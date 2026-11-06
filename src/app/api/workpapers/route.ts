import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { WORKOBER_TEMPLATES, createWorkpaperFromTemplate } from "@/lib/workpapers/templates";

const REVIEW_ROLES = ["SENIOR_ACCOUNTANT", "CONTROLLER", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "ADMIN"];
const SIGNOFF_ROLES = ["AUDIT_MANAGER", "PARTNER", "ADMIN"];

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;
  const period = req.nextUrl.searchParams.get("period");
  const workpapers = await prisma.workpaper.findMany({
    where: { clientId: access.client.id, ...(period ? { period } : {}) },
    include: { schedules: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ accountCode: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ workpapers, templates: WORKOBER_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.clientId !== "string") return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    const access = await authorizeClientAccess(body.clientId);
    if (!access.ok) return access.response;

    if (typeof body.id === "string") {
      const existing = await prisma.workpaper.findFirst({
        where: { id: body.id, clientId: access.client.id },
      });
      if (!existing) return NextResponse.json({ error: "Workpaper not found" }, { status: 404 });

      const requestedStatus = body.status;
      const isReview = requestedStatus === "REVIEWED";
      const isSignoff = requestedStatus === "SIGNED_OFF";
      if (isReview && !REVIEW_ROLES.includes(access.user.role)) {
        return NextResponse.json({ error: "You are not authorized to review workpapers" }, { status: 403 });
      }
      if (isSignoff && !SIGNOFF_ROLES.includes(access.user.role)) {
        return NextResponse.json({ error: "You are not authorized to sign off workpapers" }, { status: 403 });
      }
      if (!isReview && !isSignoff && existing.preparedById !== access.user.id) {
        return NextResponse.json({ error: "Only the preparer or an authorized reviewer may edit this workpaper" }, { status: 403 });
      }
      const data: any = {};
      if (typeof body.findings === "string") data.findings = body.findings.slice(0, 20000);
      if (typeof body.conclusion === "string") data.conclusion = body.conclusion.slice(0, 10000);
      if (isReview) { data.status = "REVIEWED"; data.reviewedById = access.user.id; }
      else if (isSignoff) { data.status = "SIGNED_OFF"; data.reviewedById = access.user.id; data.signedOffAt = new Date(); }
      else if (body.status === "IN_PROGRESS" || body.status === "PREPARED") data.status = body.status;
      else if (body.status !== undefined) return NextResponse.json({ error: "Invalid workpaper status transition" }, { status: 400 });

      const updated = await prisma.workpaper.update({
        where: { id: existing.id }, data,
        include: { schedules: { orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json({ success: true, workpaper: updated });
    }

    if (typeof body.templateAccountCode !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const template = WORKOBER_TEMPLATES.find(t => t.accountCode === body.templateAccountCode);
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    const draft = createWorkpaperFromTemplate(template, body.period || new Date().toISOString().slice(0, 7), Number(body.leadBalance) || 0);
    const wp = await prisma.workpaper.create({
      data: {
        accountCode: draft.accountCode, accountName: draft.accountName, title: draft.title,
        period: draft.period, leadBalance: draft.leadBalance, status: "DRAFT",
        procedures: draft.procedures, preparedById: access.user.id,
        clientId: access.client.id, firmId: access.client.firmId,
        schedules: { create: draft.schedules },
      },
      include: { schedules: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ success: true, workpaper: wp }, { status: 201 });
  } catch (error) {
    console.error("Workpaper API error:", error);
    return NextResponse.json({ error: "Failed to process workpaper" }, { status: 500 });
  }
}
