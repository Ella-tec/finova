import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, firmId: true, clientId: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "CLIENT") {
    const clients = user.clientId
      ? await prisma.client.findMany({
          where: { id: user.clientId },
          select: { id: true, name: true, legalName: true },
        })
      : [];
    return NextResponse.json({
      clients,
      message: clients.length
        ? null
        : "This client login has no workspace linked. Ask your firm administrator to link a client record.",
    });
  }

  if (!user.firmId) {
    return NextResponse.json(
      {
        clients: [],
        error:
          "No firm is linked to this account. Re-run the demo seed (FINOVA_ALLOW_SEED=1 on Neon) or assign a firm in Administration.",
      },
      { status: 403 }
    );
  }

  const clients = await prisma.client.findMany({
    where: { firmId: user.firmId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, legalName: true },
  });

  return NextResponse.json({
    clients,
    message: clients.length
      ? null
      : "No client workspaces exist for this firm yet. Run the demo seed against your database or create clients under Clients.",
  });
}
