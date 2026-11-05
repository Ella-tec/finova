import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// GET /api/documents?clientId=xxx&folderId=yyy
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  const folderId = req.nextUrl.searchParams.get("folderId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const where: any = { clientId };
  if (folderId) where.folderId = folderId;

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(documents);
}

// POST /api/documents  upload a document
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId") as string;
    const folderId = formData.get("folderId") as string | null;
    const tags = formData.get("tags") as string | null;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "file and clientId are required" },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 25 MB limit" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads", clientId);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || "";
    const storageKey = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, storageKey);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const document = await prisma.document.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey: `${clientId}/${storageKey}`,
        status: "PENDING_REVIEW",
        clientId,
        folderId: folderId || null,
        uploadedById: (session.user as any).id,
        tags: tags || null,
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
        details: JSON.stringify({
          fileName: file.name,
          size: file.size,
          clientId,
          folderId,
        }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}