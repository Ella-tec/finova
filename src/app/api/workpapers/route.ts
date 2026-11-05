import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WORKOBER_TEMPLATES, createWorkpaperFromTemplate } from "@/lib/workpapers/templates";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period");
  const where = period ? { period } : {};
  const workpapers = await prisma.workpaper.findMany({
    where,
    include: { schedules: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ accountCode: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ workpapers, templates: WORKOBER_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const userId = (session.user as any).id;

    // Update status / fields
    if (body.id && (body.status || body.conclusion || body.findings)) {
      const updated = await prisma.workpaper.update({
        where: { id: body.id },
        data: {
          status: body.status,
          conclusion: body.conclusion,
          findings: body.findings,
          reviewedById: body.status === "REVIEWED" || body.status === "SIGNED_OFF" ? userId : undefined,
          signedOffAt: body.status === "SIGNED_OFF" ? new Date() : undefined,
          preparedById: body.status === "PREPARED" ? userId : undefined,
        },
        include: { schedules: true },
      });
      return NextResponse.json({ success: true, workpaper: updated });
    }

    // Create from template
    if (body.templateAccountCode) {
      const template = WORKOBER_TEMPLATES.find((t) => t.accountCode === body.templateAccountCode);
      if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

      const draft = createWorkpaperFromTemplate(template, body.period || new Date().toISOString().slice(0, 7), body.leadBalance);
      const wp = await prisma.workpaper.create({
        data: {
          accountCode: draft.accountCode,
          accountName: draft.accountName,
          title: draft.title,
          period: draft.period,
          leadBalance: draft.leadBalance,
          status: "DRAFT",
          procedures: draft.procedures,
          preparedById: userId,
          clientId: body.clientId || "demo-client-001",
          schedules: { create: draft.schedules },
        },
        include: { schedules: true },
      });
      return NextResponse.json({ success: true, workpaper: wp }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
