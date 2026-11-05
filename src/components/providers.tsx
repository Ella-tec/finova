"use client";

import { SessionProvider } from "next-auth/react";
import { AiWidget } from "@/components/brand/AiWidget";
import { ThemeProvider } from "@/components/brand/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <AiWidget />
      </ThemeProvider>
    </SessionProvider>
  );
}
