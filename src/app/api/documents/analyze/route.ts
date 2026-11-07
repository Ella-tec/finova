import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { analyzeDocumentText, simulateOcr } from "@/lib/documents/analyzer";
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

    // Try to read stored file for text (limited  binary files will fall back to simulation)
    let rawText = textHint || "";
    try {
      const filePath = path.join(process.cwd(), "uploads", doc.storageKey);
      const buf = await readFile(filePath);
      const asText = buf.toString("utf8");
      if (asText.length > 30 && !asText.includes("\u0000")) {
        rawText = asText.slice(0, 8000);
      }
    } catch {
      // file may not be readable as text
    }

    if (!rawText || rawText.length < 20) {
      rawText = simulateOcr(doc.fileName, textHint);
    }

    // Prefer Azure Document Intelligence when configured and file is readable
    let analysis;
    try {
      const filePath = path.join(process.cwd(), "uploads", doc.storageKey);
      const buf = await readFile(filePath);
      const azureResult = await analyzeWithAzure(buf, doc.fileName, doc.mimeType);
      analysis = azureResult;
      if (azureResult.provider === "azure" && !rawText) {
        rawText = azureResult.summary;
      }
    } catch {
      analysis = analyzeDocumentText(rawText, doc.fileName);
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
    const usableAmount = typeof analysis.totalAmount === "number" && Number.isFinite(analysis.totalAmount) && analysis.totalAmount >= 0;
    const confident = analysis.confidence >= 0.65;
    const target = analysis.docType === "INVOICE" ? { area: "PURCHASING", kind: "BILL", title: "Bill " + (analysis.invoiceNumber || doc.fileName) } : analysis.docType === "RECEIPT" ? { area: "PURCHASING", kind: "EXPENSE", title: "Expense " + (analysis.vendor || doc.fileName) } : analysis.docType === "BANK_STATEMENT" ? { area: "BANKING", kind: "BANK_STATEMENT", title: "Bank statement " + doc.fileName } : null;
    if (target && usableAmount && confident) {
      const candidates = await prisma.workspaceRecord.findMany({ where: { clientId: doc.clientId, kind: target.kind }, orderBy: { createdAt: "desc" }, take: 250 });
      const alreadyLinked = candidates.find((row) => { try { return JSON.parse(row.payload || "{}").documentId === documentId; } catch { return false; } });
      if (alreadyLinked) accountingRecord = { id: alreadyLinked.id, area: alreadyLinked.area, kind: alreadyLinked.kind, status: alreadyLinked.status };
      else {
        const duplicate = candidates.find((row) => Boolean(analysis.invoiceNumber) && row.reference?.toLowerCase() === analysis.invoiceNumber.toLowerCase() && row.amount === analysis.totalAmount && (!analysis.vendor || row.counterparty?.toLowerCase() === analysis.vendor.toLowerCase()));
        if (duplicate) duplicateWarning = "Possible duplicate of record " + duplicate.id + ". Review before approval.";
        const row = await prisma.workspaceRecord.create({ data: { area: target.area, kind: target.kind, title: target.title, reference: analysis.invoiceNumber || null, counterparty: analysis.vendor || null, status: "PENDING_REVIEW", amount: analysis.totalAmount, currency: analysis.currency || "USD", recordDate: analysis.invoiceDate && !Number.isNaN(Date.parse(analysis.invoiceDate)) ? new Date(analysis.invoiceDate) : null, dueDate: analysis.dueDate && !Number.isNaN(Date.parse(analysis.dueDate)) ? new Date(analysis.dueDate) : null, description: [analysis.summary, duplicateWarning].filter(Boolean).join(" "), payload: JSON.stringify({ documentId, sourceFileName: doc.fileName, docType: analysis.docType, confidence: analysis.confidence, taxAmount: analysis.taxAmount ?? null, lineItems: analysis.lineItems ?? [], reviewRequired: true }), firmId: access.user.firmId ?? null, clientId: doc.clientId, createdById: access.user.id } });
        accountingRecord = { id: row.id, area: row.area, kind: row.kind, status: row.status };
      }
    }
    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ANALYZED",
        entityType: "Document",
        entityId: documentId,
        details: JSON.stringify({ docType: analysis.docType, confidence: analysis.confidence, totalAmount: analysis.totalAmount, accountingRecordId: accountingRecord?.id ?? null, duplicateWarning }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, analysis, accountingRecord, duplicateWarning, autoRecordSkippedReason: !target ? "Unsupported document category." : !usableAmount ? "No reliable total amount was extracted." : !confident ? "Extraction confidence is too low." : null });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}