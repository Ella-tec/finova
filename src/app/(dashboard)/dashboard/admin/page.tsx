"use client";

import Link from "next/link";
import {
  Users, Building2, Shield, Settings, FileText, KeyRound, Bell,
  Database, Palette, CheckCircle2, ArrowRight,
} from "lucide-react";

const cards = [
  { title: "Users & Invites", desc: "Invite staff, assign roles, and manage access.", href: "/dashboard/admin/users", icon: Users },
  { title: "Entities", desc: "Manage legal entities, ownership, and currencies.", href: "/dashboard/entities", icon: Building2 },
  { title: "File Sanitizer", desc: "Review the security gate before document analysis.", href: "/dashboard/security", icon: Shield },
  { title: "Documents", desc: "Browse firm documents and organized folders.", href: "/dashboard/documents", icon: FileText },
  { title: "Roles & Security", desc: "Review user roles and access controls.", href: "/dashboard/security", icon: KeyRound },
  { title: "Notifications", desc: "Review client requests and workflow notifications.", href: "/dashboard/audit/pbc", icon: Bell },
  { title: "Sample Library", desc: "Open templates and sample accounting documents.", href: "/dashboard/samples", icon: Database },
  { title: "Brand & Workspace", desc: "Return to the Finova workspace and preferences.", href: "/dashboard", icon: Palette },
];

const summaries = [
  { label: "Workspace", value: "Finova", detail: "Accounting and audit workspace", icon: CheckCircle2, href: "/dashboard" },
  { label: "Access management", value: "User roles", detail: "Review team permissions", icon: Users, href: "/dashboard/admin/users" },
  { label: "Security", value: "Controls", detail: "Open sanitizer and security tools", icon: Shield, href: "/dashboard/security" },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-isaca-medium">Workspace controls</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Settings className="h-7 w-7 text-isaca-medium" /> Administration
        </h1>
        <p className="mt-1 text-sm text-slate-500">Manage your Finova workspace, users, security, and shared resources.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {summaries.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-xl border bg-white p-4 shadow-sm hover:border-isaca-medium/40 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-isaca-light p-2 text-isaca-medium"><item.icon className="h-5 w-5" /></span>
              <div><p className="text-xs text-slate-500">{item.label}</p><p className="font-semibold text-slate-900">{item.value}</p></div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{item.detail}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-isaca-medium/40 hover:shadow-md">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-isaca-light text-isaca-medium"><card.icon className="h-5 w-5" /></span>
            <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">{card.title}</h2>
            <p className="mt-1 min-h-10 text-sm text-slate-500">{card.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-isaca-medium">Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
