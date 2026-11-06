import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the current user from the database (not just JWT claims) and verify
 * access to a client before any client-scoped read or write.
 */
export async function authorizeClientAccess(clientId: string) {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;

  if (!sessionUserId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const [user, client] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true, role: true, firmId: true, clientId: true },
    }),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, firmId: true },
    }),
  ]);

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!client) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Client not found" }, { status: 404 }),
    };
  }

  const isClientUser = user.role === "CLIENT";
  const canAccess = isClientUser
    ? user.clientId === client.id
    : Boolean(user.firmId && user.firmId === client.firmId);

  if (!canAccess) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, user, client };
}
