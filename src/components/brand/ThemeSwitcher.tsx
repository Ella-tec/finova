"use client";

import { Palette } from "lucide-react";
import { FINSPHERE_THEMES, useFinSphereTheme } from "@/components/brand/ThemeProvider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useFinSphereTheme();
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <Palette className="h-4 w-4 text-isaca-medium" aria-hidden="true" />
      <span className="hidden sm:inline">Theme</span>
      <select
        aria-label="Choose FinSphere color theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value as typeof theme)}
        className="max-w-[145px] bg-transparent font-medium text-slate-800 outline-none"
      >
        {FINSPHERE_THEMES.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </label>
  );
}
