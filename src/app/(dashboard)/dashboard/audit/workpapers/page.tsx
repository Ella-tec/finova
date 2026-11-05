"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

type Schedule = {
  id: string;
  lineCode?: string | null;
  description: string;
  priorBalance: number;
  currentBalance: number;
  adjustments: number;
  finalBalance: number;
};

type Workpaper = {
  id: string;
  accountCode?: string | null;
  accountName: string;
  title: string;
  period?: string | null;
  leadBalance?: number | null;
  status: string;
  procedures?: string | null;
  schedules: Schedule[];
};

type Template = {
  accountCode: string;
  accountName: string;
  title: string;
};

export default function WorkpapersPage() {
  const [workpapers, setWorkpapers] = useState<Workpaper[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Workpaper | null>(null);
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/workpapers?period=${period}`);
    const data = await res.json();
    setWorkpapers(data.workpapers || []);
    setTemplates(data.templates || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [period]);

  const createFromTemplate = async (accountCode: string) => {
    setCreating(true);
    const res = await fetch("/api/workpapers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateAccountCode: accountCode, period }),
    });
    const data = await res.json();
    if (data.workpaper) {
      setSelected(data.workpaper);
      load();
    }
    setCreating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/workpapers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
  };

  const procedures: string[] = selected?.procedures
    ? JSON.parse(selected.procedures)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workpapers & Lead Schedules</h1>
          <p className="text-slate-600 mt-1">Standard audit workpapers with procedures and lead schedules</p>
        </div>
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List + templates */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white shadow-sm p-4">
            <h2 className="font-semibold text-sm text-slate-700 mb-3">Create from template</h2>
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.accountCode}
                  onClick={() => createFromTemplate(t.accountCode)}
                  disabled={creating}
                  className="w-full text-left rounded-lg border px-3 py-2 text-sm hover:bg-isaca-light hover:border-isaca-teal/30 transition"
                >
                  <span className="font-medium">{t.accountCode}</span> — {t.accountName}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm divide-y max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>
            ) : workpapers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No workpapers yet. Create one from a template.
              </div>
            ) : (
              workpapers.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => setSelected(wp)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-50 transition",
                    selected?.id === wp.id && "bg-isaca-light"
                  )}
                >
                  <p className="font-medium text-sm text-slate-900">{wp.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {wp.accountCode} · {wp.status}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
              <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              Select or create a workpaper
            </div>
          ) : (
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{selected.title}</h2>
                  <p className="text-sm text-slate-500">
                    {selected.accountCode} · {selected.period} · Lead:{" "}
                    {formatCurrency(selected.leadBalance || 0)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium">
                  {selected.status}
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Procedures</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {procedures.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-isaca-medium shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Lead Schedule</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-slate-500">
                          <th className="pb-2 pr-2">Code</th>
                          <th className="pb-2 pr-2">Description</th>
                          <th className="pb-2 pr-2 text-right">Prior</th>
                          <th className="pb-2 pr-2 text-right">Current</th>
                          <th className="pb-2 pr-2 text-right">Adj</th>
                          <th className="pb-2 text-right">Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.schedules.map((s) => (
                          <tr key={s.id} className="border-b border-slate-100">
                            <td className="py-2 pr-2 text-slate-500">{s.lineCode}</td>
                            <td className="py-2 pr-2">{s.description}</td>
                            <td className="py-2 pr-2 text-right">{formatCurrency(s.priorBalance)}</td>
                            <td className="py-2 pr-2 text-right">{formatCurrency(s.currentBalance)}</td>
                            <td className="py-2 pr-2 text-right">{formatCurrency(s.adjustments)}</td>
                            <td className="py-2 text-right font-medium">{formatCurrency(s.finalBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.status === "DRAFT" && (
                    <button
                      onClick={() => updateStatus(selected.id, "PREPARED")}
                      className="rounded-lg bg-isaca-medium px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Mark Prepared
                    </button>
                  )}
                  {selected.status === "PREPARED" && (
                    <button
                      onClick={() => updateStatus(selected.id, "REVIEWED")}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {selected.status === "REVIEWED" && (
                    <button
                      onClick={() => updateStatus(selected.id, "SIGNED_OFF")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Sign Off
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
