"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, Sparkles, ShieldCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

const suggestions = [
  "Explain the month-end close workflow",
  "What should I review in a bank reconciliation?",
  "How do I prepare an audit workpaper?",
  "Explain the financial statements",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant",
    content: "Welcome to Finova. I can guide you through accounting, reconciliation, financial reporting, month-end close, document security, and audit workflows. I will not post entries or approve work on your behalf.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (value: string) => {
    const prompt = value.trim();
    if (!prompt || loading) return;
    setMessages((items) => [...items, { id: crypto.randomUUID(), role: "user", content: prompt }]);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant could not respond.");
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", content: data.reply || "I couldn't prepare a response. Please try again." }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-5xl flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-isaca-medium">Finova intelligence</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><Bot className="h-7 w-7 text-isaca-medium" />AI Assistant</h1>
          <p className="mt-1 text-sm text-slate-500">Workflow guidance for accounting and audit teams.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><ShieldCheck className="h-4 w-4" /> Human review required</div>
      </header>

      <section aria-label="Conversation" className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Sparkles className="h-5 w-5" /></span>}
            <div className={cn("max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6", message.role === "user" ? "rounded-br-md bg-[#14324F] text-white" : "rounded-bl-md border border-slate-100 bg-slate-50 text-slate-800")}>{message.content}</div>
            {message.role === "user" && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><User className="h-5 w-5" /></span>}
          </div>
        ))}
        {loading && <div className="flex items-center gap-3 text-sm text-slate-500"><Sparkles className="h-5 w-5 animate-pulse text-emerald-700" />Preparing guidance…</div>}
        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => sendMessage(messages.filter(m => m.role === "user").at(-1)?.content || "")} className="inline-flex items-center gap-1 font-semibold"><RotateCcw className="h-4 w-4" />Retry</button></div>}
        <div ref={bottomRef} />
      </section>

      {messages.length === 1 && <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item} type="button" onClick={() => sendMessage(item)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50">{item}</button>)}</div>}

      <form onSubmit={(event) => { event.preventDefault(); void sendMessage(input); }} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <input aria-label="Ask Finova" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a finance or audit workflow…" disabled={loading} className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400" />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="flex items-center justify-center gap-2 rounded-xl bg-[#14324F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4564] disabled:opacity-50"><Send className="h-4 w-4" /><span className="hidden sm:inline">Send</span></button>
      </form>
      <p className="text-center text-xs text-slate-400">AI guidance can be incomplete. Verify calculations, source records, and professional conclusions before use.</p>
    </div>
  );
}
