"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Always-available navigation: previous page + home destination.
 */
export function BackNav({
  homeHref = "/dashboard",
  homeLabel = "Home",
  className,
}: {
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(homeHref);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={goBack}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#07649d]"
        aria-label="Go back"
        title="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </button>
      <Link
        href={homeHref}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#07649d]"
        aria-label={homeLabel}
        title={homeLabel}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">{homeLabel}</span>
      </Link>
    </div>
  );
}
