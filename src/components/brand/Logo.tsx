import { cn } from "@/lib/utils";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-[#1d2d5c] font-bold text-white",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      F
    </span>
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
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
          light
            ? "bg-white/15 text-white ring-1 ring-white/25"
            : "bg-[#1d2d5c] text-white"
        )}
      >
        F
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-[#1d2d5c]"
        )}
      >
        Finova
        <span className={cn("ml-1 font-semibold", light ? "text-[#a8e6ff]" : "text-[#07649d]")}>
          AI
        </span>
      </span>
    </div>
  );
}
