"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookMarked, ExternalLink, Library, Search } from "lucide-react";
import { LIBRARY_ITEMS, LIBRARY_KINDS } from "@/lib/learning/library";

export default function LibraryPage() {
  const [kind, setKind] = useState<(typeof LIBRARY_KINDS)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return LIBRARY_ITEMS.filter((item) => {
      if (kind !== "All" && item.kind !== kind) return false;
      if (!query) return true;
      const hay = `${item.title} ${item.authors} ${item.blurb} ${item.topics.join(" ")}`.toLowerCase();
      return hay.includes(query);
    });
  }, [kind, q]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Library</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
          <Library className="h-8 w-8 text-amber-700" />
          Books, articles & research
        </h1>
        <p className="max-w-2xl text-slate-600">
          A curated list you can browse and open through legitimate publishers, standards bodies,
          and open textbooks — not pirated files.
        </p>
        <Link href="/learning/practice" className="text-sm font-semibold text-[#1d2d5c] hover:underline">
          ← Practice hub
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, topic…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm focus:border-[#1d2d5c] focus:outline-none focus:ring-2 focus:ring-[#1d2d5c]/15"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {LIBRARY_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                kind === k
                  ? "bg-[#1d2d5c] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing <strong className="text-slate-800">{filtered.length}</strong> of {LIBRARY_ITEMS.length}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-900">
                {item.kind}
              </span>
              <span className="text-xs text-slate-500">{item.level}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.authors}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{item.accessNote}</p>
            {item.accessUrl && (
              <a
                href={item.accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 self-start rounded-xl bg-[#1d2d5c] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#162447]"
              >
                <BookMarked className="h-4 w-4" />
                Open resource
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border bg-white py-12 text-center text-slate-500">
          No titles match your filters.
        </p>
      )}
    </div>
  );
}
