/**
 * Financial Statement Generator
 * Trial Balance → Balance Sheet, Income Statement, Cash Flow
 * Uses standard account normal balances and sectioned output.
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
  section?: string;
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
  trialBalance: {
    lines: TBLine[];
    totalDebit: number;
    totalCredit: number;
    balanced: boolean;
  };
};

function inferType(code: string, name: string): NonNullable<TBLine["type"]> {
  const c = String(code || "").trim().toUpperCase();
  const n = String(name || "").toLowerCase();

  if (c.startsWith("1") || /\b(cash|receivable|inventory|prepaid|asset|equipment|ppe|fleet|bank)\b/.test(n))
    return "ASSET";
  if (c.startsWith("2") || /\b(payable|loan|liability|accrual|deferred revenue|debt|billings)\b/.test(n))
    return "LIABILITY";
  if (c.startsWith("3") || /\b(equity|capital|retained|common stock|partners)\b/.test(n))
    return "EQUITY";
  if (c.startsWith("4") || /\b(revenue|sales|income|subscription|freight revenue|construction revenue)\b/.test(n))
    return "REVENUE";
  if (c.startsWith("5") || /\b(cogs|cost of|job costs|clinical supplies|fuel)\b/.test(n))
    return "COGS";
  return "EXPENSE";
}

/** Signed amount using normal balance: debit-normal positive as debit−credit */
function signedAmount(line: TBLine, type: NonNullable<TBLine["type"]>): number {
  const d = Number(line.debit) || 0;
  const c = Number(line.credit) || 0;
  // Debit-normal accounts
  if (type === "ASSET" || type === "EXPENSE" || type === "COGS") return d - c;
  // Credit-normal accounts
  return c - d;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function generateStatements(lines: TBLine[], period: string): FinancialStatements {
  const classified = lines.map((l) => ({
    ...l,
    debit: Number(l.debit) || 0,
    credit: Number(l.credit) || 0,
    type: (l.type || inferType(l.accountCode, l.accountName)) as NonNullable<TBLine["type"]>,
  }));

  const assets = classified.filter((l) => l.type === "ASSET");
  const liabilities = classified.filter((l) => l.type === "LIABILITY");
  const equity = classified.filter((l) => l.type === "EQUITY");
  const revenue = classified.filter((l) => l.type === "REVENUE");
  const cogs = classified.filter((l) => l.type === "COGS");
  const opex = classified.filter((l) => l.type === "EXPENSE");
  const expenses = [...cogs, ...opex];

  const totalAssets = round2(assets.reduce((s, l) => s + signedAmount(l, "ASSET"), 0));
  const totalLiabilities = round2(liabilities.reduce((s, l) => s + signedAmount(l, "LIABILITY"), 0));
  const equityBase = round2(equity.reduce((s, l) => s + signedAmount(l, "EQUITY"), 0));
  const totalRevenue = round2(revenue.reduce((s, l) => s + signedAmount(l, "REVENUE"), 0));
  const totalCogs = round2(cogs.reduce((s, l) => s + signedAmount(l, "COGS"), 0));
  const totalOpex = round2(opex.reduce((s, l) => s + signedAmount(l, "EXPENSE"), 0));
  const totalExpenses = round2(totalCogs + totalOpex);
  const netIncome = round2(totalRevenue - totalExpenses);
  const totalEquity = round2(equityBase + netIncome);

  const cashLine = assets.find((l) => /cash|bank/i.test(l.accountName));
  const cashBalance = cashLine ? signedAmount(cashLine, "ASSET") : 0;

  const totalDebit = round2(classified.reduce((s, l) => s + (Number(l.debit) || 0), 0));
  const totalCredit = round2(classified.reduce((s, l) => s + (Number(l.credit) || 0), 0));

  const currentAssets = assets.filter((l) =>
    /cash|receivable|inventory|prepaid|bank/i.test(l.accountName)
  );
  const currentLiabilities = liabilities.filter((l) =>
    /payable|accrual|short|deferred/i.test(l.accountName)
  );
  const currentAssetsTotal = currentAssets.reduce((s, l) => s + signedAmount(l, "ASSET"), 0);
  const currentLiabTotal = currentLiabilities.reduce((s, l) => s + signedAmount(l, "LIABILITY"), 0);

  return {
    period,
    trialBalance: {
      lines: classified.map(({ type: _t, ...rest }) => rest),
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    },
    balanceSheet: {
      assets: assets.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: round2(signedAmount(l, "ASSET")),
        level: 1,
        section: "Assets",
      })),
      liabilities: liabilities.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: round2(signedAmount(l, "LIABILITY")),
        level: 1,
        section: "Liabilities",
      })),
      equity: [
        ...equity.map((l) => ({
          code: l.accountCode,
          name: l.accountName,
          amount: round2(signedAmount(l, "EQUITY")),
          level: 1,
          section: "Equity",
        })),
        {
          code: "",
          name: "Net Income (current period)",
          amount: netIncome,
          level: 1,
          section: "Equity",
          isTotal: false,
        },
      ],
      totalAssets,
      totalLiabilities,
      totalEquity,
    },
    incomeStatement: {
      revenue: revenue.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: round2(signedAmount(l, "REVENUE")),
        level: 1,
        section: "Revenue",
      })),
      expenses: expenses.map((l) => ({
        code: l.accountCode,
        name: l.accountName,
        amount: round2(signedAmount(l, l.type as "COGS" | "EXPENSE")),
        level: 1,
        section: l.type === "COGS" ? "Cost of sales" : "Operating expenses",
      })),
      totalRevenue,
      totalExpenses,
      netIncome,
    },
    cashFlow: {
      operating: [
        { code: "", name: "Net Income", amount: netIncome, level: 1, section: "Operating" },
        {
          code: "",
          name: "Adjustments to reconcile net income (simplified)",
          amount: 0,
          level: 1,
          section: "Operating",
        },
      ],
      investing: [
        {
          code: "",
          name: "Capital expenditures (simplified)",
          amount: 0,
          level: 1,
          section: "Investing",
        },
      ],
      financing: [
        {
          code: "",
          name: "Debt and equity movements (simplified)",
          amount: 0,
          level: 1,
          section: "Financing",
        },
      ],
      netChange: cashBalance || netIncome,
    },
    ratios: {
      currentRatio: currentLiabTotal > 0 ? round2(currentAssetsTotal / currentLiabTotal) : null,
      debtToEquity: totalEquity > 0 ? round2(totalLiabilities / totalEquity) : null,
      grossMargin: totalRevenue > 0 ? round2((totalRevenue - totalCogs) / totalRevenue) : null,
      netMargin: totalRevenue > 0 ? round2(netIncome / totalRevenue) : null,
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
    if (!row.trim() || row.toLowerCase().startsWith("total")) continue;
    const cols = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    let accountCode = "";
    let accountName = "";
    let debit = 0;
    let credit = 0;

    if (cols.length >= 4) {
      accountCode = cols[0];
      accountName = cols[1];
      debit = parseFloat(cols[2].replace(/,/g, "")) || 0;
      credit = parseFloat(cols[3].replace(/,/g, "")) || 0;
    } else {
      accountName = cols[0];
      debit = parseFloat(cols[1].replace(/,/g, "")) || 0;
      credit = parseFloat(cols[2].replace(/,/g, "")) || 0;
      accountCode = accountName.substring(0, 4).toUpperCase();
    }

    if (!accountName) continue;
    result.push({
      accountCode,
      accountName,
      debit,
      credit,
      type: inferType(accountCode, accountName),
    });
  }

  return result;
}

/** Organized export helpers — correct file content for each statement path */
export function formatTrialBalanceCSV(lines: TBLine[], period: string): string {
  const rows = [
    "Statement,Trial Balance",
    "Period," + period,
    "Account Code,Account Name,Debit,Credit,Account Type",
  ];
  let td = 0;
  let tc = 0;
  for (const l of lines) {
    const type = l.type || inferType(l.accountCode, l.accountName);
    const d = Number(l.debit) || 0;
    const c = Number(l.credit) || 0;
    td += d;
    tc += c;
    rows.push([l.accountCode, l.accountName, d.toFixed(2), c.toFixed(2), type].join(","));
  }
  rows.push(["", "TOTAL", td.toFixed(2), tc.toFixed(2), ""].join(","));
  rows.push("Balanced," + (Math.abs(td - tc) < 0.01 ? "YES" : "NO"));
  return rows.join("\n");
}

export function formatIncomeStatementCSV(s: FinancialStatements): string {
  const rows = [
    "Statement,Income Statement",
    "Period," + s.period,
    "Section,Account Code,Account Name,Amount",
  ];
  for (const r of s.incomeStatement.revenue) {
    rows.push(["Revenue", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Revenue", "", "Total Revenue", s.incomeStatement.totalRevenue.toFixed(2)].join(","));
  for (const r of s.incomeStatement.expenses) {
    rows.push([r.section || "Expense", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Expense", "", "Total Expenses", s.incomeStatement.totalExpenses.toFixed(2)].join(","));
  rows.push(["Result", "", "Net Income", s.incomeStatement.netIncome.toFixed(2)].join(","));
  return rows.join("\n");
}

export function formatBalanceSheetCSV(s: FinancialStatements): string {
  const rows = [
    "Statement,Balance Sheet",
    "Period," + s.period,
    "Section,Account Code,Account Name,Amount",
  ];
  for (const r of s.balanceSheet.assets) {
    rows.push(["Assets", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Assets", "", "Total Assets", s.balanceSheet.totalAssets.toFixed(2)].join(","));
  for (const r of s.balanceSheet.liabilities) {
    rows.push(["Liabilities", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Liabilities", "", "Total Liabilities", s.balanceSheet.totalLiabilities.toFixed(2)].join(","));
  for (const r of s.balanceSheet.equity) {
    rows.push(["Equity", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Equity", "", "Total Equity", s.balanceSheet.totalEquity.toFixed(2)].join(","));
  rows.push(
    ["Check", "", "Assets vs Liabilities+Equity",
      (s.balanceSheet.totalAssets - s.balanceSheet.totalLiabilities - s.balanceSheet.totalEquity).toFixed(2),
    ].join(",")
  );
  return rows.join("\n");
}

export function formatCashFlowCSV(s: FinancialStatements): string {
  const rows = [
    "Statement,Cash Flow",
    "Period," + s.period,
    "Section,Account Code,Account Name,Amount",
  ];
  for (const r of s.cashFlow.operating) {
    rows.push(["Operating", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  for (const r of s.cashFlow.investing) {
    rows.push(["Investing", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  for (const r of s.cashFlow.financing) {
    rows.push(["Financing", r.code, r.name, r.amount.toFixed(2)].join(","));
  }
  rows.push(["Result", "", "Net change in cash", s.cashFlow.netChange.toFixed(2)].join(","));
  return rows.join("\n");
}

export function statementFileName(
  kind: "trial-balance" | "journal-entries" | "income-statement" | "balance-sheet" | "cash-flow",
  period: string,
  companyCode?: string
) {
  const code = (companyCode || "FINOVA").replace(/[^A-Za-z0-9_-]/g, "_");
  const p = (period || "period").replace(/[^0-9A-Za-z_-]/g, "-");
  return code + "_" + kind + "_" + p + ".csv";
}
