"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FolderOpen, ClipboardList, FileText, ArrowLeft, Building2 } from "lucide-react";

type Client = { id: string; name: string; legalName?: string | null };

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/clients")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load client.");
        return data;
      })
      .then((data) => {
        if (active) setClient((data.clients || []).find((item: Client) => item.id === clientId) || null);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load client.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [clientId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-[#087f68] hover:underline">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
      {loading ? (
        <p className="text-sm text-slate-500">Loading client workspace…</p>
      ) : !client ? (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <Building2 className="mx-auto h-9 w-9 text-slate-300" />
          <h1 className="mt-3 font-semibold text-slate-900">Client not found</h1>
          <p className="mt-1 text-sm text-slate-500">This client may not be assigned to your workspace.</p>
        </div>
      ) : (
        <>
          <header>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#087f68]">Client workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#172b3a]">{client.name}</h1>
            <p className="mt-1 text-sm text-[#71817e]">{client.legalName || "Engagement workspace"}</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/dashboard/documents" className="rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-sm transition hover:border-[#b9d9ca] hover:shadow-md">
              <FolderOpen className="mb-2 h-6 w-6 text-[#087f68]" /><p className="font-semibold text-[#263e4a]">Documents</p><p className="text-sm text-slate-500">View and preview authorized files</p>
            </Link>
            <Link href="/dashboard/audit/pbc" className="rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-sm transition hover:border-[#b9d9ca] hover:shadow-md">
              <ClipboardList className="mb-2 h-6 w-6 text-[#087f68]" /><p className="font-semibold text-[#263e4a]">PBC Requests</p><p className="text-sm text-slate-500">Review client requests</p>
            </Link>
            <Link href="/dashboard/reporting/statements" className="rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-sm transition hover:border-[#b9d9ca] hover:shadow-md">
              <FileText className="mb-2 h-6 w-6 text-[#087f68]" /><p className="font-semibold text-[#263e4a]">Statements</p><p className="text-sm text-slate-500">Trial balance and financial statements</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
