import Link from "next/link";
import { ClipboardList, FileSearch, ArrowRight, FileText, ShieldCheck } from "lucide-react";

const workspaces = [
  {
    href: "/dashboard/audit/pbc",
    title: "PBC Requests",
    description: "Create evidence requests, select an authorized client, track review status, and send scoped client notifications.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/audit/workpapers",
    title: "Workpapers",
    description: "Prepare lead schedules and audit procedures, attach evidence, and use the available prepare/review/sign-off workflow.",
    icon: FileSearch,
  },
  {
    href: "/dashboard/documents",
    title: "Audit Evidence",
    description: "Open the shared document repository to preview, download, and analyze authorized supporting files.",
    icon: FileText,
  },
  {
    href: "/dashboard/security",
    title: "Evidence Security",
    description: "Review available file checks before using documents in AI-assisted workflows. This is not a replacement for enterprise antivirus.",
    icon: ShieldCheck,
  },
];

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Assurance delivery</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Audit Workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Coordinate client evidence, workpaper preparation, review, and document handling from connected workspaces.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspaces.map((item) => (
          <Link key={item.href} href={item.href} className="group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-isaca-medium/40 hover:shadow-md">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-isaca-light text-isaca-medium">
              <item.icon className="h-5 w-5" />
            </span>
            <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-isaca-medium">
              Open workspace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        <strong>Capability boundary:</strong> this repository currently provides PBC and workpaper workflows, not a complete engagement lifecycle. Engagement administration, formal risk assessment, sampling plans, findings management, and final audit-report issuance remain implementation work.
      </div>
    </div>
  );
}
