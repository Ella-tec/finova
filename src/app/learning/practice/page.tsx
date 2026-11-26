"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Library,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { QUIZ_SETS } from "@/lib/learning/quizzes";
import { HANDS_ON, READING_NOTES } from "@/lib/learning/exercises";
import { LIBRARY_ITEMS } from "@/lib/learning/library";

const cards = [
  {
    href: "/learning/quiz",
    title: "Accounting quiz workout",
    blurb: "Timed-style drills with instant answers and plain-language explanations.",
    icon: ClipboardCheck,
    meta: `${QUIZ_SETS.length} sets · ${QUIZ_SETS.reduce((n, q) => n + q.questions.length, 0)} questions`,
    tone: "from-[#1d2d5c] to-[#07649d]",
  },
  {
    href: "/learning/exercises",
    title: "Hands-on exercises",
    blurb: "Step-by-step labs for trial balance, bank rec, and PBC packaging.",
    icon: NotebookPen,
    meta: `${HANDS_ON.length} labs`,
    tone: "from-[#0f766e] to-[#0d9488]",
  },
  {
    href: "/learning/notes",
    title: "Reading notes",
    blurb: "Short study notes plus a practice prompt after each topic.",
    icon: BookOpen,
    meta: `${READING_NOTES.length} notes`,
    tone: "from-[#7c3aed] to-[#6366f1]",
  },
  {
    href: "/learning/library",
    title: "Books, articles & research",
    blurb: "Curated textbooks, standards, journals, and open resources — legal access links only.",
    icon: Library,
    meta: `${LIBRARY_ITEMS.length} titles`,
    tone: "from-[#b45309] to-[#d97706]",
  },
];

export default function PracticeHubPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#07649d]">
          Learning practice
        </p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          <GraduationCap className="h-9 w-9 text-[#1d2d5c]" />
          Learn by doing
        </h1>
        <p className="max-w-2xl text-slate-600">
          Quizzes with explanations, hands-on workouts, reading notes, and a library of
          accounting books and research — designed to sit beside your Finova courses.
        </p>
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d2d5c] hover:underline"
        >
          ← Back to Learning Center
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`bg-gradient-to-r ${c.tone} px-5 py-4 text-white`}>
              <c.icon className="h-6 w-6 opacity-90" />
              <h2 className="mt-3 text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-white/85">{c.meta}</p>
            </div>
            <div className="flex items-end justify-between gap-3 p-5">
              <p className="text-sm leading-6 text-slate-600">{c.blurb}</p>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1d2d5c]">
                Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[#1d2d5c]">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-semibold">Suggested path</h2>
        </div>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Read one short note (accrual or double-entry).</li>
          <li>Take the Accounting basics quiz and read every explanation.</li>
          <li>Complete the Trial balance → statements exercise on paper or Excel.</li>
          <li>Browse the library for a textbook or OpenStax chapter to go deeper.</li>
        </ol>
        <Link
          href="/learning/quiz/accounting-basics"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162447]"
        >
          <BookMarked className="h-4 w-4" /> Start basics quiz
        </Link>
      </section>
    </div>
  );
}
