import Link from "next/link";
import {
  FileText,
  BarChart3,
  ArrowRight,
  Scale,
  TrendingUp,
  Wallet,
  Table2,
  Download,
  BookOpen,
  LineChart,
  Landmark,
} from "lucide-react";

const processSteps = [
  {
    step: "1",
    title: "Trial Balance",
    href: "/dashboard/reporting/statements?tab=trial-balance",
    icon: Table2,
    detail: "Import & validate",
  },
  {
    step: "2",
    title: "Journal Entries",
    href: "/dashboard/reporting/statements?tab=journal",
    icon: BookOpen,
    detail: "Adjustments & posts",
  },
  {
    step: "3",
    title: "Income Statement",
    href: "/dashboard/reporting/statements?tab=income",
    icon: TrendingUp,
    detail: "P&L generate",
  },
  {
    step: "4",
    title: "Balance Sheet",
    href: "/dashboard/reporting/statements?tab=balance",
    icon: Landmark,
    detail: "Position view",
  },
  {
    step: "5",
    title: "Cash Flow",
    href: "/dashboard/reporting/statements?tab=cashflow",
    icon: LineChart,
    detail: "Operating / investing",
  },
];

const links = [
  {
    href: "/dashboard/reporting/statements",
    title: "Financial Statements Workspace",
    description:
      "Import trial balance and generate Balance Sheet, Income Statement, Cash Flow, and notes.",
    icon: FileText,
    badge: "Core",
  },
  {
    href: "/dashboard/samples",
    title: "Sample companies & packs",
    description:
      "18 demo companies with TB, JEs, invoices, bank statements, and statement packs.",
    icon: Download,
    badge: "Library",
  },
  {
    href: "/dashboard/market",
    title: "Market & FX Context",
    description: "FX rates and benchmarks for fair value and consolidation context.",
    icon: BarChart3,
    badge: "Live",
  },
  {
    href: "/dashboard/consolidation",
    title: "Consolidation",
    description: "Multi-entity roll-up, eliminations, and ownership.",
    icon: Scale,
    badge: "Entities",
  },
  {
    href: "/dashboard/close",
    title: "Month-End Close",
    description: "Checklist, approvals, and period lock before final reports.",
    icon: Wallet,
    badge: "Workflow",
  },
  {
    href: "/dashboard/operations",
    title: "Accounting hub",
    description: "Chart of accounts, journals, and ledger operations.",
    icon: BookOpen,
    badge: "Books",
  },
];

export default function ReportingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">
          Financial reporting
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#1d2d5c]">Statements & close package</h1>
        <p className="mt-1 text-slate-600">
          Full process: Trial Balance → Journal Entries → Income Statement → Balance Sheet → Cash
          Flow
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-5">
        {processSteps.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00a4e4]/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f0f5] text-xs font-bold text-[#07649d]">
                {s.step}
              </span>
              <s.icon className="h-4 w-4 text-[#36ac91]" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1d2d5c] group-hover:text-[#07649d]">
              {s.title}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{s.detail}</p>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/reporting/statements"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162447]"
        >
          Open statements workspace <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard/samples"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#07649d] hover:bg-[#e7f0f5]"
        >
          Browse sample packs
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.title + item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#00a4e4]/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f0f5] text-[#07649d]">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {item.badge}
              </span>
            </div>
            <h2 className="mt-3 font-semibold text-[#1d2d5c] group-hover:text-[#07649d]">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#07649d]">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
