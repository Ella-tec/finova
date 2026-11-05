"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Building2, Layout, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = {
  kind: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : { results: [] };
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  const icon = (kind: string) => {
    if (kind === "Page") return Layout;
    if (kind === "Company") return Building2;
    if (kind.includes("process")) return ListTree;
    return FileText;
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim() && setOpen(true)}
        placeholder="Search pages, processes, companies, samples…"
        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-isaca-blue/30 focus:border-isaca-blue"
      />
      {open && (q.trim() || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-3 text-sm text-slate-500">No matches. Try “trial balance”, “P2P”, “materiality”…</p>
          )}
          {results.map((r) => {
            const Icon = icon(r.kind);
            return (
              <button
                key={r.kind + r.id}
                type="button"
                onClick={() => go(r.href)}
                className="w-full text-left px-3 py-2.5 hover:bg-isaca-light/60 flex gap-2 border-b border-slate-50 last:border-0"
              >
                <Icon className="h-4 w-4 text-isaca-medium mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">{r.title}</span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    {r.kind}
                    {r.subtitle ? ` · ${r.subtitle}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
