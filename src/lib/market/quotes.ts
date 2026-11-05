/**
 * Market data helpers for accounting / audit context:
 * - FX rates (fair value, consolidation)
 * - Equity indices & tickers (portfolio FV, disclosures)
 * - Demo quotes when no API key is set
 *
 * Optional: set FINNHUB_API_KEY or ALPHA_VANTAGE_API_KEY for live data.
 */

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  currency: string;
  asOf: string;
  source: "live" | "demo";
};

export type FxRate = {
  pair: string;
  rate: number;
  asOf: string;
  source: "live" | "demo";
};

const DEMO_QUOTES: Quote[] = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 582.4, changePct: 0.35, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 512.1, changePct: 0.62, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "DIA", name: "Dow Jones ETF", price: 438.2, changePct: 0.18, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "IWM", name: "Russell 2000 ETF", price: 228.5, changePct: -0.22, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "GLD", name: "Gold ETF", price: 248.9, changePct: 0.41, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "TLT", name: "20+ Year Treasury", price: 94.3, changePct: -0.15, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "USO", name: "Crude Oil ETF", price: 72.8, changePct: 1.2, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "AAPL", name: "Apple Inc.", price: 228.5, changePct: 0.8, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "MSFT", name: "Microsoft", price: 428.1, changePct: 0.45, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 248.2, changePct: -0.3, currency: "USD", asOf: new Date().toISOString(), source: "demo" },
];

const DEMO_FX: FxRate[] = [
  { pair: "EUR/USD", rate: 1.082, asOf: new Date().toISOString(), source: "demo" },
  { pair: "GBP/USD", rate: 1.271, asOf: new Date().toISOString(), source: "demo" },
  { pair: "USD/JPY", rate: 149.2, asOf: new Date().toISOString(), source: "demo" },
  { pair: "USD/CAD", rate: 1.358, asOf: new Date().toISOString(), source: "demo" },
  { pair: "AUD/USD", rate: 0.662, asOf: new Date().toISOString(), source: "demo" },
  { pair: "USD/CHF", rate: 0.891, asOf: new Date().toISOString(), source: "demo" },
];

export async function getMarketQuotes(symbols?: string[]): Promise<Quote[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return DEMO_QUOTES.filter((q) => !symbols || symbols.includes(q.symbol));
  }

  const list = symbols || ["SPY", "QQQ", "DIA", "AAPL", "MSFT", "JPM"];
  const results: Quote[] = [];

  for (const symbol of list) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.c == null) continue;
      const prev = data.pc || data.c;
      results.push({
        symbol,
        name: symbol,
        price: data.c,
        changePct: prev ? ((data.c - prev) / prev) * 100 : 0,
        currency: "USD",
        asOf: new Date().toISOString(),
        source: "live",
      });
    } catch {
      // skip
    }
  }

  return results.length ? results : DEMO_QUOTES;
}

export async function getFxRates(): Promise<FxRate[]> {
  // Frankfurter (ECB) — free, no key
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CAD,AUD,CHF", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const rates: FxRate[] = [];
      // API returns USD base → foreign. Invert for EUR/USD style where needed.
      if (data.rates?.EUR) {
        rates.push({ pair: "EUR/USD", rate: 1 / data.rates.EUR, asOf: data.date, source: "live" });
        rates.push({ pair: "USD/EUR", rate: data.rates.EUR, asOf: data.date, source: "live" });
      }
      if (data.rates?.GBP) rates.push({ pair: "GBP/USD", rate: 1 / data.rates.GBP, asOf: data.date, source: "live" });
      if (data.rates?.JPY) rates.push({ pair: "USD/JPY", rate: data.rates.JPY, asOf: data.date, source: "live" });
      if (data.rates?.CAD) rates.push({ pair: "USD/CAD", rate: data.rates.CAD, asOf: data.date, source: "live" });
      if (data.rates?.AUD) rates.push({ pair: "AUD/USD", rate: 1 / data.rates.AUD, asOf: data.date, source: "live" });
      if (data.rates?.CHF) rates.push({ pair: "USD/CHF", rate: data.rates.CHF, asOf: data.date, source: "live" });
      if (rates.length) return rates;
    }
  } catch {
    // fall through
  }
  return DEMO_FX;
}

/** Accounting-oriented summary for fair value / disclosure context */
export function marketContextNotes(quotes: Quote[], fx: FxRate[]): string[] {
  const notes: string[] = [];
  const spy = quotes.find((q) => q.symbol === "SPY");
  if (spy) {
    notes.push(
      spy.changePct >= 0
        ? `Equity markets firmer (SPY ${spy.changePct.toFixed(2)}%). Consider fair-value marks on Level 1 securities.`
        : `Equity markets softer (SPY ${spy.changePct.toFixed(2)}%). Review impairment indicators for equity holdings.`
    );
  }
  const eurusd = fx.find((r) => r.pair === "EUR/USD");
  if (eurusd) {
    notes.push(`EUR/USD ${eurusd.rate.toFixed(4)} — use for EUR subsidiary translation and IC settlements.`);
  }
  notes.push("Rates and quotes are for informational support of audit/accounting judgments — not investment advice.");
  return notes;
}
