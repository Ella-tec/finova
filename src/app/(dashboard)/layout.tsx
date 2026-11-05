"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Library,
  ClipboardCheck,
  Users,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/brand/GlobalSearch";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Sample Library", href: "/dashboard/samples", icon: Library },
  { name: "File Sanitizer", href: "/dashboard/security", icon: Shield },
  { name: "Bank Rec", href: "/dashboard/bank-rec", icon: BookOpen },
  { name: "Financial Reporting", href: "/dashboard/reporting", icon: FileText },
  { name: "Consolidation", href: "/dashboard/consolidation", icon: Building2 },
  { name: "Entities", href: "/dashboard/entities", icon: Building2 },
  { name: "Market Pulse", href: "/dashboard/market", icon: BarChart3 },
  { name: "Month-End Close", href: "/dashboard/close", icon: ClipboardCheck },
  { name: "Audit / PBC", href: "/dashboard/audit", icon: ClipboardCheck },
  { name: "Client Portal", href: "/dashboard/clients", icon: Users },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { name: "Users", href: "/dashboard/admin/users", icon: Users },
  { name: "Learning", href: "/learning", icon: GraduationCap },
  { name: "Administration", href: "/dashboard/admin", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const displayName =
    session?.user?.name || session?.user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-isaca-light/50 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white">
        <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-800">
          <LogoWordmark light />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-isaca-medium text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-isaca-medium flex items-center justify-center text-sm font-semibold">
              {status === "loading" ? "…" : initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">
                {(session?.user as { role?: string } | undefined)?.role || "Member"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-20">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium capitalize">
              {pathname.split("/").filter(Boolean).pop() || "Home"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <GlobalSearch />
          </div>
          <Link
            href="/dashboard/ai"
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-isaca-light/50 flex items-center gap-2"
          >
            <Bot className="h-4 w-4 text-isaca-medium" />
            Ask AI
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
