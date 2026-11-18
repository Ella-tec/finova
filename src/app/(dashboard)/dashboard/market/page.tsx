"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Radio, CloudSun, RefreshCw, Loader2, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/market", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Market data is temporarily unavailable.");
      setQuotes(data.quotes || []);
      setFx(data.fx || []);
      setNotes(data.notes || []);
      setTicker(data.ticker || "");
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Market data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => { void load(); }, 120000);
    return () => clearInterval(interval);
  }, [load]);

  const hasData = quotes.length > 0 || fx.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">External reference data</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900"><Radio className="h-7 w-7 text-isaca-medium" />Market Pulse</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Reference FX rates and market benchmarks for accounting estimates, fair-value context, and consolidation support. Not investment advice or an approved valuation source.</p>
          <p className="mt-1 text-xs text-slate-400">{lastUpdated ? `Last retrieved ${lastUpdated}` : "Waiting for market data"} · Sources are shown per item.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh data
        </button>
      </header>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      {ticker && <div className="overflow-hidden rounded-xl bg-slate-900 text-sky-300"><div className="px-4 py-3 font-mono text-xs">{ticker}</div></div>}

      {loading && !hasData ? (
        <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Retrieving market reference data…</div>
      ) : !hasData ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No market or FX data is available right now. Use Refresh data to retry.</div>
      ) : (
        <>
          <section>
            <div className="mb-3 flex items-end justify-between"><div><h2 className="font-semibold text-slate-900">FX reference rates</h2><p className="mt-1 text-xs text-slate-500">Verify source, effective date, and firm policy before posting currency translations.</p></div><span className="text-xs text-slate-400">{fx.length} pair(s)</span></div>
            {fx.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {fx.map((item) => <article key={item.pair} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{item.pair}</p><p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{item.rate.toFixed(4)}</p><p className="mt-1 text-[10px] uppercase text-slate-400">{item.source}</p></article>)}
            </div> : <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No FX rates returned.</p>}
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between"><div><h2 className="font-semibold text-slate-900">Benchmarks & liquid names</h2><p className="mt-1 text-xs text-slate-500">Indicative market information only; not a substitute for validated pricing evidence.</p></div><span className="text-xs text-slate-400">{quotes.length} symbol(s)</span></div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Name</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Change</th><th className="px-4 py-3">Source</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.map((quote) => <tr key={quote.symbol} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{quote.symbol}</td><td className="px-4 py-3 text-slate-600">{quote.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {quote.currency}</td>
                    <td className="px-4 py-3 text-right"><span className={cn("inline-flex items-center gap-1 font-medium", quote.changePct >= 0 ? "text-emerald-600" : "text-red-600")}>{quote.changePct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{quote.changePct >= 0 ? "+" : ""}{quote.changePct.toFixed(2)}%</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{quote.source}</td>
                  </tr>)}
                  {!quotes.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No benchmark quotes returned.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {!!notes.length && <section className="space-y-2 rounded-xl border border-sky-100 bg-sky-50 p-5"><h2 className="text-sm font-semibold text-sky-950">Accounting and audit context</h2>{notes.map((note, index) => <p key={index} className="text-sm leading-6 text-sky-900">{note}</p>)}</section>}
        </>
      )}

      <section className="flex gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        <CloudSun className="h-5 w-5 shrink-0 text-amber-500" />
        <div><h2 className="font-medium text-slate-900">Fieldwork planning</h2><p className="mt-1">Weather for warehouse counts and site visits is not connected in this build. Use the organization's approved weather source when planning fieldwork; this page does not retrieve location-specific forecasts.</p></div>
      </section>
    </div>
  );
}
