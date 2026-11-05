import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTrialBalanceCSV } from "@/lib/statements/generator";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { csv, period, clientId } = body as {
      csv: string;
      period: string;
      clientId?: string;
    };

    if (!csv || !period) {
      return NextResponse.json({ error: "csv and period are required" }, { status: 400 });
    }

    const lines = parseTrialBalanceCSV(csv);
    if (lines.length === 0) {
      return NextResponse.json({ error: "No valid trial balance lines found" }, { status: 400 });
    }

    // Store lines (simplified  in production use a proper TB header + lines table)
    const created = [];
    for (const line of lines) {
      const row = await prisma.trialBalance.create({
        data: {
          period,
          accountCode: line.accountCode,
          accountName: line.accountName,
          debit: line.debit,
          credit: line.credit,
          clientId: clientId || "demo-client-001",
        },
      });
      created.push(row);
    }

    await prisma.auditLog.create({
      data: {
        action: "TRIAL_BALANCE_IMPORTED",
        entityType: "TrialBalance",
        details: JSON.stringify({ period, lineCount: lines.length }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({
      success: true,
      period,
      lineCount: lines.length,
      lines,
    });
  } catch (err) {
    console.error("TB import error:", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");

  const where = period ? { period } : {};
  const rows = await prisma.trialBalance.findMany({
    where,
    orderBy: [{ period: "desc" }, { accountCode: "asc" }],
  });

  return NextResponse.json({ rows });
}