import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const root = path.resolve(process.cwd(), "uploads");
    const filePath = path.resolve(root, document.storageKey);
    if (!filePath.startsWith(root + path.sep)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const bytes = await readFile(filePath);
    const disposition = req.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": String(bytes.length),
        "Content-Disposition": `${disposition}; filename="${document.fileName.replace(/["\\\\\r\n]/g, "_")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Document file retrieval failed:", error);
    return NextResponse.json({ error: "Unable to open this document" }, { status: 500 });
  }
}
