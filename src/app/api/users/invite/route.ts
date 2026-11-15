import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().min(2).max(120),
  role: z.nativeEnum(Role),
});

const INVITERS = ["ADMIN", "PARTNER", "CONTROLLER"] as const;

async function currentFirmAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true },
  });
}

function canAssignRole(currentRole: string, requestedRole: Role) {
  if (currentRole === "ADMIN") return true;
  if (currentRole === "PARTNER") return requestedRole !== "ADMIN";
  return ["CLIENT", "STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT"].includes(requestedRole);
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await currentFirmAdmin();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!INVITERS.includes(currentUser.role as typeof INVITERS[number]) || !currentUser.firmId) {
      return NextResponse.json({ error: "Firm administrator, partner, or controller access is required." }, { status: 403 });
    }

    const parsed = inviteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid invitation details.", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    if (!canAssignRole(currentUser.role, data.role)) {
      return NextResponse.json({ error: "You cannot assign a role at or above your own permission level." }, { status: 403 });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        error: "Secure invitation delivery is not configured. Configure a verified password-setup or invitation email flow before inviting production users.",
      }, { status: 503 });
    }

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });

    const temporaryPassword = randomBytes(18).toString("base64url");
    const passwordHash = await hash(temporaryPassword, 12);
    const user = await prisma.user.create({
      data: {
        email,
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
          firmId: currentUser.firmId,
        }),
        userId: currentUser.id,
      },
    });

    // Development/demo only: display a one-time password so the local workflow can be tested.
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      temporaryPassword,
      invitationDelivery: "DEVELOPMENT_ONLY",
    }, { status: 201 });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Invite failed. Check for duplicate email or firm configuration." }, { status: 500 });
  }
}

export async function GET() {
  const currentUser = await currentFirmAdmin();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!INVITERS.includes(currentUser.role as typeof INVITERS[number]) || !currentUser.firmId) {
    return NextResponse.json({ error: "Firm administrator, partner, or controller access is required to view team members." }, { status: 403 });
  }

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
