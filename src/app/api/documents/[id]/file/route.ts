import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true, fileName: true, mimeType: true, storageKey: true, clientId: true },
    });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const absolutePath = path.resolve(uploadsRoot, document.storageKey);
    if (!absolutePath.startsWith(uploadsRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid document storage path" }, { status: 400 });
    }

    const bytes = await readFile(absolutePath);
    const download = req.nextUrl.searchParams.get("download") === "1";
    const safeName = document.fileName.replace(/[\r\n"]/g, "_");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Document file retrieval failed:", error);
    return NextResponse.json({ error: "Could not open this document. The stored file may be unavailable." }, { status: 404 });
  }
}
