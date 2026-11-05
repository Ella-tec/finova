import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-isaca-blue disabled:opacity-60",
          variant === "default" && "bg-isaca-medium text-white hover:bg-isaca-dark",
          variant === "outline" && "border border-slate-300 bg-white hover:bg-slate-50",
          variant === "ghost" && "hover:bg-slate-100",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
