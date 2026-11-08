import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, PlayCircle, ExternalLink, BookOpen } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";
import { getCourse } from "@/lib/learning/courses";
import { VideoLibrary } from "@/components/learning/VideoLibrary";

const VIDEO_LIBRARY = "https://quickbooks.intuit.com/learn-support/en-us/quickbooks-online/how-to-videos/";

function videoSearch(title: string, courseTitle: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`accounting tutorial ${title} ${courseTitle}`)}`;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/learning" aria-label="Back to all courses" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" aria-label="Finova home"><LogoWordmark /></Link>
          </div>
          <Link href="/learning" className="hidden items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700 sm:flex">
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-7 px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 via-slate-800 to-teal-800 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1">{course.level}</span>
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>
              <span className="rounded-full bg-white/15 px-3 py-1">{lessons.length} lessons</span>
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{course.summary || course.description}</p>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-9">
            <div className="flex items-center gap-2 text-sm text-slate-600"><BookOpen className="h-4 w-4 text-teal-700" /> Select a lesson and open a video walkthrough.</div>
            <a href={VIDEO_LIBRARY} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900">Official QuickBooks video library <ExternalLink className="h-4 w-4" /></a>
          </div>
        </section>

        <VideoLibrary courseTitle={course.title} />

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div><h2 className="text-xl font-semibold text-slate-900">Course lessons</h2><p className="mt-1 text-sm text-slate-500">Short, focused modules with related video examples.</p></div>
            <span className="text-xs font-medium text-slate-400">{lessons.length} lessons</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {lessons.map((lesson, index) => (
              <article key={lesson.id} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {lesson.minutes} min lesson</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={videoSearch(lesson.title, course.title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"><PlayCircle className="h-4 w-4" /> Find sample video</a>
                  <a href={VIDEO_LIBRARY} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800">Video tutorials <ExternalLink className="h-3.5 w-3.5" /></a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
