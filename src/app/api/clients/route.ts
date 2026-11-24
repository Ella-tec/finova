import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns client workspaces the signed-in user may access.
 * Staff: all clients on their firm. Heals missing firmId from seed.
 * Client role: only their linked client.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true, clientId: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "CLIENT") {
    const clients = user.clientId
      ? await prisma.client.findMany({
          where: { id: user.clientId },
          select: { id: true, name: true, legalName: true },
          orderBy: { name: "asc" },
        })
      : [];
    return NextResponse.json({
      clients,
      message: clients.length
        ? null
        : "This client login has no workspace linked. Ask your firm administrator to link a client record.",
    });
  }

  // Heal missing firmId (common after partial seed / old accounts)
  if (!user.firmId) {
    const firm =
      (await prisma.firm.findFirst({ where: { name: { contains: "Finova" } } })) ||
      (await prisma.firm.findFirst({ orderBy: { createdAt: "asc" } }));

    if (firm) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firmId: firm.id },
        select: { id: true, role: true, firmId: true, clientId: true, email: true },
      });
    }
  }

  if (!user.firmId) {
    return NextResponse.json(
      {
        clients: [],
        error:
          "No firm is linked to this account. Run seed: $env:FINOVA_ALLOW_SEED='1'; npx tsx prisma/seed.ts then sign in as demo@finova.ai",
      },
      { status: 403 }
    );
  }

  let clients = await prisma.client.findMany({
    where: { firmId: user.firmId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, legalName: true },
  });

  // Fallback: any clients in DB (then re-link to this firm)
  if (clients.length === 0) {
    const anyClients = await prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, legalName: true },
      take: 50,
    });
    if (anyClients.length > 0) {
      await prisma.client.updateMany({
        where: { id: { in: anyClients.map((c) => c.id) } },
        data: { firmId: user.firmId },
      });
      clients = anyClients;
    }
  }

  return NextResponse.json({
    clients,
    message: clients.length
      ? null
      : "No client workspaces found. Run: $env:FINOVA_ALLOW_SEED='1'; npx tsx prisma/seed.ts",
  });
}
