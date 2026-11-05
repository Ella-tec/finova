"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users, Shield, Settings, Building2, FileText, KeyRound, ScrollText,
  ArrowRight, Bell, Database, Palette, CheckCircle2,
} from "lucide-react";

const links = [
  { href: "/dashboard/admin/users", title: "Users & Invites", desc: "Invite team members, assign roles, and manage access.", icon: Users },
  { href: "/dashboard/security", title: "Security & File Sanitizer", desc: "Review file scans, privacy controls, and risk checks.", icon: Shield },
  { href: "/dashboard/entities", title: "Entities & Firm Structure", desc: "Manage legal entities, ownership, and reporting currency.", icon: Building2 },
  { href: "/dashboard/clients", title: "Client Management", desc: "Manage engagements and client portal access.", icon: FileText },
  { href: "/dashboard/audit", title: "Audit Controls", desc: "Review PBC requests, workpapers, and findings.", icon: ScrollText },
  { href: "/dashboard/ai", title: "AI & Assistant Settings", desc: "Open the assistant and review human-approval workflows.", icon: KeyRound },
  { href: "/dashboard/documents", title: "Document Workspace", desc: "Open the document repository and review uploaded files.", icon: Database },
  { href: "/dashboard/learning", title: "Learning Center", desc: "Open courses, lessons, and team enablement resources.", icon: Bell },
];

export default function AdminPage() {
  const [notice, setNotice] = useState("");
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-isaca-medium">Workspace controls</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900"><Settings className="h-7 w-7 text-isaca-medium" />Administration</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Manage your FinSphere AI workspace, people, security, and operational settings from one place.</p>
        </div>
        <Link href="/dashboard/admin/users" className="inline-flex items-center justify-center gap-2 rounded-xl bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:brightness-110"><Users className="h-4 w-4" />Manage users</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Workspace", value: "Active", detail: "Open the main workspace", icon: CheckCircle2, href: "/dashboard" },
          { label: "Access management", value: "User roles", detail: "Review team permissions", icon: Users, href: "/dashboard/admin/users" },
          { label: "Security", value: "Controls", detail: "Open sanitizer and risk checks", icon: Shield, href: "/dashboard/security" },
          { label: "Appearance", value: "10 themes", detail: "Choose your workspace style", icon: Palette, href: "#appearance" },
        ].map((item) => (
          <Link key={item.label} href={item.href} onClick={item.href === "#appearance" ? (event) => { event.preventDefault(); document.querySelector<HTMLSelectElement>('select[aria-label="Choose FinSphere color theme"]')?.focus(); } : undefined} className="surface-hover group block rounded-2xl border bg-white p-5 shadow-sm hover:border-isaca-medium/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-isaca-medium">
            <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{item.label}</span><item.icon className="h-5 w-5 text-isaca-medium" /></div>
            <p className="mt-3 text-xl font-bold text-slate-900">{item.value}</p><p className="mt-1 text-sm text-slate-500">{item.detail}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-isaca-medium">Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Administration modules</h2><p className="text-sm text-slate-500">Select a module to open its working page.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="surface-hover group flex min-h-36 gap-4 rounded-2xl border bg-white p-5 shadow-sm hover:border-isaca-medium/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-isaca-light text-isaca-medium group-hover:bg-isaca-medium group-hover:text-white"><item.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><p className="flex items-center justify-between gap-2 font-semibold text-slate-900">{item.title}<ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-1 group-hover:text-isaca-medium" /></p><p className="mt-1.5 text-sm leading-6 text-slate-500">{item.desc}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-isaca-light p-2 text-isaca-medium"><KeyRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900">Environment & setup guidance</h2><p className="mt-1 text-sm text-slate-600">Use environment variables for secrets and database configuration. Never store credentials in source control.</p><ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><li>• Configure NEXTAUTH_SECRET and DATABASE_URL</li><li>• Run database migrations and seed data</li><li>• Configure email and identity providers as needed</li><li>• Review access roles before inviting production users</li></ul></div></div>
        <button type="button" onClick={() => setNotice("Setup checklist reviewed. Open the relevant module above to manage each setting.")} className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:border-isaca-medium hover:text-isaca-medium">Review setup checklist</button>
        {notice && <p role="status" className="mt-3 text-sm text-isaca-medium">{notice}</p>}
      </section>
    </div>
  );
}
