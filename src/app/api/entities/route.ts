import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const entitySchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1),
  currency: z.string().default("USD"),
  ownershipPct: z.number().min(0).max(100).default(100),
  parentId: z.string().optional().nullable(),
  isEliminating: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const firmId = (session.user as any).firmId;
  const entities = await prisma.entity.findMany({
    where: firmId ? { firmId } : {},
    orderBy: { code: "asc" },
  });
  return NextResponse.json({ entities });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const firmId = (session.user as any).firmId;

    // Delete
    if (body.action === "delete" && body.id) {
      await prisma.entityBalance.deleteMany({ where: { entityId: body.id } });
      await prisma.entity.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    // Update
    if (body.id) {
      const data = entitySchema.partial().parse(body);
      const updated = await prisma.entity.update({
        where: { id: body.id },
        data: {
          code: data.code,
          name: data.name,
          currency: data.currency,
          ownershipPct: data.ownershipPct,
          parentId: data.parentId,
          isEliminating: data.isEliminating,
        },
      });
      return NextResponse.json({ success: true, entity: updated });
    }

    // Create
    const data = entitySchema.parse(body);
    const entity = await prisma.entity.create({
      data: {
        code: data.code,
        name: data.name,
        currency: data.currency || "USD",
        ownershipPct: data.ownershipPct ?? 100,
        parentId: data.parentId || null,
        isEliminating: data.isEliminating || false,
        firmId: firmId || null,
      },
    });
    return NextResponse.json({ success: true, entity }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
