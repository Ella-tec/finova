import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStatements, TBLine } from "@/lib/statements/generator";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { period, lines } = body as { period: string; lines?: TBLine[] };

    if (!period) {
      return NextResponse.json({ error: "period is required" }, { status: 400 });
    }

    let tbLines: TBLine[] = lines || [];

    if (!tbLines.length) {
      const rows = await prisma.trialBalance.findMany({
        where: { period },
        orderBy: { accountCode: "asc" },
      });
      tbLines = rows.map((r) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        debit: r.debit,
        credit: r.credit,
      }));
    }

    if (!tbLines.length) {
      return NextResponse.json(
        { error: "No trial balance data found for this period. Import first." },
        { status: 400 }
      );
    }

    const statements = generateStatements(tbLines, period);

    await prisma.auditLog.create({
      data: {
        action: "STATEMENTS_GENERATED",
        entityType: "FinancialStatements",
        details: JSON.stringify({
          period,
          netIncome: statements.incomeStatement.netIncome,
        }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, statements });
  } catch (err) {
    console.error("Statements error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}