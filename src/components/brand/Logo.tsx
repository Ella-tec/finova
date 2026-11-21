import { cn } from "@/lib/utils";

/** Clean Finova mark — abstract ledger / growth bars (no RF letters). */
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
      {/* Abstract chart bars — Finova finance mark */}
      <rect x="18" y="42" width="10" height="18" rx="3" fill="white" opacity="0.95" />
      <rect x="35" y="28" width="10" height="32" rx="3" fill="white" opacity="0.95" />
      <rect x="52" y="18" width="10" height="42" rx="3" fill="#99F6E4" />
      <path
        d="M18 22h28"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
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
