import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { z } from "zod";
const STAFF = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];
const schema = z.object({ clientId: z.string().min(1), email: z.string().email().max(254) });
export async function POST(req: NextRequest) {
 const session = await getServerSession(authOptions);
 const id = (session?.user as { id?: string } | undefined)?.id;
 if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const actor = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
 if (!actor || !STAFF.includes(actor.role)) return NextResponse.json({ error: "Only authorized staff can link a client account." }, { status: 403 });
 const parsed = schema.safeParse(await req.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error: "Enter a valid client workspace and email." }, { status: 400 });
 const access = await authorizeClientAccess(parsed.data.clientId);
 if (!access.ok) return access.response;
 const target = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase().trim() }, select: { id: true, role: true, email: true } });
 if (!target || target.role !== "CLIENT") return NextResponse.json({ error: "No client account exists for that email." }, { status: 404 });
 await prisma.user.update({ where: { id: target.id }, data: { clientId: access.client.id, firmId: access.client.firmId } });
 await prisma.auditLog.create({ data: { action: "CLIENT_ACCOUNT_LINKED", entityType: "User", entityId: target.id, userId: access.user.id, details: JSON.stringify({ clientId: access.client.id, email: target.email }) } });
 return NextResponse.json({ success: true, message: "Client account linked to " + access.client.name + "." });
}