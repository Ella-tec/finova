import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeFile } from "@/lib/security/sanitizer";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    let fileName = "pasted-text.txt";
    let mimeType = "text/plain";
    let size = 0;
    let textContent = "";
    let scannedDocumentId: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      scannedDocumentId = typeof body.documentId === "string" ? body.documentId : null;
      if (scannedDocumentId) {
        const document = await prisma.document.findUnique({ where: { id: scannedDocumentId } });
        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
        const { authorizeClientAccess } = await import("@/lib/authz");
        const access = await authorizeClientAccess(document.clientId);
        if (!access.ok) return access.response;
        fileName = document.fileName;
        mimeType = document.mimeType;
        size = document.size;
        const root = path.resolve(process.cwd(), "uploads");
        const filePath = path.resolve(root, document.storageKey);
        if (!filePath.startsWith(root + path.sep)) return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
        if ([".csv", ".txt", ".json"].some((ext) => fileName.toLowerCase().endsWith(ext)) || mimeType.includes("text")) {
          textContent = (await readFile(filePath)).toString("utf8").slice(0, 200000);
        }
      } else {
        fileName = body.fileName || "unknown";
        mimeType = body.mimeType || "";
        size = body.size || 0;
        textContent = body.textContent || body.textHint || "";
      }
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const fileEntry = form.get("file");
      const hint = form.get("textHint");
      if (typeof hint === "string") textContent = hint.slice(0, 200_000);

      if (fileEntry instanceof File) {
        fileName = fileEntry.name;
        mimeType = fileEntry.type || "application/octet-stream";
        size = fileEntry.size;
        const extension = fileName.toLowerCase().split(".").pop();
        if (mimeType.startsWith("text/") || ["csv", "txt", "json", "xml", "md"].includes(extension || "")) {
          try { textContent = (await fileEntry.text()).slice(0, 200_000); }
          catch { /* Binary files have metadata-only checks until OCR is integrated. */ }
        }
      } else {
        const submittedName = form.get("fileName");
        const submittedMime = form.get("mimeType");
        if (typeof submittedName === "string") fileName = submittedName.slice(0, 180);
        if (typeof submittedMime === "string") mimeType = submittedMime.slice(0, 120);
        size = new TextEncoder().encode(textContent).length;
        if (!textContent.trim()) return NextResponse.json({ error: "Choose a file or provide text to scan." }, { status: 400 });
      }
    } else {
    }

    const result = sanitizeFile({ fileName, mimeType, size, textContent });
    await prisma.auditLog.create({
      data: {
        action: "FILE_SANITIZE_SCAN",
        entityType: "Security",
        details: JSON.stringify({
          fileName,
          classification: result.classification,
          safeToUpload: result.safeToUpload,
          safeForPublicAI: result.safeForPublicAI,
          findingCount: result.findings.length,
          piiTypes: result.piiHits.map((p) => p.type),
          documentId: scannedDocumentId,
        }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, result, documentId: scannedDocumentId, fileName });
  } catch (err) {
    console.error("Sanitize error:", err);
    return NextResponse.json({ error: "Sanitize failed" }, { status: 500 });
  }
}
