import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="Finova"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
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
      <Image
        src="/logo.svg"
        alt="Finova"
        width={36}
        height={36}
        className={cn(
          "object-contain",
          light && "brightness-0 invert"
        )}
        priority
      />
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-[#1d2d5c]"
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
