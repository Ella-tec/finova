import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consolidate, getSampleConsolidationData, EntityTBLine } from "@/lib/consolidation/engine";

const VIEW_ROLES = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true },
  });
  if (!user || !user.firmId || !VIEW_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Firm-level consolidation access is required." }, { status: 403 });
  }

  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return NextResponse.json({ error: "A valid reporting period (YYYY-MM) is required." }, { status: 400 });
  }

  let entities = await prisma.entity.findMany({
    where: { firmId: user.firmId },
    orderBy: { code: "asc" },
  });

  // Seed illustrative entities only when the firm explicitly enables demo data.
  if (entities.length === 0 && process.env.FINOVA_DEMO_DATA === "true") {
    const sample = getSampleConsolidationData(period);
    for (const sampleEntity of sample.entities) {
      const entity = await prisma.entity.create({
        data: {
          code: sampleEntity.code,
          name: sampleEntity.name,
          ownershipPct: sampleEntity.ownershipPct,
          firmId: user.firmId,
        },
      });
      entities.push(entity);
    }
    const codeToId = Object.fromEntries(entities.map((entity) => [entity.code, entity.id]));
    await prisma.entityBalance.createMany({
      data: sample.lines.flatMap((line) => codeToId[line.entityCode] ? [{
        entityId: codeToId[line.entityCode],
        period,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: line.debit,
        credit: line.credit,
      }] : []),
    });
    await prisma.auditLog.create({
      data: {
        action: "DEMO_CONSOLIDATION_DATA_SEEDED",
        entityType: "Consolidation",
        details: JSON.stringify({ period, firmId: user.firmId }),
        userId: user.id,
      },
    });
  }

  if (!entities.length) {
    return NextResponse.json({ period, entities: [], result: null, message: "No entities are configured for this firm yet." });
  }

  const balances = await prisma.entityBalance.findMany({
    where: { period, entityId: { in: entities.map((entity) => entity.id) } },
    include: { entity: true },
  });

  // Missing period balances remain empty; never copy illustrative balances into real firm entities.
  if (!balances.length) {
    return NextResponse.json({
      period,
      entities: entities.map((entity) => ({ id: entity.id, code: entity.code, name: entity.name, ownershipPct: entity.ownershipPct })),
      result: null,
      message: "No entity balances have been recorded for this period.",
    });
  }

  return runConsolidation(period, balances);
}

function runConsolidation(period: string, balances: any[]) {
  const lines: EntityTBLine[] = balances.map((balance) => ({
    entityId: balance.entityId,
    entityCode: balance.entity.code,
    entityName: balance.entity.name,
    ownershipPct: balance.entity.ownershipPct,
    currency: balance.entity.currency || "USD",
    accountCode: balance.accountCode,
    accountName: balance.accountName,
    debit: balance.debit,
    credit: balance.credit,
    type: balance.type || undefined,
  }));

  const result = consolidate(period, lines);
  const entities = [...new Map(balances.map((balance) => [balance.entity.code, balance.entity])).values()];

  return NextResponse.json({
    period,
    entities: entities.map((entity: any) => ({
      id: entity.id,
      code: entity.code,
      name: entity.name,
      ownershipPct: entity.ownershipPct,
    })),
    result,
  });
}
