"use client";

import Link from "next/link";
import { BookOpen, Clock, PenLine } from "lucide-react";
import { READING_NOTES } from "@/lib/learning/exercises";

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Reading</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
          <BookOpen className="h-8 w-8 text-violet-700" />
          Study notes
        </h1>
        <p className="max-w-2xl text-slate-600">
          Short, focused notes with a practice prompt so reading turns into skill.
        </p>
        <Link href="/learning/practice" className="text-sm font-semibold text-[#1d2d5c] hover:underline">
          ← Practice hub
        </Link>
      </header>

      <div className="space-y-4">
        {READING_NOTES.map((note) => (
          <article
            key={note.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {note.minutes} min read
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{note.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{note.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {note.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                <PenLine className="h-4 w-4" /> Practice prompt
              </p>
              <p className="mt-1 text-sm text-violet-950/90">{note.practicePrompt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
