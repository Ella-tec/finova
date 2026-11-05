"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, GitMerge } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

type Entity = { id: string; code: string; name: string; ownershipPct: number };
type Line = {
  accountCode: string;
  accountName: string;
  type: string;
  entities: Record<string, number>;
  consolidated: number;
  eliminations: number;
  final: number;
};
type Result = {
  period: string;
  reportingCurrency?: string;
  lines: Line[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalNCI?: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netIncomeAttributableToParent?: number;
  netIncomeAttributableToNCI?: number;
  eliminationEntries: { description: string; amount: number }[];
  fxRatesUsed?: Record<string, number>;
};

export default function ConsolidationPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [entities, setEntities] = useState<Entity[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consolidation?period=${period}`);
      const data = await res.json();
      setEntities(data.entities || []);
      setResult(data.result || null);
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [period]);

  const entityCodes = entities.map((e) => e.code);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitMerge className="h-7 w-7 text-isaca-medium" />
            Multi-Entity Consolidation
          </h1>
          <p className="text-slate-600 mt-1">
            Combine entity trial balances, apply ownership %, eliminate intercompany balances
          </p>
        </div>
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Entities */}
      <div className="grid sm:grid-cols-3 gap-3">
        {entities.map((e) => (
          <div key={e.id} className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-isaca-light flex items-center justify-center">
              <Building2 className="h-5 w-5 text-isaca-medium" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{e.code}</p>
              <p className="text-xs text-slate-500">{e.name}</p>
              <p className="text-xs text-isaca-dark font-medium">{e.ownershipPct}% owned</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading consolidation…
        </div>
      ) : !result ? (
        <div className="text-center py-12 text-slate-500">No data for this period</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Assets", value: result.totalAssets },
              { label: "Total Revenue", value: result.totalRevenue },
              { label: "NI to Parent", value: result.netIncomeAttributableToParent ?? result.netIncome },
              { label: "NI to NCI", value: result.netIncomeAttributableToNCI ?? 0 },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{k.label}</p>
                <p className={cn("text-xl font-bold mt-1", k.label === "Net Income" && k.value >= 0 ? "text-emerald-600" : "")}>
                  {formatCurrency(k.value)}
                </p>
              </div>
            ))}
          </div>

          {result.fxRatesUsed && Object.keys(result.fxRatesUsed).length > 0 && (
            <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Reporting: {result.reportingCurrency || "USD"} · FX used: </span>
              {Object.entries(result.fxRatesUsed).map(([c, r]) => (
                <span key={c} className="mr-3">{c}={Number(r).toFixed(4)}</span>
              ))}
            </div>
          )}

          {/* Eliminations */}
          {result.eliminationEntries.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900 text-sm mb-2">Elimination entries</h3>
              <ul className="space-y-1 text-sm text-amber-800">
                {result.eliminationEntries.map((e, i) => (
                  <li key={i}>
                    {e.description}: {formatCurrency(e.amount)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Worksheet */}
          <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Account</th>
                  {entityCodes.map((c) => (
                    <th key={c} className="px-3 py-3 font-medium text-right">{c}</th>
                  ))}
                  <th className="px-3 py-3 font-medium text-right">Combined</th>
                  <th className="px-3 py-3 font-medium text-right">Elim</th>
                  <th className="px-3 py-3 font-medium text-right">Final</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((l) => (
                  <tr key={l.accountCode + l.accountName} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <span className="text-slate-500 text-xs mr-2">{l.accountCode}</span>
                      {l.accountName}
                    </td>
                    {entityCodes.map((c) => (
                      <td key={c} className="px-3 py-2 text-right tabular-nums">
                        {l.entities[c] != null ? formatCurrency(l.entities[c]) : "—"}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(l.consolidated)}</td>
                    <td className={cn("px-3 py-2 text-right tabular-nums", l.eliminations !== 0 && "text-amber-700")}>
                      {l.eliminations !== 0 ? formatCurrency(l.eliminations) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{formatCurrency(l.final)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
