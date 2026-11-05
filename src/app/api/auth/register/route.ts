import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  firmName: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(data.password, 12);

    // Create firm if provided (first user becomes admin of new firm)
    let firmId: string | undefined;
    if (data.firmName) {
      const slug = data.firmName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const firm = await prisma.firm.create({
        data: {
          name: data.firmName,
          slug: `${slug}-${Date.now().toString(36)}`,
        },
      });
      firmId = firm.id;
    }

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: firmId ? Role.ADMIN : Role.STAFF_ACCOUNTANT,
        firmId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        entityType: "User",
        entityId: user.id,
        details: JSON.stringify({ email: user.email, firmId }),
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    }
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}