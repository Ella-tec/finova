"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2 } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const STARTERS = [
  "How do I run month-end close?",
  "Show financial statement process",
  "Sanitize a file before AI",
  "Help with bank reconciliation",
];

export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I’m Finova. Ask about close, statements (TB → JE → P&L → BS → CF), audit PBC, consolidation, or document security.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Close when clicking / tapping anywhere outside the panel
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (launcherRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      }).catch(() => null);

      let reply =
        "I can help with Finova workflows: Documents, File Sanitizer, Bank Rec, Financial Statements (Trial Balance → Journal Entries → Income Statement → Balance Sheet → Cash Flow), Close, Consolidation, Audit/PBC, and Sample Library.";
      if (res && res.ok) {
        const data = await res.json();
        reply = data.reply || data.message || reply;
      } else {
        const l = q.toLowerCase();
        if (l.includes("close"))
          reply =
            "Go to Month-End Close (/dashboard/close). Start the period, complete bank rec → AR/AP → JEs → TB review → final approval.";
        else if (l.includes("statement") || l.includes("trial") || l.includes("balance sheet") || l.includes("cash flow"))
          reply =
            "Open Financial Statements (/dashboard/reporting/statements). Full process: import Trial Balance → review Journal Entries → generate Income Statement → Balance Sheet → Cash Flow. Use Sample Library for company packs.";
        else if (l.includes("sanit") || l.includes("pii") || l.includes("secur"))
          reply =
            "Use File Sanitizer (/dashboard/security) before AI: type checks, PII hints, classification, and public-AI gate.";
        else if (l.includes("bank"))
          reply =
            "Bank Rec (/dashboard/bank-rec): load period → AI Auto-Match → review exceptions.";
        else if (l.includes("pbc") || l.includes("audit"))
          reply =
            "Audit → PBC Requests: create request, track REQUESTED → UPLOADED → REVIEW → ACCEPTED. Clients reply in /portal.";
        else if (l.includes("sample") || l.includes("compan"))
          reply =
            "Sample Library has 18 demo companies (Acme, Nexus, Orbit, Parent group, and more) with TB, JEs, statements, invoices, and PBC lists.";
      }
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full py-2 pl-2 pr-4 shadow-brand",
          "bg-gradient-to-r from-[#1d2d5c] via-[#07649d] to-[#36ac91] text-white",
          "transition hover:scale-[1.03] active:scale-95",
          open && "invisible pointer-events-none"
        )}
        aria-label="Open Finova AI"
      >
        <span className="rounded-full bg-white/15 p-1">
          <Logo size={32} />
        </span>
        <span className="text-sm font-semibold tracking-wide">AI</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-[60] flex h-[min(70vh,520px)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-[#d7e3ec] bg-white shadow-2xl shadow-[#1d2d5c]/20"
        >
          <header className="flex items-center gap-2 bg-gradient-to-r from-[#1d2d5c] via-[#07649d] to-[#36ac91] px-3 py-2.5 text-white">
            <Logo size={28} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Finova AI</p>
              <p className="text-[10px] text-white/80">Assistant · click outside to close</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/15"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#e7f0f5]/50 px-3 py-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto rounded-br-md bg-[#07649d] text-white"
                    : "rounded-bl-md border border-slate-100 bg-white text-slate-800 shadow-sm"
                )}
              >
                {m.text}
              </div>
            ))}
            {busy && <p className="animate-pulse text-xs text-[#07649d]">Thinking…</p>}
            <div ref={endRef} />
          </div>

          {msgs.length < 3 && (
            <div className="flex flex-wrap gap-1.5 bg-[#e7f0f5]/50 px-3 pb-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-[#36ac91]/40 bg-white px-2.5 py-1 text-[11px] text-[#1d2d5c] hover:bg-[#36ac91]/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-slate-100 bg-white p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Finova…"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/40"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-[#07649d] p-2.5 text-white hover:bg-[#1d2d5c] disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
