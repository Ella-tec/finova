"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, BookOpen, FileText, Library, ClipboardCheck, Users,
  BarChart3, Bot, Settings, LogOut, ChevronRight, GraduationCap, Building2, Shield,
  Menu, X, ArrowLeft, ArrowRight,
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
  { name: "Accounting", href: "/dashboard/operations#accounting", icon: BookOpen },
  { name: "Sales", href: "/dashboard/operations#sales", icon: Users },
  { name: "Purchasing", href: "/dashboard/operations#purchasing", icon: FileText },
  { name: "Banking & Payroll", href: "/dashboard/operations#banking", icon: Building2 },
  { name: "Bank Rec", href: "/dashboard/bank-rec", icon: BookOpen },
  { name: "Financial Reporting", href: "/dashboard/reporting", icon: BarChart3 },
  { name: "Consolidation", href: "/dashboard/consolidation", icon: Building2 },
  { name: "Entities", href: "/dashboard/entities", icon: Building2 },
  { name: "Market Pulse", href: "/dashboard/market", icon: BarChart3 },
  { name: "Month-End Close", href: "/dashboard/close", icon: ClipboardCheck },
  { name: "Audit / PBC", href: "/dashboard/audit", icon: ClipboardCheck },
  { name: "Client Portal", href: "/dashboard/clients", icon: Users },
  { name: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { name: "Users", href: "/dashboard/admin/users", icon: Users },
  { name: "Learning Center", href: "/dashboard/learning", icon: GraduationCap },
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
        className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
          isActive ? "bg-[#e8f4ee] text-[#087f68] shadow-sm ring-1 ring-[#d3e9de]" : "text-[#62736f] hover:bg-[#f1f6f3] hover:text-[#203b35]")}>
        <item.icon className="h-5 w-5 shrink-0" />{item.name}
      </Link>
    );
  });

  return (
    <div className="min-h-screen flex bg-[#f5f7f5]">
      <aside className="hidden lg:flex lg:flex-col w-[272px] shrink-0 border-r border-[#e4ebe6] bg-white text-[#203b35]">
        <div className="flex h-[76px] items-center gap-2 border-b border-[#edf1ee] px-5"><LogoWordmark light /></div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-4 py-5">{navLinks()}</nav>
        <div className="border-t border-[#edf1ee] p-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f4ee] text-sm font-bold text-[#087f68]">{status === "loading" ? "…" : initials}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{displayName}</p><p className="truncate text-xs text-[#87958f]">{(session?.user as { role?: string } | undefined)?.role || "Member"}</p></div>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#71817b] hover:bg-[#f1f6f3] hover:text-[#203b35]"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>

      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#172f3d]/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e4ebe6] bg-white text-[#203b35] shadow-2xl transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-[#edf1ee] px-4"><LogoWordmark light /><button aria-label="Close menu" onClick={() => setMobileOpen(false)}><X /></button></div>
        <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">{navLinks(true)}</nav>
        <div className="border-t border-[#edf1ee] p-4"><button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 text-sm text-[#71817b]"><LogOut className="h-4 w-4" />Sign out</button></div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-[#e5ebe7] bg-white/90 px-3 backdrop-blur-xl sm:px-4 lg:px-7">
          <button type="button" aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex shrink-0 items-center gap-1 text-sm text-[#87958f]"><button type="button" aria-label="Go back" title="Go back" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.assign("/dashboard"); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#71817b] transition hover:bg-[#edf5f0] hover:text-[#087f68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b8b70]" ><ArrowLeft className="h-[18px] w-[18px]" /></button><Link href="/dashboard" title="Go to dashboard" aria-label="Go to dashboard" className={cn("hidden sm:inline transition-colors hover:text-[#087f68]", pathname === "/dashboard" ? "font-semibold text-[#087f68]" : "text-[#87958f]")}>Dashboard</Link><ChevronRight className="h-4 w-4" /><span className="font-semibold capitalize text-[#263e4a]">{pathname.split("/").filter(Boolean).pop() || "Home"}</span></div>
          <div className="min-w-0 flex-1"><GlobalSearch /></div>
          <div className="hidden items-center gap-2 md:flex"><ThemeSwitcher /><DarkModeToggle /></div>
          <Link href="/dashboard/ai" className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-isaca-light/50"><Bot className="h-4 w-4 text-isaca-medium" /><span className="hidden sm:inline">Ask AI</span></Link>
        </header>
        <div className="flex items-center justify-between border-b border-[#e5ebe7] bg-white px-4 py-2 md:hidden"><ThemeSwitcher /><DarkModeToggle /></div>
        <main className="min-h-0 flex-1 p-4 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
