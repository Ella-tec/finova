import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

const FOLDER_MANAGERS = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "PARTNER", "ADMIN"];

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;

  const folders = await prisma.folder.findMany({
    where: { clientId: access.client.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  });
  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    const parentId = typeof body.parentId === "string" && body.parentId ? body.parentId : null;
    if (!name || name.length > 80 || !clientId) {
      return NextResponse.json({ error: "A folder name (maximum 80 characters) and clientId are required." }, { status: 400 });
    }

    const access = await authorizeClientAccess(clientId);
    if (!access.ok) return access.response;
    if (!FOLDER_MANAGERS.includes(access.user.role)) {
      return NextResponse.json({ error: "Only authorized firm staff may create or organize client folders." }, { status: 403 });
    }

    if (parentId) {
      const parent = await prisma.folder.findFirst({ where: { id: parentId, clientId: access.client.id } });
      if (!parent) return NextResponse.json({ error: "Parent folder must belong to the selected client workspace." }, { status: 400 });
    }
    const existing = await prisma.folder.findFirst({
      where: { clientId: access.client.id, parentId, name },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ error: "A folder with this name already exists at this level." }, { status: 409 });

    const parentPath = parentId
      ? (await prisma.folder.findUnique({ where: { id: parentId }, select: { path: true } }))?.path || ""
      : "";
    const path = `${parentPath}/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const folder = await prisma.folder.create({
      data: { name, path, clientId: access.client.id, parentId },
    });
    await prisma.auditLog.create({
      data: {
        action: "FOLDER_CREATED",
        entityType: "Folder",
        entityId: folder.id,
        details: JSON.stringify({ name, clientId: access.client.id, parentId }),
        userId: access.user.id,
      },
    });
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Folder create error:", error);
    return NextResponse.json({ error: "Could not create the folder." }, { status: 500 });
  }
}
