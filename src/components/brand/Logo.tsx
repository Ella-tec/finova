import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
    >
      <rect width="80" height="80" rx="20" fill="#0F766E" />
      <path
        d="M22 52V28h10.5c6.2 0 10.2 3.2 10.2 8.1 0 3.2-1.7 5.7-4.6 6.9L46 52h-8.2l-6.6-8.4H30V52H22zm8-13.2h2.4c2.6 0 4.1-1.2 4.1-3.2s-1.5-3.1-4.1-3.1H30v6.3z"
        fill="white"
      />
      <path d="M48 52V28h14v6.2H56v3.6h5.2v5.6H56V52h-8z" fill="white" opacity="0.92" />
      <circle cx="62" cy="22" r="5" fill="#99F6E4" />
    </svg>
  );
}

export function LogoWordmark({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={36} />
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-slate-900"
        )}
      >
        Finova{" "}
        <span className={cn("font-semibold", light ? "text-[#a8e6ff]" : "text-[#07649d]")}>
          AI
        </span>
      </span>
    </div>
  );
}
