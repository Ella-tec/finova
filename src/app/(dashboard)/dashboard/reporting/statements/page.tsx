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
  Eye,
  BookOpen,
  Scale,
  TrendingUp,
  Wallet,
  ListOrdered,
} from "lucide-react";
import { FinancialStatements, TBLine, generateStatements } from "@/lib/statements/generator";
import { formatCurrency, cn } from "@/lib/utils";

type SavedLine = TBLine & { id?: string };
type TabId = "trial-balance" | "journal" | "income" | "balance" | "cashflow";

const SAMPLE: TBLine[] = [
  { accountCode: "1000", accountName: "Cash", debit: 125000, credit: 0 },
  { accountCode: "1100", accountName: "Accounts Receivable", debit: 85000, credit: 0 },
  { accountCode: "1200", accountName: "Inventory", debit: 62000, credit: 0 },
  { accountCode: "1500", accountName: "Fixed Assets", debit: 210000, credit: 0 },
  { accountCode: "1510", accountName: "Accumulated Depreciation", debit: 0, credit: 45000 },
  { accountCode: "2000", accountName: "Accounts Payable", debit: 0, credit: 48000 },
  { accountCode: "2100", accountName: "Accrued Expenses", debit: 0, credit: 12000 },
  { accountCode: "3000", accountName: "Common Stock", debit: 0, credit: 100000 },
  { accountCode: "3100", accountName: "Retained Earnings", debit: 0, credit: 95000 },
  { accountCode: "4000", accountName: "Product Revenue", debit: 0, credit: 320000 },
  { accountCode: "4100", accountName: "Service Revenue", debit: 0, credit: 85000 },
  { accountCode: "5000", accountName: "Cost of Goods Sold", debit: 180000, credit: 0 },
  { accountCode: "6000", accountName: "Salaries Expense", debit: 95000, credit: 0 },
  { accountCode: "6100", accountName: "Rent Expense", debit: 24000, credit: 0 },
  { accountCode: "6200", accountName: "Utilities Expense", debit: 8500, credit: 0 },
  { accountCode: "6300", accountName: "Insurance Expense", debit: 6200, credit: 0 },
  { accountCode: "6400", accountName: "Depreciation Expense", debit: 14300, credit: 0 },
];

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
  const parsed = data
    .filter((r) => r.trim())
    .map((r) => {
      const c = cells(r);
      const number = (v: string) => Number(v.replace(/[$,\s]/g, "")) || 0;
      return {
        accountCode: c[codeIndex >= 0 ? codeIndex : 0] || "",
        accountName: c[nameIndex >= 0 ? nameIndex : 1] || "",
        debit: number(c[debitIndex >= 0 ? debitIndex : 2] || "0"),
        credit: number(c[creditIndex >= 0 ? creditIndex : 3] || "0"),
      };
    })
    .filter((r) => r.accountCode && r.accountName);
  if (!parsed.length)
    throw new Error("No valid rows. Expected Account Code, Account Name, Debit, Credit.");
  return parsed;
}

function downloadText(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
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

  const debitTotal = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0),
    [lines]
  );
  const creditTotal = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0),
    [lines]
  );
  const difference = debitTotal - creditTotal;
  const money = (n: number) => formatCurrency(n);

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/trial-balance?period=" + encodeURIComponent(period), {
        cache: "no-store",
      });
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
          : "No saved trial balance for this period yet. Import a CSV or load sample data."
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
              [field]:
                field === "debit" || field === "credit"
                  ? value === ""
                    ? 0
                    : Number(value)
                  : value,
            }
          : line
      )
    );
    setDirty(true);
    setStatements(null);
    setMessage("");
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setMessage("");
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please select a .csv file.");
      const parsed = parseCsv(await file.text());
      setLines(parsed);
      setDirty(true);
      setStatements(null);
      setTab("trial-balance");
      setMessage("Loaded " + parsed.length + " accounts from " + file.name + ". Review, then save.");
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
    setMessage("");
    try {
      const response = await fetch("/api/trial-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, lines }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save trial balance.");
      setDirty(false);
      setLines((data.lines || []).map((l: TBLine) => l));
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
    setMessage("");
    try {
      if (dirty) throw new Error("Save trial balance changes before generating statements.");
      if (!lines.length) throw new Error("Load or import a trial balance first.");
      // Prefer API; fall back to client generator so review still works offline
      try {
        const response = await fetch("/api/statements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ period }),
        });
        const data = await response.json();
        if (response.ok && data.statements) {
          setStatements(data.statements);
          setMessage("Financial statements generated from the saved trial balance.");
          setTab("income");
          return;
        }
      } catch {
        /* client fallback */
      }
      const local = generateStatements(lines, period);
      setStatements(local);
      setMessage("Statements generated locally from the current trial balance.");
      setTab("income");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTb = () => {
    const quote = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const content = [
      "Account Code,Account Name,Debit,Credit",
      ...lines.map((l) => [l.accountCode, l.accountName, l.debit, l.credit].map(quote).join(",")),
    ].join("\n");
    downloadText("trial-balance-" + period + ".csv", content);
  };

  const downloadStatementCsv = (kind: string, rows: { code?: string; name: string; amount: number }[]) => {
    const quote = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const content = [
      "Code,Name,Amount",
      ...rows.map((r) => [r.code || "", r.name, r.amount].map(quote).join(",")),
    ].join("\n");
    downloadText(kind + "-" + period + ".csv", content);
  };

  /** Sample adjusting journal entries derived from the TB for review */
  const journalEntries = useMemo(() => {
    if (!lines.length) return [];
    const dep = lines.find((l) => /depreciation/i.test(l.accountName));
    const entries = [
      {
        id: "JE-001",
        date: period + "-28",
        memo: "Monthly payroll accrual (sample)",
        lines: [
          { account: "6000 Salaries Expense", debit: 12000, credit: 0 },
          { account: "2100 Accrued Expenses", debit: 0, credit: 12000 },
        ],
      },
      {
        id: "JE-002",
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
      {
        id: "JE-003",
        date: period + "-30",
        memo: "Close revenue to income summary (illustrative)",
        lines: lines
          .filter((l) => l.credit > 0 && /^4/.test(l.accountCode))
          .flatMap((l) => [
            { account: l.accountCode + " " + l.accountName, debit: l.credit, credit: 0 },
          ])
          .concat([
            {
              account: "3900 Income Summary",
              debit: 0,
              credit: lines.filter((l) => /^4/.test(l.accountCode)).reduce((s, l) => s + l.credit, 0),
            },
          ]),
      },
    ];
    return entries;
  }, [lines, period]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Finova · Reporting workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Financial Statements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Full process: Trial Balance → Journal Entries → Income Statement → Balance Sheet → Cash
            Flow. Upload, review, and download each step.
          </p>
        </div>
        <label className="text-sm font-medium text-slate-600">
          Reporting period
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </header>

      {/* Process step buttons */}
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
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-800"
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
            <p className="mt-2 text-xl font-bold text-slate-900">{k.value}</p>
          </div>
        ))}
      </section>

      {/* Shared toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100">
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
        <button
          type="button"
          onClick={() => {
            setLines(SAMPLE.map((l) => ({ ...l })));
            setDirty(true);
            setStatements(null);
            setTab("trial-balance");
            setMessage("Sample accounts loaded. Save to persist this period.");
            setError("");
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={saveTrialBalance}
          disabled={loading || !dirty || !lines.length}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Save TB
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !lines.length}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate statements
        </button>
        <button
          type="button"
          onClick={loadSaved}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
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
            (error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800")
          }
        >
          {error || message}
        </div>
      )}

      {/* TAB: Trial Balance */}
      {tab === "trial-balance" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">Trial Balance</h2>
              <p className="text-sm text-slate-500">Edit, review, upload, and download account balances.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" /> Add account
              </button>
              <button
                type="button"
                onClick={downloadTb}
                disabled={!lines.length}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                <Download className="h-4 w-4" /> Download CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Account code</th>
                  <th className="px-3 py-3">Account name</th>
                  <th className="px-3 py-3 text-right">Debit</th>
                  <th className="px-3 py-3 text-right">Credit</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, i) => (
                  <tr key={line.id || "new-" + i} className="hover:bg-teal-50/40">
                    <td className="px-3 py-2">
                      <input
                        value={line.accountCode}
                        onChange={(e) => updateLine(i, "accountCode", e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 focus:border-teal-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={line.accountName}
                        onChange={(e) => updateLine(i, "accountName", e.target.value)}
                        className="w-full min-w-48 rounded-lg border border-slate-200 px-2.5 py-2 focus:border-teal-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit}
                        onChange={(e) => updateLine(i, "debit", e.target.value)}
                        className="w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-right focus:border-teal-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit}
                        onChange={(e) => updateLine(i, "credit", e.target.value)}
                        className="w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-right focus:border-teal-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setLines((old) => old.filter((_, j) => j !== i));
                          setDirty(true);
                          setStatements(null);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {lines.length > 0 && (
                <tfoot className="bg-slate-50 font-semibold">
                  <tr>
                    <td colSpan={2} className="px-3 py-3 text-slate-700">
                      Difference (debits − credits)
                    </td>
                    <td className="px-3 py-3 text-right">{money(debitTotal)}</td>
                    <td className="px-3 py-3 text-right">{money(creditTotal)}</td>
                    <td
                      className={
                        "px-3 py-3 text-right " +
                        (Math.abs(difference) < 0.01 ? "text-emerald-700" : "text-amber-700")
                      }
                    >
                      {money(difference)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            {!lines.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                {loadingSaved
                  ? "Loading…"
                  : "No accounts loaded. Upload a CSV or click Load sample."}
              </p>
            )}
          </div>
          {Math.abs(difference) >= 0.01 && lines.length > 0 && (
            <p className="mt-3 flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Debits and credits do not balance. Review before generating statements.
            </p>
          )}
        </section>
      )}

      {/* TAB: Journal Entries */}
      {tab === "journal" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">Journal Entries</h2>
              <p className="text-sm text-slate-500">
                Sample adjusting and closing entries for review (from current TB).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const rows = journalEntries.flatMap((je) =>
                  je.lines.map(
                    (l) =>
                      `${je.id},${je.date},${je.memo},${l.account},${l.debit},${l.credit}`
                  )
                );
                downloadText(
                  "journal-entries-" + period + ".csv",
                  ["JE,Date,Memo,Account,Debit,Credit", ...rows].join("\n")
                );
              }}
              disabled={!journalEntries.length}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              <Download className="h-4 w-4" /> Download JEs
            </button>
          </div>
          {!lines.length ? (
            <p className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
              Load a trial balance first to see journal entry samples.
            </p>
          ) : (
            journalEntries.map((je) => (
              <div
                key={je.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-5 py-3">
                  <div>
                    <span className="font-mono text-sm font-semibold text-teal-800">{je.id}</span>
                    <span className="ml-3 text-sm text-slate-500">{je.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{je.memo}</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-2 text-left">Account</th>
                      <th className="px-5 py-2 text-right">Debit</th>
                      <th className="px-5 py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {je.lines.map((l, i) => (
                      <tr key={i}>
                        <td className="px-5 py-2">{l.account}</td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {l.debit ? money(l.debit) : "—"}
                        </td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {l.credit ? money(l.credit) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </section>
      )}

      {/* TAB: Income Statement */}
      {tab === "income" && (
        <StatementPanel
          title="Income Statement"
          period={period}
          empty={!statements}
          onGenerate={generate}
          onDownload={
            statements
              ? () =>
                  downloadStatementCsv("income-statement", [
                    ...statements.incomeStatement.revenue.map((l) => ({
                      code: l.code,
                      name: l.name,
                      amount: l.amount,
                    })),
                    {
                      code: "",
                      name: "Total revenue",
                      amount: statements.incomeStatement.totalRevenue,
                    },
                    ...statements.incomeStatement.expenses.map((l) => ({
                      code: l.code,
                      name: l.name,
                      amount: l.amount,
                    })),
                    {
                      code: "",
                      name: "Total expenses",
                      amount: statements.incomeStatement.totalExpenses,
                    },
                    {
                      code: "",
                      name: "Net income",
                      amount: statements.incomeStatement.netIncome,
                    },
                  ])
              : undefined
          }
        >
          {statements && (
            <div className="space-y-2 p-5 text-sm">
              <p className="font-semibold text-slate-500">Revenue</p>
              {statements.incomeStatement.revenue.map((l) => (
                <div key={l.code} className="flex justify-between gap-4">
                  <span>
                    {l.code} {l.name}
                  </span>
                  <span className="tabular-nums">{money(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total revenue</span>
                <span>{money(statements.incomeStatement.totalRevenue)}</span>
              </div>
              <p className="pt-3 font-semibold text-slate-500">Expenses</p>
              {statements.incomeStatement.expenses.map((l) => (
                <div key={l.code} className="flex justify-between gap-4">
                  <span>
                    {l.code} {l.name}
                  </span>
                  <span className="tabular-nums">{money(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total expenses</span>
                <span>{money(statements.incomeStatement.totalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-3 text-base font-bold">
                <span>Net income</span>
                <span>{money(statements.incomeStatement.netIncome)}</span>
              </div>
            </div>
          )}
        </StatementPanel>
      )}

      {/* TAB: Balance Sheet */}
      {tab === "balance" && (
        <StatementPanel
          title="Balance Sheet"
          period={period}
          empty={!statements}
          onGenerate={generate}
          onDownload={
            statements
              ? () =>
                  downloadStatementCsv("balance-sheet", [
                    ...statements.balanceSheet.assets.map((l) => ({
                      code: l.code,
                      name: l.name,
                      amount: l.amount,
                    })),
                    { code: "", name: "Total assets", amount: statements.balanceSheet.totalAssets },
                    ...statements.balanceSheet.liabilities.map((l) => ({
                      code: l.code,
                      name: l.name,
                      amount: l.amount,
                    })),
                    {
                      code: "",
                      name: "Total liabilities",
                      amount: statements.balanceSheet.totalLiabilities,
                    },
                    ...statements.balanceSheet.equity.map((l) => ({
                      code: l.code,
                      name: l.name,
                      amount: l.amount,
                    })),
                    { code: "", name: "Total equity", amount: statements.balanceSheet.totalEquity },
                  ])
              : undefined
          }
        >
          {statements && (
            <div className="grid gap-6 p-5 text-sm md:grid-cols-2">
              <div className="space-y-2">
                <p className="font-semibold text-slate-500">Assets</p>
                {statements.balanceSheet.assets.map((l) => (
                  <div key={l.code} className="flex justify-between gap-4">
                    <span>
                      {l.code} {l.name}
                    </span>
                    <span className="tabular-nums">{money(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total assets</span>
                  <span>{money(statements.balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-500">Liabilities</p>
                {statements.balanceSheet.liabilities.map((l) => (
                  <div key={l.code} className="flex justify-between gap-4">
                    <span>
                      {l.code} {l.name}
                    </span>
                    <span className="tabular-nums">{money(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total liabilities</span>
                  <span>{money(statements.balanceSheet.totalLiabilities)}</span>
                </div>
                <p className="pt-3 font-semibold text-slate-500">Equity</p>
                {statements.balanceSheet.equity.map((l) => (
                  <div key={l.code} className="flex justify-between gap-4">
                    <span>
                      {l.code} {l.name}
                    </span>
                    <span className="tabular-nums">{money(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total equity</span>
                  <span>{money(statements.balanceSheet.totalEquity)}</span>
                </div>
              </div>
            </div>
          )}
        </StatementPanel>
      )}

      {/* TAB: Cash Flow */}
      {tab === "cashflow" && (
        <StatementPanel
          title="Cash Flow Statement"
          period={period}
          empty={!statements}
          onGenerate={generate}
          onDownload={
            statements
              ? () =>
                  downloadStatementCsv("cash-flow", [
                    ...statements.cashFlow.operating.map((l) => ({
                      code: l.code,
                      name: "Operating: " + l.name,
                      amount: l.amount,
                    })),
                    ...statements.cashFlow.investing.map((l) => ({
                      code: l.code,
                      name: "Investing: " + l.name,
                      amount: l.amount,
                    })),
                    ...statements.cashFlow.financing.map((l) => ({
                      code: l.code,
                      name: "Financing: " + l.name,
                      amount: l.amount,
                    })),
                    { code: "", name: "Net change in cash", amount: statements.cashFlow.netChange },
                  ])
              : undefined
          }
        >
          {statements && (
            <div className="space-y-4 p-5 text-sm">
              {(
                [
                  ["Operating", statements.cashFlow.operating],
                  ["Investing", statements.cashFlow.investing],
                  ["Financing", statements.cashFlow.financing],
                ] as const
              ).map(([label, rows]) => (
                <div key={label}>
                  <p className="font-semibold text-slate-500">{label}</p>
                  {rows.map((l, i) => (
                    <div key={label + i} className="flex justify-between gap-4 py-1">
                      <span>{l.name}</span>
                      <span className="tabular-nums">{money(l.amount)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-between border-t-2 pt-3 text-base font-bold">
                <span>Net change in cash</span>
                <span>{money(statements.cashFlow.netChange)}</span>
              </div>
            </div>
          )}
        </StatementPanel>
      )}
    </div>
  );
}

function StatementPanel({
  title,
  period,
  empty,
  onGenerate,
  onDownload,
  children,
}: {
  title: string;
  period: string;
  empty: boolean;
  onGenerate: () => void;
  onDownload?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          {title} · {period}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" /> Generate / View
          </button>
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white"
            >
              <Download className="h-4 w-4" /> Download CSV
            </button>
          )}
        </div>
      </div>
      {empty ? (
        <p className="p-10 text-center text-sm text-slate-500">
          No statements yet. Save a trial balance, then click <strong>Generate / View</strong>.
        </p>
      ) : (
        children
      )}
    </section>
  );
}
