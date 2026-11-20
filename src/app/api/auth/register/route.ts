import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  firmName: z.string().trim().min(2).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter your name, firm name, valid email, and a password of at least 12 characters." },
        { status: 400 }
      );
    }

    const { name, firmName, password } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const slugBase = firmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "firm";
    const slug = `${slugBase}-${randomUUID().slice(0, 8)}`;

    const user = await prisma.$transaction(async (tx) => {
      const firm = await tx.firm.create({ data: { name: firmName, slug } });
      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: Role.ADMIN,
          firmId: firm.id,
        },
      });
    });

    // Audit logging must not block a successfully created account.
    try {
      await prisma.auditLog.create({
        data: {
          action: "USER_REGISTERED",
          entityType: "User",
          entityId: user.id,
          userId: user.id,
          details: JSON.stringify({ method: "credentials" }),
        },
      });
    } catch (auditError) {
      console.error("FINOVA registration audit log error:", auditError);
    }

    return NextResponse.json(
      { success: true, message: "Your FINOVA workspace is ready. You can now sign in." },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("FINOVA registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
