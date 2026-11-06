import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasAnyRole } from "@/lib/access";

const inviteSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().min(2).max(100),
  role: z.nativeEnum(Role),
});

const privileged = ["ADMIN", "PARTNER"];
const allowedByRole: Record<string, Role[]> = {
  ADMIN: Object.values(Role),
  PARTNER: [Role.CLIENT, Role.STAFF_ACCOUNTANT, Role.SENIOR_ACCOUNTANT, Role.CONTROLLER, Role.CFO, Role.AUDITOR, Role.AUDIT_MANAGER, Role.TAX_MANAGER],
  CONTROLLER: [Role.CLIENT, Role.STAFF_ACCOUNTANT, Role.SENIOR_ACCOUNTANT],
};

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasAnyRole(currentUser, ["ADMIN", "PARTNER", "CONTROLLER"]) || !currentUser.firmId) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const parsed = inviteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (!allowedByRole[currentUser.role]?.includes(data.role)) {
      return NextResponse.json({ error: "You cannot assign that role." }, { status: 403 });
    }

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const temporaryPassword = randomBytes(18).toString("base64url");
    const passwordHash = await hash(temporaryPassword, 12);
    const user = await prisma.user.create({
      data: { email, name: data.name, passwordHash, role: data.role, firmId: currentUser.firmId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_INVITED", entityType: "User", entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role, invitedBy: currentUser.id }),
        userId: currentUser.id,
      },
    });

    // Demo delivery only: production must send a one-time invitation/reset link by email.
    return NextResponse.json({ success: true, user, temporaryPassword }, { status: 201 });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Invite failed" }, { status: 500 });
  }
}

export async function GET() {
  const currentUser = await getSessionUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasAnyRole(currentUser, privileged) || !currentUser.firmId) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { firmId: currentUser.firmId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}
