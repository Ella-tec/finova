"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowDownLeft, ArrowUpRight, Check, CheckCircle2, ChevronDown,
  ChevronUp, FileText, Filter, Link2, Loader2, RefreshCw, Search, Sparkles,
  Unlink, WalletCards,
} from "lucide-react";
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
  reference?: string | null;
};

function dateLabel(value: string) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });
}

export default function BankRecPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "MATCHED" | "UNMATCHED">("ALL");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bank-rec?period=${encodeURIComponent(period)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load bank transactions.");
      setTxns((data.transactions || []).map((t: Txn) => ({
        ...t,
        date: typeof t.date === "string" ? t.date.slice(0, 10) : new Date(t.date).toISOString().slice(0, 10),
      })));
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to load transactions." });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  const bank = useMemo(() => txns.filter((t) => t.source === "BANK"), [txns]);
  const book = useMemo(() => txns.filter((t) => t.source === "BOOK"), [txns]);
  const matchedCount = bank.filter((t) => t.matched).length;
  const bankExceptions = bank.length - matchedCount;
  const bookExceptions = book.filter((t) => !t.matched).length;
  const filteredBank = bank.filter((t) => {
    const matchesSearch = !search || `${t.description} ${t.reference || ""} ${t.amount}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || (filter === "MATCHED" ? t.matched : !t.matched);
    return matchesSearch && matchesFilter;
  });
  const filteredBook = book.filter((t) => {
    const matchesSearch = !search || `${t.description} ${t.reference || ""} ${t.amount}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || (filter === "MATCHED" ? t.matched : !t.matched);
    return matchesSearch && matchesFilter;
  });

  const runAutoMatch = async () => {
    setMatching(true);
    setNotice(null);
    try {
      const res = await fetch("/api/bank-rec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto-match", period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auto-match failed.");
      await load();
      setNotice({ kind: "success", text: `Auto-match complete: ${data.matches?.length || 0} pairs matched. ${data.unmatchedBank || 0} bank items and ${data.unmatchedBook || 0} book entries still need review.` });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Auto-match failed." });
    } finally {
      setMatching(false);
    }
  };

  const matchManually = async () => {
    if (!selectedBankId || !selectedBookId) return;
    setBusyId(selectedBankId);
    setNotice(null);
    try {
      const res = await fetch("/api/bank-rec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual-match", period, bankId: selectedBankId, bookId: selectedBookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not match these entries.");
      setSelectedBankId("");
      setSelectedBookId("");
      setExpandedId(null);
      await load();
      setNotice({ kind: "success", text: "The bank transaction and book entry are now linked." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Manual match failed." });
    } finally {
      setBusyId(null);
    }
  };

  const unmatch = async (txn: Txn) => {
    setBusyId(txn.id);
    setNotice(null);
    try {
      const res = await fetch("/api/bank-rec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unmatch", period, bankId: txn.source === "BANK" ? txn.id : txn.matchedToId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not unlink these entries.");
      await load();
      setNotice({ kind: "success", text: "The match has been removed and both entries are available for review." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unmatch failed." });
    } finally {
      setBusyId(null);
    }
  };

  const matchedPartner = (txn: Txn) => txns.find((item) => item.id === txn.matchedToId);
  const unmatchedBooks = book.filter((item) => !item.matched);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <WalletCards className="h-3.5 w-3.5" /> Cash management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Bank Reconciliation</h1>
          <p className="mt-1 text-sm text-slate-600">Review every bank movement, connect it to the ledger, and track supporting evidence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="recon-period">Statement period</label>
          <input id="recon-period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm" />
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
          <button onClick={runAutoMatch} disabled={matching || loading} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">
            {matching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI Auto-Match
          </button>
        </div>
      </header>

      {notice && (
        <div role="status" className={cn("flex items-start gap-2 rounded-xl border px-4 py-3 text-sm", notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}>
          {notice.kind === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Bank transactions", value: bank.length, detail: "All imported bank-feed items", color: "text-slate-950", icon: ArrowDownLeft },
          { label: "Matched", value: matchedCount, detail: "Bank items linked to ledger entries", color: "text-emerald-700", icon: CheckCircle2 },
          { label: "Bank exceptions", value: bankExceptions, detail: "Bank items still unmatched", color: "text-amber-700", icon: AlertCircle },
          { label: "Book exceptions", value: bookExceptions, detail: "Ledger entries not cleared by bank", color: "text-orange-700", icon: FileText },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <card.icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className={cn("mt-2 text-3xl font-bold tabular-nums", card.color)}>{loading ? "—" : card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search descriptions, references, amounts…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["ALL", "MATCHED", "UNMATCHED"] as const).map((value) => (
            <button key={value} onClick={() => setFilter(value)} className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition", filter === value ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
              {value === "ALL" ? "All items" : value === "MATCHED" ? "Matched" : "Needs review"}
            </button>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4">
            <div><h2 className="font-semibold text-slate-900">Bank Feed</h2><p className="mt-0.5 text-xs text-slate-500">{bank.length} transactions · full statement list</p></div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{filteredBank.length} shown</span>
          </div>
          {loading ? <div className="p-8 text-center text-sm text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading bank feed…</div> :
            filteredBank.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No bank transactions match this filter.</div> :
            <div className="divide-y divide-slate-100">
              {filteredBank.map((txn) => {
                const partner = matchedPartner(txn);
                const expanded = expandedId === txn.id;
                return <article key={txn.id} className={cn(txn.matched ? "bg-emerald-50/30" : "bg-amber-50/30")}>
                  <button type="button" onClick={() => setExpandedId(expanded ? null : txn.id)} aria-expanded={expanded} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", txn.amount >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{txn.amount >= 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{txn.description}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><span>{dateLabel(txn.date)}</span>{txn.reference && <span>· Ref {txn.reference}</span>}<span className={cn("inline-flex items-center gap-1 font-medium", txn.matched ? "text-emerald-700" : "text-amber-700")}>{txn.matched ? <><CheckCircle2 className="h-3 w-3" />{Math.round((txn.matchConfidence ?? 1) * 100)}% matched</> : <><AlertCircle className="h-3 w-3" />Needs review</>}</span></span>
                    </span>
                    <span className={cn("whitespace-nowrap text-sm font-bold tabular-nums", txn.amount >= 0 ? "text-emerald-700" : "text-slate-900")}>{formatCurrency(txn.amount)}</span>
                    {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                  </button>
                  {expanded && <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Transaction details</p><p className="mt-2 text-sm text-slate-800">Date: {dateLabel(txn.date)}</p><p className="mt-1 text-sm text-slate-800">Type: {txn.type}</p><p className="mt-1 text-sm text-slate-800">Transaction ID: <span className="font-mono text-xs">{txn.id}</span></p></div>
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reconciliation status</p>{partner ? <><p className="mt-2 text-sm font-semibold text-emerald-800">Matched ledger entry</p><p className="mt-1 text-sm text-slate-700">{partner.description}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(partner.date)} · {formatCurrency(partner.amount)}</p></> : <p className="mt-2 text-sm text-amber-800">No ledger entry is currently linked. Select a book entry below to create a manual match.</p>}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a href="/dashboard/documents" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileText className="h-3.5 w-3.5" /> Supporting documents</a>
                      {txn.matched ? <button onClick={() => void unmatch(txn)} disabled={busyId === txn.id} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"><Unlink className="h-3.5 w-3.5" /> Unmatch</button> : <button onClick={() => { setSelectedBankId(txn.id); setSelectedBookId(""); }} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"><Link2 className="h-3.5 w-3.5" /> Match to book entry</button>}
                    </div>
                    {selectedBankId === txn.id && <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
                      <label className="mb-2 block text-xs font-semibold text-teal-900" htmlFor={`book-${txn.id}`}>Choose an unmatched book entry</label>
                      <select id={`book-${txn.id}`} value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)} className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm">
                        <option value="">Select a ledger entry…</option>
                        {unmatchedBooks.map((item) => <option key={item.id} value={item.id}>{dateLabel(item.date)} · {item.description} · {formatCurrency(item.amount)}</option>)}
                      </select>
                      <div className="mt-2 flex gap-2"><button onClick={() => void matchManually()} disabled={!selectedBookId || !!busyId} className="rounded-lg bg-teal-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyId === txn.id ? "Matching…" : "Confirm match"}</button><button onClick={() => { setSelectedBankId(""); setSelectedBookId(""); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white">Cancel</button></div>
                    </div>}
                  </div>}
                </article>;
              })}
            </div>}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">Every bank-feed transaction is listed above. Select any row to view its details and matching actions.</div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4">
            <div><h2 className="font-semibold text-slate-900">Books / General Ledger</h2><p className="mt-0.5 text-xs text-slate-500">{book.length} ledger entries · compare against bank activity</p></div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{filteredBook.length} shown</span>
          </div>
          {loading ? <div className="p-8 text-center text-sm text-slate-500">Loading ledger entries…</div> :
            filteredBook.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No book entries match this filter.</div> :
            <div className="divide-y divide-slate-100">
              {filteredBook.map((txn) => {
                const partner = matchedPartner(txn);
                const expanded = expandedId === txn.id;
                return <article key={txn.id} className={cn(txn.matched ? "bg-emerald-50/30" : "bg-amber-50/30")}>
                  <button type="button" onClick={() => setExpandedId(expanded ? null : txn.id)} aria-expanded={expanded} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", txn.amount >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{txn.amount >= 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{txn.description}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{dateLabel(txn.date)}</span><span className={cn("font-medium", txn.matched ? "text-emerald-700" : "text-amber-700")}>{txn.matched ? "Cleared / matched" : "Outstanding"}</span></span></span>
                    <span className={cn("whitespace-nowrap text-sm font-bold tabular-nums", txn.amount >= 0 ? "text-emerald-700" : "text-slate-900")}>{formatCurrency(txn.amount)}</span>
                    {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                  </button>
                  {expanded && <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ledger entry details</p><p className="mt-2 text-sm text-slate-800">Posting date: {dateLabel(txn.date)}</p><p className="mt-1 text-sm text-slate-800">Type: {txn.type}</p><p className="mt-1 text-sm text-slate-800">Entry ID: <span className="font-mono text-xs">{txn.id}</span></p>{partner && <p className="mt-2 text-sm text-emerald-800">Bank counterpart: {partner.description}</p>}</div>
                    <div className="mt-3 flex flex-wrap gap-2"><a href="/dashboard/documents" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileText className="h-3.5 w-3.5" /> Find supporting documents</a>{txn.matched && <button onClick={() => void unmatch(txn)} disabled={!!busyId} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50"><Unlink className="h-3.5 w-3.5" /> Unmatch</button>}</div>
                  </div>}
                </article>;
              })}
            </div>}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">Outstanding book entries may represent checks or payments that have not cleared yet.</div>
        </section>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div className="min-w-0 flex-1"><h3 className="font-semibold text-amber-950">Reconciliation review checklist</h3><p className="mt-1 text-sm leading-6 text-amber-900">Investigate unmatched deposits, bank fees, interest, outstanding checks, and timing differences. Attach the bank statement, deposit support, invoices, receipts, and payroll evidence in Documents before approving adjustments.</p><div className="mt-3 flex flex-wrap gap-2"><a href="/dashboard/documents" className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"><FileText className="h-3.5 w-3.5" /> Open document workspace</a><span className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-900"><Check className="h-3.5 w-3.5" /> Review before posting adjustments</span></div></div></div>
      </section>
    </div>
  );
}
