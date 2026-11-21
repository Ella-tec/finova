import { cn } from "@/lib/utils";

/** Official Finova logo — transparent blue arc + growth bars (no black square). */
export function Logo({
  className,
  size = 40,
  withBg = false,
}: {
  className?: string;
  size?: number;
  /** Only use when you truly need a dark tile (rare). Default is transparent. */
  withBg?: boolean;
}) {
  return (
    <svg
      className={cn("shrink-0", className)}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden
    >
      {withBg && (
        <rect width="512" height="512" rx="96" fill="#0B1220" />
      )}
      {/* Outer blue arcs — match official Finova mark */}
      <path
        d="M90 280c20-120 110-200 230-210 40-4 80 6 110 28"
        stroke="url(#finovaArc)"
        strokeWidth="36"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M70 340c40 90 140 140 250 120 70-12 120-50 150-100"
        stroke="url(#finovaArc2)"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M120 420c-40-60-40-140 10-200"
        stroke="#3B82F6"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Chart bars */}
      <rect x="230" y="280" width="36" height="100" rx="8" fill="#2563EB" />
      <rect x="280" y="230" width="36" height="150" rx="8" fill="#14B8A6" />
      <rect x="330" y="170" width="36" height="210" rx="8" fill="url(#finovaBar)" />
      <path
        d="M380 200c40 20 70 70 80 120"
        stroke="#34D399"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id="finovaArc" x1="90" y1="70" x2="430" y2="120">
          <stop stopColor="#1E3A8A" />
          <stop offset="0.5" stopColor="#2563EB" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="finovaArc2" x1="70" y1="420" x2="470" y2="280">
          <stop stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="finovaBar" x1="330" y1="170" x2="366" y2="380">
          <stop stopColor="#F59E0B" />
          <stop offset="0.4" stopColor="#34D399" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
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
