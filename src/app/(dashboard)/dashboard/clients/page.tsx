"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Building2, ArrowRight } from "lucide-react";

type Client = { id: string; name: string; code?: string | null };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: "demo-client-001", name: "Acme Corporation", code: "ACME" },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-600 mt-1">Client engagements and portal access</p>
      </div>
      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="flex items-center gap-4 p-5 hover:bg-slate-50 transition"
          >
            <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center">
              <Building2 className="h-5 w-5 text-isaca-medium" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{c.name}</p>
              <p className="text-sm text-slate-500">{c.code || c.id}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        Client users sign in at{" "}
        <Link href="/portal" className="text-isaca-medium font-medium hover:underline">
          /portal
        </Link>
      </p>
    </div>
  );
}
