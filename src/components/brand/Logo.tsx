import { cn } from "@/lib/utils";

/** Finova brand mark: a clear financial-growth symbol. */
export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)} role="img" aria-label="Finova">
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#14324F" />
      <path d="M12 31.5 20 23l5 4.5L36 15" stroke="#7FD3A3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29.5 15H36v6.5" stroke="#7FD3A3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="31.5" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}

export function LogoWordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={36} />
      <span className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-isaca-dark")}>
        Finova
      </span>
    </div>
  );
}
