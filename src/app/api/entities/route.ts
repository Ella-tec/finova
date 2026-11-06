import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasAnyRole } from "@/lib/access";
import { z } from "zod";

const entitySchema = z.object({
  code: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(120),
  currency: z.string().regex(/^[A-Z]{3}$/).default("USD"),
  ownershipPct: z.number().min(0).max(100).default(100),
  parentId: z.string().nullable().optional(),
  isEliminating: z.boolean().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.firmId || user.role === "CLIENT") return NextResponse.json({ error: "Firm access required" }, { status: 403 });
  const entities = await prisma.entity.findMany({ where: { firmId: user.firmId }, orderBy: { code: "asc" } });
  return NextResponse.json({ entities });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.firmId || !hasAnyRole(user, ["ADMIN", "PARTNER", "CONTROLLER"])) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

    const body = await req.json();
    if (body.action === "delete" && typeof body.id === "string") {
      const entity = await prisma.entity.findFirst({ where: { id: body.id, firmId: user.firmId }, select: { id: true } });
      if (!entity) return NextResponse.json({ error: "Entity not found" }, { status: 404 });
      await prisma.entityBalance.deleteMany({ where: { entityId: entity.id } });
      await prisma.entity.delete({ where: { id: entity.id } });
      return NextResponse.json({ success: true });
    }

    if (typeof body.id === "string") {
      const existing = await prisma.entity.findFirst({ where: { id: body.id, firmId: user.firmId }, select: { id: true } });
      if (!existing) return NextResponse.json({ error: "Entity not found" }, { status: 404 });
      const parsed = entitySchema.partial().safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
      const data = parsed.data;
      const entity = await prisma.entity.update({
        where: { id: existing.id },
        data: { ...data, parentId: data.parentId || null },
      });
      return NextResponse.json({ success: true, entity });
    }

    const parsed = entitySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (data.parentId) {
      const parent = await prisma.entity.findFirst({ where: { id: data.parentId, firmId: user.firmId }, select: { id: true } });
      if (!parent) return NextResponse.json({ error: "Parent entity not found" }, { status: 400 });
    }
    const entity = await prisma.entity.create({ data: { ...data, parentId: data.parentId || null, firmId: user.firmId } });
    return NextResponse.json({ success: true, entity }, { status: 201 });
  } catch (error) {
    console.error("Entity API error:", error);
    return NextResponse.json({ error: "Entity operation failed" }, { status: 500 });
  }
}
