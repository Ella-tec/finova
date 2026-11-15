"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Upload, Clock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Pbc = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: string | null;
  status: string;
};

export default function PortalRequestsPage() {
  const [requests, setRequests] = useState<Pbc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The server resolves the signed-in client's scope; no client ID is supplied by the browser.
      const response = await fetch("/api/pbc", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load your document requests.");
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your document requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const markUploaded = async (id: string) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/pbc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "UPLOADED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update this request.");
      setNotice("Your request status was updated. The firm can now review the submitted evidence.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Client workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Document Requests</h1>
        <p className="mt-2 text-sm text-slate-600">Review the evidence your accounting firm has requested and track each response.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Upload requested files in <Link href="/portal/documents" className="font-semibold underline underline-offset-2">My Documents</Link> first. Then confirm the request is ready for firm review.
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading your requests…</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <ClipboardList className="mx-auto mb-2 h-10 w-10 text-slate-300" />
            <h2 className="font-semibold text-slate-800">No open requests</h2>
            <p className="mt-1 text-sm">Your firm has not requested additional documents.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <article key={request.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{request.title}</h2>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", request.priority === "HIGH" ? "bg-red-100 text-red-700" : request.priority === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>{request.priority}</span>
                  </div>
                  {request.description && <p className="mt-1 text-sm leading-6 text-slate-600">{request.description}</p>}
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />Due: {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : "No due date"} · Status: {request.status.replaceAll("_", " ")}</p>
                </div>
                {request.status === "REQUESTED" && (
                  <button type="button" onClick={() => void markUploaded(request.id)} disabled={busyId === request.id} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                    {busyId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Confirm uploaded
                  </button>
                )}
                {request.status === "IN_REVIEW" && <span className="inline-flex items-center gap-2 text-sm font-medium text-sky-700"><Clock className="h-4 w-4" />In review by your firm</span>}
                {request.status === "ACCEPTED" && <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />Accepted</span>}
                {request.status === "REJECTED" && <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-700"><AlertCircle className="h-4 w-4" />Returned — contact your firm</span>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
