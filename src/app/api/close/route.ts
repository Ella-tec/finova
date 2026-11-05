import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MONTH_END_TASKS, calculateProgress } from "@/lib/close/checklist";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const clientId = req.nextUrl.searchParams.get("clientId") || null;

  let close = await prisma.closePeriod.findFirst({
    where: { period, clientId },
    include: { tasks: { orderBy: { step: "asc" } } },
  });

  if (!close) {
    close = await prisma.closePeriod.create({
      data: {
        period,
        clientId,
        status: "OPEN",
        progress: 0,
        tasks: {
          create: DEFAULT_MONTH_END_TASKS.map((t) => ({
            step: t.step,
            title: t.title,
            description: t.description,
            category: t.category,
            status: "NOT_STARTED",
            ownerRole: t.ownerRole,
            aiCanHelp: t.aiCanHelp || false,
          })),
        },
      },
      include: { tasks: { orderBy: { step: "asc" } } },
    });
  }

  return NextResponse.json({
    close: {
      id: close.id,
      period: close.period,
      status: close.status,
      progress: close.progress,
      startedAt: close.startedAt?.toISOString(),
      closedAt: close.closedAt?.toISOString(),
      tasks: close.tasks.map((t) => ({
        id: t.id,
        step: t.step,
        title: t.title,
        description: t.description || "",
        category: t.category,
        status: t.status,
        ownerRole: t.ownerRole,
        aiCanHelp: t.aiCanHelp,
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { period, taskId, status, action, clientId = null } = body;

    if (!period) {
      return NextResponse.json({ error: "period required" }, { status: 400 });
    }

    let close = await prisma.closePeriod.findFirst({
      where: { period, clientId },
      include: { tasks: true },
    });

    if (!close) {
      return NextResponse.json({ error: "Close period not found. Call GET first." }, { status: 404 });
    }

    if (action === "start") {
      close = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
    } else if (action === "close") {
      close = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: "CLOSED", closedAt: new Date(), progress: 100 },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
    } else if (taskId && status) {
      await prisma.closeTask.update({
        where: { id: taskId },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
          completedBy: status === "COMPLETED" ? (session.user as any).id : null,
        },
      });

      const tasks = await prisma.closeTask.findMany({ where: { closePeriodId: close.id } });
      const progress = calculateProgress(
        tasks.map((t) => ({
          id: t.id,
          step: t.step,
          title: t.title,
          description: t.description || "",
          category: t.category as any,
          status: t.status as any,
          ownerRole: t.ownerRole || undefined,
          aiCanHelp: t.aiCanHelp,
        }))
      );
      let overall = close.status;
      if (progress === 100) overall = "PENDING_APPROVAL";
      else if (progress > 0) overall = "IN_PROGRESS";

      close = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { progress, status: overall },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
    }

    return NextResponse.json({
      success: true,
      close: {
        id: close.id,
        period: close.period,
        status: close.status,
        progress: close.progress,
        startedAt: close.startedAt?.toISOString(),
        closedAt: close.closedAt?.toISOString(),
        tasks: close.tasks.map((t) => ({
          id: t.id,
          step: t.step,
          title: t.title,
          description: t.description || "",
          category: t.category,
          status: t.status,
          ownerRole: t.ownerRole,
          aiCanHelp: t.aiCanHelp,
        })),
      },
    });
  } catch (err) {
    console.error("Close API error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
