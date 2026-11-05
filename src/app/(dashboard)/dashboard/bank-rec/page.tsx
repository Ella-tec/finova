"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

type Txn = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  source: string;
  matched: boolean;
  matchConfidence?: number | null;
  matchedToId?: string | null;
};

export default function BankRecPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matchSummary, setMatchSummary] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/bank-rec?period=${period}`);
    const data = await res.json();
    setTxns(
      (data.transactions || []).map((t: any) => ({
        ...t,
        date: typeof t.date === "string" ? t.date.slice(0, 10) : new Date(t.date).toISOString().slice(0, 10),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [period]);

  const runAutoMatch = async () => {
    setMatching(true);
    setMatchSummary(null);
    const res = await fetch("/api/bank-rec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "auto-match", period }),
    });
    const data = await res.json();
    if (data.transactions) {
      setTxns(
        data.transactions.map((t: any) => ({
          ...t,
          date: typeof t.date === "string" ? t.date.slice(0, 10) : new Date(t.date).toISOString().slice(0, 10),
        }))
      );
      setMatchSummary(
        `Matched ${data.matches?.length || 0} pairs · ${data.unmatchedBank || 0} bank exceptions · ${data.unmatchedBook || 0} book exceptions`
      );
    }
    setMatching(false);
  };

  const bank = txns.filter((t) => t.source === "BANK");
  const book = txns.filter((t) => t.source === "BOOK");
  const matchedCount = bank.filter((t) => t.matched).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Reconciliation</h1>
          <p className="text-slate-600 mt-1">AI-assisted matching of bank vs book transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={runAutoMatch}
            disabled={matching}
            className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
          >
            {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Auto-Match
          </button>
        </div>
      </div>

      {matchSummary && (
        <div className="rounded-lg bg-isaca-light border border-isaca-light px-4 py-3 text-sm text-isaca-dark flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {matchSummary}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Bank transactions</p>
          <p className="text-2xl font-bold">{bank.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Matched</p>
          <p className="text-2xl font-bold text-emerald-600">{matchedCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Exceptions</p>
          <p className="text-2xl font-bold text-amber-600">{bank.length - matchedCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading transactions…</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-slate-50 font-semibold text-sm">Bank Feed</div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {bank.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "px-4 py-3 text-sm flex justify-between gap-2",
                    t.matched && "bg-emerald-50/50"
                  )}
                >
                  <div>
                    <p className="font-medium text-slate-900">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                    {t.matched && t.matchConfidence != null && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Link2 className="h-3 w-3" />
                        {(t.matchConfidence * 100).toFixed(0)}% match
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-semibold whitespace-nowrap",
                      t.amount >= 0 ? "text-emerald-600" : "text-slate-900"
                    )}
                  >
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-slate-50 font-semibold text-sm">Books</div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {book.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "px-4 py-3 text-sm flex justify-between gap-2",
                    t.matched && "bg-emerald-50/50"
                  )}
                >
                  <div>
                    <p className="font-medium text-slate-900">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                  <span
                    className={cn(
                      "font-semibold whitespace-nowrap",
                      t.amount >= 0 ? "text-emerald-600" : "text-slate-900"
                    )}
                  >
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && bank.some((t) => !t.matched) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">Exceptions need review</p>
            <p className="mt-1">
              Unmatched bank items may be timing differences, missing book entries, or bank fees.
              Review and post adjusting entries as needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
