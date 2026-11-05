/**
 * Financial Statement Generator
 * Takes Trial Balance lines and produces Balance Sheet, Income Statement, Cash Flow (simplified)
 */

export type TBLine = {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  type?: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" | "COGS";
};

export type StatementLine = {
  code: string;
  name: string;
  amount: number;
  level: number;
  isTotal?: boolean;
};

export type FinancialStatements = {
  period: string;
  balanceSheet: {
    assets: StatementLine[];
    liabilities: StatementLine[];
    equity: StatementLine[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  incomeStatement: {
    revenue: StatementLine[];
    expenses: StatementLine[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  cashFlow: {
    operating: StatementLine[];
    investing: StatementLine[];
    financing: StatementLine[];
    netChange: number;
  };
  ratios: {
    currentRatio: number | null;
    debtToEquity: number | null;
    grossMargin: number | null;
    netMargin: number | null;
  };
};

function inferType(code: string, name: string): TBLine["type"] {
  const c = code.toUpperCase();
  const n = name.toLowerCase();
  if (c.startsWith("1") || n.includes("cash") || n.includes("receivable") || n.includes("inventory") || n.includes("asset"))
    return "ASSET";
  if (c.startsWith("2") || n.includes("payable") || n.includes("loan") || n.includes("liability") || n.includes("accrual"))
    return "LIABILITY";
  if (c.startsWith("3") || n.includes("equity") || n.includes("capital") || n.includes("retained"))
    return "EQUITY";
  if (c.startsWith("4") || n.includes("revenue") || n.includes("sales") || n.includes("income"))
    return "REVENUE";
  if (c.startsWith("5") || n.includes("cogs") || n.includes("cost of"))
    return "COGS";
  return "EXPENSE";
}

function net(line: TBLine) {
  return (line.debit || 0) - (line.credit || 0);
}

export function generateStatements(lines: TBLine[], period: string): FinancialStatements {
  const classified = lines.map((l) => ({
    ...l,
    type: l.type || inferType(l.accountCode, l.accountName),
  }));

  const assets = classified.filter((l) => l.type === "ASSET");
  const liabilities = classified.filter((l) => l.type === "LIABILITY");
  const equity = classified.filter((l) => l.type === "EQUITY");
  const revenue = classified.filter((l) => l.type === "REVENUE");
  const cogs = classified.filter((l) => l.type === "COGS");
  const expenses = classified.filter((l) => l.type === "EXPENSE" || l.type === "COGS");

  const totalAssets = assets.reduce((s, l) => s + Math.abs(net(l)), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + Math.abs(net(l)), 0);
  const totalEquity = equity.reduce((s, l) => s + Math.abs(net(l)), 0);
  const totalRevenue = revenue.reduce((s, l) => s + Math.abs(net(l)), 0);
  const totalExpenses = expenses.reduce((s, l) => s + Math.abs(net(l)), 0);
  const netIncome = totalRevenue - totalExpenses;

  const cashFlowOperating: StatementLine[] = [
    { code: "", name: "Net Income", amount: netIncome, level: 1 },
    { code: "", name: "Adjustments (depreciation, WC  simplified)", amount: 0, level: 1 },
  ];

  const currentAssets = assets.filter(
    (l) =>
      l.accountName.toLowerCase().includes("cash") ||
      l.accountName.toLowerCase().includes("receivable") ||
      l.accountName.toLowerCase().includes("inventory")
  );
  const currentLiabilities = liabilities.filter(
    (l) =>
      l.accountName.toLowerCase().includes("payable") ||
      l.accountName.toLowerCase().includes("accrual") ||
      l.accountName.toLowerCase().includes("short")
  );
  const currentAssetsTotal = currentAssets.reduce((s, l) => s + Math.abs(net(l)), 0);
  const currentLiabTotal = currentLiabilities.reduce((s, l) => s + Math.abs(net(l)), 0);

  return {
    period,
    balanceSheet: {
      assets: assets.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: Math.abs(net(l)),
        level: 1,
      })),
      liabilities: liabilities.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: Math.abs(net(l)),
        level: 1,
      })),
      equity: equity.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: Math.abs(net(l)),
        level: 1,
      })),
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity + netIncome,
    },
    incomeStatement: {
      revenue: revenue.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: Math.abs(net(l)),
        level: 1,
      })),
      expenses: expenses.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: Math.abs(net(l)),
        level: 1,
      })),
      totalRevenue,
      totalExpenses,
      netIncome,
    },
    cashFlow: {
      operating: cashFlowOperating,
      investing: [{ code: "", name: "Purchase of Fixed Assets (simplified)", amount: 0, level: 1 }],
      financing: [{ code: "", name: "Debt / Equity movements (simplified)", amount: 0, level: 1 }],
      netChange: netIncome,
    },
    ratios: {
      currentRatio: currentLiabTotal > 0 ? currentAssetsTotal / currentLiabTotal : null,
      debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : null,
      grossMargin:
        totalRevenue > 0
          ? (totalRevenue - cogs.reduce((s, l) => s + Math.abs(net(l)), 0)) / totalRevenue
          : null,
      netMargin: totalRevenue > 0 ? netIncome / totalRevenue : null,
    },
  };
}

export function parseTrialBalanceCSV(csv: string): TBLine[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("account") || header.includes("code") || header.includes("debit");

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const result: TBLine[] = [];

  for (const row of dataLines) {
    const cols = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    let accountCode = "";
    let accountName = "";
    let debit = 0;
    let credit = 0;

    if (cols.length >= 4) {
      accountCode = cols[0];
      accountName = cols[1];
      debit = parseFloat(cols[2]) || 0;
      credit = parseFloat(cols[3]) || 0;
    } else {
      accountName = cols[0];
      debit = parseFloat(cols[1]) || 0;
      credit = parseFloat(cols[2]) || 0;
      accountCode = accountName.substring(0, 4).toUpperCase();
    }

    if (!accountName) continue;
    result.push({ accountCode, accountName, debit, credit });
  }

  return result;
}