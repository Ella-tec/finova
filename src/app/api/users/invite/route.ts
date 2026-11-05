import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(Role),
  temporaryPassword: z.string().min(8).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as any;
    if (!["ADMIN", "PARTNER", "CONTROLLER"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const data = inviteSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const tempPassword = data.temporaryPassword || `Temp${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: data.role,
        firmId: currentUser.firmId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_INVITED",
        entityType: "User",
        entityId: user.id,
        details: JSON.stringify({
          email: user.email,
          role: user.role,
          invitedBy: currentUser.id,
        }),
        userId: currentUser.id,
      },
    });

    // In production you would send an email here with the temp password or magic link
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      temporaryPassword: tempPassword, // only returned once for demo
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    }
    console.error("Invite error:", err);
    return NextResponse.json({ error: "Invite failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = session.user as any;
  const users = await prisma.user.findMany({
    where: { firmId: currentUser.firmId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}