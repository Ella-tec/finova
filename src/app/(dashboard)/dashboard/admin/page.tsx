"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  KeyRound,
  Palette,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";

const summaryCards = [
  { label: "Workspace", value: "Active", detail: "Core modules available", icon: CheckCircle2, href: "/dashboard" },
  { label: "Access management", value: "User roles", detail: "Review team permissions", icon: Users, href: "/dashboard/admin/users" },
  { label: "Security", value: "Controls", detail: "Sanitizer and audit access", icon: Shield, href: "/dashboard/security" },
];

const adminLinks = [
  { href: "/dashboard/admin/users", title: "Users & Invites", description: "Invite team members, assign roles, and manage access.", icon: Users },
  { href: "/dashboard/security", title: "Security & File Sanitizer", description: "Review file scans, privacy controls, and risk checks.", icon: Shield },
  { href: "/dashboard/entities", title: "Entities & Firm Structure", description: "Manage legal entities, ownership, and reporting currency.", icon: Building2 },
  { href: "/dashboard/clients", title: "Client Management", description: "Manage engagements and client portal access.", icon: FileText },
  { href: "/dashboard/audit", title: "Audit Controls", description: "Review PBC requests, workpapers, and findings.", icon: ScrollText },
  { href: "/dashboard/ai", title: "AI & Assistant Settings", description: "Review assistant settings and approval workflows.", icon: KeyRound },
  { href: "/dashboard/documents", title: "Document Workspace", description: "Open the document repository and uploaded files.", icon: Database },
  { href: "/learning", title: "Learning Center", description: "Open courses, lessons, and team enablement resources.", icon: Bell },
  { href: "/dashboard/settings", title: "Brand & Workspace", description: "Manage workspace preferences and appearance.", icon: Palette },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-isaca-medium">Workspace controls</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Settings className="h-7 w-7 text-isaca-medium" />
            Administration
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your FinSphere AI workspace, people, security, and operational settings from one place.
          </p>
        </div>
        <Link href="/dashboard/admin/users" className="inline-flex items-center justify-center gap-2 rounded-xl bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">
          <Users className="h-4 w-4" /> Manage users
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-isaca-medium/40 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-isaca-light p-2 text-isaca-medium"><item.icon className="h-5 w-5" /></span>
              <div><p className="text-sm text-slate-500">{item.label}</p><p className="font-semibold text-slate-900">{item.value}</p></div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{item.detail}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Administration modules</h2>
          <p className="text-sm text-slate-500">Select a module to open its workspace.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-36 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-isaca-medium/50 hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-isaca-light text-isaca-medium transition group-hover:bg-isaca-medium group-hover:text-white">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                  {item.title}<ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-isaca-medium" />
                </span>
                <span className="mt-1.5 block text-sm leading-6 text-slate-500">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-isaca-light p-2 text-isaca-medium"><KeyRound className="h-5 w-5" /></span>
          <div>
            <h2 className="font-semibold text-slate-900">Environment & setup guidance</h2>
            <p className="mt-1 text-sm text-slate-600">Keep secrets in environment variables and never commit credentials to source control.</p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li>• Configure NEXTAUTH_SECRET and DATABASE_URL</li>
              <li>• Run database migrations and seed data</li>
              <li>• Configure email and identity providers as needed</li>
              <li>• Review access roles before inviting production users</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
