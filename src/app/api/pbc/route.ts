import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  clientId: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId");
  const where = clientId ? { clientId } : {};

  const requests = await prisma.pbcRequest.findMany({
    where,
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Status update
    if (body.id && body.status) {
      const updated = await prisma.pbcRequest.update({
        where: { id: body.id },
        data: { status: body.status },
      });
      await prisma.auditLog.create({
        data: {
          action: "PBC_STATUS_UPDATED",
          entityType: "PbcRequest",
          entityId: body.id,
          details: JSON.stringify({ status: body.status }),
          userId: (session.user as any).id,
        },
      });
      return NextResponse.json({ success: true, request: updated });
    }

    // Create
    const data = createSchema.parse(body);
    const request = await prisma.pbcRequest.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        clientId: data.clientId,
        status: "REQUESTED",
      },
      include: { client: { select: { id: true, name: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: "PBC_CREATED",
        entityType: "PbcRequest",
        entityId: request.id,
        details: JSON.stringify({ title: request.title, priority: request.priority }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    }
    console.error("PBC error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}