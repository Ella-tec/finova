"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";

const suggestions = [
  "Summarize what documents I still owe",
  "Explain a bank reconciliation in plain language",
  "What should I upload for month-end?",
  "Help me prepare for an audit document request",
];

export default function PortalAiPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello — I am your client AI assistant. I can help explain requests, document needs, and general accounting language. I will not post books or change firm records.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    const lower = t.toLowerCase();
    let reply =
      "Thanks for your question. Use Documents to upload files and Requests to track what your firm needs. Your engagement team reviews everything before it is accepted.";
    if (lower.includes("upload") || lower.includes("document")) {
      reply = "Go to Documents to upload PDFs, statements, or invoices. After upload, open Requests and confirm any matching request as uploaded.";
    } else if (lower.includes("audit") || lower.includes("pbc")) {
      reply = "Audit requests appear under Document Requests with due dates and priority. Upload the evidence, then mark the request confirmed.";
    } else if (lower.includes("tax")) {
      reply = "Tax uploads (W-2, 1099, estimates) should go in Documents. Label clearly and message your firm from Contact if something is missing.";
    }
    setTimeout(() => setMessages((m) => [...m, { role: "assistant", content: reply }]), 400);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">AI assistant</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Bot className="h-7 w-7 text-[#07649d]" /> Ask Finova
        </h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#e7f0f5]">
            {s}
          </button>
        ))}
      </div>

      <div className="min-h-[360px] space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {messages.map((m, i) => (
          <div key={i} className={"max-w-[90%] rounded-2xl px-4 py-3 text-sm " + (m.role === "user" ? "ml-auto bg-[#1d2d5c] text-white" : "bg-[#f4f7fb] text-slate-800")}>
            {m.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about uploads, requests, or next steps…"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-3 text-sm font-semibold text-white">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}
