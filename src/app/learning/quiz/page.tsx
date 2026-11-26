"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Clock } from "lucide-react";
import { QUIZ_SETS } from "@/lib/learning/quizzes";

export default function QuizIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#07649d]">Workout</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
          <ClipboardCheck className="h-8 w-8 text-[#1d2d5c]" />
          Accounting quizzes
        </h1>
        <p className="max-w-2xl text-slate-600">
          Choose a set, answer each question, then reveal the correct answer with a short explanation.
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/learning/practice" className="text-[#1d2d5c] hover:underline">
            ← Practice hub
          </Link>
          <Link href="/learning" className="text-slate-500 hover:underline">
            Learning Center
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUIZ_SETS.map((set) => (
          <Link
            key={set.id}
            href={`/learning/quiz/${set.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1d2d5c]/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#e7f0f5] px-3 py-1 text-xs font-semibold text-[#07649d]">
                {set.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" /> ~{set.minutes} min
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{set.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{set.description}</p>
            <p className="mt-4 flex items-center justify-between text-sm font-semibold text-[#1d2d5c]">
              <span>{set.questions.length} questions</span>
              <span className="inline-flex items-center gap-1">
                Start <ArrowRight className="h-4 w-4" />
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
