"use client";

import Link from "next/link";
import {
  Users,
  Shield,
  Settings,
  Building2,
  FileText,
  KeyRound,
  ScrollText,
  ArrowRight,
} from "lucide-react";

const links = [
  {
    href: "/dashboard/admin/users",
    title: "Users & Invites",
    desc: "Invite team members, assign roles, manage access",
    icon: Users,
  },
  {
    href: "/dashboard/security",
    title: "Security & File Sanitizer",
    desc: "Scan uploads, PII checks, public-AI gate",
    icon: Shield,
  },
  {
    href: "/dashboard/entities",
    title: "Entities",
    desc: "Legal entities, ownership %, reporting currency",
    icon: Building2,
  },
  {
    href: "/dashboard/clients",
    title: "Clients",
    desc: "Engagements and client portal access",
    icon: FileText,
  },
  {
    href: "/dashboard/audit",
    title: "Audit controls",
    desc: "PBC requests, workpapers, findings workflow",
    icon: ScrollText,
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-isaca-dark flex items-center gap-2">
          <Settings className="h-7 w-7 text-isaca-medium" />
          Administration
        </h1>
        <p className="text-slate-600 mt-1">
          Firm settings, users, security, and system controls
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border bg-white p-5 shadow-sm hover:border-isaca-teal hover:shadow-md transition flex gap-4"
          >
            <div className="h-11 w-11 rounded-xl bg-isaca-light flex items-center justify-center shrink-0 group-hover:bg-isaca-medium/10">
              <item.icon className="h-5 w-5 text-isaca-medium" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 group-hover:text-isaca-dark flex items-center gap-1">
                {item.title}
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition" />
              </p>
              <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-isaca-light/40 p-5 text-sm text-slate-700">
        <p className="font-semibold text-isaca-dark flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Environment tips
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600">
          <li>Set NEXTAUTH_SECRET and DATABASE_URL in .env</li>
          <li>Optional: Azure AD, Document Intelligence, Resend for email</li>
          <li>Demo logins are seeded via npm run db:seed</li>
        </ul>
      </div>
    </div>
  );
}
