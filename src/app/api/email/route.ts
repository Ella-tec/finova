import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, pbcRequestEmail, pbcStatusEmail } from "@/lib/email/send";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const portalBase = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (body.type === "pbc_request" && body.pbcId) {
      const pbc = await prisma.pbcRequest.findUnique({
        where: { id: body.pbcId },
        include: { client: true },
      });
      if (!pbc) return NextResponse.json({ error: "PBC not found" }, { status: 404 });

      // Find a client user email for this client
      const clientUser = await prisma.user.findFirst({
        where: { clientId: pbc.clientId, role: "CLIENT" },
      });
      const to = body.to || clientUser?.email || body.fallbackEmail;
      if (!to) return NextResponse.json({ error: "No recipient email" }, { status: 400 });

      const { subject, body: emailBody } = pbcRequestEmail({
        clientName: pbc.client?.name || "Client",
        title: pbc.title,
        description: pbc.description || undefined,
        priority: pbc.priority,
        dueDate: pbc.dueDate ? pbc.dueDate.toLocaleDateString() : undefined,
        portalUrl: `${portalBase}/portal/requests`,
      });

      const result = await sendEmail({
        to,
        subject,
        body: emailBody,
        template: "pbc_request",
        relatedType: "PbcRequest",
        relatedId: pbc.id,
      });
      return NextResponse.json(result);
    }

    if (body.type === "pbc_status" && body.pbcId) {
      const pbc = await prisma.pbcRequest.findUnique({
        where: { id: body.pbcId },
        include: { client: true },
      });
      if (!pbc) return NextResponse.json({ error: "PBC not found" }, { status: 404 });

      const clientUser = await prisma.user.findFirst({
        where: { clientId: pbc.clientId, role: "CLIENT" },
      });
      const to = body.to || clientUser?.email;
      if (!to) return NextResponse.json({ error: "No recipient email" }, { status: 400 });

      const { subject, body: emailBody } = pbcStatusEmail({
        clientName: pbc.client?.name || "Client",
        title: pbc.title,
        status: pbc.status,
        portalUrl: `${portalBase}/portal/requests`,
      });

      const result = await sendEmail({
        to,
        subject,
        body: emailBody,
        template: "pbc_status",
        relatedType: "PbcRequest",
        relatedId: pbc.id,
      });
      return NextResponse.json(result);
    }

    // Generic send
    if (body.to && body.subject && body.body) {
      const result = await sendEmail(body);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid email request" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ logs });
}
