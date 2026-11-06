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

    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ANALYZED",
        entityType: "Document",
        entityId: documentId,
        details: JSON.stringify({
          docType: analysis.docType,
          confidence: analysis.confidence,
          totalAmount: analysis.totalAmount,
        }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}