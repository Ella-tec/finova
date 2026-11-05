"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2 } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string };

const STARTERS = [
  "How do I run month-end close?",
  "Explain NCI on consolidation",
  "Sanitize a file before AI",
  "Help with bank reconciliation",
];

export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Hi — I’m Finova. Ask about close, statements, audit PBC, consolidation, or document security.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      // Prefer existing AI API if present; else local helpful reply
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      }).catch(() => null);

      let reply =
        "I can help with Finova workflows: Documents, File Sanitizer, Bank Rec, Statements, Close, Consolidation (NCI/FX), Audit/PBC, and Market Pulse. Open those pages from the sidebar, or ask a specific step.";
      if (res && res.ok) {
        const data = await res.json();
        reply = data.reply || data.message || reply;
      } else {
        // Lightweight contextual hints
        const l = q.toLowerCase();
        if (l.includes("close")) reply = "Go to Month-End Close (/dashboard/close). Start the period, complete bank rec → AR/AP → JEs → TB review → final approval. Progress is saved in the database.";
        else if (l.includes("nci") || l.includes("consolidat")) reply = "Open Consolidation (/dashboard/consolidation). Ownership % drives NCI; EUR entities translate via FX rates. Entity CRUD is under Entities.";
        else if (l.includes("sanit") || l.includes("pii") || l.includes("secur")) reply = "Use File Sanitizer (/dashboard/security) before upload: type checks, PII hints, classification, and public-AI gate.";
        else if (l.includes("bank")) reply = "Bank Rec (/dashboard/bank-rec): load period → AI Auto-Match → review exceptions.";
        else if (l.includes("pbc") || l.includes("audit")) reply = "Audit → PBC Requests: create request, Send Email, track REQUESTED → UPLOADED → REVIEW → ACCEPTED.";
        else if (l.includes("portal")) reply = "Clients sign in at /portal with client@acme.com to upload files and answer PBC requests.";
      }
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full pl-2 pr-4 py-2 shadow-brand",
          "bg-gradient-to-r from-isaca-dark via-isaca-medium to-isaca-teal text-white",
          "hover:scale-[1.03] active:scale-95 transition",
          open && "invisible pointer-events-none"
        )}
        aria-label="Open Finova"
      >
        <span className="rounded-full bg-white/15 p-1">
          <Logo size={32} />
        </span>
        <span className="text-sm font-semibold tracking-wide">AI</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[60] w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] flex flex-col rounded-2xl border border-isaca-light bg-white shadow-2xl shadow-isaca-dark/20 overflow-hidden">
          <header className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-isaca-dark via-isaca-medium to-isaca-teal text-white">
            <Logo size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Finova</p>
              <p className="text-[10px] text-white/80">Assistant · always on this page</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-isaca-light/40">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-isaca-medium text-white rounded-br-md"
                    : "bg-white border border-slate-100 text-slate-800 rounded-bl-md shadow-sm"
                )}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <p className="text-xs text-isaca-medium animate-pulse">Thinking…</p>
            )}
            <div ref={endRef} />
          </div>

          {msgs.length < 3 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-isaca-light/40">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-[11px] rounded-full border border-isaca-teal/40 bg-white px-2.5 py-1 text-isaca-dark hover:bg-isaca-teal/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-slate-100 p-2.5 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Finova…"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-isaca-blue/40 focus:border-isaca-blue"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-isaca-medium p-2.5 text-white hover:bg-isaca-dark disabled:opacity-50"
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
