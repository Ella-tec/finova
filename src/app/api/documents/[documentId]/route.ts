import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params;
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, clientId: true, fileName: true, mimeType: true, storageKey: true },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const uploadRoot = path.resolve(process.cwd(), "uploads", access.client.id);
    const filePath = path.resolve(process.cwd(), "uploads", document.storageKey);
    if (!filePath.startsWith(uploadRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid document location" }, { status: 400 });
    }

    const bytes = await readFile(filePath);
    const forceDownload = req.nextUrl.searchParams.get("download") === "1";
    const safeName = document.fileName.replace(/[\r\n"]/g, "_");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${safeName}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Document preview failed:", error);
    return NextResponse.json({ error: "Unable to open document" }, { status: 404 });
  }
}