import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { analyzeDocumentText, simulateOcr } from "@/lib/documents/analyzer";
import { analyzeWithAzure } from "@/lib/azure/document-intelligence";
import { canAccessClient, getSessionUser } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const documentId = typeof body.documentId === "string" ? body.documentId : "";
    const textHint = typeof body.textHint === "string" ? body.textHint.slice(0, 8000) : "";
    if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (!(await canAccessClient(user, doc.clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let rawText = textHint;
    const filePath = path.join(process.cwd(), "uploads", doc.storageKey);
    try {
      const buf = await readFile(filePath);
      if (!rawText) {
        const asText = buf.toString("utf8");
        if (asText.length > 30 && !asText.includes("\u0000")) rawText = asText.slice(0, 8000);
      }
    } catch {
      // An unavailable local copy is not treated as extracted evidence.
    }

    let analysis;
    try {
      const buf = await readFile(filePath);
      analysis = await analyzeWithAzure(buf, doc.fileName, doc.mimeType);
      if (analysis.provider !== "azure" && !rawText) rawText = simulateOcr(doc.fileName, textHint);
    } catch {
      if (!rawText) rawText = simulateOcr(doc.fileName, textHint);
      analysis = analyzeDocumentText(rawText, doc.fileName);
    }

    const persisted = await prisma.documentAnalysis.upsert({
      where: { documentId },
      create: {
        documentId, docType: analysis.docType, vendor: analysis.vendor,
        invoiceNumber: analysis.invoiceNumber, invoiceDate: analysis.invoiceDate,
        dueDate: analysis.dueDate, totalAmount: analysis.totalAmount,
        currency: analysis.currency, taxAmount: analysis.taxAmount,
        confidence: analysis.confidence, rawText: rawText.slice(0, 5000),
        summary: analysis.summary,
        lineItems: analysis.lineItems ? JSON.stringify(analysis.lineItems) : null,
      },
      update: {
        docType: analysis.docType, vendor: analysis.vendor,
        invoiceNumber: analysis.invoiceNumber, invoiceDate: analysis.invoiceDate,
        dueDate: analysis.dueDate, totalAmount: analysis.totalAmount,
        currency: analysis.currency, taxAmount: analysis.taxAmount,
        confidence: analysis.confidence, rawText: rawText.slice(0, 5000),
        summary: analysis.summary,
        lineItems: analysis.lineItems ? JSON.stringify(analysis.lineItems) : null,
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { ocrText: rawText.slice(0, 5000), tags: analysis.suggestedTags?.join(",") || doc.tags, status: "PENDING_REVIEW" },
    });
    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_ANALYZED", entityType: "Document", entityId: documentId,
        details: JSON.stringify({ docType: analysis.docType, confidence: analysis.confidence, totalAmount: analysis.totalAmount }),
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, analysis: persisted, provider: analysis.provider || "local" });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
