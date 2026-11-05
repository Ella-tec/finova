/**
 * AI Bank Reconciliation Matcher (simulation)
 * Matches bank transactions to book entries by amount + fuzzy description + date proximity.
 */

export type BankTxn = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  reference?: string;
  matched?: boolean;
  matchConfidence?: number;
  matchedToId?: string;
  matchedToDescription?: string;
  source: "BANK" | "BOOK";
};

export type MatchResult = {
  bankId: string;
  bookId: string;
  confidence: number;
  reason: string;
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function amountClose(a: number, b: number, tolerance = 0.01) {
  return Math.abs(Math.abs(a) - Math.abs(b)) <= tolerance;
}

function dateClose(d1: string, d2: string, days = 3) {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.abs(t1 - t2) <= days * 24 * 60 * 60 * 1000;
}

function descriptionScore(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = new Set(na.split(" "));
  const wordsB = new Set(nb.split(" "));
  let common = 0;
  wordsA.forEach((w) => {
    if (w.length > 2 && wordsB.has(w)) common++;
  });
  const union = new Set([...wordsA, ...wordsB]).size;
  return union ? common / union : 0;
}

export function autoMatch(
  bankTxns: BankTxn[],
  bookTxns: BankTxn[]
): { matches: MatchResult[]; unmatchedBank: BankTxn[]; unmatchedBook: BankTxn[] } {
  const matches: MatchResult[] = [];
  const usedBook = new Set<string>();
  const usedBank = new Set<string>();

  // Sort by amount magnitude for better matching order
  const bankSorted = [...bankTxns].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  for (const bank of bankSorted) {
    if (usedBank.has(bank.id)) continue;

    let best: { book: BankTxn; score: number; reason: string } | null = null;

    for (const book of bookTxns) {
      if (usedBook.has(book.id)) continue;
      if (!amountClose(bank.amount, book.amount)) continue;

      let score = 0.4; // base for amount match
      const descScore = descriptionScore(bank.description, book.description);
      score += descScore * 0.4;

      if (dateClose(bank.date, book.date)) score += 0.2;

      // Prefer opposite signs that form a logical match (deposit vs receipt etc.)
      if (
        (bank.type === "CREDIT" && book.type === "CREDIT") ||
        (bank.type === "DEBIT" && book.type === "DEBIT")
      ) {
        score += 0.05;
      }

      if (!best || score > best.score) {
        best = {
          book,
          score: Math.min(0.99, score),
          reason:
            descScore > 0.7
              ? "Amount + strong description match"
              : dateClose(bank.date, book.date)
                ? "Amount + date proximity"
                : "Amount match only",
        };
      }
    }

    if (best && best.score >= 0.55) {
      matches.push({
        bankId: bank.id,
        bookId: best.book.id,
        confidence: best.score,
        reason: best.reason,
      });
      usedBank.add(bank.id);
      usedBook.add(best.book.id);
    }
  }

  return {
    matches,
    unmatchedBank: bankTxns.filter((t) => !usedBank.has(t.id)),
    unmatchedBook: bookTxns.filter((t) => !usedBook.has(t.id)),
  };
}

/** Sample data for demo */
export function getSampleBankData(period: string): { bank: BankTxn[]; book: BankTxn[] } {
  const bank: BankTxn[] = [
    { id: "b1", date: `${period}-02`, description: "ACH DEPOSIT ACME CUSTOMER PAYMENT", amount: 12500, type: "CREDIT", source: "BANK" },
    { id: "b2", date: `${period}-05`, description: "CHECK 4521 OFFICE SUPPLIES CO", amount: -1344.6, type: "DEBIT", source: "BANK" },
    { id: "b3", date: `${period}-08`, description: "WIRE TRANSFER PAYROLL", amount: -28400, type: "DEBIT", source: "BANK" },
    { id: "b4", date: `${period}-12`, description: "POS PURCHASE AMAZON", amount: -186.42, type: "DEBIT", source: "BANK" },
    { id: "b5", date: `${period}-15`, description: "CUSTOMER ACH INV-8821", amount: 8750, type: "CREDIT", source: "BANK" },
    { id: "b6", date: `${period}-18`, description: "UTILITY PAYMENT ELECTRIC", amount: -1240, type: "DEBIT", source: "BANK" },
    { id: "b7", date: `${period}-22`, description: "UNKNOWN TRANSFER", amount: -500, type: "DEBIT", source: "BANK" },
    { id: "b8", date: `${period}-28`, description: "INTEREST CREDIT", amount: 42.15, type: "CREDIT", source: "BANK" },
  ];

  const book: BankTxn[] = [
    { id: "k1", date: `${period}-02`, description: "Customer payment - Acme", amount: 12500, type: "CREDIT", source: "BOOK" },
    { id: "k2", date: `${period}-05`, description: "Office Supplies Co Invoice INV-2026-8842", amount: -1344.6, type: "DEBIT", source: "BOOK" },
    { id: "k3", date: `${period}-08`, description: "Semi-monthly Payroll", amount: -28400, type: "DEBIT", source: "BOOK" },
    { id: "k4", date: `${period}-12`, description: "Amazon business purchase", amount: -186.42, type: "DEBIT", source: "BOOK" },
    { id: "k5", date: `${period}-15`, description: "Payment received INV-8821", amount: 8750, type: "CREDIT", source: "BOOK" },
    { id: "k6", date: `${period}-18`, description: "Electric utility bill", amount: -1240, type: "DEBIT", source: "BOOK" },
    { id: "k7", date: `${period}-25`, description: "Rent payment - not yet cleared", amount: -4500, type: "DEBIT", source: "BOOK" },
  ];

  return { bank, book };
}