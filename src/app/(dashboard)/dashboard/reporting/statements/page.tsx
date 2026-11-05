"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { FinancialStatements } from "@/lib/statements/generator";
import { formatCurrency } from "@/lib/utils";

export default function StatementsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [csv, setCsv] = useState("");
  const [statements, setStatements] = useState<FinancialStatements | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleCSV = `Account Code,Account Name,Debit,Credit
1000,Cash,125000,0
1100,Accounts Receivable,85000,0
1200,Inventory,62000,0
1500,Fixed Assets,210000,0
2000,Accounts Payable,0,48000
2100,Accrued Expenses,0,12000
3000,Common Stock,0,100000
3100,Retained Earnings,0,95000
4000,Product Revenue,0,320000
4100,Service Revenue,0,85000
5000,Cost of Goods Sold,180000,0
6000,Salaries Expense,95000,0
6100,Rent Expense,24000,0
6200,Utilities Expense,8500,0
6300,Insurance Expense,6200,0`;

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trial-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csv || sampleCSV, period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImported(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatements(data.statements);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Statements</h1>
        <p className="text-slate-600 mt-1">
          Import a trial balance (or grab one from Sample Library) and generate Balance Sheet, Income Statement, Cash Flow & ratios.
        </p>
      </div>

      {/* Import section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-isaca-medium" />
          <h2 className="font-semibold text-slate-900">1. Import Trial Balance</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => setCsv(sampleCSV)}
            className="text-sm font-medium text-isaca-medium hover:text-isaca-dark"
          >
            Load sample data
          </button>
        </div>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="Paste CSV: Account Code, Account Name, Debit, Credit"
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-isaca-blue"
        />

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import Trial Balance
          </button>
          {imported && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Imported
            </span>
          )}
        </div>
      </div>

      {/* Generate */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-isaca-medium" />
          <h2 className="font-semibold text-slate-900">2. Generate Statements</h2>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generate Financial Statements
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {statements && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Net Income", value: statements.incomeStatement.netIncome },
              { label: "Total Assets", value: statements.balanceSheet.totalAssets },
              {
                label: "Current Ratio",
                value: statements.ratios.currentRatio,
                isRatio: true,
              },
              {
                label: "Net Margin",
                value: statements.ratios.netMargin,
                isRatio: true,
                percent: true,
              },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {kpi.isRatio
                    ? kpi.value != null
                      ? kpi.percent
                        ? `${(kpi.value * 100).toFixed(1)}%`
                        : kpi.value.toFixed(2)
                      : ""
                    : formatCurrency(kpi.value as number)}
                </p>
              </div>
            ))}
          </div>

          {/* Income Statement */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h3 className="font-semibold">Income Statement  {statements.period}</h3>
            </div>
            <div className="p-6 space-y-1 text-sm">
              <p className="font-medium text-slate-500 uppercase text-xs mb-2">Revenue</p>
              {statements.incomeStatement.revenue.map((l) => (
                <div key={l.code + l.name} className="flex justify-between">
                  <span>{l.name}</span>
                  <span>{formatCurrency(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Revenue</span>
                <span>{formatCurrency(statements.incomeStatement.totalRevenue)}</span>
              </div>

              <p className="font-medium text-slate-500 uppercase text-xs mb-2 mt-4">Expenses</p>
              {statements.incomeStatement.expenses.map((l) => (
                <div key={l.code + l.name} className="flex justify-between">
                  <span>{l.name}</span>
                  <span>{formatCurrency(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total Expenses</span>
                <span>{formatCurrency(statements.incomeStatement.totalExpenses)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t-2 border-slate-900 pt-3 mt-3">
                <span>Net Income</span>
                <span
                  className={
                    statements.incomeStatement.netIncome >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  {formatCurrency(statements.incomeStatement.netIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h3 className="font-semibold">Balance Sheet  {statements.period}</h3>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-medium text-slate-500 uppercase text-xs mb-2">Assets</p>
                {statements.balanceSheet.assets.map((l) => (
                  <div key={l.code + l.name} className="flex justify-between py-0.5">
                    <span>{l.name}</span>
                    <span>{formatCurrency(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total Assets</span>
                  <span>{formatCurrency(statements.balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-500 uppercase text-xs mb-2">
                  Liabilities & Equity
                </p>
                {statements.balanceSheet.liabilities.map((l) => (
                  <div key={l.code + l.name} className="flex justify-between py-0.5">
                    <span>{l.name}</span>
                    <span>{formatCurrency(l.amount)}</span>
                  </div>
                ))}
                {statements.balanceSheet.equity.map((l) => (
                  <div key={l.code + l.name} className="flex justify-between py-0.5">
                    <span>{l.name}</span>
                    <span>{formatCurrency(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total L+E</span>
                  <span>
                    {formatCurrency(
                      statements.balanceSheet.totalLiabilities +
                        statements.balanceSheet.totalEquity
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}