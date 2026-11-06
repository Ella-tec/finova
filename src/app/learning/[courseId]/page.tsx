
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";
import { getCourse } from "@/lib/learning/courses";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    notFound();
  }

  const lessonCount = Array.isArray(course.lessons)
    ? course.lessons.length
    : course.lessons;

  const duration = course.minutes ?? course.duration;
  const modules = course.modules ?? course.lessons;

  return (
    <div className="min-h-screen bg-isaca-light/40">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/">
            <LogoWordmark />
          </Link>

          <Link
            href="/learning"
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-isaca-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            All courses
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {course.level}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {duration} min · {lessonCount} lessons
            </span>
          </div>

          <h1 className="text-3xl font-bold text-isaca-dark">
            {course.title}
          </h1>

          <p className="mt-2 text-slate-600">
            {course.summary ?? course.description}
          </p>
        </div>

        <div className="divide-y rounded-2xl border bg-white">
          {modules.map((m, i) => {
            const moduleTitle =
              typeof m === "string" ? m : m.title;

            const moduleMinutes =
              typeof m === "string" ? undefined : m.minutes;

            return (
              <div
                key={`${i}-${moduleTitle}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-isaca-light/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-isaca-light text-sm font-semibold text-isaca-dark">
                    {i + 1}
                  </span>

                  <div>
                    <p className="font-medium text-slate-900">
                      {moduleTitle}
                    </p>

                    {moduleMinutes != null && (
                      <p className="text-xs text-slate-500">
                        {moduleMinutes} min
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-isaca-medium"
                >
                  <PlayCircle className="h-4 w-4" />
                  Open
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-isaca-medium/20 bg-isaca-light/50 p-5 text-sm text-slate-700">
          <p className="mb-1 font-medium text-isaca-dark">
            Practice in the product
          </p>

          <p>
            After each module, open the matching FinSphere screen
            (Close, Bank Rec, Samples, Audit/PBC, AI) and complete
            the checklist items listed in the course overview.
          </p>

          <Link
            href="/dashboard"
            className="mt-3 inline-block font-semibold text-isaca-medium hover:underline"
          >
            Go to Dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}
