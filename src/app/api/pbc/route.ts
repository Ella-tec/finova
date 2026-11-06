import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessClient, hasAnyRole } from "@/lib/access";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional(),
  clientId: z.string().min(1),
});
const statuses = ["REQUESTED", "UPLOADED", "IN_REVIEW", "ACCEPTED", "REJECTED"] as const;

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requested = req.nextUrl.searchParams.get("clientId");
  const clientId = user.role === "CLIENT" ? user.clientId : requested;
  if (user.role === "CLIENT" && !clientId) return NextResponse.json({ requests: [] });
  if (clientId && !(await canAccessClient(user, clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!clientId && (!user.firmId || !hasAnyRole(user, ["ADMIN", "PARTNER", "CONTROLLER", "AUDIT_MANAGER", "AUDITOR", "SENIOR_ACCOUNTANT"]))) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const requests = await prisma.pbcRequest.findMany({
    where: clientId ? { clientId } : { client: { firmId: user.firmId! } },
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
      if (!statuses.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      const existing = await prisma.pbcRequest.findUnique({ where: { id: body.id }, select: { id: true, clientId: true } });
      if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });
      if (!(await canAccessClient(user, existing.clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (user.role === "CLIENT" && !["UPLOADED"].includes(body.status)) return NextResponse.json({ error: "Client users may only mark requests uploaded" }, { status: 403 });
      if (user.role !== "CLIENT" && !hasAnyRole(user, ["ADMIN", "PARTNER", "CONTROLLER", "AUDIT_MANAGER", "AUDITOR", "SENIOR_ACCOUNTANT"])) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
      const updated = await prisma.pbcRequest.update({ where: { id: existing.id }, data: { status: body.status } });
      await prisma.auditLog.create({ data: { action: "PBC_STATUS_UPDATED", entityType: "PbcRequest", entityId: updated.id, details: JSON.stringify({ status: body.status }), userId: user.id } });
      return NextResponse.json({ success: true, request: updated });
    }

    if (user.role === "CLIENT" || !hasAnyRole(user, ["ADMIN", "PARTNER", "CONTROLLER", "AUDIT_MANAGER", "AUDITOR", "SENIOR_ACCOUNTANT"])) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (!(await canAccessClient(user, data.clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const request = await prisma.pbcRequest.create({
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null, status: "REQUESTED" },
      include: { client: { select: { id: true, name: true } } },
    });
    await prisma.auditLog.create({ data: { action: "PBC_CREATED", entityType: "PbcRequest", entityId: request.id, details: JSON.stringify({ title: request.title, priority: request.priority }), userId: user.id } });
    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error("PBC API error:", error);
    return NextResponse.json({ error: "PBC operation failed" }, { status: 500 });
  }
}
