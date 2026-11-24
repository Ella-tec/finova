"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  FileText,
  ClipboardList,
  Users,
  Shield,
  Bot,
  GraduationCap,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";

const nav = [
  { name: "Dashboard", href: "/portal", icon: Home },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: ClipboardList },
  { name: "Contact", href: "/portal/contact", icon: Users },
  { name: "Sanitizer", href: "/portal/security", icon: Shield },
  { name: "AI Assistant", href: "/portal/ai", icon: Bot },
  { name: "Learning", href: "/portal/learning", icon: GraduationCap },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role && role !== "CLIENT";
  const name = session?.user?.name || session?.user?.email || "Client";

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/portal" className="flex min-w-0 items-center gap-2">
            <LogoWordmark />
            <span className="hidden rounded-full bg-[#e7f0f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#07649d] sm:inline">
              Client
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 overflow-x-auto md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/portal" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition lg:text-sm",
                    active
                      ? "bg-[#1d2d5c] text-white"
                      : "text-slate-600 hover:bg-[#e7f0f5] hover:text-[#1d2d5c]"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-sm">
            {isStaff && (
              <Link
                href="/dashboard"
                className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Staff
              </Link>
            )}
            <span className="hidden max-w-[120px] truncate text-xs text-slate-500 lg:inline">{name}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-2 md:hidden">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
                  active ? "bg-[#1d2d5c] text-white" : "bg-white text-slate-600 border border-slate-200"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
