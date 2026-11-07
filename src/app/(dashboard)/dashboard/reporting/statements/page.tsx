"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileUp, FileText, Loader2, CheckCircle2, Plus, Trash2, RefreshCw, Save, AlertTriangle } from "lucide-react";
import { FinancialStatements, TBLine } from "@/lib/statements/generator";
import { formatCurrency } from "@/lib/utils";

type SavedLine = TBLine & { id?: string };

const SAMPLE: TBLine[] = [
  { accountCode: "1000", accountName: "Cash", debit: 125000, credit: 0 },
  { accountCode: "1100", accountName: "Accounts Receivable", debit: 85000, credit: 0 },
  { accountCode: "1200", accountName: "Inventory", debit: 62000, credit: 0 },
  { accountCode: "1500", accountName: "Fixed Assets", debit: 210000, credit: 0 },
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
];

function parseCsv(text: string): TBLine[] {
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) throw new Error("The CSV file is empty or missing its data rows.");
  const cells = (line: string) => {
    const out: string[] = []; let value = ""; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) { out.push(value.trim()); value = ""; }
      else value += ch;
    }
    out.push(value.trim()); return out;
  };
  const first = cells(rows[0]).map((v) => v.toLowerCase());
  const hasHeader = first.some((v) => v.includes("account") || v.includes("code") || v.includes("debit"));
  const data = hasHeader ? rows.slice(1) : rows;
  const codeIndex = hasHeader ? first.findIndex((v) => v.includes("code")) : 0;
  const nameIndex = hasHeader ? first.findIndex((v) => v.includes("name")) : 1;
  const debitIndex = hasHeader ? first.findIndex((v) => v.includes("debit")) : 2;
  const creditIndex = hasHeader ? first.findIndex((v) => v.includes("credit")) : 3;
  const parsed = data.filter((r) => r.trim()).map((r) => {
    const c = cells(r);
    const number = (v: string) => Number(v.replace(/[$,\s]/g, "")) || 0;
    return {
      accountCode: c[codeIndex >= 0 ? codeIndex : 0] || "",
      accountName: c[nameIndex >= 0 ? nameIndex : 1] || "",
      debit: number(c[debitIndex >= 0 ? debitIndex : 2] || "0"),
      credit: number(c[creditIndex >= 0 ? creditIndex : 3] || "0"),
    };
  }).filter((r) => r.accountCode && r.accountName);
  if (!parsed.length) throw new Error("No valid rows found. Expected Account Code, Account Name, Debit, Credit.");
  return parsed;
}

export default function StatementsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [lines, setLines] = useState<SavedLine[]>([]);
  const [statements, setStatements] = useState<FinancialStatements | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const debitTotal = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0), [lines]);
  const creditTotal = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0), [lines]);
  const difference = debitTotal - creditTotal;

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/trial-balance?period=" + encodeURIComponent(period), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load saved trial balance.");
      setLines((data.rows || []).map((r: any) => ({ id: r.id, accountCode: r.accountCode, accountName: r.accountName, debit: r.debit, credit: r.credit })));
      setStatements(null); setDirty(false);
      setMessage(data.rows?.length ? "Loaded " + data.rows.length + " saved accounts for " + period + "." : "No saved trial balance for this period yet. Import a CSV or add accounts below.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load saved data."); }
    finally { setLoadingSaved(false); }
  }, [period]);

  useEffect(() => { void loadSaved(); }, [loadSaved]);

  const updateLine = (index: number, field: keyof TBLine, value: string) => {
    setLines((old) => old.map((line, i) => i === index ? { ...line, [field]: field === "debit" || field === "credit" ? (value === "" ? 0 : Number(value)) : value } : line));
    setDirty(true); setStatements(null); setMessage("");
  };

  const importFile = async (file?: File) => {
    if (!file) return;
    setError(""); setMessage("");
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Please select a .csv file.");
      const parsed = parseCsv(await file.text());
      setLines(parsed); setDirty(true); setStatements(null);
      setMessage("Loaded " + parsed.length + " accounts from " + file.name + ". Review the rows, then save changes.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not read this file."); }
  };

  const saveTrialBalance = async () => {
    if (!lines.length) { setError("Add or import at least one account first."); return; }
    if (lines.some((l) => !l.accountCode.trim() || !l.accountName.trim() || !Number.isFinite(Number(l.debit)) || !Number.isFinite(Number(l.credit)) || Number(l.debit) < 0 || Number(l.credit) < 0)) {
      setError("Every row needs an account code, account name, and valid non-negative debit and credit amounts."); return;
    }
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/trial-balance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period, lines }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save trial balance.");
      setDirty(false); setLines((data.lines || []).map((l: TBLine) => l));
      setMessage("Saved " + data.lineCount + " account rows for " + period + ". You can now generate or regenerate statements.");
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      if (dirty) throw new Error("Save your trial balance changes before generating statements.");
      const response = await fetch("/api/statements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Statement generation failed.");
      setStatements(data.statements); setMessage("Financial statements generated from the saved trial balance.");
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); }
    finally { setLoading(false); }
  };

  const downloadCsv = () => {
    const quote = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const content = ["Account Code,Account Name,Debit,Credit", ...lines.map((l) => [l.accountCode, l.accountName, l.debit, l.credit].map(quote).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "trial-balance-" + period + ".csv"; a.click(); URL.revokeObjectURL(url);
  };

  const addLine = () => { setLines((old) => [...old, { accountCode: "", accountName: "", debit: 0, credit: 0 }]); setDirty(true); };
  const money = (n: number) => formatCurrency(n);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Finova · Reporting workspace</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Financial Statements</h1><p className="mt-1 max-w-2xl text-sm text-slate-600">Import, edit, validate, save, and regenerate financial statements from your trial balance.</p></div>
        <label className="text-sm font-medium text-slate-600">Reporting period<input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" /></label>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Accounts", value: lines.length }, { label: "Total debits", value: money(debitTotal) }, { label: "Total credits", value: money(creditTotal) }].map((k) => <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p><p className="mt-2 text-xl font-bold text-slate-900">{k.value}</p></div>)}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">1. Import and maintain trial balance</h2><p className="mt-1 text-sm text-slate-500">Upload a CSV, load sample accounts, or edit account rows directly.</p></div><button onClick={loadSaved} disabled={loadingSaved} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className={"h-4 w-4 " + (loadingSaved ? "animate-spin" : "")}/>Reload saved</button></div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"><FileUp className="h-4 w-4"/>Choose CSV file<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { void importFile(e.target.files?.[0]); e.currentTarget.value = ""; }}/></label>
          <button onClick={() => { setLines(SAMPLE.map((l) => ({ ...l }))); setDirty(true); setStatements(null); setMessage("Sample accounts loaded. Save them to replace this period's saved trial balance."); setError(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Load sample data</button>
          <button onClick={addLine} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-800"><Plus className="h-4 w-4"/>Add account</button>
          <button onClick={downloadCsv} disabled={!lines.length} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Export CSV</button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Account code</th><th className="px-3 py-3">Account name</th><th className="px-3 py-3 text-right">Debit</th><th className="px-3 py-3 text-right">Credit</th><th className="px-3 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{lines.map((line, i) => <tr key={line.id || "new-" + i} className="hover:bg-teal-50/40"><td className="px-3 py-2"><input aria-label="Account code" value={line.accountCode} onChange={(e) => updateLine(i, "accountCode", e.target.value)} className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 focus:border-teal-500 focus:outline-none"/></td><td className="px-3 py-2"><input aria-label="Account name" value={line.accountName} onChange={(e) => updateLine(i, "accountName", e.target.value)} className="w-full min-w-48 rounded-lg border border-slate-200 px-2.5 py-2 focus:border-teal-500 focus:outline-none"/></td><td className="px-3 py-2"><input aria-label="Debit" type="number" min="0" step="0.01" value={line.debit} onChange={(e) => updateLine(i, "debit", e.target.value)} className="w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-right focus:border-teal-500 focus:outline-none"/></td><td className="px-3 py-2"><input aria-label="Credit" type="number" min="0" step="0.01" value={line.credit} onChange={(e) => updateLine(i, "credit", e.target.value)} className="w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-right focus:border-teal-500 focus:outline-none"/></td><td className="px-3 py-2 text-right"><button aria-label={"Remove " + line.accountName} onClick={() => { setLines((old) => old.filter((_, j) => j !== i)); setDirty(true); setStatements(null); }} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4"/></button></td></tr>)}</tbody>
            {lines.length > 0 && <tfoot className="bg-slate-50 font-semibold"><tr><td colSpan={2} className="px-3 py-3 text-slate-700">Difference (debits − credits)</td><td className="px-3 py-3 text-right">{money(debitTotal)}</td><td className="px-3 py-3 text-right">{money(creditTotal)}</td><td className={"px-3 py-3 text-right " + (Math.abs(difference) < 0.01 ? "text-emerald-700" : "text-amber-700")}>{money(difference)}</td></tr></tfoot>}
          </table>
          {!lines.length && <p className="p-8 text-center text-sm text-slate-500">{loadingSaved ? "Loading saved accounts…" : "No accounts loaded. Upload a CSV or add an account to begin."}</p>}
        </div>
        {Math.abs(difference) >= 0.01 && lines.length > 0 && <p className="mt-3 flex items-center gap-2 text-sm text-amber-700"><AlertTriangle className="h-4 w-4"/>Debits and credits do not balance. Review the trial balance before generating statements.</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={saveTrialBalance} disabled={loading || !dirty || !lines.length} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4"/>{loading ? "Saving…" : "Save / Update Trial Balance"}</button>{dirty && <span className="text-xs font-medium text-amber-700">Unsaved changes</span>}</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">2. Generate financial statements</h2><p className="mt-1 text-sm text-slate-500">Generate from the saved trial balance for {period}.</p></div><button onClick={generate} disabled={loading || loadingSaved || dirty || !lines.length} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText className="h-4 w-4"/>}Generate / Regenerate statements</button></div>
        {dirty && <p className="mt-3 text-xs text-amber-700">Save your edits before generating statements.</p>}
      </section>

      {(message || error) && <div role="status" className={"rounded-xl border p-3 text-sm " + (error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800")}>{error || message}</div>}

      {statements && <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Net income", value: money(statements.incomeStatement.netIncome) }, { label: "Total assets", value: money(statements.balanceSheet.totalAssets) }, { label: "Current ratio", value: statements.ratios.currentRatio == null ? "N/A" : statements.ratios.currentRatio.toFixed(2) }, { label: "Net margin", value: statements.ratios.netMargin == null ? "N/A" : (statements.ratios.netMargin * 100).toFixed(1) + "%" }].map((k) => <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-500">{k.label}</p><p className="mt-2 text-xl font-bold text-slate-900">{k.value}</p></div>)}</div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-5 py-4"><h3 className="font-semibold">Income Statement · {statements.period}</h3></div><div className="space-y-2 p-5 text-sm"><p className="font-semibold text-slate-500">Revenue</p>{statements.incomeStatement.revenue.map((l) => <div key={l.code} className="flex justify-between gap-4"><span>{l.name}</span><span>{money(l.amount)}</span></div>)}<div className="flex justify-between border-t pt-2 font-semibold"><span>Total revenue</span><span>{money(statements.incomeStatement.totalRevenue)}</span></div><p className="pt-3 font-semibold text-slate-500">Expenses</p>{statements.incomeStatement.expenses.map((l) => <div key={l.code} className="flex justify-between gap-4"><span>{l.name}</span><span>{money(l.amount)}</span></div>)}<div className="flex justify-between border-t pt-2 font-semibold"><span>Total expenses</span><span>{money(statements.incomeStatement.totalExpenses)}</span></div><div className="flex justify-between border-t-2 pt-3 text-base font-bold"><span>Net income</span><span>{money(statements.incomeStatement.netIncome)}</span></div></div></div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-5 py-4"><h3 className="font-semibold">Balance Sheet · {statements.period}</h3></div><div className="grid gap-6 p-5 text-sm sm:grid-cols-2"><div><p className="mb-2 font-semibold text-slate-500">Assets</p>{statements.balanceSheet.assets.map((l) => <div key={l.code} className="flex justify-between gap-3 py-1"><span>{l.name}</span><span>{money(l.amount)}</span></div>)}<div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Total assets</span><span>{money(statements.balanceSheet.totalAssets)}</span></div></div><div><p className="mb-2 font-semibold text-slate-500">Liabilities & equity</p>{[...statements.balanceSheet.liabilities, ...statements.balanceSheet.equity].map((l) => <div key={l.code} className="flex justify-between gap-3 py-1"><span>{l.name}</span><span>{money(l.amount)}</span></div>)}<div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Total liabilities & equity</span><span>{money(statements.balanceSheet.totalLiabilities + statements.balanceSheet.totalEquity)}</span></div></div></div></div>
        </div>
        <div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Print / Save as PDF</button><button onClick={() => { const data = JSON.stringify(statements, null, 2); const url = URL.createObjectURL(new Blob([data], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = "financial-statements-" + period + ".json"; a.click(); URL.revokeObjectURL(url); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export statement data</button></div>
      </section>}
    </div>
  );
}
