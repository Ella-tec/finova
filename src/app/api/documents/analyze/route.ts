import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { analyzeDocumentText } from "@/lib/documents/analyzer";
import { analyzeWithAzure } from "@/lib/azure/document-intelligence";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, textHint } = body as { documentId: string; textHint?: string };

    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const access = await authorizeClientAccess(doc.clientId);
    if (!access.ok) return access.response;
    if (access.user.role === "CLIENT") {
      return NextResponse.json({ error: "Client portal users may upload evidence, but AI analysis must be initiated by authorized firm staff after review." }, { status: 403 });
    }

    // A stored document must have a completed, passing sanitizer scan before analysis.
    const latestScan = await prisma.auditLog.findFirst({
      where: {
        action: "FILE_SANITIZE_SCAN",
        entityType: "Document",
        entityId: documentId,
      },
      orderBy: { createdAt: "desc" },
      select: { details: true, createdAt: true },
    });
    if (!latestScan?.details) {
      return NextResponse.json({ error: "Run File Sanitizer on this stored document before requesting AI analysis." }, { status: 409 });
    }
    let scanDetails: { safeToUpload?: boolean; classification?: string; safeForPublicAI?: boolean } = {};
    try {
      scanDetails = JSON.parse(latestScan.details);
    } catch {
      return NextResponse.json({ error: "The latest sanitizer result could not be verified. Run File Sanitizer again." }, { status: 409 });
    }
    if (scanDetails.safeToUpload !== true) {
      return NextResponse.json({ error: "The latest sanitizer result did not approve this document for processing. Review the findings before continuing." }, { status: 422 });
    }

    const filePath = path.resolve(process.cwd(), "uploads", doc.storageKey);
    const uploadRoot = path.resolve(process.cwd(), "uploads");
    if (!filePath.startsWith(uploadRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid document storage path." }, { status: 400 });
    }

    const extension = path.extname(doc.fileName).toLowerCase();
    const isTextDocument =
      doc.mimeType.startsWith("text/") ||
      doc.mimeType === "application/json" ||
      [".csv", ".txt", ".json", ".xml", ".md"].includes(extension);
    let rawText = "";
    if (isTextDocument) {
      rawText = (await readFile(filePath)).toString("utf8").slice(0, 8000);
      if (!rawText.trim()) {
        return NextResponse.json({ error: "The text document is empty or could not be read." }, { status: 422 });
      }
    }

    // Text files use transparent pattern-based parsing. Binary documents require configured Azure Document Intelligence.
    let analysis;
    if (isTextDocument) {
      analysis = { ...analyzeDocumentText(rawText, doc.fileName), provider: "text-parser" as const };
    } else {
      try {
        const buffer = await readFile(filePath);
        analysis = await analyzeWithAzure(buffer, doc.fileName, doc.mimeType);
        if (analysis.provider !== "azure") {
          return NextResponse.json({ error: "No verified OCR provider is available. Configure Azure Document Intelligence or enable demo data explicitly; no extracted values were inferred from the filename." }, { status: 503 });
        }
        rawText = analysis.summary || "";
      } catch (providerError) {
        console.error("Document intelligence provider unavailable:", providerError);
        return NextResponse.json({ error: "Verified document extraction is unavailable. Configure Azure Document Intelligence and retry; the document was not analyzed using filename-based sample data." }, { status: 503 });
      }
    }

    // Persist analysis
    await prisma.documentAnalysis.upsert({
      where: { documentId },
      create: {
        documentId,
        docType: analysis.docType,
        vendor: analysis.vendor,
        invoiceNumber: analysis.invoiceNumber,
        invoiceDate: analysis.invoiceDate,
        dueDate: analysis.dueDate,
        totalAmount: analysis.totalAmount,
        currency: analysis.currency,
        taxAmount: analysis.taxAmount,
        confidence: analysis.confidence,
        rawText: rawText.slice(0, 5000),
        summary: analysis.summary,
        lineItems: analysis.lineItems ? JSON.stringify(analysis.lineItems) : null,
      },
      update: {
        docType: analysis.docType,
        vendor: analysis.vendor,
        invoiceNumber: analysis.invoiceNumber,
        invoiceDate: analysis.invoiceDate,
        totalAmount: analysis.totalAmount,
        confidence: analysis.confidence,
        summary: analysis.summary,
        rawText: rawText.slice(0, 5000),
      },
    });

    // Update document OCR text + tags
    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrText: rawText.slice(0, 5000),
        tags: analysis.suggestedTags?.join(",") || doc.tags,
        status: "PENDING_REVIEW",
      },
    });

    let accountingRecord: { id: string; area: string; kind: string; status: string } | null = null;
    let duplicateWarning: string | null = null;
    const usableAmount =
      typeof analysis.totalAmount === "number" &&
      Number.isFinite(analysis.totalAmount) &&
      analysis.totalAmount >= 0;
    const confident =
      analysis.confidence >= 0.65 && (analysis as { provider?: string }).provider === "azure";
    const target =
      analysis.docType === "INVOICE"
        ? { area: "PURCHASING", kind: "BILL", title: "Bill " + (analysis.invoiceNumber || doc.fileName) }
        : analysis.docType === "RECEIPT"
          ? { area: "PURCHASING", kind: "EXPENSE", title: "Expense " + (analysis.vendor || doc.fileName) }
          : analysis.docType === "BANK_STATEMENT"
            ? { area: "BANKING", kind: "BANK_STATEMENT", title: "Bank statement " + doc.fileName }
            : null;
    if (target && usableAmount && confident) {
      const candidates = await prisma.workspaceRecord.findMany({
        where: { clientId: doc.clientId, kind: target.kind },
        orderBy: { createdAt: "desc" },
        take: 250,
      });
      const alreadyLinked = candidates.find((row) => {
        try {
          return JSON.parse(row.payload || "{}").documentId === documentId;
        } catch {
          return false;
        }
      });
      if (alreadyLinked) {
        accountingRecord = {
          id: alreadyLinked.id,
          area: alreadyLinked.area,
          kind: alreadyLinked.kind,
          status: alreadyLinked.status,
        };
      } else {
        const invoiceNumber = analysis.invoiceNumber;
        const duplicate = candidates.find(
          (row) =>
            Boolean(invoiceNumber) &&
            row.reference?.toLowerCase() === invoiceNumber!.toLowerCase() &&
            row.amount === analysis.totalAmount &&
            (!analysis.vendor || row.counterparty?.toLowerCase() === analysis.vendor.toLowerCase())
        );
        if (duplicate) {
          duplicateWarning = "Possible duplicate of record " + duplicate.id + ". Review before approval.";
        }
        const row = await prisma.workspaceRecord.create({
          data: {
            area: target.area,
            kind: target.kind,
            title: target.title,
            reference: analysis.invoiceNumber || null,
            counterparty: analysis.vendor || null,
            status: "PENDING_REVIEW",
            amount: analysis.totalAmount,
            currency: analysis.currency || "USD",
            recordDate:
              analysis.invoiceDate && !Number.isNaN(Date.parse(analysis.invoiceDate))
                ? new Date(analysis.invoiceDate)
                : null,
            dueDate:
              analysis.dueDate && !Number.isNaN(Date.parse(analysis.dueDate))
                ? new Date(analysis.dueDate)
                : null,
            description: [analysis.summary, duplicateWarning].filter(Boolean).join(" "),
            payload: JSON.stringify({
              documentId,
              sourceFileName: doc.fileName,
              docType: analysis.docType,
              confidence: analysis.confidence,
              taxAmount: analysis.taxAmount ?? null,
              lineItems: analysis.lineItems ?? [],
              reviewRequired: true,
            }),
            firmId: access.user.firmId ?? null,
            clientId: doc.clientId,
            createdById: access.user.id,
          },
        });
        accountingRecord = { id: row.id, area: row.area, kind: row.kind, status: row.status };
      }
    }
    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ANALYZED",
        entityType: "Document",
        entityId: documentId,
        details: JSON.stringify({
          docType: analysis.docType,
          confidence: analysis.confidence,
          totalAmount: analysis.totalAmount,
          accountingRecordId: accountingRecord?.id ?? null,
          duplicateWarning,
        }),
        userId: (session.user as { id?: string }).id,
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
      accountingRecord,
      duplicateWarning,
      autoRecordSkippedReason: !target
        ? "Unsupported document category."
        : !usableAmount
          ? "No reliable total amount was extracted."
          : !confident
            ? "Verified OCR is not available or confidence is too low. Configure Azure Document Intelligence and review the document; no accounting record was created."
            : null,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
