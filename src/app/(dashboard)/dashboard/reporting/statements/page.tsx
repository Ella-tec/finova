"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileUp,
  FileText,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  AlertTriangle,
  Download,
  BookOpen,
  Scale,
  TrendingUp,
  Wallet,
  ListOrdered,
} from "lucide-react";
import {
  FinancialStatements,
  TBLine,
  generateStatements,
  formatTrialBalanceCSV,
  formatIncomeStatementCSV,
  formatBalanceSheetCSV,
  formatCashFlowCSV,
  statementFileName,
} from "@/lib/statements/generator";
import { STATEMENT_SAMPLE_PACKS } from "@/lib/statements/sample-packs";
import { formatCurrency, cn } from "@/lib/utils";

type SavedLine = TBLine & { id?: string };
type TabId = "trial-balance" | "journal" | "income" | "balance" | "cashflow";

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "trial-balance", label: "Trial Balance", icon: ListOrdered },
  { id: "journal", label: "Journal Entries", icon: BookOpen },
  { id: "income", label: "Income Statement", icon: TrendingUp },
  { id: "balance", label: "Balance Sheet", icon: Scale },
  { id: "cashflow", label: "Cash Flow", icon: Wallet },
];

function parseCsv(text: string): TBLine[] {
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) throw new Error("The CSV file is empty or missing data rows.");
  const cells = (line: string) => {
    const out: string[] = [];
    let value = "",
      quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) {
        value += '"';
        i++;
      } else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) {
        out.push(value.trim());
        value = "";
      } else value += ch;
    }
    out.push(value.trim());
    return out;
  };
  const first = cells(rows[0]).map((v) => v.toLowerCase());
  const hasHeader = first.some((v) => v.includes("account") || v.includes("code") || v.includes("debit"));
  const data = hasHeader ? rows.slice(1) : rows;
  const codeIndex = hasHeader ? first.findIndex((v) => v.includes("code")) : 0;
  const nameIndex = hasHeader ? first.findIndex((v) => v.includes("name")) : 1;
  const debitIndex = hasHeader ? first.findIndex((v) => v.includes("debit")) : 2;
  const creditIndex = hasHeader ? first.findIndex((v) => v.includes("credit")) : 3;
  const number = (v: string) => Number(String(v).replace(/[$,\s]/g, "")) || 0;
  const parsed = data
    .filter((r) => r.trim())
    .map((r) => {
      const c = cells(r);
      return {
        accountCode: c[codeIndex >= 0 ? codeIndex : 0] || "",
        accountName: c[nameIndex >= 0 ? nameIndex : 1] || "",
        debit: number(c[debitIndex >= 0 ? debitIndex : 2] || "0"),
        credit: number(c[creditIndex >= 0 ? creditIndex : 3] || "0"),
      };
    })
    .filter((r) => r.accountCode && r.accountName);
  if (!parsed.length) throw new Error("No valid rows. Expected Account Code, Account Name, Debit, Credit.");
  return parsed;
}

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StatementsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [tab, setTab] = useState<TabId>("trial-balance");
  const [lines, setLines] = useState<SavedLine[]>([]);
  const [statements, setStatements] = useState<FinancialStatements | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [companyPack, setCompanyPack] = useState(STATEMENT_SAMPLE_PACKS[0]?.id || "acme");

  const debitTotal = useMemo(() => lines.reduce((s, l) => s + (Number(l.debit) || 0), 0), [lines]);
  const creditTotal = useMemo(() => lines.reduce((s, l) => s + (Number(l.credit) || 0), 0), [lines]);
  const difference = debitTotal - creditTotal;
  const money = (n: number) => formatCurrency(n);

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    setError("");
    try {
      const response = await fetch("/api/trial-balance?period=" + encodeURIComponent(period), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load saved trial balance.");
      setLines(
        (data.rows || []).map((r: { id: string; accountCode: string; accountName: string; debit: number; credit: number }) => ({
          id: r.id,
          accountCode: r.accountCode,
          accountName: r.accountName,
          debit: r.debit,
          credit: r.credit,
        }))
      );
      setStatements(null);
      setDirty(false);
      setMessage(
        data.rows?.length
          ? "Loaded " + data.rows.length + " saved accounts for " + period + "."
          : "No saved TB for this period. Upload CSV or load a company sample."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load saved data.");
    } finally {
      setLoadingSaved(false);
    }
  }, [period]);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const updateLine = (index: number, field: keyof TBLine, value: string) => {
    setLines((old) =>
      old.map((line, i) =>
        i === index
          ? {
              ...line,
              [field]: field === "debit" || field === "credit" ? (value === "" ? 0 : Number(value)) : value,
            }
          : line
      )
    );
    setDirty(true);
    setStatements(null);
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please select a .csv file.");
      const parsed = parseCsv(await file.text());
      setLines(parsed);
      setDirty(true);
      setStatements(null);
      setTab("trial-balance");
      setMessage("Loaded " + parsed.length + " accounts from " + file.name + ". Review, then Save TB.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this file.");
    }
  };

  const saveTrialBalance = async () => {
    if (!lines.length) {
      setError("Add or import at least one account first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/trial-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, lines }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save trial balance.");
      setDirty(false);
      setLines((data.lines || lines).map((l: TBLine) => l));
      setMessage("Saved " + (data.lineCount || lines.length) + " rows for " + period + ".");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      if (!lines.length) throw new Error("Load or import a trial balance first.");
      const local = generateStatements(lines, period);
      setStatements(local);
      setMessage("Statements generated: Income Statement, Balance Sheet, and Cash Flow are ready.");
      setTab("income");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const journalEntries = useMemo(() => {
    if (!lines.length) return [];
    const dep = lines.find((l) => /depreciation/i.test(l.accountName));
    const ar = lines.find((l) => /receivable/i.test(l.accountName));
    const rev = lines.find((l) => /revenue|sales/i.test(l.accountName));
    return [
      {
        id: "JE-001",
        date: period + "-15",
        memo: "Customer invoice / AR (sample)",
        lines: [
          { account: (ar?.accountCode || "1100") + " Accounts Receivable", debit: 15000, credit: 0 },
          { account: (rev?.accountCode || "4000") + " Revenue", debit: 0, credit: 15000 },
        ],
      },
      {
        id: "JE-002",
        date: period + "-28",
        memo: "Monthly payroll accrual (sample)",
        lines: [
          { account: "6000 Salaries Expense", debit: 12000, credit: 0 },
          { account: "2100 Accrued Expenses", debit: 0, credit: 12000 },
        ],
      },
      {
        id: "JE-003",
        date: period + "-30",
        memo: "Record depreciation (sample)",
        lines: [
          {
            account: dep ? dep.accountCode + " " + dep.accountName : "6400 Depreciation Expense",
            debit: dep?.debit || 14300,
            credit: 0,
          },
          { account: "1510 Accumulated Depreciation", debit: 0, credit: dep?.debit || 14300 },
        ],
      },
    ];
  }, [lines, period]);

  const downloadCurrent = () => {
    const companyCode =
      STATEMENT_SAMPLE_PACKS.find((p) => p.id === companyPack)?.code || "FINOVA";
    const q = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    if (tab === "trial-balance" || !statements) {
      downloadText(statementFileName("trial-balance", period, companyCode), formatTrialBalanceCSV(lines, period));
      return;
    }
    if (tab === "journal") {
      const rows = journalEntries.flatMap((je) =>
        je.lines.map((l) => [je.id, je.date, je.memo, l.account, l.debit, l.credit].map(q).join(","))
      );
      downloadText(
        statementFileName("journal-entries", period, companyCode),
        ["Statement,Journal Entries", "Period," + period, "JE,Date,Memo,Account,Debit,Credit", ...rows].join("\n")
      );
      return;
    }
    if (tab === "income" && statements) {
      downloadText(statementFileName("income-statement", period, companyCode), formatIncomeStatementCSV(statements));
      return;
    }
    if (tab === "balance" && statements) {
      downloadText(statementFileName("balance-sheet", period, companyCode), formatBalanceSheetCSV(statements));
      return;
    }
    if (tab === "cashflow" && statements) {
      downloadText(statementFileName("cash-flow", period, companyCode), formatCashFlowCSV(statements));
    }
  };

  const loadCompany = () => {
    const pack = STATEMENT_SAMPLE_PACKS.find((p) => p.id === companyPack) || STATEMENT_SAMPLE_PACKS[0];
    if (!pack) return;
    const next = pack.lines.map((l) => ({ ...l }));
    setLines(next);
    setPeriod(pack.period);
    setDirty(true);
    const stmts = generateStatements(next, pack.period);
    setStatements(stmts);
    setTab("trial-balance");
    setMessage(
      "Loaded " +
        pack.name +
        " (" +
        pack.code +
        ") — full sample: Trial Balance, Journal Entries, Income Statement, Balance Sheet, Cash Flow. Open each tab or Download File."
    );
    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#07649d]">Finova · Reporting</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1d2d5c]">Financial Statements</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Full process: Trial Balance → Journal Entries → Income Statement → Balance Sheet → Cash Flow. Upload, review, and download each step.
          </p>
        </div>
        <label className="text-sm font-medium text-slate-600">
          Reporting period
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/25"
          />
        </label>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                active
                  ? "border-[#07649d] bg-[#07649d] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#00a4e4] hover:text-[#07649d]"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Accounts", value: String(lines.length) },
          { label: "Total debits", value: money(debitTotal) },
          { label: "Total credits", value: money(creditTotal) },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className="mt-2 text-xl font-bold text-[#1d2d5c]">{k.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#c5dceb] bg-[#e7f0f5] px-3 py-2 text-sm font-semibold text-[#07649d] hover:bg-[#d7eaf5]">
          <FileUp className="h-4 w-4" />
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <select
          value={companyPack}
          onChange={(e) => setCompanyPack(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
          aria-label="Sample company"
        >
          {STATEMENT_SAMPLE_PACKS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {p.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={loadCompany} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Load company sample
        </button>
        <button
          type="button"
          onClick={saveTrialBalance}
          disabled={loading || !dirty || !lines.length}
          className="inline-flex items-center gap-2 rounded-xl bg-[#07649d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d2d5c] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save TB
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !lines.length}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-3 py-2 text-sm font-semibold text-white hover:bg-[#162447] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate statements
        </button>
        <button
          type="button"
          onClick={downloadCurrent}
          disabled={!lines.length}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download File
        </button>
        <button type="button" onClick={loadSaved} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">
          <RefreshCw className={cn("h-4 w-4", loadingSaved && "animate-spin")} />
          Reload
        </button>
        {dirty && <span className="text-xs font-medium text-amber-700">Unsaved changes</span>}
      </div>

      {(message || error) && (
        <div
          role="status"
          className={
            "rounded-xl border p-3 text-sm " +
            (error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800")
          }
        >
          {error || message}
        </div>
      )}

      {Math.abs(difference) > 0.01 && lines.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          Trial balance is out of balance by {money(Math.abs(difference))}.
        </div>
      )}

      {tab === "trial-balance" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-[#1d2d5c]">Trial Balance</h2>
            <button
              type="button"
              onClick={() => {
                setLines((old) => [...old, { accountCode: "", accountName: "", debit: 0, credit: 0 }]);
                setDirty(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input value={line.accountCode} onChange={(e) => updateLine(index, "accountCode", e.target.value)} className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={line.accountName} onChange={(e) => updateLine(index, "accountName", e.target.value)} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" step="0.01" value={line.debit || ""} onChange={(e) => updateLine(index, "debit", e.target.value)} className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" step="0.01" value={line.credit || ""} onChange={(e) => updateLine(index, "credit", e.target.value)} className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-right text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => { setLines((old) => old.filter((_, i) => i !== index)); setDirty(true); }} className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove row">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-slate-50 font-semibold">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>Totals</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(debitTotal)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(creditTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          {!lines.length && <p className="p-6 text-center text-sm text-slate-500">Upload a CSV or load a company sample to begin.</p>}
        </section>
      )}

      {tab === "journal" && (
        <section className="space-y-3">
          {journalEntries.map((je) => (
            <div key={je.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[#1d2d5c]">{je.id} · {je.date}</p>
                <p className="text-sm text-slate-500">{je.memo}</p>
              </div>
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-1">Account</th>
                    <th className="py-1 text-right">Debit</th>
                    <th className="py-1 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {je.lines.map((l, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2">{l.account}</td>
                      <td className="py-2 text-right tabular-nums">{l.debit ? money(l.debit) : "—"}</td>
                      <td className="py-2 text-right tabular-nums">{l.credit ? money(l.credit) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {!journalEntries.length && <p className="text-sm text-slate-500">Load a company sample to see journal entries.</p>}
        </section>
      )}

      {tab === "income" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!statements ? (
            <p className="text-sm text-slate-600">Load a company sample (or Generate statements) to view the Income Statement.</p>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1d2d5c]">Income Statement · {statements.period}</h2>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Revenue</p>
                {statements.incomeStatement.revenue.map((r) => (
                  <div key={r.code + r.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                    <span>{r.code} {r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-sm font-semibold">
                  <span>Total Revenue</span>
                  <span className="tabular-nums">{money(statements.incomeStatement.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Expenses</p>
                {statements.incomeStatement.expenses.map((r) => (
                  <div key={r.code + r.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                    <span>{r.code} {r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-sm font-semibold">
                  <span>Total Expenses</span>
                  <span className="tabular-nums">{money(statements.incomeStatement.totalExpenses)}</span>
                </div>
              </div>
              <div className="flex justify-between rounded-xl bg-teal-50 px-4 py-3 text-base font-bold text-teal-900">
                <span>Net Income</span>
                <span className="tabular-nums">{money(statements.incomeStatement.netIncome)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "balance" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!statements ? (
            <p className="text-sm text-slate-600">Load a company sample to view the Balance Sheet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-[#1d2d5c]">Assets</h3>
                {statements.balanceSheet.assets.map((r) => (
                  <div key={r.code + r.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                    <span>{r.code} {r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold">
                  <span>Total Assets</span>
                  <span className="tabular-nums">{money(statements.balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#1d2d5c]">Liabilities</h3>
                {statements.balanceSheet.liabilities.map((r) => (
                  <div key={r.code + r.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                    <span>{r.code} {r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold">
                  <span>Total Liabilities</span>
                  <span className="tabular-nums">{money(statements.balanceSheet.totalLiabilities)}</span>
                </div>
                <h3 className="mt-4 font-semibold text-[#1d2d5c]">Equity</h3>
                {statements.balanceSheet.equity.map((r) => (
                  <div key={r.code + r.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                    <span>{r.code} {r.name}</span>
                    <span className="tabular-nums">{money(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold">
                  <span>Total Equity</span>
                  <span className="tabular-nums">{money(statements.balanceSheet.totalEquity)}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "cashflow" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!statements ? (
            <p className="text-sm text-slate-600">Load a company sample to view Cash Flow.</p>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1d2d5c]">Cash Flow · {statements.period}</h2>
              {["operating", "investing", "financing"].map((sec) => (
                <div key={sec}>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{sec}</p>
                  {(statements.cashFlow as any)[sec].map((r: any, i: number) => (
                    <div key={i} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                      <span>{r.name}</span>
                      <span className="tabular-nums">{money(r.amount)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-between rounded-xl bg-sky-50 px-4 py-3 font-bold text-sky-900">
                <span>Net change in cash</span>
                <span className="tabular-nums">{money(statements.cashFlow.netChange)}</span>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
