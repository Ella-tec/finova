"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FileText, ClipboardList, Home, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";
import { BackNav } from "@/components/brand/BackNav";

const nav = [
  { name: "Home", href: "/portal", icon: Home },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: ClipboardList },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role && role !== "CLIENT";

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <BackNav homeHref="/portal" homeLabel="Portal home" />
            <Link href="/portal" className="hidden sm:block">
              <LogoWordmark />
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/portal" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-[#07649d] text-white"
                      : "text-slate-600 hover:bg-[#e7f0f5] hover:text-[#1d2d5c]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-sm">
            {isStaff && (
              <Link
                href="/dashboard"
                className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
                title="Firm dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            <span className="hidden max-w-[120px] truncate text-slate-500 md:inline">
              {session?.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-slate-600 hover:text-[#1d2d5c]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
