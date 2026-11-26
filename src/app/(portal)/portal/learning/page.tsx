"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  Clock,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { COURSES, LEVELS, type LevelFilter } from "@/lib/learning/courses";
import { VideoLibrary } from "@/components/learning/VideoLibrary";

export default function PortalLearningPage() {
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("All");

  const filtered = useMemo(() => {
    if (activeLevel === "All") return COURSES;
    return COURSES.filter((c) => c.level === activeLevel);
  }, [activeLevel]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#07649d]">
            Learn & grow
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <GraduationCap className="h-8 w-8 text-[#1d2d5c]" />
            Learning Center
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            The same practical Finova curriculum as staff: accounting foundations,
            documents, bank activity, month-end awareness, audit readiness, and
            secure collaboration with your firm.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-900">{COURSES.length} courses</span>
          <span className="mx-2 text-slate-300">•</span>
          Self-paced learning
        </div>
      </div>

      <VideoLibrary />

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
                  ? "bg-[#1d2d5c] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#1d2d5c]/40 hover:text-[#1d2d5c]"
              }`}
            >
              {level}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => (
          <Link
            key={course.id}
            href={`/learning/${course.id}`}
            className="group flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1d2d5c]/35 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#e7f0f5] px-3 py-1 text-xs font-semibold text-[#07649d]">
                {course.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {course.duration ?? `${course.minutes} min`}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-[#1d2d5c]">
              {course.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.summary}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">{course.lessons.length} lessons</span>
              <span className="flex items-center gap-1 font-semibold text-[#1d2d5c]">
                Start course <PlayCircle className="h-4 w-4" />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white py-10 text-center text-slate-500">
          No courses match this filter.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-[#f4f7fb] to-[#e7f0f5] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1d2d5c]" />
          <h2 className="font-semibold text-slate-900">Quick start path</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          New to Finova? Start with Getting Started, then Documents and secure file
          habits, then audit readiness so PBC requests move faster with your firm.
        </p>
        <Link
          href="/learning/getting-started"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162447]"
        >
          Begin learning <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
