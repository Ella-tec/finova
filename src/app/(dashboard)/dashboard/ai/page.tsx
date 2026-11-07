"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Prepare March close checklist",
  "Generate cash flow statement",
  "Analyze revenue trends",
  "Create audit program for inventory",
  "Show unpaid invoices over 60 days",
  "Detect risks in payroll",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! Im your Finova Assistant. I can help with close tasks, financial statements, audit workpapers, risk detection, and more. Everything I propose will require your approval before posting. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant could not respond.");
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || "I could not find a response." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: error instanceof Error ? error.message : "The assistant is temporarily unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="h-7 w-7 text-isaca-medium" />
          AI Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Guided help for Finova workflows · Review outputs before use
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border bg-white p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-isaca-light flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-isaca-medium" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-isaca-medium text-white"
                  : "bg-slate-100 text-slate-800"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-isaca-light flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-isaca-medium animate-pulse" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-500">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-fin-300 hover:bg-isaca-light transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a Finova workflow…"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-isaca-blue focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-isaca-medium px-4 py-3 text-white hover:bg-isaca-dark disabled:opacity-50 transition"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

