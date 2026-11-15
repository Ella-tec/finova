import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { parseTrialBalanceCSV, TBLine } from "@/lib/statements/generator";

const isValidPeriod = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { csv?: string; lines?: TBLine[]; period?: string; clientId?: string };
    if (!isValidPeriod(body.period)) {
      return NextResponse.json({ error: "A valid reporting period (YYYY-MM) is required." }, { status: 400 });
    }
    const access = await authorizeClientAccess(body.clientId || "");
    if (!access.ok) return access.response;
    if (access.user.role === "CLIENT") return NextResponse.json({ error: "Only firm staff may import or replace a trial balance." }, { status: 403 });

    const lines = Array.isArray(body.lines)
      ? body.lines
      : typeof body.csv === "string"
        ? parseTrialBalanceCSV(body.csv)
        : [];
    if (!lines.length) return NextResponse.json({ error: "No trial balance rows supplied." }, { status: 400 });
    if (lines.some((line) =>
      !line.accountCode?.trim() ||
      !line.accountName?.trim() ||
      !Number.isFinite(Number(line.debit)) ||
      !Number.isFinite(Number(line.credit)) ||
      Number(line.debit) < 0 ||
      Number(line.credit) < 0 ||
      (Number(line.debit) > 0 && Number(line.credit) > 0)
    )) {
      return NextResponse.json({ error: "Each row needs an account code, account name, and non-negative debit or credit value. A row cannot contain both a debit and a credit." }, { status: 400 });
    }

    const normalized = lines.map((line) => ({
      period: body.period!,
      accountCode: line.accountCode.trim(),
      accountName: line.accountName.trim(),
      debit: Number(line.debit),
      credit: Number(line.credit),
      clientId: access.client.id,
    }));
    const saved = await prisma.$transaction(async (tx) => {
      await tx.trialBalance.deleteMany({ where: { period: body.period!, clientId: access.client.id } });
      await tx.trialBalance.createMany({ data: normalized });
      return tx.trialBalance.findMany({
        where: { period: body.period!, clientId: access.client.id },
        orderBy: { accountCode: "asc" },
      });
    });

    const debitTotal = saved.reduce((sum, line) => sum + line.debit, 0);
    const creditTotal = saved.reduce((sum, line) => sum + line.credit, 0);
    const difference = Math.round((debitTotal - creditTotal) * 100) / 100;
    await prisma.auditLog.create({
      data: {
        action: "TRIAL_BALANCE_SAVED",
        entityType: "TrialBalance",
        details: JSON.stringify({
          period: body.period,
          clientId: access.client.id,
          lineCount: saved.length,
          replacedExisting: true,
          debitTotal,
          creditTotal,
          difference,
        }),
        userId: access.user.id,
      },
    });
    return NextResponse.json({
      success: true,
      period: body.period,
      clientId: access.client.id,
      lineCount: saved.length,
      debitTotal,
      creditTotal,
      difference,
      balanced: Math.abs(difference) < 0.01,
      lines: saved.map(({ id, accountCode, accountName, debit, credit }) => ({ id, accountCode, accountName, debit, credit })),
    });
  } catch (error) {
    console.error("Trial balance save error:", error);
    return NextResponse.json({ error: "Trial balance could not be saved. Check the input and database setup." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get("period");
    const clientId = req.nextUrl.searchParams.get("clientId");
    if (period && !isValidPeriod(period)) return NextResponse.json({ error: "Invalid reporting period." }, { status: 400 });
    const access = await authorizeClientAccess(clientId || "");
    if (!access.ok) return access.response;
    if (access.user.role === "CLIENT") return NextResponse.json({ error: "Trial balance access is restricted to firm staff." }, { status: 403 });

    const rows = await prisma.trialBalance.findMany({
      where: { ...(period ? { period } : {}), clientId: access.client.id },
      orderBy: [{ period: "desc" }, { accountCode: "asc" }],
    });
    return NextResponse.json({ rows, clientId: access.client.id });
  } catch (error) {
    console.error("Trial balance load error:", error);
    return NextResponse.json({ error: "Could not load saved trial balance." }, { status: 500 });
  }
}
