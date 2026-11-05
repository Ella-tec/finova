"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FolderOpen, ClipboardList, FileText, ArrowLeft } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-isaca-medium hover:underline">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Client workspace</h1>
        <p className="text-slate-600 mt-1 font-mono text-sm">{clientId}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/documents" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <FolderOpen className="h-6 w-6 text-isaca-medium mb-2" />
          <p className="font-semibold">Documents</p>
          <p className="text-sm text-slate-500">Files & analysis</p>
        </Link>
        <Link href="/dashboard/audit/pbc" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <ClipboardList className="h-6 w-6 text-isaca-medium mb-2" />
          <p className="font-semibold">PBC Requests</p>
          <p className="text-sm text-slate-500">Client requests</p>
        </Link>
        <Link href="/dashboard/reporting/statements" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <FileText className="h-6 w-6 text-isaca-medium mb-2" />
          <p className="font-semibold">Statements</p>
          <p className="text-sm text-slate-500">TB & financials</p>
        </Link>
      </div>
    </div>
  );
}
