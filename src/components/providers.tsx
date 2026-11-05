"use client";

import { SessionProvider } from "next-auth/react";
import { AiWidget } from "@/components/brand/AiWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <AiWidget />
    </SessionProvider>
  );
}
