import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";
import { getCourse } from "@/lib/learning/courses";
import { VideoLibrary } from "@/components/learning/VideoLibrary";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const modules =
    course.modules ??
    lessons.map((lesson) => ({
      title: lesson.title,
      minutes: lesson.minutes,
    }));

  return (
    <div className="min-h-screen bg-isaca-light/40">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/">
            <LogoWordmark />
          </Link>
          <Link
            href="/dashboard/learning"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-isaca-dark"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">{course.level}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {course.duration} · {lessons.length} lessons
            </span>
          </div>
          <h1 className="text-3xl font-bold text-isaca-dark">{course.title}</h1>
          <p className="mt-2 text-slate-600">{course.summary || course.description}</p>
        </div>

        {/* Free accounting video library — includes Accounting 1 (ACCT 121) 39-lesson tab */}
        <VideoLibrary courseTitle={course.title} />

        {course.outcomes && course.outcomes.length > 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">What you will learn</h2>
            <ul className="space-y-2">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-isaca-teal" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="divide-y rounded-2xl border bg-white">
          {modules.map((m, i) => (
            <details
              key={`${m.title}-${i}`}
              id={`module-${i + 1}`}
              className="group px-5 py-4 transition open:bg-isaca-light/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-isaca-medium">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-isaca-light text-sm font-semibold text-isaca-dark">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.minutes} min · Lesson overview</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-isaca-medium">
                  <PlayCircle className="h-4 w-4" /> View lesson
                </span>
              </summary>
              <div className="ml-11 mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-800">Learning objective</p>
                <p className="mt-1">
                  Understand {m.title.toLowerCase()} as part of {course.title.toLowerCase()}.
                </p>
                <p className="mt-3 font-semibold text-slate-800">Practice task</p>
                <p className="mt-1">
                  Use a clearly labeled practice dataset, document the steps you take, check the
                  result, and note any questions for review.
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="rounded-2xl border border-isaca-medium/20 bg-isaca-light/50 p-5 text-sm text-slate-700">
          <p className="mb-1 font-medium text-isaca-dark">Practice in the product</p>
          <p>
            After each module, open the matching Finova screen (Close, Bank Rec, Samples, Audit/PBC,
            Documents, Operations, or AI) and complete the checklist items listed in the course
            overview.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex font-semibold text-isaca-medium hover:underline">
              Go to Dashboard →
            </Link>
            <Link href="/dashboard/learning" className="inline-flex font-semibold text-slate-600 hover:underline">
              Back to all courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
