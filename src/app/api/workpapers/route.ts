import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import {
  WORKPAPER_TEMPLATES,
  createWorkpaperFromTemplate,
} from "@/lib/workpapers/templates";

const REVIEW_ROLES = ["SENIOR_ACCOUNTANT", "CONTROLLER", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "ADMIN"];
const SIGNOFF_ROLES = ["AUDIT_MANAGER", "PARTNER", "ADMIN"];

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;

  const period = req.nextUrl.searchParams.get("period");
  const workpapers = await prisma.workpaper.findMany({
    where: {
      clientId: access.client.id,
      ...(period ? { period } : {}),
    },
    include: { schedules: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ accountCode: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ workpapers, templates: WORKPAPER_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (typeof body.clientId !== "string" || !body.clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const access = await authorizeClientAccess(body.clientId);
    if (!access.ok) return access.response;

    if (typeof body.id === "string") {
      const existing = await prisma.workpaper.findFirst({
        where: { id: body.id, clientId: access.client.id },
      });
      if (!existing) return NextResponse.json({ error: "Workpaper not found" }, { status: 404 });
      if (existing.status === "SIGNED_OFF") {
        return NextResponse.json({ error: "Signed-off workpapers are locked. Use the formal amendment workflow." }, { status: 409 });
      }

      const isReview = body.status === "REVIEWED";
      const isSignoff = body.status === "SIGNED_OFF";
      if (isReview) {
        if (!REVIEW_ROLES.includes(access.user.role)) {
          return NextResponse.json({ error: "You are not authorized to review workpapers" }, { status: 403 });
        }
        if (existing.preparedById === access.user.id) {
          return NextResponse.json({ error: "Workpapers must be reviewed by someone other than the preparer" }, { status: 409 });
        }
        if (existing.status !== "PREPARED") {
          return NextResponse.json({ error: "Only prepared workpapers can be reviewed" }, { status: 409 });
        }
      } else if (isSignoff) {
        if (!SIGNOFF_ROLES.includes(access.user.role)) {
          return NextResponse.json({ error: "You are not authorized to sign off workpapers" }, { status: 403 });
        }
        if (existing.status !== "REVIEWED" || !existing.reviewedById || existing.reviewedById === access.user.id) {
          return NextResponse.json({ error: "A different authorized reviewer must review the workpaper before sign-off" }, { status: 409 });
        }
      } else {
        if (existing.preparedById !== access.user.id) {
          return NextResponse.json({ error: "Only the preparer may edit this workpaper" }, { status: 403 });
        }
        if (existing.status === "REVIEWED") {
          return NextResponse.json({ error: "Reviewed workpapers are locked pending reviewer return or formal amendment" }, { status: 409 });
        }
      }

      const data: Record<string, unknown> = {};
      if (isReview || isSignoff) {
        if (body.findings !== undefined || body.conclusion !== undefined) {
          return NextResponse.json({ error: "Review and sign-off actions cannot modify workpaper content" }, { status: 400 });
        }
        if (isReview) {
          data.status = "REVIEWED";
          data.reviewedById = access.user.id;
        } else {
          data.status = "SIGNED_OFF";
          data.signedOffAt = new Date();
        }
      } else {
        if (typeof body.findings === "string") data.findings = body.findings.slice(0, 20000);
        if (typeof body.conclusion === "string") data.conclusion = body.conclusion.slice(0, 10000);
        if (body.status === "IN_PROGRESS" || body.status === "PREPARED") {
          data.status = body.status;
        } else if (body.status !== undefined) {
          return NextResponse.json({ error: "Invalid workpaper status transition" }, { status: 400 });
        }
      }

      const updated = await prisma.workpaper.update({
        where: { id: existing.id },
        data,
        include: { schedules: { orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json({ success: true, workpaper: updated });
    }

    if (typeof body.templateAccountCode !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const template = WORKPAPER_TEMPLATES.find(
      (item) => item.accountCode === body.templateAccountCode
    );
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const draft = createWorkpaperFromTemplate(
      template,
      typeof body.period === "string" ? body.period : new Date().toISOString().slice(0, 7),
      Number.isFinite(Number(body.leadBalance)) ? Number(body.leadBalance) : 0
    );

    const workpaper = await prisma.workpaper.create({
      data: {
        accountCode: draft.accountCode,
        accountName: draft.accountName,
        title: draft.title,
        period: draft.period,
        leadBalance: draft.leadBalance,
        status: "DRAFT",
        procedures: draft.procedures,
        preparedById: access.user.id,
        clientId: access.client.id,
        firmId: access.client.firmId,
        schedules: { create: draft.schedules },
      },
      include: { schedules: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ success: true, workpaper }, { status: 201 });
  } catch (error) {
    console.error("Workpaper API error:", error);
    return NextResponse.json({ error: "Failed to process workpaper" }, { status: 500 });
  }
}
