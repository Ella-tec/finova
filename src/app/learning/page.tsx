"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
} from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";
import { COURSES, LEVELS, type LevelFilter } from "@/lib/learning/courses";

export default function LearningPage() {
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("All");

  const filtered = useMemo(() => {
    if (activeLevel === "All") return COURSES;
    return COURSES.filter((c) => c.level === activeLevel);
  }, [activeLevel]);

  return (
    <div className="min-h-screen bg-isaca-light/40">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <LogoWordmark />
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/faq" className="text-slate-600 hover:text-isaca-dark">
              FAQ
            </Link>
            <Link href="/dashboard" className="text-slate-600 hover:text-isaca-dark">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-isaca-dark flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-isaca-medium" />
            Learning Center
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Short, practical courses to help your team master Finova. Everything is
            focused on real accounting and audit work.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => {
            const isActive = activeLevel === level;
            const count =
              level === "All"
                ? COURSES.length
                : COURSES.filter((c) => c.level === level).length;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveLevel(level)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-isaca-medium text-white shadow-sm"
                    : "bg-white border text-slate-600 hover:border-isaca-medium/50 hover:text-isaca-dark"
                }`}
              >
                {level}
                <span
                  className={`ml-1.5 text-xs ${
                    isActive ? "text-white/80" : "text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/learning/${c.id}`}
              className="group rounded-2xl border bg-white p-5 shadow-sm hover:border-isaca-teal hover:shadow-md transition flex flex-col"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-isaca-light px-2 py-0.5 font-medium text-isaca-dark">
                  {c.level}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {c.duration}
                </span>
              </div>
              <h2 className="mt-3 font-semibold text-slate-900 group-hover:text-isaca-medium">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 flex-1">
                {c.description ?? c.summary}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {c.lessons.length} lessons
                </span>
                <span className="text-isaca-medium font-medium flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  Start
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">
            No courses in this category yet.
          </p>
        )}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-isaca-dark flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Start Checklist
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {[
              "Invite your first team members and assign roles",
              "Create a client and set up their document folders",
              "Import a trial balance and generate sample statements",
              "Run a practice month-end close checklist",
              "Create a sample PBC request and upload a test document",
              'Try the AI Assistant with "Prepare March close"',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-isaca-teal mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
