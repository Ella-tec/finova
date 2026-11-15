import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  clientId: z.string().min(1),
});

const PBC_STATUSES = ["REQUESTED", "UPLOADED", "IN_REVIEW", "ACCEPTED", "REJECTED"] as const;
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["UPLOADED"],
  UPLOADED: ["IN_REVIEW"],
  IN_REVIEW: ["ACCEPTED", "REJECTED"],
  REJECTED: ["REQUESTED"],
};

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true, clientId: true },
  });
}

const STAFF_ROLES = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (clientId) {
    const access = await authorizeClientAccess(clientId);
    if (!access.ok) return access.response;
    const requests = await prisma.pbcRequest.findMany({
      where: { clientId: access.client.id },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: { client: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ requests, clientId: access.client.id });
  }

  // Never return an unscoped PBC list.
  const allowedClientFilter = user.role === "CLIENT"
    ? { id: user.clientId || "__no_client__" }
    : { firmId: user.firmId || "__no_firm__" };
  const clients = await prisma.client.findMany({
    where: allowedClientFilter,
    select: { id: true },
  });
  if (!clients.length) return NextResponse.json({ error: "No authorized client workspace is assigned to this account." }, { status: 403 });
  const requests = await prisma.pbcRequest.findMany({
    where: { clientId: { in: clients.map((client) => client.id) } },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { client: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();

    if (body.id && body.status) {
      if (!STAFF_ROLES.includes(user.role)) {
        return NextResponse.json({ error: "Only authorized firm staff may change PBC review status." }, { status: 403 });
      }
      if (!PBC_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid PBC status." }, { status: 400 });
      }
      const existing = await prisma.pbcRequest.findUnique({ where: { id: String(body.id) } });
      if (!existing) return NextResponse.json({ error: "PBC request not found." }, { status: 404 });
      const access = await authorizeClientAccess(existing.clientId);
      if (!access.ok) return access.response;
      if (!ALLOWED_TRANSITIONS[existing.status]?.includes(body.status)) {
        return NextResponse.json({ error: `Transition from ${existing.status} to ${body.status} is not allowed.` }, { status: 409 });
      }
      const updated = await prisma.pbcRequest.update({
        where: { id: existing.id },
        data: { status: body.status },
        include: { client: { select: { id: true, name: true } } },
      });
      await prisma.auditLog.create({
        data: {
          action: "PBC_STATUS_UPDATED",
          entityType: "PbcRequest",
          entityId: existing.id,
          details: JSON.stringify({ previousStatus: existing.status, status: updated.status }),
          userId: access.user.id,
        },
      });
      return NextResponse.json({ success: true, request: updated });
    }

    if (!STAFF_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Only authorized firm staff may create PBC requests." }, { status: 403 });
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid PBC request.", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const access = await authorizeClientAccess(data.clientId);
    if (!access.ok) return access.response;
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Enter a valid due date." }, { status: 400 });
    }

    const request = await prisma.pbcRequest.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate,
        clientId: access.client.id,
        status: "REQUESTED",
      },
      include: { client: { select: { id: true, name: true } } },
    });
    await prisma.auditLog.create({
      data: {
        action: "PBC_CREATED",
        entityType: "PbcRequest",
        entityId: request.id,
        details: JSON.stringify({ title: request.title, priority: request.priority, clientId: access.client.id }),
        userId: access.user.id,
      },
    });
    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error("PBC API error:", error);
    return NextResponse.json({ error: "Could not complete the PBC request." }, { status: 500 });
  }
}
