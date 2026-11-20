"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FolderOpen, ClipboardList, ArrowRight } from "lucide-react";

export default function PortalHomePage() {
  const { data: session } = useSession();
  const name = (session?.user as { name?: string } | undefined)?.name || "Client";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome, {name}</h1>
        <p className="mt-1 text-slate-600">Upload files and complete requests from your firm.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal/documents"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <FolderOpen className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-800">My Documents</h2>
          <p className="mt-1 text-sm text-slate-600">Upload statements, invoices, and reports.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
            Open folders <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/portal/requests"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 group-hover:text-teal-800">Requests</h2>
          <p className="mt-1 text-sm text-slate-600">See what the firm asked for and mark complete.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
            View requests <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
