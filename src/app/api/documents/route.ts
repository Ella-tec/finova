import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".csv": ["text/csv", "application/vnd.ms-excel", "text/plain"],
  ".txt": ["text/plain"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

function safeFileName(name: string) {
  return path.basename(name).replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 180) || "upload";
}

function matchesFileSignature(extension: string, bytes: Buffer) {
  if (extension === ".pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === ".png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (extension === ".jpg" || extension === ".jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === ".docx" || extension === ".xlsx") {
    return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }
  if (extension === ".csv" || extension === ".txt") {
    return !bytes.includes(0) && !bytes.subarray(0, Math.min(bytes.length, 4096)).toString("utf8").includes("\\ufffd");
  }
  return false;
}

// GET /api/documents?clientId=...&folderId=...
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const folderId = req.nextUrl.searchParams.get("folderId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, clientId: access.client.id },
      select: { id: true },
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
  }

  const documents = await prisma.document.findMany({
    where: { clientId: access.client.id, ...(folderId ? { folderId } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(documents);
}

// POST /api/documents
export async function POST(req: NextRequest) {
  let savedPath: string | undefined;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const clientId = formData.get("clientId");
    const folderId = formData.get("folderId");
    const tags = formData.get("tags");

    if (!(file instanceof File) || typeof clientId !== "string" || !clientId.trim()) {
      return NextResponse.json({ error: "file and clientId are required" }, { status: 400 });
    }

    const access = await authorizeClientAccess(clientId);
    if (!access.ok) return access.response;

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be between 1 byte and 25 MB" }, { status: 400 });
    }

    const originalName = safeFileName(file.name);
    const extension = path.extname(originalName).toLowerCase();
    const allowedMimes = ALLOWED_TYPES[extension];
    if (!allowedMimes || !allowedMimes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Allowed: PDF, PNG, JPG, CSV, TXT, DOCX, XLSX." }, { status: 415 });
    }

    const normalizedFolderId = typeof folderId === "string" && folderId ? folderId : null;
    if (normalizedFolderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: normalizedFolderId, clientId: access.client.id },
        select: { id: true },
      });
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    const normalizedTags = typeof tags === "string" ? tags.trim().slice(0, 1000) : "";
    const storageName = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "uploads", access.client.id);
    await mkdir(uploadDir, { recursive: true });
    savedPath = path.join(uploadDir, storageName);

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!matchesFileSignature(extension, bytes)) {
      return NextResponse.json({ error: "The uploaded file content does not match its declared file type." }, { status: 415 });
    }
    await writeFile(savedPath, bytes, { flag: "wx", mode: 0o600 });

    const document = await prisma.document.create({
      data: {
        name: originalName.replace(/\.[^/.]+$/, ""),
        fileName: originalName,
        mimeType: file.type,
        size: file.size,
        storageKey: `${access.client.id}/${storageName}`,
        status: "PENDING_REVIEW",
        clientId: access.client.id,
        folderId: normalizedFolderId,
        uploadedById: access.user.id,
        tags: normalizedTags || null,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        folder: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "DOCUMENT_UPLOADED",
        entityType: "Document",
        entityId: document.id,
        details: JSON.stringify({ fileName: originalName, size: file.size, clientId: access.client.id, folderId: normalizedFolderId }),
        userId: access.user.id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (savedPath) await unlink(savedPath).catch(() => undefined);
    console.error("Document upload failed:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
