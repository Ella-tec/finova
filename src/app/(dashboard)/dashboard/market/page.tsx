"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Radio, CloudSun, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  currency: string;
  source: string;
};
type Fx = { pair: string; rate: number; source: string };

export default function MarketPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [fx, setFx] = useState<Fx[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/market");
      const data = await res.json();
      setQuotes(data.quotes || []);
      setFx(data.fx || []);
      setNotes(data.notes || []);
      setTicker(data.ticker || "");
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 120000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Radio className="h-7 w-7 text-isaca-medium" />
            Market Pulse
          </h1>
          <p className="text-slate-600 mt-1">
            FX & equities for fair value, consolidation rates, and audit context — not investment advice
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Ticker tape */}
      <div className="rounded-lg bg-slate-900 text-sky-300 text-xs font-mono overflow-hidden whitespace-nowrap">
        <div className="animate-pulse px-4 py-2">{ticker || "Loading market tape…"}</div>
      </div>

      {/* FX */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">FX rates (consolidation / IC)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {fx.map((r) => (
            <div key={r.pair} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">{r.pair}</p>
              <p className="text-lg font-bold tabular-nums mt-1">{r.rate.toFixed(4)}</p>
              <p className="text-[10px] text-slate-400 uppercase">{r.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Equities */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Benchmarks & liquid names</h2>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotes.map((q) => (
                <tr key={q.symbol} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{q.symbol}</td>
                  <td className="px-4 py-3 text-slate-600">{q.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{q.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        q.changePct >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {q.changePct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {q.changePct >= 0 ? "+" : ""}
                      {q.changePct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounting notes */}
      <div className="rounded-xl border border-isaca-light bg-isaca-light p-5 space-y-2">
        <h3 className="font-semibold text-fin-900 text-sm">Audit & accounting context</h3>
        {notes.map((n, i) => (
          <p key={i} className="text-sm text-isaca-dark">• {n}</p>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-5 flex gap-3 text-sm text-slate-600">
        <CloudSun className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <p className="font-medium text-slate-900">Weather & field work</p>
          <p className="mt-1">
            For inventory counts and site visits, use local weather at warehouse locations when planning
            teams. Optional: add OpenWeather or Azure Maps weather per office coordinates in a later
            release. Bloomberg Terminal–style full TV is out of scope; this pulse board covers rates
            and liquid marks useful for FV hierarchy and consolidation.
          </p>
        </div>
      </div>
    </div>
  );
}
