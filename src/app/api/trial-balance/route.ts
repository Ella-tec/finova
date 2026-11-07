import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTrialBalanceCSV, TBLine } from "@/lib/statements/generator";

const DEMO_CLIENT_ID = "demo-client-001";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json() as { csv?: string; lines?: TBLine[]; period?: string; clientId?: string };
    const { period } = body;
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return NextResponse.json({ error: "A valid reporting period (YYYY-MM) is required." }, { status: 400 });

    const lines = Array.isArray(body.lines) ? body.lines : typeof body.csv === "string" ? parseTrialBalanceCSV(body.csv) : [];
    if (!lines.length) return NextResponse.json({ error: "No trial balance rows supplied." }, { status: 400 });
    if (lines.some((l) => !l.accountCode?.trim() || !l.accountName?.trim() || !Number.isFinite(Number(l.debit)) || !Number.isFinite(Number(l.credit)) || Number(l.debit) < 0 || Number(l.credit) < 0)) {
      return NextResponse.json({ error: "Each row must have an account code, account name, and non-negative debit and credit values." }, { status: 400 });
    }

    const clientId = body.clientId || DEMO_CLIENT_ID;
    const normalized = lines.map((l) => ({ period, accountCode: l.accountCode.trim(), accountName: l.accountName.trim(), debit: Number(l.debit), credit: Number(l.credit), clientId }));
    const saved = await prisma.$transaction(async (tx) => {
      await tx.trialBalance.deleteMany({ where: { period, clientId } });
      await tx.trialBalance.createMany({ data: normalized });
      return tx.trialBalance.findMany({ where: { period, clientId }, orderBy: { accountCode: "asc" } });
    });

    await prisma.auditLog.create({
      data: {
        action: "TRIAL_BALANCE_SAVED",
        entityType: "TrialBalance",
        details: JSON.stringify({ period, lineCount: saved.length, replacedExisting: true }),
        userId: (session.user as any).id,
      },
    });
    return NextResponse.json({ success: true, period, lineCount: saved.length, lines: saved.map(({ id, accountCode, accountName, debit, credit }) => ({ id, accountCode, accountName, debit, credit })) });
  } catch (err) {
    console.error("Trial balance save error:", err);
    return NextResponse.json({ error: "Trial balance could not be saved. Check the server logs and database connection." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    if (period && !/^\d{4}-\d{2}$/.test(period)) return NextResponse.json({ error: "Invalid reporting period." }, { status: 400 });
    const rows = await prisma.trialBalance.findMany({
      where: { ...(period ? { period } : {}), clientId: DEMO_CLIENT_ID },
      orderBy: [{ period: "desc" }, { accountCode: "asc" }],
    });
    return NextResponse.json({ rows });
  } catch (err) {
    console.error("Trial balance load error:", err);
    return NextResponse.json({ error: "Could not load saved trial balance." }, { status: 500 });
  }
}
