"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Route-driven ISACA page accents only.
 * There is intentionally no user-facing theme picker.
 */
export const FINSPHERE_THEMES = [
  { id: "dashboard-blue", name: "ISACA Navy", primary: "#1d2d5c", accent: "#00a4e4", soft: "#e7f0f5" },
  { id: "green-focus", name: "ISACA Green", primary: "#4f922d", accent: "#6cb33f", soft: "#edf5e7" },
  { id: "teal-harmony", name: "ISACA Teal", primary: "#167d70", accent: "#36ac91", soft: "#e8f5f1" },
  { id: "purple-insight", name: "ISACA Purple", primary: "#51469a", accent: "#6558b1", soft: "#efedf8" },
  { id: "red-energy", name: "ISACA Red", primary: "#b9142d", accent: "#e31837", soft: "#fdecef" },
  { id: "orange-success", name: "ISACA Orange", primary: "#b95b18", accent: "#e57524", soft: "#fff1e6" },
  { id: "indigo-inspire", name: "ISACA Medium Blue", primary: "#07527f", accent: "#07649d", soft: "#e7f0f5" },
  { id: "ocean-blend", name: "ISACA Bright Blue", primary: "#007eae", accent: "#00a4e4", soft: "#e5f5fb" },
  { id: "modern-teal", name: "ISACA Teal Deep", primary: "#167d70", accent: "#36ac91", soft: "#e8f5f1" },
  { id: "premium-gold", name: "ISACA Gold", primary: "#7c570e", accent: "#fbb034", soft: "#fff5df" },
] as const;

export type FinSphereTheme = (typeof FINSPHERE_THEMES)[number]["id"];
type ThemeContextValue = { theme: FinSphereTheme; setTheme: (theme: FinSphereTheme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function themeForPath(pathname: string): FinSphereTheme {
  if (pathname.startsWith("/dashboard/security")) return "purple-insight";
  if (pathname.startsWith("/dashboard/documents")) return "ocean-blend";
  if (pathname.startsWith("/dashboard/samples")) return "teal-harmony";
  if (pathname.startsWith("/dashboard/bank-rec")) return "modern-teal";
  if (pathname.startsWith("/dashboard/ar")) return "red-energy";
  if (pathname.startsWith("/dashboard/operations")) return "indigo-inspire";
  if (pathname.startsWith("/dashboard/close")) return "green-focus";
  if (pathname.startsWith("/dashboard/consolidation")) return "indigo-inspire";
  if (pathname.startsWith("/dashboard/entities")) return "indigo-inspire";
  if (pathname.startsWith("/dashboard/reporting")) return "teal-harmony";
  if (pathname.startsWith("/dashboard/market")) return "premium-gold";
  if (pathname.startsWith("/dashboard/audit")) return "orange-success";
  if (pathname.startsWith("/dashboard/ai")) return "purple-insight";
  if (pathname.startsWith("/dashboard/learning")) return "teal-harmony";
  if (pathname.startsWith("/dashboard/clients")) return "ocean-blend";
  if (pathname.startsWith("/dashboard/admin")) return "dashboard-blue";
  if (pathname.startsWith("/portal")) return "ocean-blend";
  return "dashboard-blue";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<FinSphereTheme>("dashboard-blue");

  useEffect(() => {
    setTheme(themeForPath(pathname || "/dashboard"));
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Remove any legacy manual theme storage from older builds
    try {
      window.localStorage.removeItem("finsphere-theme");
      window.localStorage.removeItem("finova-theme");
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useFinSphereTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useFinSphereTheme must be used inside ThemeProvider");
  return value;
}
