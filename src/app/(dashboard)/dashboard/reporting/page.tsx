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
} from "lucide-react";

const links = [
  {
    href: "/dashboard/reporting/statements",
    title: "Financial Statements",
    description: "Import trial balance and generate Balance Sheet, P&L, Cash Flow and notes.",
    icon: FileText,
    badge: "Core",
  },
  {
    href: "/dashboard/reporting/statements",
    title: "Trial Balance",
    description: "Load, edit, and validate account balances before reporting.",
    icon: Table2,
    badge: "Import",
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
    href: "/dashboard/samples",
    title: "Sample statements",
    description: "Download training trial balances and statement packs.",
    icon: Download,
    badge: "Library",
  },
];

export default function ReportingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Reporting</h1>
        <p className="mt-1 text-slate-600">
          Trial balance, statements, consolidation context, and management reports
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Statements", value: "BS · P&L · CF", icon: TrendingUp },
          { label: "Workflow", value: "Import → Validate → Export", icon: Table2 },
          { label: "Security", value: "Role-based access", icon: Scale },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 text-emerald-700">
              <k.icon className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{k.label}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-800">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.title + item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {item.badge}
              </span>
            </div>
            <h2 className="mt-3 font-semibold text-slate-900 group-hover:text-emerald-800">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
