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
  UserPlus,
  Pencil,
  Trash2,
  UserCog,
} from "lucide-react";

const accountActions = [
  {
    title: "Create account",
    description: "Invite a new firm user or client portal login with role and temporary password.",
    href: "/dashboard/admin/users?tab=create",
    icon: UserPlus,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    button: "Add account",
  },
  {
    title: "Edit account",
    description: "Change name, role, or reset password for verification and access control.",
    href: "/dashboard/admin/users",
    icon: Pencil,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
    button: "Open list",
  },
  {
    title: "Delete account",
    description: "Remove a user from the firm workspace. Cannot delete your own signed-in account.",
    href: "/dashboard/admin/users",
    icon: Trash2,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
    button: "Manage removals",
  },
];

const summaryCards = [
  {
    label: "Workspace",
    value: "Finova",
    detail: "Enterprise accounting and assurance workspace",
    icon: CheckCircle2,
    href: "/dashboard",
  },
  {
    label: "Accounts",
    value: "Create · Edit · Delete",
    detail: "Firm users, roles, and verification",
    icon: UserCog,
    href: "/dashboard/admin/users",
  },
  {
    label: "Security",
    value: "Controls",
    detail: "Document scanning and security activity",
    icon: Shield,
    href: "/dashboard/security",
  },
];

const adminLinks = [
  {
    href: "/dashboard/admin/users",
    title: "Accounts & Access",
    description: "Create, edit, and delete team members and client portal users.",
    icon: Users,
  },
  {
    href: "/dashboard/operations#accounting",
    title: "Company Setup",
    description: "Open company, fiscal, currency, and accounting setup workflows.",
    icon: Building2,
  },
  {
    href: "/dashboard/entities",
    title: "Entities & Firm Structure",
    description: "Manage legal entities, ownership, and reporting currency.",
    icon: BookOpen,
  },
  {
    href: "/dashboard/clients",
    title: "Client Management",
    description: "Review authorized clients and open their workspaces.",
    icon: FileText,
  },
  {
    href: "/dashboard/audit",
    title: "Audit Controls",
    description: "Review PBC requests, workpapers, and engagement activity.",
    icon: ScrollText,
  },
  {
    href: "/dashboard/ai",
    title: "AI Assistant Workspace",
    description: "Use the Finova assistant for research and draft analysis.",
    icon: Bot,
  },
  {
    href: "/dashboard/documents",
    title: "Document Workspace",
    description: "Open the document repository and uploaded evidence.",
    icon: Database,
  },
  {
    href: "/dashboard/learning",
    title: "Learning Center",
    description: "Open courses, accounting videos, and team enablement resources.",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/security",
    title: "Security & File Sanitizer",
    description: "Review file checks and scan results before AI processing.",
    icon: Shield,
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-700">Firm controls</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Settings className="h-7 w-7 text-teal-700" />
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage accounts, access, company structure, documents, and operational controls.
          </p>
        </div>
        <Link
          href="/dashboard/admin/users?tab=create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          <UserPlus className="h-4 w-4" /> Add account
        </Link>
      </header>

      {/* Accounts feature block */}
      <section className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/80 via-white to-sky-50/60 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/10">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Accounts</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Create new logins, edit roles and passwords, or delete accounts for verification and firm access control.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm hover:bg-teal-50"
          >
            Open accounts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {accountActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex flex-col rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${action.tone}`}>
                <action.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-slate-900">{action.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{action.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2">
                {action.button} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{item.detail}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">More settings</h2>
          <p className="text-sm text-slate-500">Open a connected Finova module. Access is enforced by the destination API.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-36 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                  {item.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                </span>
                <span className="mt-1.5 block text-sm leading-6 text-slate-500">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Environment & setup</h2>
            <p className="mt-1 text-sm text-slate-600">Keep secrets in environment variables and never commit credentials.</p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li>• Configure NEXTAUTH_SECRET and DATABASE_URL</li>
              <li>• Use versioned Prisma migrations for production</li>
              <li>• Configure email and identity providers as needed</li>
              <li>• Review role and client scope before inviting users</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
