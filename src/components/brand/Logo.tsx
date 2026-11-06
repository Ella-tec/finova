import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official Finova brand mark, shared by the website and application shell. */
export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      width={size}
      height={size}
      alt="Finova"
      priority
      className={cn("shrink-0 object-contain", className)}
    />
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
