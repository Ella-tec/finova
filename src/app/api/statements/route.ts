import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { generateStatements, TBLine } from "@/lib/statements/generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { period?: string; clientId?: string };
    if (typeof body.period !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(body.period)) {
      return NextResponse.json({ error: "A valid reporting period (YYYY-MM) is required." }, { status: 400 });
    }
    const access = await authorizeClientAccess(body.clientId || "");
    if (!access.ok) return access.response;
    if (access.user.role === "CLIENT") return NextResponse.json({ error: "Only firm staff may generate internal financial statements." }, { status: 403 });

    const rows = await prisma.trialBalance.findMany({
      where: { period: body.period, clientId: access.client.id },
      orderBy: { accountCode: "asc" },
    });
    const tbLines: TBLine[] = rows.map((row) => ({
      accountCode: row.accountCode,
      accountName: row.accountName,
      debit: row.debit,
      credit: row.credit,
    }));

    if (!tbLines.length) {
      return NextResponse.json({ error: "No trial balance data found for this client and period. Import and save a trial balance first." }, { status: 400 });
    }
    if (tbLines.some((line) => !Number.isFinite(Number(line.debit)) || !Number.isFinite(Number(line.credit)) || Number(line.debit) < 0 || Number(line.credit) < 0 || (Number(line.debit) > 0 && Number(line.credit) > 0))) {
      return NextResponse.json({ error: "The saved trial balance contains invalid debit/credit rows. Correct the source data before generating statements." }, { status: 422 });
    }
    const debitTotal = tbLines.reduce((sum, line) => sum + Number(line.debit), 0);
    const creditTotal = tbLines.reduce((sum, line) => sum + Number(line.credit), 0);
    if (Math.abs(Math.round((debitTotal - creditTotal) * 100) / 100) >= 0.01) {
      return NextResponse.json({ error: "The saved trial balance is out of balance. Reconcile debits and credits before generating financial statements." }, { status: 422 });
    }

    const statements = generateStatements(tbLines, body.period);
    await prisma.auditLog.create({
      data: {
        action: "STATEMENTS_GENERATED",
        entityType: "FinancialStatements",
        details: JSON.stringify({
          period: body.period,
          clientId: access.client.id,
          netIncome: statements.incomeStatement.netIncome,
        }),
        userId: access.user.id,
      },
    });

    return NextResponse.json({ success: true, clientId: access.client.id, statements });
  } catch (error) {
    console.error("Statements generation error:", error);
    return NextResponse.json({ error: "Financial statements could not be generated from the selected trial balance." }, { status: 500 });
  }
}
