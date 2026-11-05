import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  consolidate,
  getSampleConsolidationData,
  EntityTBLine,
} from "@/lib/consolidation/engine";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const firmId = (session.user as any).firmId;

  let entities = await prisma.entity.findMany({
    where: firmId ? { firmId } : {},
    orderBy: { code: "asc" },
  });

  // Seed sample entities + balances if empty
  if (entities.length === 0) {
    const sample = getSampleConsolidationData(period);
    for (const e of sample.entities) {
      const ent = await prisma.entity.create({
        data: {
          code: e.code,
          name: e.name,
          ownershipPct: e.ownershipPct,
          firmId: firmId || null,
        },
      });
      entities.push(ent);
    }
    const codeToId = Object.fromEntries(entities.map((e) => [e.code, e.id]));
    for (const l of sample.lines) {
      await prisma.entityBalance.create({
        data: {
          entityId: codeToId[l.entityCode],
          period,
          accountCode: l.accountCode,
          accountName: l.accountName,
          debit: l.debit,
          credit: l.credit,
        },
      });
    }
  }

  const balances = await prisma.entityBalance.findMany({
    where: { period, entityId: { in: entities.map((e) => e.id) } },
    include: { entity: true },
  });

  // If no balances for this period, copy sample structure for the period
  if (balances.length === 0) {
    const sample = getSampleConsolidationData(period);
    const codeToId = Object.fromEntries(entities.map((e) => [e.code, e.id]));
    for (const l of sample.lines) {
      if (!codeToId[l.entityCode]) continue;
      await prisma.entityBalance.create({
        data: {
          entityId: codeToId[l.entityCode],
          period,
          accountCode: l.accountCode,
          accountName: l.accountName,
          debit: l.debit,
          credit: l.credit,
        },
      });
    }
    const refreshed = await prisma.entityBalance.findMany({
      where: { period },
      include: { entity: true },
    });
    return runConsolidation(period, refreshed);
  }

  return runConsolidation(period, balances);
}

function runConsolidation(period: string, balances: any[]) {
  const lines: EntityTBLine[] = balances.map((b) => ({
    entityId: b.entityId,
    entityCode: b.entity.code,
    entityName: b.entity.name,
    ownershipPct: b.entity.ownershipPct,
    currency: b.entity.currency || "USD",
    accountCode: b.accountCode,
    accountName: b.accountName,
    debit: b.debit,
    credit: b.credit,
    type: b.type || undefined,
  }));

  const result = consolidate(period, lines);
  const entities = [...new Map(balances.map((b) => [b.entity.code, b.entity])).values()];

  return NextResponse.json({
    period,
    entities: entities.map((e: any) => ({
      id: e.id,
      code: e.code,
      name: e.name,
      ownershipPct: e.ownershipPct,
    })),
    result,
  });
}
