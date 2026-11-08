"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, ArrowRight, Users } from "lucide-react";

type Client = { id: string; name: string; legalName?: string | null };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/clients")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load clients.");
        return data;
      })
      .then((data) => {
        if (active) setClients(data.clients || []);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load clients.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f4ee] text-[#087f68]"><Users className="h-5 w-5" /></span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#172b3a]">Clients</h1>
          <p className="mt-1 text-sm text-[#71817e]">Client engagements and portal workspaces in your authorized firm.</p>
        </div>
      </header>
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}
      <section className="overflow-hidden rounded-2xl border border-[#e4ebe6] bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading authorized clients…</div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto h-9 w-9 text-slate-300" />
            <h2 className="mt-3 font-semibold text-slate-800">No clients found</h2>
            <p className="mt-1 text-sm text-slate-500">Clients assigned to your workspace will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#edf1ee]">
            {clients.map((client) => (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="flex items-center gap-4 p-5 transition hover:bg-[#f8fbf9]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f4ee] text-[#087f68]"><Building2 className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[#263e4a]">{client.name}</span>
                  <span className="block truncate text-sm text-[#87958f]">{client.legalName || "Client workspace"}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#91a09b]" />
              </Link>
            ))}
          </div>
        )}
      </section>
      <p className="text-sm text-slate-500">Client users sign in through the <Link href="/portal" className="font-medium text-[#087f68] hover:underline">Client Portal</Link>.</p>
    </div>
  );
}
