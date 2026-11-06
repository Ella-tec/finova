import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { canAccessClient, getSessionUser } from "@/lib/access";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp", ".csv", ".xlsx", ".xls", ".doc", ".docx", ".txt"]);

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestedClientId = req.nextUrl.searchParams.get("clientId");
  const clientId = user.role === "CLIENT" ? user.clientId : requestedClientId;
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  if (!(await canAccessClient(user, clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const folderId = req.nextUrl.searchParams.get("folderId");
  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, clientId }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const documents = await prisma.document.findMany({
    where: { clientId, ...(folderId ? { folderId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { id: true, name: true, email: true } }, folder: { select: { id: true, name: true } } },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const requestedClientId = String(formData.get("clientId") || "");
    const clientId = user.role === "CLIENT" ? user.clientId : requestedClientId;
    const folderId = String(formData.get("folderId") || "") || null;
    const tags = String(formData.get("tags") || "").slice(0, 1000);

    if (!(file instanceof File) || !clientId) return NextResponse.json({ error: "file and clientId are required" }, { status: 400 });
    if (!(await canAccessClient(user, clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File must be between 1 byte and 25 MB" }, { status: 400 });

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    if (folderId) {
      const folder = await prisma.folder.findFirst({ where: { id: folderId, clientId }, select: { id: true } });
      if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const storageName = randomUUID() + extension;
    const uploadDir = path.join(process.cwd(), "uploads", clientId);
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, storageName);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });

    try {
      const document = await prisma.document.create({
        data: {
          name: path.basename(file.name, extension).slice(0, 200),
          fileName: path.basename(file.name).slice(0, 255),
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          storageKey: `${clientId}/${storageName}`,
          status: "PENDING_REVIEW",
          clientId,
          folderId,
          uploadedById: user.id,
          tags: tags || null,
        },
        include: { uploadedBy: { select: { id: true, name: true, email: true } }, folder: { select: { id: true, name: true } } },
      });
      await prisma.auditLog.create({
        data: { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: document.id, details: JSON.stringify({ fileName: document.fileName, size: file.size, clientId, folderId }), userId: user.id },
      });
      return NextResponse.json(document, { status: 201 });
    } catch (error) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
