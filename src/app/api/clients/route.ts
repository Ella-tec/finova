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
    select: { role: true, firmId: true, clientId: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = user.role === "CLIENT"
    ? user.clientId
      ? await prisma.client.findMany({ where: { id: user.clientId }, select: { id: true, name: true, legalName: true } })
      : []
    : user.firmId
      ? await prisma.client.findMany({ where: { firmId: user.firmId }, orderBy: { name: "asc" }, select: { id: true, name: true, legalName: true } })
      : null;

  if (clients === null) return NextResponse.json({ error: "No firm workspace is assigned to this account." }, { status: 403 });
  return NextResponse.json({ clients });
}