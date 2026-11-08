import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** Retrieve a document by ID. The /file subroute remains available for existing clients. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, clientId: true, fileName: true, mimeType: true, storageKey: true },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const clientUploadRoot = path.resolve(process.cwd(), "uploads", access.client.id);
    const filePath = path.resolve(process.cwd(), "uploads", document.storageKey);
    if (!filePath.startsWith(clientUploadRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid document location" }, { status: 400 });
    }

    const bytes = await readFile(filePath);
    const download = request.nextUrl.searchParams.get("download") === "1";
    const safeFileName = document.fileName.replace(/[\r\n"]/g, "_");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Document retrieval failed:", error);
    return NextResponse.json({ error: "Unable to open this document" }, { status: 404 });
  }
}
