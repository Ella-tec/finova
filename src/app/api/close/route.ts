import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MONTH_END_TASKS, calculateProgress } from "@/lib/close/checklist";
import { canAccessClient, getSessionUser, hasAnyRole } from "@/lib/access";

const periodPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function serialize(close: any) {
  return {
    id: close.id, period: close.period, status: close.status, progress: close.progress,
    startedAt: close.startedAt?.toISOString(), closedAt: close.closedAt?.toISOString(),
    tasks: close.tasks.map((task: any) => ({
      id: task.id, step: task.step, title: task.title, description: task.description || "",
      category: task.category, status: task.status, ownerRole: task.ownerRole, aiCanHelp: task.aiCanHelp,
    })),
  };
}

async function resolveScope(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>, requestedClientId: string | null) {
  const clientId = user.role === "CLIENT" ? user.clientId : requestedClientId;
  if (clientId) {
    if (!(await canAccessClient(user, clientId))) return null;
    return { clientId, firmId: user.firmId || null };
  }
  if (!user.firmId || user.role === "CLIENT") return null;
  return { clientId: null, firmId: user.firmId };
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  if (!periodPattern.test(period)) return NextResponse.json({ error: "Period must use YYYY-MM" }, { status: 400 });
  const scope = await resolveScope(user, req.nextUrl.searchParams.get("clientId"));
  if (!scope) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let close = await prisma.closePeriod.findFirst({
    where: { period, clientId: scope.clientId, firmId: scope.firmId },
    include: { tasks: { orderBy: { step: "asc" } } },
  });

  if (!close) {
    try {
      close = await prisma.closePeriod.create({
        data: {
          period, clientId: scope.clientId, firmId: scope.firmId, status: "OPEN", progress: 0,
          tasks: { create: DEFAULT_MONTH_END_TASKS.map((task) => ({
            step: task.step, title: task.title, description: task.description,
            category: task.category, status: "NOT_STARTED", ownerRole: task.ownerRole,
            aiCanHelp: task.aiCanHelp || false,
          })) },
        },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
    } catch {
      close = await prisma.closePeriod.findFirst({
        where: { period, clientId: scope.clientId, firmId: scope.firmId },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      if (!close) throw new Error("Could not initialize close period");
    }
  }
  return NextResponse.json({ close: serialize(close) });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { period, taskId, status, action } = body;
    if (typeof period !== "string" || !periodPattern.test(period)) return NextResponse.json({ error: "A valid YYYY-MM period is required" }, { status: 400 });
    const scope = await resolveScope(user, typeof body.clientId === "string" ? body.clientId : null);
    if (!scope) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const close = await prisma.closePeriod.findFirst({
      where: { period, clientId: scope.clientId, firmId: scope.firmId },
      include: { tasks: { orderBy: { step: "asc" } } },
    });
    if (!close) return NextResponse.json({ error: "Close period not found. Load it first." }, { status: 404 });

    if (action === "close") {
      if (!hasAnyRole(user, ["ADMIN", "PARTNER", "CONTROLLER", "CFO"])) return NextResponse.json({ error: "Only an authorized approver can close this period" }, { status: 403 });
      if (close.tasks.some((task) => task.status !== "COMPLETED")) return NextResponse.json({ error: "Complete every close task before final close" }, { status: 409 });
      const updated = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: "CLOSED", closedAt: new Date(), progress: 100 },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      await prisma.auditLog.create({ data: { action: "CLOSE_PERIOD_APPROVED", entityType: "ClosePeriod", entityId: close.id, details: JSON.stringify({ period }), userId: user.id } });
      return NextResponse.json({ success: true, close: serialize(updated) });
    }

    if (action === "start") {
      if (user.role === "CLIENT") return NextResponse.json({ error: "Client users cannot start accounting close" }, { status: 403 });
      const updated = await prisma.closePeriod.update({
        where: { id: close.id }, data: { status: "IN_PROGRESS", startedAt: close.startedAt || new Date() },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      return NextResponse.json({ success: true, close: serialize(updated) });
    }

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED"];
    if (typeof taskId !== "string" || !validStatuses.includes(status)) return NextResponse.json({ error: "Invalid task update" }, { status: 400 });
    if (user.role === "CLIENT") return NextResponse.json({ error: "Client users cannot edit close tasks" }, { status: 403 });
    const task = await prisma.closeTask.findFirst({ where: { id: taskId, closePeriodId: close.id }, select: { id: true } });
    if (!task) return NextResponse.json({ error: "Task not found in this close period" }, { status: 404 });

    await prisma.closeTask.update({
      where: { id: task.id },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : null, completedBy: status === "COMPLETED" ? user.id : null },
    });
    const tasks = await prisma.closeTask.findMany({ where: { closePeriodId: close.id } });
    const progress = calculateProgress(tasks.map((task) => ({
      id: task.id, step: task.step, title: task.title, description: task.description || "",
      category: task.category as any, status: task.status as any, ownerRole: task.ownerRole || undefined, aiCanHelp: task.aiCanHelp,
    })));
    const overall = progress === 100 ? "PENDING_APPROVAL" : progress > 0 ? "IN_PROGRESS" : "OPEN";
    const updated = await prisma.closePeriod.update({
      where: { id: close.id }, data: { progress, status: overall },
      include: { tasks: { orderBy: { step: "asc" } } },
    });
    await prisma.auditLog.create({ data: { action: "CLOSE_TASK_UPDATED", entityType: "CloseTask", entityId: task.id, details: JSON.stringify({ period, status }), userId: user.id } });
    return NextResponse.json({ success: true, close: serialize(updated) });
  } catch (error) {
    console.error("Close API error:", error);
    return NextResponse.json({ error: "Close operation failed" }, { status: 500 });
  }
}
