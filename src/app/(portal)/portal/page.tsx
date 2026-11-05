"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FolderOpen, ClipboardList, Upload, ArrowRight } from "lucide-react";

export default function PortalHomePage() {
  const { data: session } = useSession();
  const name = (session?.user as any)?.name || "Client";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {name}</h1>
        <p className="text-slate-600 mt-1">
          Upload documents and respond to requests from your accounting firm.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/portal/documents"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition group"
        >
          <div className="h-12 w-12 rounded-xl bg-isaca-light flex items-center justify-center mb-4">
            <FolderOpen className="h-6 w-6 text-isaca-medium" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 group-hover:text-isaca-medium">
            My Documents
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload bank statements, invoices, payroll reports and other files your firm needs.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">
            Open folders <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/portal/requests"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition group"
        >
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 group-hover:text-isaca-medium">
            Document Requests
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            See what your firm has asked for and mark items as uploaded.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">
            View requests <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-isaca-light bg-isaca-light p-6 flex items-start gap-4">
        <Upload className="h-6 w-6 text-isaca-medium shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-fin-900">Quick tip</h3>
          <p className="text-sm text-isaca-dark mt-1">
            Prefer mobile? You can open this portal on your phone and use the camera to capture
            receipts and statements. Files are analyzed automatically after upload.
          </p>
        </div>
      </div>
    </div>
  );
}
