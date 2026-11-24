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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";

const primaryNav = [
  { name: "Dashboard", href: "/portal", icon: Home },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: ClipboardList },
  { name: "Contact", href: "/portal/contact", icon: Users },
  { name: "Sanitizer", href: "/portal/security", icon: Shield },
];

const moreNav = [
  { name: "AI Assistant", href: "/portal/ai", icon: Bot },
  { name: "Learning Center", href: "/portal/learning", icon: GraduationCap },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/portal" && pathname.startsWith(href));
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = Boolean(role && role !== "CLIENT");
  const name = session?.user?.name || session?.user?.email || "Client";

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
      active
        ? "bg-[#1d2d5c] text-white shadow-sm"
        : "text-slate-600 hover:bg-white hover:text-[#1d2d5c]"
    );

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/portal" aria-label="Finova AI client home" className="shrink-0">
              <LogoWordmark />
            </Link>
            <span className="hidden rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-800 sm:inline-flex">
              Client workspace
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isStaff && (
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Staff
              </Link>
            )}
            <div className="hidden max-w-[190px] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 lg:flex">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f0f5] text-xs font-bold text-[#07649d]">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-sm font-medium text-slate-600">{name}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-[#f8fafc]">
          <nav
            aria-label="Client navigation"
            className="mx-auto hidden max-w-[1440px] items-center gap-1 px-4 py-2 sm:px-6 md:flex"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={linkClass(isActive(pathname, item.href))}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}

            <details className="group relative">
              <summary
                className={cn(
                  linkClass(moreNav.some((item) => isActive(pathname, item.href))),
                  "cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                )}
              >
                More
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {moreNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      isActive(pathname, item.href)
                        ? "bg-[#1d2d5c] text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <nav
            aria-label="Client navigation"
            className="mx-auto grid max-w-[1440px] grid-cols-4 gap-1.5 px-3 py-2 md:hidden"
          >
            {[...primaryNav, ...moreNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] font-semibold transition",
                  isActive(pathname, item.href)
                    ? "bg-[#1d2d5c] text-white"
                    : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="leading-tight">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {children}
      </main>
    </div>
  );
}
