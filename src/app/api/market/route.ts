import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMarketQuotes, getFxRates, marketContextNotes } from "@/lib/market/quotes";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbols = req.nextUrl.searchParams.get("symbols")?.split(",").filter(Boolean);

  const [quotes, fx] = await Promise.all([getMarketQuotes(symbols), getFxRates()]);
  const notes = marketContextNotes(quotes, fx);

  // Simple "TV ticker" string
  const ticker = quotes.map((q) => `${q.symbol} ${q.price.toFixed(2)} (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%)`).join("   ·   ");

  return NextResponse.json({
    quotes,
    fx,
    notes,
    ticker,
    weatherHint:
      "Use firm location weather for operational site visits / inventory counts planning (integrate weather API per office if needed).",
  });
}
