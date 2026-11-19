import Link from "next/link";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

const PATHS = [
  {
    title: "Where files come from",
    items: [
      "Client uploads in Portal → Documents / Requests",
      "Staff uploads in Documents inbox",
      "Sample Library (practice packs by company)",
      "Bank feeds / CSV for Bank Rec",
      "Email attachments cleaned in File Sanitizer",
    ],
  },
  {
    title: "Recording path (from scratch)",
    items: [
      "1. Create / select company (Entities or Samples)",
      "2. Chart of Accounts / Accounting hub",
      "3. Journal entries & source documents",
      "4. Post to General Ledger",
      "5. Bank Rec match & lock",
      "6. AR invoices & collections",
    ],
  },
  {
    title: "Reporting path (generate)",
    items: [
      "Trial Balance (upload or from books)",
      "Adjusting Journal Entries",
      "Income Statement (P&L)",
      "Balance Sheet",
      "Cash Flow",
      "Each step: Upload · Review · Download",
    ],
  },
  {
    title: "Close & audit path",
    items: [
      "Month-End Close checklist & approvals",
      "Consolidation (if multi-entity)",
      "PBC requests to client",
      "Client uploads evidence",
      "Workpapers · findings · reports",
    ],
  },
];

export default function PublicGuidePage() {
  return (
    <main className="min-h-screen bg-[#0c1222] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <LogoWordmark light />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8d5a3]">
              <BookOpen className="h-3.5 w-3.5" /> App Guide
            </span>
          </div>
          <Link href="/#sign-in" className="text-sm text-white/70 hover:text-[#e8d5a3]">
            Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-white sm:text-4xl">How to use Finova</h1>
          <p className="mt-3 max-w-2xl text-white/55">
            Wireframe paths from first file to finished statements, close, and audit — for staff,
            clients, and presenters.
          </p>
        </div>

        {/* Simple wireframe flow */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e8d5a3]">
            Master wireframe
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {[
              "Files",
              "Sanitize",
              "Record",
              "Reconcile",
              "TB",
              "JE",
              "P&L",
              "BS",
              "CF",
              "Close",
              "PBC",
              "Report",
            ].map((label, i, arr) => (
              <span key={label} className="flex items-center gap-2">
                <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-medium">
                  {label}
                </span>
                {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-white/30" />}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {PATHS.map((block) => (
            <article
              key={block.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="font-semibold text-[#e8d5a3]">{block.title}</h3>
              <ol className="mt-3 space-y-2 text-sm text-white/70">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8d5a3]" />
                    {item}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 p-5">
          <h2 className="font-semibold text-white">After you sign in</h2>
          <p className="mt-2 text-sm text-white/55">
            Open the full interactive guide with live links to every page:
          </p>
          <p className="mt-2 font-mono text-sm text-[#e8d5a3]">/dashboard/guide</p>
          <Link
            href="/#sign-in"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c4a35a] to-[#e8d5a3] px-4 py-2.5 text-sm font-semibold text-[#0c1222]"
          >
            Sign in to continue <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
