"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  Shield,
  Settings,
  FileText,
  KeyRound,
  Bell,
  Database,
  Palette,
} from "lucide-react";

const cards = [
  {
    title: "Users & Invites",
    desc: "Invite staff, assign roles, manage access",
    href: "/dashboard/admin/users",
    icon: Users,
    color: "bg-isaca-medium",
  },
  {
    title: "Entities",
    desc: "Legal entities, ownership %, currencies",
    href: "/dashboard/entities",
    icon: Building2,
    color: "bg-isaca-teal",
  },
  {
    title: "File Sanitizer",
    desc: "Security gateway before AI and storage",
    href: "/dashboard/security",
    icon: Shield,
    color: "bg-isaca-dark",
  },
  {
    title: "Documents",
    desc: "Firm document library and folders",
    href: "/dashboard/documents",
    icon: FileText,
    color: "bg-isaca-blue",
  },
  {
    title: "Roles & security",
    desc: "RBAC, audit logs, session policy (overview)",
    href: "/dashboard/admin/users",
    icon: KeyRound,
    color: "bg-purple-600",
  },
  {
    title: "Notifications",
    desc: "Email alerts for PBC, close, approvals",
    href: "/dashboard/audit/pbc",
    icon: Bell,
    color: "bg-amber-500",
  },
  {
    title: "Data & seed",
    desc: "Demo data lives in Prisma seed — re-run npm run db:seed",
    href: "/dashboard/samples",
    icon: Database,
    color: "bg-emerald-600",
  },
  {
    title: "Theme & branding",
    desc: "ISACA palette active — more themes coming",
    href: "/dashboard",
    icon: Palette,
    color: "bg-rose-500",
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-7 w-7 text-isaca-medium" />
          Administration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Firm settings, users, security, and system tools
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-isaca-medium/40 transition"
          >
            <div
              className={`h-10 w-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}
            >
              <c.icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-isaca-dark">
              {c.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
            <span className="inline-block mt-3 text-sm font-medium text-isaca-medium">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
