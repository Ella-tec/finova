"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is Finova?",
        a: "Finova is a complete platform that combines Accounting ERP, Financial Statement generation, full Audit Workspace, Tax modules, Document Management (SharePoint-style), Client Collaboration, and an AI Copilot  all in one secure system designed for CPA firms, accountants, auditors, controllers, and CFOs.",
      },
      {
        q: "Who is Finova built for?",
        a: "It is built exclusively for accounting and audit professionals and their clients. We focus on one company vision: serving the complete accounting lifecycle without diluting the product with unrelated features.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. You can start with a free trial to explore the Client Portal, Document Management, Financial Statements, and AI Assistant before committing.",
      },
    ],
  },
  {
    category: "Security & Compliance",
    questions: [
      {
        q: "How secure is Finova?",
        a: "We use Zero Trust architecture, mandatory MFA, AES-256 encryption at rest, TLS 1.3 in transit, immutable audit logs, least-privilege access, and human-in-the-loop for all AI actions. The platform is designed for SOC 2 Type II and ISO 27001 readiness from day one.",
      },
      {
        q: "Can AI post journal entries by itself?",
        a: "No. AI can only propose entries, accruals, statements, and workpapers. Every high-risk action requires explicit human approval. This is a core security design principle.",
      },
      {
        q: "Do you support Microsoft Entra ID / Azure AD?",
        a: "Yes. Microsoft Entra ID is the recommended authentication provider, with support for Conditional Access, passwordless login, and biometrics.",
      },
    ],
  },
  {
    category: "Features & Workflows",
    questions: [
      {
        q: "Does it handle full month-end and year-end close?",
        a: "Yes. There are guided checklists for daily, weekly, month-end, quarter-end, and year-end processes, with AI agents that help with accruals, matching, flux analysis, and exception review.",
      },
      {
        q: "Can clients upload documents easily?",
        a: "Yes. The Client Portal is mobile-first. Clients can upload with one tap (including camera + OCR), respond to PBC requests, approve items, and sign documents with almost zero friction.",
      },
      {
        q: "Is there a full Audit module?",
        a: "Yes. It includes engagement planning, risk assessment, materiality, workpapers, sampling, testing, findings, and audit reports, plus a complete PBC request system.",
      },
    ],
  },
  {
    category: "AI Assistant",
    questions: [
      {
        q: "What can I ask the AI?",
        a: "Examples: Prepare March close, Build cash flow statement, Analyze revenue, Create audit program for inventory, Detect risks in payroll. The AI creates tasks, drafts, and workpapers that you then review and approve.",
      },
      {
        q: "Is my data used to train public AI models?",
        a: "No. We use private Azure OpenAI deployments. Your data stays isolated and is never used to train public models.",
      },
    ],
  },
  {
    category: "Getting Started",
    questions: [
      {
        q: "How long does it take to go live?",
        a: "Most firms can start with Client Portal + Document Management + Statements in days. Full accounting and audit modules roll out in phases so you can adopt at your own pace.",
      },
      {
        q: "Where can I learn the system?",
        a: "Visit the Learning Center for short practical courses, or open the in-app AI Assistant and ask questions anytime.",
      },
    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-slate-900 pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-400 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-4 text-slate-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-isaca-medium flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              Finova <span className="text-isaca-medium">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/learning"
              className="text-sm font-medium text-slate-600 hover:text-isaca-medium"
            >
              Learning
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-isaca-medium flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-8 w-8 text-isaca-medium" />
          <h1 className="text-3xl font-bold text-slate-900">
            Questions & Answers
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Common questions about Finova, security, features, and getting
          started.
        </p>

        <div className="mt-12 space-y-10">
          {faqs.map((group) => (
            <div key={group.category}>
              <h2 className="text-sm font-semibold text-isaca-medium uppercase tracking-wider mb-3">
                {group.category}
              </h2>
              <div className="rounded-2xl border bg-white px-6 shadow-sm">
                {group.questions.map((item) => (
                  <FaqItem
                    key={item.q}
                    question={item.q}
                    answer={item.a}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-isaca-light border border-isaca-light p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Still have questions?
          </h2>
          <p className="mt-2 text-slate-600">
            Contact our team or try the in-app AI Assistant after you sign in.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-6 py-2.5 text-sm font-semibold text-white hover:bg-isaca-dark transition"
          >
            Sign in to Ask AI
          </Link>
        </div>
      </main>
    </div>
  );
}