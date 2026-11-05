"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const FINSPHERE_THEMES = [
  { id: "dashboard-blue", name: "Dashboard Blue", primary: "#0B63CE", accent: "#3B82F6", soft: "#60A5FA" },
  { id: "green-focus", name: "Green Focus", primary: "#16A34A", accent: "#22C55E", soft: "#86EFAC" },
  { id: "teal-harmony", name: "Teal Harmony", primary: "#0891B2", accent: "#06B6D4", soft: "#67E8F9" },
  { id: "purple-insight", name: "Purple Insight", primary: "#7C3AED", accent: "#A855F7", soft: "#C084FC" },
  { id: "red-energy", name: "Red Energy", primary: "#DC2626", accent: "#EF4444", soft: "#F87171" },
  { id: "orange-success", name: "Orange Success", primary: "#F97316", accent: "#FB923C", soft: "#FDBA74" },
  { id: "indigo-inspire", name: "Indigo Inspire", primary: "#4F46E5", accent: "#6366F1", soft: "#818CF8" },
  { id: "ocean-blend", name: "Ocean Blend", primary: "#0EA5E9", accent: "#06B6D4", soft: "#22D3EE" },
  { id: "modern-teal", name: "Modern Teal", primary: "#059669", accent: "#10B981", soft: "#34D399" },
  { id: "premium-gold", name: "Premium Gold", primary: "#D97706", accent: "#F59E0B", soft: "#FDE68A" },
] as const;

export type FinSphereTheme = (typeof FINSPHERE_THEMES)[number]["id"];
type ThemeContextValue = { theme: FinSphereTheme; setTheme: (theme: FinSphereTheme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<FinSphereTheme>("dashboard-blue");

  useEffect(() => {
    const saved = window.localStorage.getItem("finsphere-theme") as FinSphereTheme | null;
    if (saved && FINSPHERE_THEMES.some((item) => item.id === saved)) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("finsphere-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useFinSphereTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useFinSphereTheme must be used inside ThemeProvider");
  return value;
}
