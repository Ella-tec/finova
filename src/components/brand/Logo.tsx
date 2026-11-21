import { cn } from "@/lib/utils";

/**
 * Official Finova logo — exact brand mark from user SVG.
 * Transparent background (no black square).
 */
export function Logo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  // Unique gradient IDs so multiple logos on one page don't clash
  const uid = `fs-${size}`;

  return (
    <svg
      className={cn("shrink-0", className)}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d2d5c" />
          <stop offset="45%" stopColor="#07649d" />
          <stop offset="100%" stopColor="#00a4e4" />
        </linearGradient>
        <linearGradient id={`${uid}-teal`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00a4e4" />
          <stop offset="50%" stopColor="#36ac91" />
          <stop offset="100%" stopColor="#6cb33f" />
        </linearGradient>
        <linearGradient id={`${uid}-green`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#36ac91" />
          <stop offset="70%" stopColor="#6cb33f" />
          <stop offset="100%" stopColor="#e57524" />
        </linearGradient>
      </defs>

      {/* Outer blue arc */}
      <path
        d="M58 12C30 18 14 42 16 68c2 28 24 46 52 48 8 0 14-2 20-5-22 2-48-8-56-32-8-26 6-52 34-60-4-1-6-1-8 1z"
        fill={`url(#${uid}-blue)`}
      />

      {/* Mid teal arc */}
      <path
        d="M28 78c8-22 28-36 52-34 18 2 32 12 38 28-10-18-30-28-50-24-16 3-28 14-34 28-2 1-4 2-6 2z"
        fill={`url(#${uid}-teal)`}
      />

      {/* Lower blue arc */}
      <path
        d="M22 92c14-8 32-6 46 4 12 8 18 20 16 32-2-14-12-26-28-32-14-5-28-4-34-4z"
        fill="#07649d"
      />

      {/* Growth bars */}
      <rect x="68" y="58" width="10" height="28" rx="2" fill="#00a4e4" />
      <rect x="80" y="42" width="10" height="44" rx="2" fill="#36ac91" />
      <rect x="92" y="28" width="10" height="58" rx="2" fill={`url(#${uid}-green)`} />

      {/* Soft purple accent */}
      <path
        d="M20 70c-2 8 0 16 4 22 2-10 6-18 8-24-4 0-8 0-12 2z"
        fill="#6558b1"
        opacity="0.55"
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
