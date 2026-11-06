import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessClient, hasAnyRole } from "@/lib/access";
import { WORKOBER_TEMPLATES, createWorkpaperFromTemplate } from "@/lib/workpapers/templates";

const editors = ["ADMIN", "PARTNER", "CONTROLLER", "AUDIT_MANAGER", "AUDITOR", "SENIOR_ACCOUNTANT"];
const reviewers = ["ADMIN", "PARTNER", "CONTROLLER", "AUDIT_MANAGER"];

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.firmId || user.role === "CLIENT") return NextResponse.json({ error: "Firm access required" }, { status: 403 });

  const period = req.nextUrl.searchParams.get("period");
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (clientId && !(await canAccessClient(user, clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const workpapers = await prisma.workpaper.findMany({
    where: { firmId: user.firmId, ...(period ? { period } : {}), ...(clientId ? { clientId } : {}) },
    include: { schedules: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ accountCode: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ workpapers, templates: WORKOBER_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.firmId || !hasAnyRole(user, editors)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    const body = await req.json();

    if (typeof body.id === "string" && body.status) {
      const existing = await prisma.workpaper.findFirst({ where: { id: body.id, firmId: user.firmId }, select: { id: true, clientId: true, status: true } });
      if (!existing) return NextResponse.json({ error: "Workpaper not found" }, { status: 404 });
      if (existing.clientId && !(await canAccessClient(user, existing.clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const allowedStatuses = ["DRAFT", "IN_PROGRESS", "PREPARED", "REVIEWED", "SIGNED_OFF"];
      if (!allowedStatuses.includes(body.status)) return NextResponse.json({ error: "Invalid workpaper status" }, { status: 400 });
      if (["REVIEWED", "SIGNED_OFF"].includes(body.status) && !hasAnyRole(user, reviewers)) {
        return NextResponse.json({ error: "Reviewer or approver role required" }, { status: 403 });
      }
      if (body.status === "SIGNED_OFF" && !["REVIEWED"].includes(existing.status)) {
        return NextResponse.json({ error: "A workpaper must be reviewed before sign-off" }, { status: 409 });
      }
      const updated = await prisma.workpaper.update({
        where: { id: existing.id },
        data: {
          status: body.status,
          conclusion: typeof body.conclusion === "string" ? body.conclusion.slice(0, 10000) : undefined,
          findings: typeof body.findings === "string" ? body.findings.slice(0, 10000) : undefined,
          reviewedById: ["REVIEWED", "SIGNED_OFF"].includes(body.status) ? user.id : undefined,
          signedOffAt: body.status === "SIGNED_OFF" ? new Date() : undefined,
          preparedById: body.status === "PREPARED" ? user.id : undefined,
        },
        include: { schedules: true },
      });
      await prisma.auditLog.create({ data: { action: "WORKPAPER_STATUS_UPDATED", entityType: "Workpaper", entityId: updated.id, details: JSON.stringify({ status: body.status }), userId: user.id } });
      return NextResponse.json({ success: true, workpaper: updated });
    }

    if (typeof body.templateAccountCode !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const clientId = typeof body.clientId === "string" ? body.clientId : null;
    if (clientId && !(await canAccessClient(user, clientId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const template = WORKOBER_TEMPLATES.find((item) => item.accountCode === body.templateAccountCode);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const leadBalance = typeof body.leadBalance === "number" && Number.isFinite(body.leadBalance) ? body.leadBalance : 0;
    const draft = createWorkpaperFromTemplate(template, body.period || new Date().toISOString().slice(0, 7), leadBalance);
    const workpaper = await prisma.workpaper.create({
      data: {
        accountCode: draft.accountCode, accountName: draft.accountName, title: draft.title,
        period: draft.period, leadBalance: draft.leadBalance, status: "DRAFT",
        procedures: draft.procedures, preparedById: user.id,
        clientId, firmId: user.firmId, schedules: { create: draft.schedules },
      },
      include: { schedules: true },
    });
    await prisma.auditLog.create({ data: { action: "WORKPAPER_CREATED", entityType: "Workpaper", entityId: workpaper.id, userId: user.id } });
    return NextResponse.json({ success: true, workpaper }, { status: 201 });
  } catch (error) {
    console.error("Workpaper API error:", error);
    return NextResponse.json({ error: "Workpaper operation failed" }, { status: 500 });
  }
}
