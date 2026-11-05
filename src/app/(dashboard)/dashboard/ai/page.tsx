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

    // Simulated AI response (replace with real Azure OpenAI call later)
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedReply(text),
      };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="h-7 w-7 text-isaca-medium" />
          AI Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Propose only " Human approval required for all posting actions
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
              Thinking&
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
          placeholder="Ask anything& e.g. Prepare March close"
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

function getSimulatedReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("close") || lower.includes("march")) {
    return [
      "I have prepared a March close checklist for you:",
      "",
      "1. Bank Reconciliation",
      "2. AR Aging & Bad Debt Review",
      "3. AP Accruals",
      "4. Fixed Asset Depreciation",
      "5. Inventory Count & Adjustments",
      "6. Journal Entries (Accruals, Prepaids, Reclasses)",
      "7. Trial Balance Validation",
      "8. Controller Approval",
      "",
      "Would you like me to create the tasks in your Close module? (You will still need to approve each step.)",
    ].join("\n");
  }
  if (lower.includes("cash flow") || lower.includes("statement")) {
    return [
      "I can generate a Cash Flow Statement from the latest Trial Balance and adjustments.",
      "",
      "Please confirm the period (e.g. October 2026) and whether you want the direct or indirect method. Once generated, you can review, edit notes, and approve before finalizing.",
    ].join("\n");
  }
  if (lower.includes("audit") || lower.includes("inventory")) {
    return [
      "I have drafted an Audit Program for Inventory:",
      "",
      "- Risk Assessment (Valuation & Existence)",
      "- Materiality calculation",
      "- Sampling plan (statistical)",
      "- Test of details - existence",
      "- Test of details - valuation",
      "- Cut-off testing",
      "- Lead schedule + workpapers",
      "",
      "Shall I create the engagement workpapers so the audit team can begin?",
    ].join("\n");
  }
  if (lower.includes("revenue") || lower.includes("analyze")) {
    return [
      "Here is a quick revenue analysis based on available data:",
      "",
      "- MoM change: +4.2%",
      "- YoY change: +12.8%",
      "- Top variance drivers: Product line A (+18%), Service revenue (-3%)",
      "",
      "I can generate a full variance dashboard and draft management commentary. Would you like me to proceed?",
    ].join("\n");
  }
  return [
    "I understand your request. In the full version I will connect to your live general ledger, documents, and close data to give precise answers and create real tasks or drafts for your approval.",
    "",
    "For now this is a simulated response. Tell me more details or try one of the suggested prompts.",
  ].join("\n");
}