"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import { getCourse } from "@/lib/learning/courses";
import { LogoWordmark } from "@/components/brand/Logo";

export default function CoursePage() {
  const params = useParams();
  const id = String(params.courseId || "");
  const course = getCourse(id);
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Course not found.</p>
        <Link href="/learning" className="text-isaca-medium font-medium">
          ← Learning Center
        </Link>
      </div>
    );
  }

  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completed / course.lessons.length) * 100);

  return (
    <div className="min-h-screen bg-isaca-light/40">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <LogoWordmark />
          </Link>
          <Link href="/learning" className="text-sm text-slate-600 hover:text-isaca-dark flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Courses
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-xs font-medium text-isaca-medium uppercase tracking-wide">
            {course.level} · {course.duration}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-isaca-dark flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-isaca-medium" />
            {course.title}
          </h1>
          <p className="mt-2 text-slate-600">{course.description}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Progress</span>
            <span className="text-isaca-medium font-semibold">
              {completed}/{course.lessons.length} · {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-isaca-medium to-isaca-teal transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-slate-900 mb-3">You will learn</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {course.outcomes.map((o) => (
              <li key={o} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-isaca-teal shrink-0 mt-0.5" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white divide-y shadow-sm">
          <div className="px-5 py-3 font-semibold text-slate-900">Lessons</div>
          {course.lessons.map((lesson, i) => {
            const isDone = !!done[lesson.id];
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setDone((d) => ({ ...d, [lesson.id]: !d[lesson.id] }))}
                className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-isaca-light/50 transition"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-isaca-teal shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>
                    {i + 1}. {lesson.title}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.minutes} min
                </span>
                <PlayCircle className="h-4 w-4 text-isaca-medium" />
              </button>
            );
          })}
        </div>

        {pct === 100 && (
          <div className="rounded-xl border border-isaca-teal/40 bg-isaca-light/60 p-5 text-center">
            <p className="font-semibold text-isaca-dark">Course complete</p>
            <p className="text-sm text-slate-600 mt-1">
              Practice next in the app: Sample Library, Close, or Bank Rec.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Link
                href="/dashboard/samples"
                className="rounded-lg bg-isaca-medium px-3 py-1.5 text-sm text-white font-medium"
              >
                Sample Library
              </Link>
              <Link
                href="/dashboard/close"
                className="rounded-lg border bg-white px-3 py-1.5 text-sm font-medium"
              >
                Month-End Close
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
