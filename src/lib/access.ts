import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  role: string;
  firmId?: string | null;
  clientId?: string | null;
  email?: string | null;
};

/** Resolve a signed-in user from the server-side NextAuth session. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as SessionUser;
  return user.id ? user : null;
}

/** Enforce firm/client tenancy for every client-scoped resource. */
export async function canAccessClient(user: SessionUser, clientId: string): Promise<boolean> {
  if (!clientId) return false;
  if (user.role === "CLIENT") return user.clientId === clientId;
  if (!user.firmId) return false;
  const client = await prisma.client.findFirst({
    where: { id: clientId, firmId: user.firmId },
    select: { id: true },
  });
  return Boolean(client);
}

export function hasAnyRole(user: SessionUser, roles: string[]): boolean {
  return roles.includes(user.role);
}
