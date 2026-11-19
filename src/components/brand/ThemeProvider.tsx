"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export const FINSPHERE_THEMES = [
  { id: "dashboard-blue", name: "ISACA Navy & Blue", primary: "#1d2d5c", accent: "#00a4e4", soft: "#e7f0f5" },
  { id: "green-focus", name: "ISACA Green", primary: "#6cb33f", accent: "#36ac91", soft: "#eaf4e3" },
  { id: "teal-harmony", name: "ISACA Teal", primary: "#36ac91", accent: "#07649d", soft: "#e5f4f0" },
  { id: "purple-insight", name: "ISACA Purple", primary: "#6558b1", accent: "#1d2d5c", soft: "#efedf8" },
  { id: "red-energy", name: "ISACA Red", primary: "#e31837", accent: "#1d2d5c", soft: "#fdecef" },
  { id: "orange-success", name: "ISACA Orange", primary: "#e57524", accent: "#1d2d5c", soft: "#fff1e6" },
  { id: "indigo-inspire", name: "ISACA Medium Blue", primary: "#07649d", accent: "#00a4e4", soft: "#e7f0f5" },
  { id: "ocean-blend", name: "ISACA Bright Blue", primary: "#00a4e4", accent: "#07649d", soft: "#e7f0f5" },
  { id: "modern-teal", name: "ISACA Teal & Green", primary: "#36ac91", accent: "#6cb33f", soft: "#eaf4e3" },
  { id: "premium-gold", name: "ISACA Yellow", primary: "#fbb034", accent: "#1d2d5c", soft: "#fff5df" },
] as const;

export type FinSphereTheme = (typeof FINSPHERE_THEMES)[number]["id"];
type ThemeContextValue = { theme: FinSphereTheme; setTheme: (theme: FinSphereTheme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Each workspace area receives a deliberate ISACA palette combination.
// The theme follows the current route; users do not need a global theme picker.
function themeForPath(pathname: string): FinSphereTheme {
  if (pathname.startsWith("/dashboard/security")) return "purple-insight";
  if (pathname.startsWith("/dashboard/documents")) return "ocean-blend";
  if (pathname.startsWith("/dashboard/samples")) return "teal-harmony";
  if (pathname.startsWith("/dashboard/bank-rec")) return "modern-teal";
  if (pathname.startsWith("/dashboard/ar")) return "red-energy";
  if (pathname.startsWith("/dashboard/close")) return "green-focus";
  if (pathname.startsWith("/dashboard/consolidation")) return "indigo-inspire";
  if (pathname.startsWith("/dashboard/reporting")) return "teal-harmony";
  if (pathname.startsWith("/dashboard/market")) return "premium-gold";
  if (pathname.startsWith("/dashboard/audit")) return "orange-success";
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
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useFinSphereTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useFinSphereTheme must be used inside ThemeProvider");
  return value;
}
