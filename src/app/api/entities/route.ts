import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const entitySchema = z.object({
  code: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(180),
  currency: z.string().trim().length(3).default("USD"),
  ownershipPct: z.number().min(0).max(100).default(100),
  parentId: z.string().optional().nullable(),
  isEliminating: z.boolean().optional(),
});

const READ_ROLES = ["CLIENT", "STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];
const WRITE_ROLES = ["CONTROLLER", "PARTNER", "ADMIN"];

async function getFirmUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true, clientId: true },
  });
}

export async function GET() {
  const user = await getFirmUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!READ_ROLES.includes(user.role) || !user.firmId || user.role === "CLIENT") {
    return NextResponse.json({ error: "Firm workspace access is required to view entities." }, { status: 403 });
  }
  const entities = await prisma.entity.findMany({
    where: { firmId: user.firmId },
    orderBy: { code: "asc" },
  });
  return NextResponse.json({ entities });
}

export async function POST(req: NextRequest) {
  const user = await getFirmUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!WRITE_ROLES.includes(user.role) || !user.firmId) {
    return NextResponse.json({ error: "Controller, partner, or administrator permission is required to manage entities." }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (body.action === "delete" && typeof body.id === "string") {
      const existing = await prisma.entity.findFirst({ where: { id: body.id, firmId: user.firmId } });
      if (!existing) return NextResponse.json({ error: "Entity not found in this firm." }, { status: 404 });
      const balanceCount = await prisma.entityBalance.count({ where: { entityId: existing.id } });
      if (balanceCount > 0) {
        return NextResponse.json({ error: "This entity has balance history and cannot be deleted. Mark it inactive in a future controlled workflow instead." }, { status: 409 });
      }
      await prisma.$transaction([
        prisma.entity.delete({ where: { id: existing.id } }),
        prisma.auditLog.create({
          data: {
            action: "ENTITY_DELETED",
            entityType: "Entity",
            entityId: existing.id,
            details: JSON.stringify({ code: existing.code, name: existing.name, firmId: user.firmId }),
            userId: user.id,
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (typeof body.id === "string") {
      const parsed = entitySchema.partial().safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid entity details.", details: parsed.error.flatten() }, { status: 400 });
      const existing = await prisma.entity.findFirst({ where: { id: body.id, firmId: user.firmId } });
      if (!existing) return NextResponse.json({ error: "Entity not found in this firm." }, { status: 404 });
      const data = parsed.data;
      if (data.parentId) {
        if (data.parentId === existing.id) return NextResponse.json({ error: "An entity cannot be its own parent." }, { status: 400 });
        const parent = await prisma.entity.findFirst({ where: { id: data.parentId, firmId: user.firmId } });
        if (!parent) return NextResponse.json({ error: "Choose a parent entity in the same firm." }, { status: 400 });
      }
      const updated = await prisma.entity.update({
        where: { id: existing.id },
        data: {
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.currency !== undefined ? { currency: data.currency.toUpperCase() } : {}),
          ...(data.ownershipPct !== undefined ? { ownershipPct: data.ownershipPct } : {}),
          ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
          ...(data.isEliminating !== undefined ? { isEliminating: data.isEliminating } : {}),
        },
      });
      await prisma.auditLog.create({
        data: {
          action: "ENTITY_UPDATED",
          entityType: "Entity",
          entityId: updated.id,
          details: JSON.stringify({ changes: data, firmId: user.firmId }),
          userId: user.id,
        },
      });
      return NextResponse.json({ success: true, entity: updated });
    }

    const parsed = entitySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid entity details.", details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (data.parentId) {
      const parent = await prisma.entity.findFirst({ where: { id: data.parentId, firmId: user.firmId } });
      if (!parent) return NextResponse.json({ error: "Choose a parent entity in the same firm." }, { status: 400 });
    }
    const entity = await prisma.entity.create({
      data: {
        code: data.code,
        name: data.name,
        currency: data.currency.toUpperCase(),
        ownershipPct: data.ownershipPct,
        parentId: data.parentId || null,
        isEliminating: data.isEliminating || false,
        firmId: user.firmId,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "ENTITY_CREATED",
        entityType: "Entity",
        entityId: entity.id,
        details: JSON.stringify({ code: entity.code, name: entity.name, firmId: user.firmId }),
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true, entity }, { status: 201 });
  } catch (error) {
    console.error("Entity API error:", error);
    return NextResponse.json({ error: "Could not complete the entity change. Check for duplicate codes and existing references." }, { status: 500 });
  }
}
