"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Loader2,
  GitMerge,
  Download,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";
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

type KpiKey = "assets" | "revenue" | "niParent" | "niNci" | null;

const KPI_META: Record<
  Exclude<KpiKey, null>,
  { label: string; color: string; ring: string; bg: string; match: (l: Line) => boolean }
> = {
  assets: {
    label: "Total Assets",
    color: "text-emerald-800",
    ring: "ring-emerald-400",
    bg: "bg-emerald-50 border-emerald-200",
    match: (l) =>
      l.type === "asset" ||
      /^1\d{3}/.test(l.accountCode) ||
      /cash|receivable|inventory|asset/i.test(l.accountName),
  },
  revenue: {
    label: "Total Revenue",
    color: "text-sky-800",
    ring: "ring-sky-400",
    bg: "bg-sky-50 border-sky-200",
    match: (l) =>
      l.type === "revenue" ||
      /^4\d{3}/.test(l.accountCode) ||
      /revenue|income(?!.*expense)/i.test(l.accountName),
  },
  niParent: {
    label: "NI to Parent",
    color: "text-violet-800",
    ring: "ring-violet-400",
    bg: "bg-violet-50 border-violet-200",
    match: (l) =>
      l.type === "revenue" ||
      l.type === "expense" ||
      /^[456]\d{3}/.test(l.accountCode),
  },
  niNci: {
    label: "NI to NCI",
    color: "text-amber-900",
    ring: "ring-amber-400",
    bg: "bg-amber-50 border-amber-200",
    match: (l) =>
      l.type === "revenue" ||
      l.type === "expense" ||
      /^[456]\d{3}/.test(l.accountCode),
  },
};

const ENTITY_COLORS: Record<string, string> = {
  PARENT: "border-slate-300 bg-slate-50",
  "SUB-A": "border-teal-200 bg-teal-50",
  "SUB-B": "border-indigo-200 bg-indigo-50",
  "SUB-EU": "border-rose-200 bg-rose-50",
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportFullCsv(result: Result, entities: Entity[]) {
  const codes = entities.map((e) => e.code);
  const header = [
    "Account Code",
    "Account Name",
    ...codes,
    "Combined",
    "Eliminations",
    "Final",
  ];
  const rows = result.lines.map((l) => [
    l.accountCode,
    l.accountName,
    ...codes.map((c) => (l.entities[c] != null ? String(l.entities[c]) : "")),
    String(l.consolidated),
    String(l.eliminations),
    String(l.final),
  ]);
  const summary = [
    [],
    ["KPI", "Amount"],
    ["Total Assets", String(result.totalAssets)],
    ["Total Revenue", String(result.totalRevenue)],
    ["NI to Parent", String(result.netIncomeAttributableToParent ?? result.netIncome)],
    ["NI to NCI", String(result.netIncomeAttributableToNCI ?? 0)],
    [],
    ["Elimination", "Amount"],
    ...result.eliminationEntries.map((e) => [e.description, String(e.amount)]),
  ];
  downloadCsv(`consolidation-${result.period || "export"}.csv`, [header, ...rows, ...summary]);
}

/** Export one entity's trial-balance style transactions only. */
function exportEntityCsv(result: Result, entity: Entity) {
  const code = entity.code;
  const header = [
    "Entity Code",
    "Entity Name",
    "Ownership %",
    "Period",
    "Account Code",
    "Account Name",
    "Amount",
  ];
  const rows = result.lines
    .filter((l) => l.entities[code] != null && l.entities[code] !== 0)
    .map((l) => [
      code,
      entity.name,
      String(entity.ownershipPct),
      result.period || "",
      l.accountCode,
      l.accountName,
      String(l.entities[code]),
    ]);

  const total = rows.reduce((sum, r) => sum + Number(r[6] || 0), 0);
  const footer = [[], ["", "", "", "", "", "Row count", String(rows.length)], ["", "", "", "", "", "Sum of amounts", String(total)]];

  downloadCsv(
    `entity-${code}-${result.period || "export"}.csv`,
    [header, ...rows, ...footer]
  );
}

export default function ConsolidationPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [entities, setEntities] = useState<Entity[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKpi, setActiveKpi] = useState<KpiKey>(null);
  const [focusEntity, setFocusEntity] = useState<string | null>(null);
  const [showElimOnly, setShowElimOnly] = useState(false);

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
    void load();
  }, [period]);

  const entityCodes = entities.map((e) => e.code);

  const visibleLines = useMemo(() => {
    if (!result) return [];
    let lines = result.lines;
    if (showElimOnly) lines = lines.filter((l) => l.eliminations !== 0);
    if (activeKpi) lines = lines.filter((l) => KPI_META[activeKpi].match(l));
    return lines;
  }, [result, activeKpi, showElimOnly]);

  const kpis = result
    ? [
        { key: "assets" as const, label: "Total Assets", value: result.totalAssets },
        { key: "revenue" as const, label: "Total Revenue", value: result.totalRevenue },
        {
          key: "niParent" as const,
          label: "NI to Parent",
          value: result.netIncomeAttributableToParent ?? result.netIncome,
        },
        {
          key: "niNci" as const,
          label: "NI to NCI",
          value: result.netIncomeAttributableToNCI ?? 0,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <GitMerge className="h-7 w-7 text-isaca-medium" />
            Multi-Entity Consolidation
          </h1>
          <p className="mt-1 text-slate-600">
            Combine entity trial balances, apply ownership %, eliminate intercompany balances
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          {result && (
            <button
              type="button"
              onClick={() => exportFullCsv(result, entities)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-isaca-medium px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              <Download className="h-4 w-4" /> Export full workbook
            </button>
          )}
        </div>
      </div>

      {/* Entity cards — focus + per-entity export */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entities.map((e) => {
          const active = focusEntity === e.code;
          const lineCount =
            result?.lines.filter((l) => l.entities[e.code] != null && l.entities[e.code] !== 0)
              .length ?? 0;
          return (
            <div
              key={e.id}
              className={cn(
                "rounded-xl border p-4 shadow-sm transition",
                ENTITY_COLORS[e.code] || "border-slate-200 bg-white",
                active && "ring-2 ring-isaca-medium ring-offset-1"
              )}
            >
              <button
                type="button"
                onClick={() => setFocusEntity(active ? null : e.code)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80">
                  <Building2 className="h-5 w-5 text-isaca-medium" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{e.code}</p>
                  <p className="truncate text-xs text-slate-600">{e.name}</p>
                  <p className="text-xs font-medium text-isaca-dark">{e.ownershipPct}% owned</p>
                </div>
              </button>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/5 pt-3">
                <span className="text-xs text-slate-500">{lineCount} accounts</span>
                <button
                  type="button"
                  disabled={!result || lineCount === 0}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (result) exportEntityCsv(result, e);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export {e.code}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading consolidation…
        </div>
      ) : !result ? (
        <div className="py-12 text-center text-slate-500">No data for this period</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {kpis.map((k) => {
              const meta = KPI_META[k.key];
              const active = activeKpi === k.key;
              return (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setActiveKpi(active ? null : k.key)}
                  className={cn(
                    "rounded-xl border p-4 text-left shadow-sm transition",
                    meta.bg,
                    active && `ring-2 ${meta.ring} ring-offset-1`
                  )}
                >
                  <p className="text-sm text-slate-600">{meta.label}</p>
                  <p className={cn("mt-1 text-xl font-bold", meta.color)}>
                    {formatCurrency(k.value)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {active ? "Showing related accounts — click to clear" : "Click to view related lines"}
                  </p>
                </button>
              );
            })}
          </div>

          {result.fxRatesUsed && Object.keys(result.fxRatesUsed).length > 0 && (
            <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                Reporting: {result.reportingCurrency || "USD"} · FX used:{" "}
              </span>
              {Object.entries(result.fxRatesUsed).map(([c, r]) => (
                <span key={c} className="mr-3">
                  {c}={Number(r).toFixed(4)}
                </span>
              ))}
            </div>
          )}

          {result.eliminationEntries.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-amber-900">Elimination entries</h3>
                <button
                  type="button"
                  onClick={() => setShowElimOnly((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                    showElimOnly
                      ? "border-amber-400 bg-amber-100 text-amber-900"
                      : "border-amber-200 bg-white text-amber-800"
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {showElimOnly ? "Showing elim rows only" : "Filter elim rows"}
                </button>
              </div>
              <ul className="space-y-1 text-sm text-amber-800">
                {result.eliminationEntries.map((e, i) => (
                  <li key={i}>
                    {e.description}: {formatCurrency(e.amount)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(activeKpi || focusEntity || showElimOnly) && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">Active filters:</span>
              {activeKpi && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm">
                  {KPI_META[activeKpi].label}
                  <button type="button" onClick={() => setActiveKpi(null)} aria-label="Clear KPI filter">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {focusEntity && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm">
                  Entity: {focusEntity}
                  <button type="button" onClick={() => setFocusEntity(null)} aria-label="Clear entity focus">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {showElimOnly && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm">
                  Eliminations only
                  <button type="button" onClick={() => setShowElimOnly(false)} aria-label="Clear elim filter">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveKpi(null);
                  setFocusEntity(null);
                  setShowElimOnly(false);
                }}
                className="ml-auto text-xs font-semibold text-isaca-medium hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Consolidation worksheet
                <span className="ml-2 font-normal text-slate-500">
                  ({visibleLines.length} of {result.lines.length} accounts)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Use entity cards to export one company · Full workbook for all columns
              </p>
            </div>
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-medium">Account</th>
                  {entityCodes.map((c) => (
                    <th
                      key={c}
                      className={cn(
                        "px-3 py-3 text-right font-medium",
                        focusEntity === c && "bg-isaca-light text-isaca-dark"
                      )}
                    >
                      {c}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right font-medium">Combined</th>
                  <th className="px-3 py-3 text-right font-medium">Elim</th>
                  <th className="px-3 py-3 text-right font-medium">Final</th>
                </tr>
              </thead>
              <tbody>
                {visibleLines.length === 0 ? (
                  <tr>
                    <td colSpan={entityCodes.length + 4} className="px-4 py-10 text-center text-slate-500">
                      No accounts match the current filters.
                    </td>
                  </tr>
                ) : (
                  visibleLines.map((l) => (
                    <tr
                      key={l.accountCode + l.accountName}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="sticky left-0 z-10 bg-white px-4 py-2">
                        <span className="mr-2 text-xs text-slate-500">{l.accountCode}</span>
                        {l.accountName}
                      </td>
                      {entityCodes.map((c) => (
                        <td
                          key={c}
                          className={cn(
                            "px-3 py-2 text-right tabular-nums",
                            focusEntity === c && "bg-isaca-light/40 font-medium"
                          )}
                        >
                          {l.entities[c] != null ? formatCurrency(l.entities[c]) : "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(l.consolidated)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          l.eliminations !== 0 && "font-medium text-amber-700"
                        )}
                      >
                        {l.eliminations !== 0 ? formatCurrency(l.eliminations) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">
                        {formatCurrency(l.final)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Each entity card has its own <strong>Export PARENT / SUB-A / …</strong> button for that
            company's accounts only. <strong>Export full workbook</strong> downloads every entity
            plus eliminations and final balances.
          </p>
        </>
      )}
    </div>
  );
}
