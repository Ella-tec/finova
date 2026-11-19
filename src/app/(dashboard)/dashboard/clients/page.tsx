"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  ArrowRight,
  Users,
  Phone,
  Video,
  Mail,
  FileText,
  ClipboardList,
  Shield,
  MessageSquare,
} from "lucide-react";

type Client = { id: string; name: string; legalName?: string | null };

const quickActions = [
  {
    href: "/dashboard/clients/contact-center",
    title: "Contact Center",
    text: "Video, voice, email, SMS, attachments, and recording",
    icon: Phone,
    color: "bg-[#1d2d5c] text-white",
  },
  {
    href: "/portal",
    title: "Client portal",
    text: "Client-facing folders, uploads, and requests",
    icon: Users,
    color: "bg-[#e7f0f5] text-[#07649d]",
  },
  {
    href: "/dashboard/documents",
    title: "Documents",
    text: "Upload, review, and download client files",
    icon: FileText,
    color: "bg-[#e7f0f5] text-[#07649d]",
  },
  {
    href: "/dashboard/audit/pbc",
    title: "PBC requests",
    text: "Request evidence and track client responses",
    icon: ClipboardList,
    color: "bg-[#e7f0f5] text-[#07649d]",
  },
  {
    href: "/dashboard/security",
    title: "File Sanitizer",
    text: "Scan files before AI or external sharing",
    icon: Shield,
    color: "bg-[#e7f0f5] text-[#07649d]",
  },
  {
    href: "/dashboard/clients/contact-center",
    title: "Message clients",
    text: "Email and SMS threads with attach & view",
    icon: MessageSquare,
    color: "bg-[#e7f0f5] text-[#07649d]",
  },
];

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
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f0f5] text-[#07649d]">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1d2d5c]">Clients</h1>
            <p className="mt-1 text-sm text-slate-600">
              Engagements, portal workspaces, and the firm Contact Center.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/clients/contact-center"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162447]"
        >
          <Video className="h-4 w-4" />
          Open Contact Center
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.color}`}>
              <a.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-semibold text-[#1d2d5c]">{a.title}</p>
            <p className="mt-1 text-sm text-slate-500">{a.text}</p>
          </Link>
        ))}
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-[#1d2d5c]">Client list</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading authorized clients…</div>
        ) : clients.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="mx-auto h-9 w-9 text-slate-300" />
            <h2 className="mt-3 font-semibold text-slate-800">No clients found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Run the demo seed to load sample companies, or add clients in Administration.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clients.map((client) => (
              <div key={client.id} className="flex flex-wrap items-center gap-3 p-4 hover:bg-[#f8fbfd]">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f0f5] text-[#07649d]">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[#1d2d5c]">{client.name}</span>
                    <span className="block truncate text-sm text-slate-500">
                      {client.legalName || "Client workspace"}
                    </span>
                  </span>
                </Link>
                <Link
                  href="/dashboard/clients/contact-center"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                >
                  <Mail className="h-3.5 w-3.5" /> Contact
                </Link>
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#07649d]"
                >
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
