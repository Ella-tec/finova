import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { autoMatch, getSampleBankData, BankTxn } from "@/lib/bank/matcher";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const clientId = req.nextUrl.searchParams.get("clientId") || "demo-client-001";

  const rows = await prisma.bankTransaction.findMany({
    where: { period, clientId },
    orderBy: { date: "asc" },
  });

  if (rows.length === 0) {
    // Seed sample data for the period
    const sample = getSampleBankData(period);
    const toCreate = [
      ...sample.bank.map((t) => ({
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type,
        source: t.source,
        period,
        clientId,
        matched: false,
      })),
      ...sample.book.map((t) => ({
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type,
        source: t.source,
        period,
        clientId,
        matched: false,
      })),
    ];
    await prisma.bankTransaction.createMany({ data: toCreate });
    const seeded = await prisma.bankTransaction.findMany({
      where: { period, clientId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ transactions: seeded, period });
  }

  return NextResponse.json({ transactions: rows, period });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, period, clientId = "demo-client-001", bankId, bookId } = body;

    if (action === "auto-match") {
      const rows = await prisma.bankTransaction.findMany({
        where: { period, clientId },
      });

      const bank: BankTxn[] = rows
        .filter((r) => r.source === "BANK")
        .map((r) => ({
          id: r.id,
          date: r.date.toISOString().slice(0, 10),
          description: r.description,
          amount: r.amount,
          type: r.type as "DEBIT" | "CREDIT",
          source: "BANK",
          matched: r.matched,
        }));

      const book: BankTxn[] = rows
        .filter((r) => r.source === "BOOK")
        .map((r) => ({
          id: r.id,
          date: r.date.toISOString().slice(0, 10),
          description: r.description,
          amount: r.amount,
          type: r.type as "DEBIT" | "CREDIT",
          source: "BOOK",
          matched: r.matched,
        }));

      const result = autoMatch(bank, book);

      // Persist matches
      for (const m of result.matches) {
        await prisma.bankTransaction.update({
          where: { id: m.bankId },
          data: {
            matched: true,
            matchConfidence: m.confidence,
            matchedToId: m.bookId,
          },
        });
        await prisma.bankTransaction.update({
          where: { id: m.bookId },
          data: {
            matched: true,
            matchConfidence: m.confidence,
            matchedToId: m.bankId,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: "BANK_REC_AUTO_MATCH",
          entityType: "BankReconciliation",
          details: JSON.stringify({
            period,
            matchCount: result.matches.length,
            unmatchedBank: result.unmatchedBank.length,
          }),
          userId: (session.user as any).id,
        },
      });

      const updated = await prisma.bankTransaction.findMany({
        where: { period, clientId },
        orderBy: { date: "asc" },
      });

      return NextResponse.json({
        success: true,
        matches: result.matches,
        unmatchedBank: result.unmatchedBank.length,
        unmatchedBook: result.unmatchedBook.length,
        transactions: updated,
      });
    }

    if (action === "manual-match" && bankId && bookId) {
      await prisma.bankTransaction.update({
        where: { id: bankId },
        data: { matched: true, matchConfidence: 1, matchedToId: bookId },
      });
      await prisma.bankTransaction.update({
        where: { id: bookId },
        data: { matched: true, matchConfidence: 1, matchedToId: bankId },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "unmatch" && bankId) {
      const txn = await prisma.bankTransaction.findUnique({ where: { id: bankId } });
      if (txn?.matchedToId) {
        await prisma.bankTransaction.update({
          where: { id: txn.matchedToId },
          data: { matched: false, matchConfidence: null, matchedToId: null },
        });
      }
      await prisma.bankTransaction.update({
        where: { id: bankId },
        data: { matched: false, matchConfidence: null, matchedToId: null },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Bank rec error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}