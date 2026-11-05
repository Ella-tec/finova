"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FileText, ClipboardList, Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWordmark } from "@/components/brand/Logo";

const nav = [
  { name: "Home", href: "/portal", icon: Home },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: ClipboardList },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-isaca-light/60">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/portal">
            <LogoWordmark />
          </Link>
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
                      ? "bg-isaca-medium text-white"
                      : "text-slate-600 hover:bg-isaca-light hover:text-isaca-dark"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-slate-500 truncate max-w-[140px]">
              {session?.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1 text-slate-600 hover:text-isaca-dark"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
