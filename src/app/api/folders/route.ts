import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/folders?clientId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const folders = await prisma.folder.findMany({
    where: { clientId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { documents: true } },
    },
  });

  return NextResponse.json(folders);
}

// POST /api/folders  create a new folder
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, clientId, parentId } = body;

  if (!name || !clientId) {
    return NextResponse.json(
      { error: "name and clientId are required" },
      { status: 400 }
    );
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
      clientId,
      parentId: parentId || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "FOLDER_CREATED",
      entityType: "Folder",
      entityId: folder.id,
      details: JSON.stringify({ name, clientId }),
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json(folder, { status: 201 });
}