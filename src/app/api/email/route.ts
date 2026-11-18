import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, pbcRequestEmail, pbcStatusEmail } from "@/lib/email/send";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true, clientId: true },
  });
}

const STAFF_ROLES = ["STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO", "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN"];

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const portalBase = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (body.type === "pbc_request" && body.pbcId) {
      if (!STAFF_ROLES.includes(user.role)) {
        return NextResponse.json({ error: "Only authorized firm staff may send PBC notifications." }, { status: 403 });
      }
      const pbc = await prisma.pbcRequest.findUnique({
        where: { id: String(body.pbcId) },
        include: { client: true },
      });
      if (!pbc) return NextResponse.json({ error: "PBC not found" }, { status: 404 });
      const access = await authorizeClientAccess(pbc.clientId);
      if (!access.ok) return access.response;
      const clientUser = await prisma.user.findFirst({
        where: { clientId: pbc.clientId, role: "CLIENT" },
        orderBy: { createdAt: "asc" },
        select: { email: true },
      });
      if (!clientUser?.email) return NextResponse.json({ error: "No client portal recipient is configured for this client." }, { status: 409 });

      const { subject, body: emailBody } = pbcRequestEmail({
        clientName: pbc.client?.name || "Client",
        title: pbc.title,
        description: pbc.description || undefined,
        priority: pbc.priority,
        dueDate: pbc.dueDate ? pbc.dueDate.toLocaleDateString() : undefined,
        portalUrl: `${portalBase}/portal/requests`,
      });
      const result = await sendEmail({
        to: clientUser.email,
        subject,
        body: emailBody,
        template: "pbc_request",
        relatedType: "PbcRequest",
        relatedId: pbc.id,
      });
      await prisma.auditLog.create({
        data: {
          action: "PBC_NOTIFICATION_REQUESTED",
          entityType: "PbcRequest",
          entityId: pbc.id,
          details: JSON.stringify({ recipientConfigured: true }),
          userId: access.user.id,
        },
      });
      return NextResponse.json(result);
    }

    if (body.type === "pbc_status" && body.pbcId) {
      if (!STAFF_ROLES.includes(user.role)) {
        return NextResponse.json({ error: "Only authorized firm staff may send PBC notifications." }, { status: 403 });
      }
      const pbc = await prisma.pbcRequest.findUnique({
        where: { id: String(body.pbcId) },
        include: { client: true },
      });
      if (!pbc) return NextResponse.json({ error: "PBC not found" }, { status: 404 });
      const access = await authorizeClientAccess(pbc.clientId);
      if (!access.ok) return access.response;
      const clientUser = await prisma.user.findFirst({
        where: { clientId: pbc.clientId, role: "CLIENT" },
        orderBy: { createdAt: "asc" },
        select: { email: true },
      });
      if (!clientUser?.email) return NextResponse.json({ error: "No client portal recipient is configured for this client." }, { status: 409 });

      const { subject, body: emailBody } = pbcStatusEmail({
        clientName: pbc.client?.name || "Client",
        title: pbc.title,
        status: pbc.status,
        portalUrl: `${portalBase}/portal/requests`,
      });
      const result = await sendEmail({
        to: clientUser.email,
        subject,
        body: emailBody,
        template: "pbc_status",
        relatedType: "PbcRequest",
        relatedId: pbc.id,
      });
      await prisma.auditLog.create({
        data: {
          action: "PBC_STATUS_NOTIFICATION_REQUESTED",
          entityType: "PbcRequest",
          entityId: pbc.id,
          details: JSON.stringify({ recipientConfigured: true }),
          userId: access.user.id,
        },
      });
      return NextResponse.json(result);
    }

    // Generic outbound mail is an administrative action, not a general signed-in capability.
    if (body.to && body.subject && body.body) {
      if (!["ADMIN", "PARTNER"].includes(user.role)) {
        return NextResponse.json({ error: "Generic outbound email requires administrator or partner permission." }, { status: 403 });
      }
      const result = await sendEmail(body);
      await prisma.auditLog.create({
        data: {
          action: "ADMIN_EMAIL_SENT",
          entityType: "Email",
          details: JSON.stringify({ to: String(body.to).slice(0, 254), subject: String(body.subject).slice(0, 180) }),
          userId: user.id,
        },
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid email request" }, { status: 400 });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Email could not be sent." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "PARTNER"].includes(user.role)) {
    return NextResponse.json({ error: "Administrator or partner access is required to view email delivery logs." }, { status: 403 });
  }
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
