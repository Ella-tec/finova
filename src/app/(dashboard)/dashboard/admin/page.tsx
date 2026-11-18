"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  KeyRound,
  ScrollText,
  Settings,
  Shield,
  Users,
  GraduationCap,
  Bot,
  BookOpen,
} from "lucide-react";

const summaryCards = [
  { label: "Workspace", value: "Finova", detail: "Enterprise accounting and assurance workspace", icon: CheckCircle2, href: "/dashboard" },
  { label: "Access management", value: "User roles", detail: "Review team permissions and invitations", icon: Users, href: "/dashboard/admin/users" },
  { label: "Security", value: "Controls", detail: "Review document scanning and security activity", icon: Shield, href: "/dashboard/security" },
];

const adminLinks = [
  { href: "/dashboard/admin/users", title: "Users & Access", description: "Invite team members and review assigned roles.", icon: Users },
  { href: "/dashboard/operations#accounting", title: "Company Setup", description: "Open company, fiscal, currency, and accounting setup workflows.", icon: Building2 },
  { href: "/dashboard/entities", title: "Entities & Firm Structure", description: "Manage legal entities, ownership, and reporting currency.", icon: BookOpen },
  { href: "/dashboard/clients", title: "Client Management", description: "Review authorized clients and open their workspaces.", icon: FileText },
  { href: "/dashboard/audit", title: "Audit Controls", description: "Review PBC requests, workpapers, and engagement activity.", icon: ScrollText },
  { href: "/dashboard/ai", title: "AI Assistant Workspace", description: "Use the Finova assistant for research and draft analysis.", icon: Bot },
  { href: "/dashboard/documents", title: "Document Workspace", description: "Open the document repository and uploaded evidence.", icon: Database },
  { href: "/dashboard/learning", title: "Learning Center", description: "Open courses, accounting videos, and team enablement resources.", icon: GraduationCap },
  { href: "/dashboard/security", title: "Security & File Sanitizer", description: "Review file checks and scan results before AI processing.", icon: Shield },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-isaca-medium">Firm controls</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Settings className="h-7 w-7 text-isaca-medium" />
            Administration
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage the Finova workspace, people, access, company structure, documents, and operational controls.
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
          <h2 className="text-lg font-semibold text-slate-900">Administration workspaces</h2>
          <p className="text-sm text-slate-500">Open a connected Finova module. Access is still enforced by the destination API.</p>
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
              <li>• Use versioned Prisma migrations for production changes</li>
              <li>• Configure email and identity providers as needed</li>
              <li>• Review role and client scope before inviting production users</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
