import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { authorizeClientAccess } from "@/lib/authz";
import { DEFAULT_MONTH_END_TASKS, calculateProgress } from "@/lib/close/checklist";

const APPROVER_ROLES = ["CONTROLLER", "CFO", "PARTNER", "ADMIN"];
const TASK_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED", "WAITING", "SKIPPED"];

/** Resolve client for firm staff when clientId is omitted. */
async function resolveClientId(explicit?: string | null) {
  if (explicit && typeof explicit === "string" && explicit.length > 0) {
    return explicit;
  }
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  if (!sessionUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true, role: true, firmId: true, clientId: true },
  });
  if (!user) return null;
  if (user.clientId) return user.clientId;
  if (user.firmId) {
    const first = await prisma.client.findFirst({
      where: { firmId: user.firmId },
      orderBy: { name: "asc" },
      select: { id: true },
    });
    return first?.id ?? null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const period =
    req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const clientId = await resolveClientId(req.nextUrl.searchParams.get("clientId"));

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return NextResponse.json({ error: "A valid period (YYYY-MM) is required" }, { status: 400 });
  }
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "No client found for your firm. Seed demo data or create a client, then retry.",
      },
      { status: 400 }
    );
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
        period,
        clientId: access.client.id,
        firmId: access.client.firmId,
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
    close,
    clientId: access.client.id,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { period, taskId, status, action } = body;
    const clientId = await resolveClientId(body.clientId);

    if (typeof period !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      return NextResponse.json({ error: "A valid period (YYYY-MM) is required" }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json(
        { error: "No client found for your firm. Create or seed a client first." },
        { status: 400 }
      );
    }

    const access = await authorizeClientAccess(clientId);
    if (!access.ok) return access.response;

    let close = await prisma.closePeriod.findFirst({
      where: { period, clientId: access.client.id },
      include: { tasks: true },
    });

    // Auto-create on start if missing
    if (!close && action === "start") {
      close = await prisma.closePeriod.create({
        data: {
          period,
          clientId: access.client.id,
          firmId: access.client.firmId,
          status: "IN_PROGRESS",
          progress: 0,
          startedAt: new Date(),
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
      return NextResponse.json({ success: true, close, clientId: access.client.id });
    }

    if (!close) {
      return NextResponse.json({ error: "Close period not found" }, { status: 404 });
    }

    if (close.status === "CLOSED") {
      return NextResponse.json(
        {
          error:
            "This accounting period is closed and locked. Use the authorized, audited reopening process.",
        },
        { status: 409 }
      );
    }

    if (action === "close") {
      if (!APPROVER_ROLES.includes(access.user.role)) {
        return NextResponse.json(
          { error: "Only an authorized approver may close a period" },
          { status: 403 }
        );
      }
      if (close.tasks.length === 0 || close.tasks.some((t) => t.status !== "COMPLETED")) {
        return NextResponse.json(
          { error: "All close tasks must be completed before approval" },
          { status: 409 }
        );
      }

      const updated = await prisma.closePeriod.update({
        where: { id: close.id },
        data: { status: "CLOSED", closedAt: new Date(), progress: 100 },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      await prisma.auditLog.create({
        data: {
          action: "ACCOUNTING_PERIOD_CLOSED",
          entityType: "ClosePeriod",
          entityId: close.id,
          details: JSON.stringify({ period, clientId: access.client.id }),
          userId: access.user.id,
        },
      });
      return NextResponse.json({ success: true, close: updated });
    }

    if (action === "start") {
      const updated = await prisma.closePeriod.update({
        where: { id: close.id },
        data: {
          status: close.status === "OPEN" ? "IN_PROGRESS" : close.status,
          startedAt: close.startedAt || new Date(),
        },
        include: { tasks: { orderBy: { step: "asc" } } },
      });
      return NextResponse.json({ success: true, close: updated, clientId: access.client.id });
    }

    if (typeof taskId !== "string" || !TASK_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "A valid taskId and status are required" },
        { status: 400 }
      );
    }

    const task = await prisma.closeTask.findFirst({
      where: { id: taskId, closePeriodId: close.id },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found in this close period" }, { status: 404 });
    }

    await prisma.closeTask.update({
      where: { id: task.id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        completedBy: status === "COMPLETED" ? access.user.id : null,
      },
    });

    const tasks = await prisma.closeTask.findMany({ where: { closePeriodId: close.id } });
    const progress = calculateProgress(
      tasks.map((t) => ({
        id: t.id,
        step: t.step,
        title: t.title,
        description: t.description || "",
        category: t.category as "CASH" | "AR" | "AP" | "PAYROLL" | "INVENTORY" | "ASSETS" | "TAX" | "REPORTING" | "OTHER",
        status: t.status as "NOT_STARTED" | "IN_PROGRESS" | "WAITING" | "COMPLETED" | "SKIPPED",
        ownerRole: t.ownerRole || undefined,
        aiCanHelp: t.aiCanHelp,
      }))
    );
    const overall =
      progress === 100 ? "PENDING_APPROVAL" : progress > 0 ? "IN_PROGRESS" : "OPEN";

    const updated = await prisma.closePeriod.update({
      where: { id: close.id },
      data: { progress, status: overall },
      include: { tasks: { orderBy: { step: "asc" } } },
    });

    return NextResponse.json({ success: true, close: updated, clientId: access.client.id });
  } catch (error) {
    console.error("Close API error:", error);
    return NextResponse.json({ error: "Failed to update close period" }, { status: 500 });
  }
}
