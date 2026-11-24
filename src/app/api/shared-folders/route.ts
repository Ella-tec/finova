import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { z } from "zod";

const STAFF_ROLES = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];
async function currentUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true, role: true, firmId: true, clientId: true } });
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "CLIENT") {
    const shares = await prisma.folderShare.findMany({
      where: { userId: user.id, folder: { clientId: user.clientId || "__none__" } },
      orderBy: { createdAt: "desc" },
      include: { folder: { include: { documents: { select: { id: true, fileName: true, mimeType: true, size: true, status: true, createdAt: true } }, client: { select: { id: true, name: true } } }, grantedBy: { select: { name: true, email: true } } },
    });
    return NextResponse.json({ folders: shares.map((share) => ({ ...share.folder, permissions: { canUpload: share.canUpload, canDownload: share.canDownload, canManage: share.canManage }, sharedBy: share.grantedBy })) });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Choose a client workspace." }, { status: 400 });
  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;
  const folders = await prisma.folder.findMany({
    where: { clientId: access.client.id },
    orderBy: { createdAt: "desc" },
    include: { documents: { select: { id: true, fileName: true, mimeType: true, size: true, status: true, createdAt: true } }, shares: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
  return NextResponse.json({ folders });
}

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-folder"), clientId: z.string().min(1), name: z.string().trim().min(1).max(100) }),
  z.object({ action: z.literal("share"), folderId: z.string().min(1), email: z.string().email().max(254), canUpload: z.boolean().default(false), canDownload: z.boolean().default(true) }),
  z.object({ action: z.literal("revoke"), folderId: z.string().min(1), userId: z.string().min(1) }),
]);

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid shared-folder action.", details: parsed.error.flatten() }, { status: 400 });

  try {
    if (parsed.data.action === "create-folder") {
      const access = await authorizeClientAccess(parsed.data.clientId);
      if (!access.ok) return access.response;
      const folder = await prisma.folder.create({
        data: { name: parsed.data.name, path: "/" + parsed.data.name, clientId: access.client.id },
      });
      await prisma.auditLog.create({ data: { action: "SHARED_FOLDER_CREATED", entityType: "Folder", entityId: folder.id, userId: access.user.id } });
      return NextResponse.json({ folder }, { status: 201 });
    }

    if (!STAFF_ROLES.includes(user.role)) return NextResponse.json({ error: "Only authorized firm staff can grant or revoke shared-folder access." }, { status: 403 });
    const folder = await prisma.folder.findUnique({ where: { id: parsed.data.folderId }, include: { client: { select: { id: true, firmId: true } } } });
    if (!folder) return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    const access = await authorizeClientAccess(folder.clientId);
    if (!access.ok) return access.response;

    if (parsed.data.action === "share") {
      const target = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() }, select: { id: true, role: true, clientId: true } });
      if (!target || target.role !== "CLIENT" || target.clientId !== folder.clientId) {
        return NextResponse.json({ error: "The recipient must be an active client user assigned to this same client workspace." }, { status: 404 });
      }
      const share = await prisma.folderShare.upsert({
        where: { folderId_userId: { folderId: folder.id, userId: target.id } },
        create: { folderId: folder.id, userId: target.id, grantedById: user.id, canUpload: parsed.data.canUpload, canDownload: parsed.data.canDownload },
        update: { grantedById: user.id, canUpload: parsed.data.canUpload, canDownload: parsed.data.canDownload },
      });
      await prisma.auditLog.create({ data: { action: "SHARED_FOLDER_ACCESS_GRANTED", entityType: "Folder", entityId: folder.id, userId: user.id, details: JSON.stringify({ recipientId: target.id, canUpload: share.canUpload, canDownload: share.canDownload }) } });
      return NextResponse.json({ success: true, share });
    }

    await prisma.folderShare.deleteMany({ where: { folderId: folder.id, userId: parsed.data.userId } });
    await prisma.auditLog.create({ data: { action: "SHARED_FOLDER_ACCESS_REVOKED", entityType: "Folder", entityId: folder.id, userId: user.id, details: JSON.stringify({ recipientId: parsed.data.userId }) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shared folder API error:", error);
    return NextResponse.json({ error: "Could not complete the shared-folder action." }, { status: 500 });
  }
}
