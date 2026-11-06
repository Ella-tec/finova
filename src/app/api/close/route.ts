import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { DEFAULT_MONTH_END_TASKS, calculateProgress } from "@/lib/close/checklist";

const APPROVER_ROLES = ["CONTROLLER", "CFO", "PARTNER", "ADMIN"];
const TASK_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!/^\d{4}-\d{2}$/.test(period) || !clientId) {
    return NextResponse.json({ error: "A valid period and clientId are required" }, { status: 400 });
  }
  const access = await authorizeClientAccess(clientId);
  if (!access.ok) return access.response;

  let close = await prisma.closePeriod.findFirst({
    where: { period, clientId: access.client.id },
    include: { tasks: { orderBy: { step: "asc" } } },
  });
  if (!close) {
    close = await prisma.closePeriod.create({
      data: {
        period, clientId: access.client.id, firmId: access.client.firmId,
        status: "OPEN", progress: 0,
        tasks: { create: DEFAULT_MONTH_END_TASKS.map(t => ({
          step: t.step, title: t.title, description: t.description,
          category: t.category, status: "NOT_STARTED", ownerRole: t.ownerRole,
          aiCanHelp: t.aiCanHelp || false,
        })) },
      },
      include: { tasks: { orderBy: { step: "asc" } } },
    });
  }
  return NextResponse.json({ close });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { period, taskId, status, action, clientId } = body;
    if (typeof period !== "string" || !/^\d{4}-\d{2}$/.test(period) || typeof clientId !== "string") {
      return NextResponse.json({ error: "A valid period and clientId are required" }, { status: 400 });
    }
    const access = await authorizeClientAccess(clientId);
    if (!access.ok) return access.response;

    const close = await prisma.closePeriod.findFirst({
      where: { period, clientId: access.client.id },
      include: { tasks: true },
    });
    if (!close) return NextResponse.json({ error: "Close period not found" }, { status: 404 });

    if (action === "close") {
      if (!APPROVER_ROLES.includes(access.user.role)) {
        return NextResponse.json({ error: "Only an authorized approver may close a period" }, { status: 403 });
      }
      if (close.tasks.length === 0 || close.tasks.some(t => t.status !== "COMPLETED")) {
        return NextResponse.json({ error: "All close tasks must be completed before approval" }, { status: 409 });
      }
      const updated = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: "CLOSED", closedAt: new Date(), progress: 100 },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      return NextResponse.json({ success: true, close: updated });
    }

    if (action === "start") {
      const updated = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: close.status === "OPEN" ? "IN_PROGRESS" : close.status, startedAt: close.startedAt || new Date() },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      return NextResponse.json({ success: true, close: updated });
    }

    if (typeof taskId !== "string" || !TASK_STATUSES.includes(status)) {
      return NextResponse.json({ error: "A valid taskId and status are required" }, { status: 400 });
    }
    const task = await prisma.closeTask.findFirst({ where: { id: taskId, closePeriodId: close.id } });
    if (!task) return NextResponse.json({ error: "Task not found in this close period" }, { status: 404 });

    await prisma.closeTask.update({
      where: { id: task.id },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : null, completedBy: status === "COMPLETED" ? access.user.id : null },
    });
    const tasks = await prisma.closeTask.findMany({ where: { closePeriodId: close.id } });
    const progress = calculateProgress(tasks.map(t => ({
      id: t.id, step: t.step, title: t.title, description: t.description || "",
      category: t.category as any, status: t.status as any, ownerRole: t.ownerRole || undefined, aiCanHelp: t.aiCanHelp,
    })));
    const overall = progress === 100 ? "PENDING_APPROVAL" : progress > 0 ? "IN_PROGRESS" : "OPEN";
    const updated = await prisma.closePeriod.update({
      where: { id: close.id },
      data: { progress, status: overall },
      include: { tasks: { orderBy: { step: "asc" } } },
    });
    return NextResponse.json({ success: true, close: updated });
  } catch (error) {
    console.error("Close API error:", error);
    return NextResponse.json({ error: "Failed to update close period" }, { status: 500 });
  }
}
