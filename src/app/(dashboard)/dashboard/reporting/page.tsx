import Link from "next/link";
import { FileText, BarChart3, ArrowRight, BookOpen, Building2, ClipboardCheck } from "lucide-react";

const workspaces = [
  {
    href: "/dashboard/reporting/statements",
    title: "Financial Statements",
    description: "Import and validate a trial balance, then prepare the Balance Sheet, Income Statement, Cash Flow, and related ratios.",
    icon: FileText,
  },
  {
    href: "/dashboard/operations#accounting",
    title: "Accounting Records",
    description: "Open the current company, account, journal, and general-ledger draft capture workspace.",
    icon: BookOpen,
  },
  {
    href: "/dashboard/consolidation",
    title: "Consolidation",
    description: "Review entity balances, ownership, eliminations, and consolidated reporting outputs.",
    icon: Building2,
  },
  {
    href: "/dashboard/close",
    title: "Close Readiness",
    description: "Review close task completion and outstanding items before preparing period reports.",
    icon: ClipboardCheck,
  },
  {
    href: "/dashboard/market",
    title: "Market & Finance Context",
    description: "Open Market Pulse for FX rates, market benchmarks, and accounting context.",
    icon: BarChart3,
  },
];

export default function ReportingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Accounting & finance</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Financial Reporting</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Move from accounting records and validated trial balances to entity, consolidated, and management reporting.
        </p>
      </header>

      <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Report values must be reviewed against the selected entity, period, currency, and source trial balance. Imported or sample balances are not automatically verified accounting records.
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((item) => (
          <Link key={item.href} href={item.href} className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-isaca-medium/40 hover:shadow-md">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-isaca-light text-isaca-medium">
              <item.icon className="h-5 w-5" />
            </span>
            <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-isaca-medium">
              Open workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
