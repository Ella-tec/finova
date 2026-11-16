"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, Landmark, BookOpen, Users, BarChart3,
  ClipboardCheck, ShieldCheck, Building2, Settings, LogOut, ChevronRight,
  Menu, X, ArrowLeft, Bot,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/brand/GlobalSearch";
import { ThemeSwitcher } from "@/components/brand/ThemeSwitcher";
import { DarkModeToggle } from "@/components/brand/DarkModeToggle";

// Keep the primary navigation focused on the daily business workflow.
// Specialist tools remain available through their direct routes and dashboard links.
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Banking", href: "/dashboard/bank-rec", icon: Landmark },
  { name: "Accounting", href: "/dashboard/operations#accounting", icon: BookOpen },
  { name: "Customers", href: "/dashboard/clients", icon: Users },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Reports", href: "/dashboard/reporting", icon: BarChart3 },
  { name: "Month-end close", href: "/dashboard/close", icon: ClipboardCheck },
  { name: "Audit & PBC", href: "/dashboard/audit", icon: ShieldCheck },
  { name: "Consolidation", href: "/dashboard/consolidation", icon: Building2 },
  { name: "Settings", href: "/dashboard/admin", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = session?.user?.name || session?.user?.email || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const navLinks = (mobile = false) => navigation.map((item) => {
    const isActive = item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(item.href.split("#")[0] + "/") || pathname === item.href.split("#")[0];
    return (
      <Link key={item.name} href={item.href} onClick={() => mobile && setMobileOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-[#e8f5ed] text-[#16834a]"
            : "text-[#53645b] hover:bg-[#f1f5f2] hover:text-[#1f3328]"
        )}>
        <item.icon className="h-[18px] w-[18px] shrink-0" />{item.name}
      </Link>
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f6f8f6] text-[#26352c]">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#e5ebe6] bg-white lg:flex">
        <div className="flex h-[68px] items-center border-b border-[#edf1ed] px-5"><LogoWordmark /></div>
        <div className="px-4 pb-2 pt-5"><p className="px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#99a69e]">Workspace</p></div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">{navLinks()}</nav>
        <div className="border-t border-[#edf1ed] p-4">
          <Link href="/dashboard/ai" className="mb-4 flex items-center gap-3 rounded-xl border border-[#dcece1] bg-[#f5fbf6] p-3 text-sm font-semibold text-[#187c48] transition hover:border-[#a9d4b6] hover:bg-[#edf8f0]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#16834a] shadow-sm"><Bot className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0 flex-1"><span className="block">Ask Finova AI</span><span className="mt-0.5 block text-[11px] font-normal text-[#7b9181]">Your accounting copilot</span></span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f5ed] text-xs font-bold text-[#16834a]">{status === "loading" ? "…" : initials}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#34443a]">{displayName}</p><p className="truncate text-[11px] text-[#8b9990]">{(session?.user as { role?: string } | undefined)?.role || "Workspace member"}</p></div>
            <button type="button" aria-label="Sign out" title="Sign out" onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-lg p-2 text-[#87948b] hover:bg-[#f1f5f2] hover:text-[#34443a]"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#172f3d]/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e5ebe6] bg-white shadow-2xl transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-[#edf1ed] px-4"><LogoWordmark light /><button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-[#f1f5f2]"><X /></button></div>
        <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">{navLinks(true)}</nav>
        <div className="border-t border-[#edf1ed] p-4"><Link href="/dashboard/ai" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg bg-[#e8f5ed] px-3 py-2.5 text-sm font-semibold text-[#16834a]"><Bot className="h-4 w-4" />Ask Finova AI</Link><button onClick={() => signOut({ callbackUrl: "/login" })} className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[#71817b]"><LogOut className="h-4 w-4" />Sign out</button></div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-[#e5ebe6] bg-white/95 px-3 backdrop-blur sm:px-5 lg:px-7">
          <button type="button" aria-label="Open navigation" className="rounded-lg p-2 text-[#64746a] hover:bg-[#f1f5f2] lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="hidden shrink-0 items-center gap-1 text-sm text-[#98a49c] md:flex"><button type="button" aria-label="Go back" title="Go back" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.assign("/dashboard"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#71817b] hover:bg-[#edf5f0] hover:text-[#16834a]"><ArrowLeft className="h-4 w-4" /></button><Link href="/dashboard" className="hover:text-[#16834a]">Home</Link><ChevronRight className="h-3.5 w-3.5" /><span className="font-semibold capitalize text-[#34443a]">{pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") || "Dashboard"}</span></div>
          <div className="min-w-0 flex-1"><GlobalSearch /></div>
          <div className="hidden items-center gap-2 md:flex"><ThemeSwitcher /><DarkModeToggle /></div>
          <Link href="/dashboard/ai" className="flex shrink-0 items-center gap-2 rounded-lg bg-[#16834a] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#116b3c]"><Bot className="h-4 w-4" /><span className="hidden sm:inline">Ask Finova</span></Link>
        </header>
        <div className="flex items-center justify-between border-b border-[#e5ebe6] bg-white px-4 py-2 md:hidden"><ThemeSwitcher /><DarkModeToggle /></div>
        <main className="min-h-0 flex-1 p-4 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
