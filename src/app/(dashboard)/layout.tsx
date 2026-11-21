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
  Menu,
  X,
  Wallet,
  CalendarCheck,
  Phone,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";
import { GlobalSearch } from "@/components/brand/GlobalSearch";
import { DarkModeToggle } from "@/components/brand/DarkModeToggle";
import { BackNav } from "@/components/brand/BackNav";

const navigation = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Home", href: "/dashboard", match: "/dashboard", icon: LayoutDashboard },
      { name: "Documents", href: "/dashboard/documents", match: "/dashboard/documents", icon: FileText },
      { name: "Sample Library", href: "/dashboard/samples", match: "/dashboard/samples", icon: Library },
      { name: "File Sanitizer", href: "/dashboard/security", match: "/dashboard/security", icon: Shield },
    ],
  },
  {
    label: "ACCOUNTING",
    items: [
      { name: "Accounting", href: "/dashboard/operations", match: "/dashboard/operations", icon: BookOpen },
      { name: "AR Aging", href: "/dashboard/ar", match: "/dashboard/ar", icon: Wallet },
      { name: "Bank Rec", href: "/dashboard/bank-rec", match: "/dashboard/bank-rec", icon: BookOpen },
      { name: "Month-End Close", href: "/dashboard/close", match: "/dashboard/close", icon: CalendarCheck },
      { name: "Financial Reporting", href: "/dashboard/reporting", match: "/dashboard/reporting", icon: BarChart3 },
      { name: "Consolidation", href: "/dashboard/consolidation", match: "/dashboard/consolidation", icon: Building2 },
    ],
  },
  {
    label: "AUDIT & CLIENTS",
    items: [
      { name: "Audit / PBC", href: "/dashboard/audit/pbc", match: "/dashboard/audit", icon: ClipboardCheck },
      { name: "Clients", href: "/dashboard/clients", match: "/dashboard/clients", icon: Users },
      {
        name: "Contact Center",
        href: "/dashboard/clients/contact-center",
        match: "/dashboard/clients/contact-center",
        icon: Phone,
      },
      { name: "AI Assistant", href: "/dashboard/ai", match: "/dashboard/ai", icon: Bot },
      { name: "Learning", href: "/dashboard/learning", match: "/dashboard/learning", icon: GraduationCap },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { name: "Settings", href: "/dashboard/admin", match: "/dashboard/admin", icon: Settings },
      { name: "Accounts", href: "/dashboard/admin/users", match: "/dashboard/admin/users", icon: UserCog },
    ],
  },
];

const allItems = navigation.flatMap((section) => section.items);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = session?.user?.name || session?.user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const activeItem = useMemo(() => {
    if (pathname === "/dashboard") return allItems[0];
    const matches = allItems.filter(
      (item) => pathname === item.match || pathname.startsWith(item.match + "/")
    );
    return matches.sort((a, b) => b.match.length - a.match.length)[0];
  }, [pathname]);

  const navLinks = (mobile = false, dark = false) =>
    navigation.map((section) => (
      <div key={section.label} className="space-y-1">
        <p
          className={cn(
            "px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[.16em]",
            dark ? "text-white/45" : "text-[#9aa8a1]"
          )}
        >
          {section.label}
        </p>
        {section.items.map((item) => {
          const isActive =
            item.match === "/dashboard"
              ? pathname === "/dashboard"
              : item.match === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname === item.match || pathname.startsWith(item.match + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                dark
                  ? isActive
                    ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                  : isActive
                    ? "finova-nav-active shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    ));

  return (
    <div className="finova-app-shell flex min-h-screen">
      <aside className="finova-sidebar hidden w-[272px] shrink-0 flex-col bg-[#1d2d5c] text-white lg:flex">
        <div className="flex h-[76px] items-center gap-2 border-b border-white/10 px-5">
          <LogoWordmark light />
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-2 overflow-y-auto px-4 pb-5">
          {navLinks(false, true)}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
              {status === "loading" ? "…" : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-white/55">
                {(session?.user as { role?: string } | undefined)?.role || "Member"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#0b1528]/55 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#1d2d5c] text-white shadow-2xl transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <LogoWordmark light />
          <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="text-white">
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex-1 space-y-2 overflow-y-auto p-3 pb-5">
          {navLinks(true, true)}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 text-sm text-white/70">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="finova-workspace flex min-w-0 flex-1 flex-col">
        <header className="finova-topbar sticky top-0 z-30 flex h-[76px] items-center gap-2 border-b border-[#d7e3ec] bg-white/95 px-3 backdrop-blur-xl sm:gap-3 sm:px-4 lg:px-7">
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <BackNav homeHref="/dashboard" homeLabel="Home" />

          <div className="hidden items-center gap-1 text-sm text-[#87958f] sm:flex">
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold capitalize text-[#1d2d5c]">
              {activeItem?.name || pathname.split("/").filter(Boolean).pop() || "Home"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <GlobalSearch />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <DarkModeToggle />
          </div>
          <Link
            href="/dashboard/clients/contact-center"
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex"
          >
            <Phone className="h-4 w-4 text-[#07649d]" />
            <span className="hidden lg:inline">Contact</span>
          </Link>
          <Link
            href="/dashboard/ai"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#1d2d5c] px-3 py-2 text-sm font-medium text-white hover:bg-[#162447]"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </Link>
        </header>
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 md:hidden">
          <DarkModeToggle />
        </div>
        <main className="finova-page min-h-0 flex-1 p-4 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
