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
