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
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-isaca-light/40">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <LogoWordmark />
          </Link>
          <Link
            href="/dashboard/learning"
            className="text-sm text-slate-600 hover:text-isaca-dark flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">{course.level}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.minutes} min · {course.lessons}{" "}
              lessons
            </span>
          </div>
          <h1 className="text-3xl font-bold text-isaca-dark">{course.title}</h1>
          <p className="mt-2 text-slate-600">{course.summary}</p>
        </div>

        <div className="rounded-2xl border bg-white divide-y">
          {course.modules.map((m, i) => (
            <details
              key={m.title}
              id={`module-${i + 1}`}
              className="group px-5 py-4 open:bg-isaca-light/20 transition"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-isaca-medium">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-isaca-light text-isaca-dark text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.minutes} min · Lesson overview</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-isaca-medium flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" /> View lesson
                </span>
              </summary>
              <div className="ml-11 mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-800">Learning objective</p>
                <p className="mt-1">Understand {m.title.toLowerCase()} as part of {course.title.toLowerCase()}.</p>
                <p className="mt-3 font-semibold text-slate-800">Practice task</p>
                <p className="mt-1">Use a clearly labeled practice dataset, document the steps you take, check the result, and note any questions for review.</p>
              </div>
            </details>
          ))}
        </div>

        <div className="rounded-2xl border border-isaca-medium/20 bg-isaca-light/50 p-5 text-sm text-slate-700">
          <p className="font-medium text-isaca-dark mb-1">Practice in the product</p>
          <p>
            After each module, open the matching Finova screen (Close, Bank Rec, Samples,
            Audit/PBC, AI) and complete the checklist items listed in the course overview.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-3 font-semibold text-isaca-medium hover:underline"
          >
            Go to Dashboard →
          </Link>
        </div>
      </main>
    </div>
  );
}
