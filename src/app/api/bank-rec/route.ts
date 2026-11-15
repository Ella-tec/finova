import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";
import { autoMatch, getSampleBankData, type BankTxn } from "@/lib/bank/matcher";

const isValidPeriod = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

async function getAccess(clientId: unknown) {
  if (typeof clientId !== "string" || !clientId.trim()) {
    return { ok: false as const, response: NextResponse.json({ error: "Choose an authorized client workspace." }, { status: 400 }) };
  }
  return authorizeClientAccess(clientId);
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || new Date().toISOString().slice(0, 7);
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!isValidPeriod(period)) return NextResponse.json({ error: "A valid YYYY-MM period is required." }, { status: 400 });
  const access = await getAccess(clientId);
  if (!access.ok) return access.response;

  let rows = await prisma.bankTransaction.findMany({
    where: { period, clientId: access.client.id },
    orderBy: { date: "asc" },
  });

  // Synthetic transactions are only created for an explicitly enabled demo workspace.
  if (rows.length === 0 && process.env.FINOVA_DEMO_DATA === "true") {
    const sample = getSampleBankData(period);
    const toCreate = [
      ...sample.bank.map((t) => ({
        date: new Date(t.date), description: t.description, amount: t.amount,
        type: t.type, source: t.source, period, clientId: access.client.id, matched: false,
      })),
      ...sample.book.map((t) => ({
        date: new Date(t.date), description: t.description, amount: t.amount,
        type: t.type, source: t.source, period, clientId: access.client.id, matched: false,
      })),
    ];
    if (toCreate.length) {
      await prisma.bankTransaction.createMany({ data: toCreate });
      rows = await prisma.bankTransaction.findMany({
        where: { period, clientId: access.client.id },
        orderBy: { date: "asc" },
      });
    }
  }

  return NextResponse.json({ transactions: rows, period, clientId: access.client.id });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, period, clientId, bankId, bookId } = body as {
      action?: string;
      period?: string;
      clientId?: string;
      bankId?: string;
      bookId?: string;
    };
    if (!isValidPeriod(period)) return NextResponse.json({ error: "A valid YYYY-MM period is required." }, { status: 400 });
    const access = await getAccess(clientId);
    if (!access.ok) return access.response;

    if (action === "auto-match") {
      const rows = await prisma.bankTransaction.findMany({
        where: { period, clientId: access.client.id },
      });
      const bank: BankTxn[] = rows.filter((row) => row.source === "BANK" && !row.matched).map((row) => ({
        id: row.id,
        date: row.date.toISOString().slice(0, 10),
        description: row.description,
        amount: row.amount,
        type: row.type as "DEBIT" | "CREDIT",
        source: "BANK",
        matched: row.matched,
      }));
      const book: BankTxn[] = rows.filter((row) => row.source === "BOOK" && !row.matched).map((row) => ({
        id: row.id,
        date: row.date.toISOString().slice(0, 10),
        description: row.description,
        amount: row.amount,
        type: row.type as "DEBIT" | "CREDIT",
        source: "BOOK",
        matched: row.matched,
      }));
      const result = autoMatch(bank, book);

      await prisma.$transaction(async (tx) => {
        for (const match of result.matches) {
          const bankRow = rows.find((row) => row.id === match.bankId && row.source === "BANK" && !row.matched);
          const bookRow = rows.find((row) => row.id === match.bookId && row.source === "BOOK" && !row.matched);
          if (!bankRow || !bookRow) continue;
          await tx.bankTransaction.update({
            where: { id: bankRow.id },
            data: { matched: true, matchConfidence: match.confidence, matchedToId: bookRow.id },
          });
          await tx.bankTransaction.update({
            where: { id: bookRow.id },
            data: { matched: true, matchConfidence: match.confidence, matchedToId: bankRow.id },
          });
        }
        await tx.auditLog.create({
          data: {
            action: "BANK_REC_AUTO_MATCH",
            entityType: "BankReconciliation",
            details: JSON.stringify({
              period,
              clientId: access.client.id,
              matchCount: result.matches.length,
              unmatchedBank: result.unmatchedBank.length,
              unmatchedBook: result.unmatchedBook.length,
            }),
            userId: access.user.id,
          },
        });
      });

      const updated = await prisma.bankTransaction.findMany({
        where: { period, clientId: access.client.id },
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

    if (action === "manual-match") {
      if (!bankId || !bookId || bankId === bookId) {
        return NextResponse.json({ error: "Select one bank transaction and one book entry." }, { status: 400 });
      }
      const [bankRow, bookRow] = await Promise.all([
        prisma.bankTransaction.findFirst({ where: { id: bankId, period, clientId: access.client.id, source: "BANK" } }),
        prisma.bankTransaction.findFirst({ where: { id: bookId, period, clientId: access.client.id, source: "BOOK" } }),
      ]);
      if (!bankRow || !bookRow) return NextResponse.json({ error: "Both transactions must belong to the selected client and period." }, { status: 404 });
      if (bankRow.matched || bookRow.matched) return NextResponse.json({ error: "One of these transactions is already matched. Refresh and try again." }, { status: 409 });
      if (Math.abs(Math.abs(bankRow.amount) - Math.abs(bookRow.amount)) > 0.01) {
        return NextResponse.json({ error: "Amounts do not agree. Resolve the difference before linking these entries." }, { status: 409 });
      }
      await prisma.$transaction([
        prisma.bankTransaction.update({ where: { id: bankRow.id }, data: { matched: true, matchConfidence: 1, matchedToId: bookRow.id } }),
        prisma.bankTransaction.update({ where: { id: bookRow.id }, data: { matched: true, matchConfidence: 1, matchedToId: bankRow.id } }),
        prisma.auditLog.create({
          data: {
            action: "BANK_REC_MANUAL_MATCH",
            entityType: "BankReconciliation",
            entityId: bankRow.id,
            details: JSON.stringify({ period, clientId: access.client.id, bankId: bankRow.id, bookId: bookRow.id }),
            userId: access.user.id,
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === "unmatch") {
      if (!bankId) return NextResponse.json({ error: "A matched bank transaction is required." }, { status: 400 });
      const bankRow = await prisma.bankTransaction.findFirst({
        where: { id: bankId, period, clientId: access.client.id, source: "BANK" },
      });
      if (!bankRow) return NextResponse.json({ error: "Bank transaction not found in this client workspace and period." }, { status: 404 });
      if (!bankRow.matchedToId) return NextResponse.json({ error: "This bank transaction is not currently matched." }, { status: 409 });
      const bookRow = await prisma.bankTransaction.findFirst({
        where: { id: bankRow.matchedToId, period, clientId: access.client.id, source: "BOOK" },
      });
      if (!bookRow) return NextResponse.json({ error: "The linked book entry could not be found in this reconciliation." }, { status: 409 });
      await prisma.$transaction([
        prisma.bankTransaction.update({ where: { id: bankRow.id }, data: { matched: false, matchConfidence: null, matchedToId: null } }),
        prisma.bankTransaction.update({ where: { id: bookRow.id }, data: { matched: false, matchConfidence: null, matchedToId: null } }),
        prisma.auditLog.create({
          data: {
            action: "BANK_REC_UNMATCH",
            entityType: "BankReconciliation",
            entityId: bankRow.id,
            details: JSON.stringify({ period, clientId: access.client.id, bankId: bankRow.id, bookId: bookRow.id }),
            userId: access.user.id,
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown reconciliation action." }, { status: 400 });
  } catch (error) {
    console.error("Bank reconciliation API error:", error);
    return NextResponse.json({ error: "Could not complete the reconciliation action." }, { status: 500 });
  }
}
