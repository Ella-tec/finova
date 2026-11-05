"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, FileText, Library, ClipboardCheck, Users,
  BarChart3, Bot, Settings, LogOut, ChevronRight, GraduationCap, Building2, Shield,
  Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/brand/GlobalSearch";
import { ThemeSwitcher } from "@/components/brand/ThemeSwitcher";
import { DarkModeToggle } from "@/components/brand/DarkModeToggle";

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
  { name: "Learning Center", href: "/learning", icon: GraduationCap },
  { name: "Administration", href: "/dashboard/admin", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = session?.user?.name || session?.user?.email || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const navLinks = (mobile = false) => navigation.map((item) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <Link key={item.name} href={item.href} onClick={() => mobile && setMobileOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
          isActive ? "bg-isaca-medium text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white")}>
        <item.icon className="h-5 w-5 shrink-0" />{item.name}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-isaca-light/50 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-slate-900 text-white">
        <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-800"><LogoWordmark light /></div>
        <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">{navLinks()}</nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-isaca-medium flex items-center justify-center text-sm font-semibold">{status === "loading" ? "…" : initials}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{displayName}</p><p className="text-xs text-slate-400 truncate">{(session?.user as { role?: string } | undefined)?.role || "Member"}</p></div>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>

      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/55 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4"><LogoWordmark light /><button aria-label="Close menu" onClick={() => setMobileOpen(false)}><X /></button></div>
        <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">{navLinks(true)}</nav>
        <div className="border-t border-slate-800 p-4"><button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 text-sm text-slate-300"><LogOut className="h-4 w-4" />Sign out</button></div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/95 px-3 backdrop-blur sm:px-4 lg:px-6">
          <button type="button" aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="hidden shrink-0 items-center gap-2 text-sm text-slate-500 sm:flex"><span>Dashboard</span><ChevronRight className="h-4 w-4" /><span className="font-medium capitalize text-slate-900">{pathname.split("/").filter(Boolean).pop() || "Home"}</span></div>
          <div className="min-w-0 flex-1"><GlobalSearch /></div>
          <div className="hidden items-center gap-2 md:flex"><ThemeSwitcher /><DarkModeToggle /></div>
          <Link href="/dashboard/ai" className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-isaca-light/50"><Bot className="h-4 w-4 text-isaca-medium" /><span className="hidden sm:inline">Ask AI</span></Link>
        </header>
        <div className="flex items-center justify-between border-b bg-white px-4 py-2 md:hidden"><ThemeSwitcher /><DarkModeToggle /></div>
        <main className="min-h-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
