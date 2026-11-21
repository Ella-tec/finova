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
  clientId: z.string().min(1).optional(),
  password: z.string().min(12).max(128).optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120).optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(12).max(128).optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
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
    if (!INVITERS.includes(currentUser.role as (typeof INVITERS)[number]) || !currentUser.firmId) {
      return NextResponse.json(
        { error: "Firm administrator, partner, or controller access is required." },
        { status: 403 }
      );
    }

    const parsed = inviteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invitation details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (!canAssignRole(currentUser.role, data.role)) {
      return NextResponse.json(
        { error: "You cannot assign a role at or above your own permission level." },
        { status: 403 }
      );
    }

    let assignedClientId: string | null = null;
    if (data.role === "CLIENT") {
      if (!data.clientId) {
        return NextResponse.json(
          { error: "Select the client workspace this portal user will belong to." },
          { status: 400 }
        );
      }
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, firmId: currentUser.firmId },
        select: { id: true },
      });
      if (!client)
        return NextResponse.json(
          { error: "The selected client does not belong to your firm." },
          { status: 403 }
        );
      assignedClientId = client.id;
    } else if (data.clientId) {
      return NextResponse.json(
        { error: "Client workspace assignment is only valid for a Client role." },
        { status: 400 }
      );
    }

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });

    const temporaryPassword = data.password || randomBytes(18).toString("base64url");
    const passwordHash = await hash(temporaryPassword, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name,
        passwordHash,
        role: data.role,
        firmId: currentUser.firmId,
        clientId: assignedClientId,
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
          clientId: assignedClientId,
        }),
        userId: currentUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        temporaryPassword,
        invitationDelivery: data.password ? "ADMIN_SET_PASSWORD" : "GENERATED_TEMP_PASSWORD",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json(
      { error: "Invite failed. Check for duplicate email or firm configuration." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentUser = await currentFirmAdmin();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!INVITERS.includes(currentUser.role as (typeof INVITERS)[number]) || !currentUser.firmId) {
    return NextResponse.json(
      { error: "Firm administrator, partner, or controller access is required to view team members." },
      { status: 403 }
    );
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

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await currentFirmAdmin();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!INVITERS.includes(currentUser.role as (typeof INVITERS)[number]) || !currentUser.firmId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const target = await prisma.user.findFirst({
      where: { id: parsed.data.id, firmId: currentUser.firmId },
    });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (parsed.data.role && !canAssignRole(currentUser.role, parsed.data.role)) {
      return NextResponse.json({ error: "You cannot assign that role." }, { status: 403 });
    }

    const data: { name?: string; role?: Role; passwordHash?: string } = {};
    if (parsed.data.name) data.name = parsed.data.name;
    if (parsed.data.role) data.role = parsed.data.role;
    if (parsed.data.password) data.passwordHash = await hash(parsed.data.password, 12);

    const user = await prisma.user.update({
      where: { id: target.id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATED",
        entityType: "User",
        entityId: user.id,
        details: JSON.stringify({ fields: Object.keys(data) }),
        userId: currentUser.id,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await currentFirmAdmin();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (currentUser.role !== "ADMIN" && currentUser.role !== "PARTNER") {
      return NextResponse.json({ error: "Only admin or partner can delete accounts" }, { status: 403 });
    }

    const parsed = deleteSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    if (parsed.data.id === currentUser.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { id: parsed.data.id, firmId: currentUser.firmId || undefined },
    });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.user.delete({ where: { id: target.id } });

    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        entityType: "User",
        entityId: target.id,
        details: JSON.stringify({ email: target.email }),
        userId: currentUser.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
