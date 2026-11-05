/**
 * Multi-entity consolidation with:
 * - Ownership %
 * - Intercompany eliminations
 * - NCI (non-controlling interest)
 * - Simple currency translation (closing-rate method for BS, average for P&L)
 */

export type EntityTBLine = {
  entityId: string;
  entityCode: string;
  entityName: string;
  ownershipPct: number;
  currency?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  type?: string;
};

export type ConsolidatedLine = {
  accountCode: string;
  accountName: string;
  type: string;
  entities: Record<string, number>;
  consolidated: number;
  eliminations: number;
  nci: number;
  final: number;
};

export type ConsolidationResult = {
  period: string;
  reportingCurrency: string;
  lines: ConsolidatedLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalNCI: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netIncomeAttributableToParent: number;
  netIncomeAttributableToNCI: number;
  eliminationEntries: { description: string; debitAccount: string; creditAccount: string; amount: number }[];
  fxRatesUsed: Record<string, number>;
};

function net(debit: number, credit: number) {
  return (debit || 0) - (credit || 0);
}

function inferType(code: string, name: string): string {
  const c = code.toUpperCase();
  const n = name.toLowerCase();
  if (c.startsWith("1") || n.includes("asset") || n.includes("cash") || n.includes("receivable") || n.includes("inventory")) return "ASSET";
  if (c.startsWith("2") || n.includes("payable") || n.includes("liability") || n.includes("loan")) return "LIABILITY";
  if (c.startsWith("3") || n.includes("equity") || n.includes("capital") || n.includes("retained") || n.includes("nci") || n.includes("non-controlling")) return "EQUITY";
  if (c.startsWith("4") || n.includes("revenue") || n.includes("sales")) return "REVENUE";
  return "EXPENSE";
}

function isICReceivable(name: string) {
  const n = name.toLowerCase();
  return n.includes("intercompany") && (n.includes("receivable") || n.includes("due from"));
}
function isICPayable(name: string) {
  const n = name.toLowerCase();
  return n.includes("intercompany") && (n.includes("payable") || n.includes("due to"));
}
function isICRevenue(name: string) {
  const n = name.toLowerCase();
  return n.includes("intercompany") && (n.includes("revenue") || n.includes("sales") || n.includes("income"));
}
function isICExpense(name: string) {
  const n = name.toLowerCase();
  return n.includes("intercompany") && (n.includes("expense") || n.includes("cost") || n.includes("cogs"));
}

/** Default FX rates to USD (demo). Override via rates param. */
export const DEFAULT_FX_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.74,
  AUD: 0.66,
  JPY: 0.0067,
  CHF: 1.12,
  INR: 0.012,
};

/**
 * Translate amounts into reporting currency.
 * BS-type accounts: closing rate; P&L: average rate (here we use same rate for simplicity unless avg provided).
 */
export function translateAmount(
  amount: number,
  fromCurrency: string,
  rates: Record<string, number>,
  _accountType?: string
): number {
  const rate = rates[fromCurrency] ?? rates[fromCurrency.toUpperCase()] ?? 1;
  return amount * rate;
}

export function consolidate(
  period: string,
  lines: EntityTBLine[],
  options?: {
    reportingCurrency?: string;
    fxRates?: Record<string, number>; // currency -> rate to reporting currency
  }
): ConsolidationResult {
  const reportingCurrency = options?.reportingCurrency || "USD";
  const fxRates = { ...DEFAULT_FX_TO_USD, ...options?.fxRates };

  // Translate + split parent share vs NCI share
  const adjusted = lines.map((l) => {
    const currency = (l.currency || "USD").toUpperCase();
    const localNet = net(l.debit, l.credit);
    const translated = translateAmount(localNet, currency, fxRates, l.type);
    const ownPct = (l.ownershipPct || 100) / 100;
    const nciPct = Math.max(0, 1 - ownPct);
    return {
      ...l,
      currency,
      type: l.type || inferType(l.accountCode, l.accountName),
      translatedNet: translated,
      parentShare: translated * ownPct,
      nciShare: translated * nciPct,
    };
  });

  const map = new Map<string, ConsolidatedLine>();

  for (const l of adjusted) {
    const key = `${l.accountCode}|${l.accountName}`;
    if (!map.has(key)) {
      map.set(key, {
        accountCode: l.accountCode,
        accountName: l.accountName,
        type: l.type!,
        entities: {},
        consolidated: 0,
        eliminations: 0,
        nci: 0,
        final: 0,
      });
    }
    const row = map.get(key)!;
    row.entities[l.entityCode] = (row.entities[l.entityCode] || 0) + l.translatedNet;
    row.consolidated += l.parentShare; // parent share only in "consolidated" column
    row.nci += l.nciShare;
  }

  // IC eliminations on full (translated) balances before NCI split is already in entities;
  // eliminate against consolidated+nci combined notionally
  let icAr = 0,
    icAp = 0,
    icRev = 0,
    icExp = 0;
  for (const row of map.values()) {
    const full = Object.values(row.entities).reduce((s, v) => s + v, 0);
    if (isICReceivable(row.accountName)) icAr += full;
    if (isICPayable(row.accountName)) icAp += Math.abs(full);
    if (isICRevenue(row.accountName)) icRev += Math.abs(full);
    if (isICExpense(row.accountName)) icExp += Math.abs(full);
  }

  const elimArAp = Math.min(Math.abs(icAr), Math.abs(icAp));
  const elimRevExp = Math.min(Math.abs(icRev), Math.abs(icExp));
  const eliminationEntries: ConsolidationResult["eliminationEntries"] = [];

  if (elimArAp > 0) {
    eliminationEntries.push({
      description: "Eliminate intercompany receivables/payables",
      debitAccount: "IC Payable",
      creditAccount: "IC Receivable",
      amount: elimArAp,
    });
    for (const row of map.values()) {
      const full = Object.values(row.entities).reduce((s, v) => s + v, 0);
      if (isICReceivable(row.accountName) && full !== 0) {
        row.eliminations -= Math.sign(full) * elimArAp * (Math.abs(full) / Math.abs(icAr || 1));
      }
      if (isICPayable(row.accountName) && full !== 0) {
        row.eliminations += Math.sign(full) * elimArAp * (Math.abs(full) / Math.abs(icAp || 1));
      }
    }
  }

  if (elimRevExp > 0) {
    eliminationEntries.push({
      description: "Eliminate intercompany revenue/expense",
      debitAccount: "IC Revenue",
      creditAccount: "IC Expense",
      amount: elimRevExp,
    });
    for (const row of map.values()) {
      if (isICRevenue(row.accountName)) {
        row.eliminations -= Math.sign(row.consolidated || 1) * Math.min(Math.abs(Object.values(row.entities).reduce((s, v) => s + v, 0)), elimRevExp);
      }
      if (isICExpense(row.accountName)) {
        row.eliminations += Math.sign(row.consolidated || 1) * Math.min(Math.abs(Object.values(row.entities).reduce((s, v) => s + v, 0)), elimRevExp);
      }
    }
  }

  const linesOut: ConsolidatedLine[] = [];
  for (const row of map.values()) {
    // Final attributable to parent group (excl. NCI column shown separately)
    row.final = row.consolidated + row.eliminations;
    linesOut.push(row);
  }
  linesOut.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const sumTypeParent = (t: string) =>
    linesOut.filter((l) => l.type === t).reduce((s, l) => s + Math.abs(l.final), 0);

  const totalRevenue = linesOut.filter((l) => l.type === "REVENUE").reduce((s, l) => s + Math.abs(l.final), 0);
  const totalExpenses = linesOut.filter((l) => l.type === "EXPENSE").reduce((s, l) => s + Math.abs(l.final), 0);
  const netIncome = totalRevenue - totalExpenses;

  // NCI share of net income from revenue/expense NCI columns
  const nciRevenue = linesOut.filter((l) => l.type === "REVENUE").reduce((s, l) => s + Math.abs(l.nci), 0);
  const nciExpense = linesOut.filter((l) => l.type === "EXPENSE").reduce((s, l) => s + Math.abs(l.nci), 0);
  const netIncomeAttributableToNCI = nciRevenue - nciExpense;
  const netIncomeAttributableToParent = netIncome; // already parent-share based
  const totalNCI = linesOut.filter((l) => l.type === "EQUITY" || l.type === "ASSET" || l.type === "LIABILITY").reduce((s, l) => s + l.nci, 0);

  // FX rates actually referenced
  const currenciesUsed = new Set(lines.map((l) => (l.currency || "USD").toUpperCase()));
  const fxRatesUsed: Record<string, number> = {};
  currenciesUsed.forEach((c) => {
    fxRatesUsed[c] = fxRates[c] ?? 1;
  });

  return {
    period,
    reportingCurrency,
    lines: linesOut,
    totalAssets: sumTypeParent("ASSET"),
    totalLiabilities: sumTypeParent("LIABILITY"),
    totalEquity: sumTypeParent("EQUITY"),
    totalNCI: Math.abs(totalNCI),
    totalRevenue,
    totalExpenses,
    netIncome,
    netIncomeAttributableToParent,
    netIncomeAttributableToNCI,
    eliminationEntries,
    fxRatesUsed,
  };
}

export function getSampleConsolidationData(period: string) {
  return {
    entities: [
      { code: "PARENT", name: "Finova Parent Co", ownershipPct: 100, currency: "USD" },
      { code: "SUB-A", name: "Subsidiary Alpha LLC", ownershipPct: 100, currency: "USD" },
      { code: "SUB-B", name: "Subsidiary Beta Inc", ownershipPct: 80, currency: "USD" },
      { code: "SUB-EU", name: "EU Operations GmbH", ownershipPct: 75, currency: "EUR" },
    ],
    lines: [
      { entityCode: "PARENT", accountCode: "1000", accountName: "Cash", debit: 500000, credit: 0 },
      { entityCode: "PARENT", accountCode: "1100", accountName: "Accounts Receivable", debit: 120000, credit: 0 },
      { entityCode: "PARENT", accountCode: "1150", accountName: "Intercompany Receivable - Sub A", debit: 50000, credit: 0 },
      { entityCode: "PARENT", accountCode: "2000", accountName: "Accounts Payable", debit: 0, credit: 80000 },
      { entityCode: "PARENT", accountCode: "3000", accountName: "Equity", debit: 0, credit: 400000 },
      { entityCode: "PARENT", accountCode: "4000", accountName: "Revenue", debit: 0, credit: 300000 },
      { entityCode: "PARENT", accountCode: "4100", accountName: "Intercompany Revenue - Sub A", debit: 0, credit: 25000 },
      { entityCode: "PARENT", accountCode: "6000", accountName: "Operating Expenses", debit: 135000, credit: 0 },
      { entityCode: "SUB-A", accountCode: "1000", accountName: "Cash", debit: 80000, credit: 0 },
      { entityCode: "SUB-A", accountCode: "1100", accountName: "Accounts Receivable", debit: 45000, credit: 0 },
      { entityCode: "SUB-A", accountCode: "2000", accountName: "Accounts Payable", debit: 0, credit: 30000 },
      { entityCode: "SUB-A", accountCode: "2100", accountName: "Intercompany Payable - Parent", debit: 0, credit: 50000 },
      { entityCode: "SUB-A", accountCode: "3000", accountName: "Equity", debit: 0, credit: 40000 },
      { entityCode: "SUB-A", accountCode: "4000", accountName: "Revenue", debit: 0, credit: 90000 },
      { entityCode: "SUB-A", accountCode: "5000", accountName: "Intercompany Expense - Parent", debit: 25000, credit: 0 },
      { entityCode: "SUB-A", accountCode: "6000", accountName: "Operating Expenses", debit: 60000, credit: 0 },
      { entityCode: "SUB-B", accountCode: "1000", accountName: "Cash", debit: 40000, credit: 0 },
      { entityCode: "SUB-B", accountCode: "1100", accountName: "Accounts Receivable", debit: 22000, credit: 0 },
      { entityCode: "SUB-B", accountCode: "2000", accountName: "Accounts Payable", debit: 0, credit: 15000 },
      { entityCode: "SUB-B", accountCode: "3000", accountName: "Equity", debit: 0, credit: 25000 },
      { entityCode: "SUB-B", accountCode: "4000", accountName: "Revenue", debit: 0, credit: 55000 },
      { entityCode: "SUB-B", accountCode: "6000", accountName: "Operating Expenses", debit: 33000, credit: 0 },
      // EU sub in EUR (will be translated)
      { entityCode: "SUB-EU", accountCode: "1000", accountName: "Cash", debit: 90000, credit: 0 },
      { entityCode: "SUB-EU", accountCode: "1100", accountName: "Accounts Receivable", debit: 40000, credit: 0 },
      { entityCode: "SUB-EU", accountCode: "2000", accountName: "Accounts Payable", debit: 0, credit: 35000 },
      { entityCode: "SUB-EU", accountCode: "3000", accountName: "Equity", debit: 0, credit: 50000 },
      { entityCode: "SUB-EU", accountCode: "4000", accountName: "Revenue", debit: 0, credit: 120000 },
      { entityCode: "SUB-EU", accountCode: "6000", accountName: "Operating Expenses", debit: 75000, credit: 0 },
    ].map((l) => ({ ...l, period })),
  };
}
