"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { HANDS_ON } from "@/lib/learning/exercises";

export default function ExercisesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f766e]">Hands-on</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
          <ClipboardList className="h-8 w-8 text-[#0f766e]" />
          Accounting exercises
        </h1>
        <p className="max-w-2xl text-slate-600">
          Work through structured labs with steps, materials, and solution tips — paper or spreadsheet.
        </p>
        <Link href="/learning/practice" className="text-sm font-semibold text-[#1d2d5c] hover:underline">
          ← Practice hub
        </Link>
      </header>

      <div className="space-y-5">
        {HANDS_ON.map((ex) => (
          <article
            key={ex.id}
            id={ex.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                {ex.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" /> {ex.minutes} min
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{ex.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{ex.goal}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Materials</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {ex.materials.map((m) => (
                    <li key={m} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Solution tips</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {ex.solutionTips.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <ol className="mt-5 space-y-3">
              {ex.steps.map((s, i) => (
                <li key={s.title} className="rounded-2xl bg-[#f4f7fb] px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {s.title || `Step ${i + 1}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{s.detail}</p>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}
