import Link from "next/link";
import {
  ClipboardList,
  FileSearch,
  ArrowRight,
  AlertTriangle,
  Users,
  Library,
} from "lucide-react";

const cards = [
  {
    href: "/dashboard/audit/pbc",
    title: "PBC Requests",
    description: "Create and track prepared-by-client document requests.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/audit/workpapers",
    title: "Workpapers",
    description: "Lead schedules, procedures, prepare / review / sign-off.",
    icon: FileSearch,
  },
  {
    href: "/dashboard/samples",
    title: "Sample Library",
    description: "Training TB, aging, confirmations, and engagement packs.",
    icon: Library,
  },
  {
    href: "/dashboard/ar",
    title: "AR Aging (demo)",
    description: "Customer invoices and aging buckets for testing.",
    icon: Users,
  },
  {
    href: "/dashboard/clients",
    title: "Clients",
    description: "Engagements and portal workspaces.",
    icon: Users,
  },
  {
    href: "/dashboard/security",
    title: "File Sanitizer",
    description: "Scan evidence before AI or permanent storage.",
    icon: AlertTriangle,
  },
];

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Workspace</h1>
        <p className="mt-1 text-slate-600">
          Planning, PBC, workpapers, findings, and supporting tools
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href + c.title}
            href={c.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <c.icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-emerald-800">
              {c.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{c.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
