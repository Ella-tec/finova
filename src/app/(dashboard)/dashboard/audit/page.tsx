import Link from "next/link";
import { ClipboardList, FileSearch, ArrowRight } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Workspace</h1>
        <p className="text-slate-600 mt-1">Planning, PBC requests, workpapers and findings</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/audit/pbc"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition group"
        >
          <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center mb-4">
            <ClipboardList className="h-5 w-5 text-isaca-medium" />
          </div>
          <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">PBC Requests</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create and track prepared-by-client document requests with priorities and status.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          href="/dashboard/audit/workpapers"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition group"
        >
          <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center mb-4">
            <FileSearch className="h-5 w-5 text-isaca-medium" />
          </div>
          <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">Workpapers</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lead schedules, procedures, prepare / review / sign-off workflow.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
