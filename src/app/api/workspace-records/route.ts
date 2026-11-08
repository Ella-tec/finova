import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Area = "ACCOUNTING" | "SALES" | "PURCHASING" | "BANKING";
const AREAS: Area[] = ["ACCOUNTING", "SALES", "PURCHASING", "BANKING"];
const allowedKinds: Record<Area, string[]> = {
  ACCOUNTING: ["COMPANY", "ACCOUNT", "JOURNAL", "LEDGER"],
  SALES: ["CUSTOMER", "INVOICE", "RECEIPT"],
  PURCHASING: ["VENDOR", "BILL", "EXPENSE"],
  BANKING: ["BANK_ACCOUNT", "BANK_STATEMENT", "EMPLOYEE", "PAYROLL"],
};

async function context() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as { id?: string; firmId?: string; clientId?: string };
  if (!user.id) return null;
  return { userId: user.id, firmId: user.firmId ?? null, clientId: user.clientId ?? null };
}

export async function GET(req: NextRequest) {
  const owner = await context();
  if (!owner) return NextResponse.json({ error: "Please sign in to view records." }, { status: 401 });
  const area = req.nextUrl.searchParams.get("area");
  if (area && !AREAS.includes(area as Area)) return NextResponse.json({ error: "Invalid workspace area." }, { status: 400 });

  const rows = await prisma.workspaceRecord.findMany({
    where: {
      ...(area ? { area } : {}),
      ...(owner.firmId ? { firmId: owner.firmId } : owner.clientId ? { clientId: owner.clientId } : { createdById: owner.userId }),
    },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });
  return NextResponse.json({ records: rows });
}

export async function POST(req: NextRequest) {
  const owner = await context();
  if (!owner) return NextResponse.json({ error: "Please sign in to save records." }, { status: 401 });
  try {
    const body = await req.json();
    const area = String(body.area || "") as Area;
    const kind = String(body.kind || "");
    const title = String(body.title || "").trim();
    const amount = body.amount === "" || body.amount == null ? null : Number(body.amount);
    if (!AREAS.includes(area) || !allowedKinds[area].includes(kind)) return NextResponse.json({ error: "Choose a valid record type." }, { status: 400 });
    if (!title || title.length > 180) return NextResponse.json({ error: "Enter a title (maximum 180 characters)." }, { status: 400 });
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) return NextResponse.json({ error: "Amount must be a valid non-negative number." }, { status: 400 });

    const record = await prisma.workspaceRecord.create({
      data: {
        area, kind, title,
        reference: String(body.reference || "").trim().slice(0, 100) || null,
        counterparty: String(body.counterparty || "").trim().slice(0, 180) || null,
        status: "DRAFT",
        amount,
        currency: String(body.currency || "USD").slice(0, 3).toUpperCase(),
        recordDate: body.recordDate ? new Date(body.recordDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        description: String(body.description || "").trim().slice(0, 2000) || null,
        payload: JSON.stringify(body.details || {}),
        firmId: owner.firmId,
        clientId: owner.clientId,
        createdById: owner.userId,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "WORKSPACE_RECORD_CREATED",
        entityType: kind,
        entityId: record.id,
        details: JSON.stringify({ area, title, reference: record.reference, amount }),
        userId: owner.userId,
      },
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Workspace record create failed:", error);
    return NextResponse.json({ error: "Could not save this record. Check your database setup and try again." }, { status: 500 });
  }
}


async function ownedRecord(recordId: string, owner: { userId: string; firmId: string | null; clientId: string | null }) {
  return prisma.workspaceRecord.findFirst({
    where: {
      id: recordId,
      ...(owner.firmId ? { firmId: owner.firmId } : owner.clientId ? { clientId: owner.clientId } : { createdById: owner.userId }),
    },
  });
}

export async function PUT(req: NextRequest) {
  const owner = await context();
  if (!owner) return NextResponse.json({ error: "Please sign in to edit records." }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id || "");
    const existing = await ownedRecord(id, owner);
    if (!existing) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (existing.status === "APPROVED") return NextResponse.json({ error: "Approved records are locked. Create an adjusting entry instead." }, { status: 409 });
    const title = String(body.title || "").trim();
    const amount = body.amount === "" || body.amount == null ? null : Number(body.amount);
    if (!title || title.length > 180 || (amount !== null && (!Number.isFinite(amount) || amount < 0))) {
      return NextResponse.json({ error: "Enter a valid title and non-negative amount." }, { status: 400 });
    }
    const record = await prisma.workspaceRecord.update({
      where: { id },
      data: {
        title,
        reference: String(body.reference || "").trim().slice(0, 100) || null,
        counterparty: String(body.counterparty || "").trim().slice(0, 180) || null,
        amount,
        currency: String(body.currency || "USD").slice(0, 3).toUpperCase(),
        recordDate: body.recordDate ? new Date(body.recordDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        description: String(body.description || "").trim().slice(0, 2000) || null,
        payload: body.details ? JSON.stringify(body.details) : existing.payload,
      },
    });
    await prisma.auditLog.create({ data: { action: "WORKSPACE_RECORD_UPDATED", entityType: existing.kind, entityId: id, details: JSON.stringify({ title }), userId: owner.userId } });
    return NextResponse.json({ record });
  } catch (error) {
    console.error("Workspace record update failed:", error);
    return NextResponse.json({ error: "Could not update this record." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const owner = await context();
  if (!owner) return NextResponse.json({ error: "Please sign in to approve records." }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id || "");
    const existing = await ownedRecord(id, owner);
    if (!existing) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    if (existing.status !== "DRAFT" && existing.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "Only draft or pending-review records can be approved." }, { status: 409 });
    }
    const session = await (await import("next-auth")).getServerSession((await import("@/lib/auth")).authOptions);
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!["SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "PARTNER", "ADMIN"].includes(userRole || "")) {
      return NextResponse.json({ error: "Approval requires a senior accountant or authorized approver." }, { status: 403 });
    }
    const record = await prisma.workspaceRecord.update({ where: { id }, data: { status: "APPROVED" } });
    await prisma.auditLog.create({ data: { action: "WORKSPACE_RECORD_APPROVED", entityType: existing.kind, entityId: id, details: JSON.stringify({ title: existing.title, previousStatus: existing.status }), userId: owner.userId } });
    return NextResponse.json({ record });
  } catch (error) {
    console.error("Workspace record approval failed:", error);
    return NextResponse.json({ error: "Could not approve this record." }, { status: 500 });
  }
}
