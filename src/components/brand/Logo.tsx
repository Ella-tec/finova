import { cn } from "@/lib/utils";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  // Logo image removed
  return null;
}

export function LogoWordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-isaca-dark"
        )}
      >
        Finova
      </span>
    </div>
  );
}