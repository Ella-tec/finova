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
  accountType: z.enum(["staff", "client"]).optional().default("staff"),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Enter your name, firm/company name, valid email, and a password of at least 12 characters.",
        },
        { status: 400 }
      );
    }

    const { name, firmName, password, accountType } = parsed.data;
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    if (accountType === "client") {
      // Never attach a self-registered client to the first existing firm.
      // Create an isolated tenant until an authorized firm explicitly links/invites them.
      const slug = "client-" + randomUUID().slice(0, 12);
      const user = await prisma.$transaction(async (tx) => {
        const firm = await tx.firm.create({ data: { name: firmName, slug } });
        const client = await tx.client.create({ data: { name: firmName, firmId: firm.id } });
        return tx.user.create({
          data: { name, email, passwordHash, role: Role.CLIENT, firmId: firm.id, clientId: client.id },
        });
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "USER_REGISTERED",
            entityType: "User",
            entityId: user.id,
            userId: user.id,
            details: JSON.stringify({ method: "credentials", accountType: "client" }),
          },
        });
      } catch {
        /* non-blocking */
      }

      return NextResponse.json({
        ok: true,
        role: "CLIENT",
        redirect: "/portal",
        userId: user.id,
      });
    }

    const slugBase =
      firmName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 45) || "firm";
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

    try {
      await prisma.auditLog.create({
        data: {
          action: "USER_REGISTERED",
          entityType: "User",
          entityId: user.id,
          userId: user.id,
          details: JSON.stringify({ method: "credentials", accountType: "staff" }),
        },
      });
    } catch {
      /* non-blocking */
    }

    return NextResponse.json({
      ok: true,
      role: "ADMIN",
      redirect: "/dashboard",
      userId: user.id,
    });
  } catch (error) {
    console.error("register failed", error);
    return NextResponse.json(
      { error: "Could not create the account. Please try again." },
      { status: 500 }
    );
  }
}
