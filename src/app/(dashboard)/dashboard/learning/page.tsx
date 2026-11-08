import Link from "next/link";
import { BookOpen, PlayCircle, Clock, GraduationCap, ArrowRight } from "lucide-react";
import { COURSES } from "@/lib/learning/courses";
import { VideoLibrary } from "@/components/learning/VideoLibrary";
import { JcccAccountingCourse } from "@/components/learning/JcccAccountingCourse";

export default function DashboardLearningPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-isaca-medium">Learn & grow</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900"><GraduationCap className="h-8 w-8 text-isaca-medium" />Learning Center</h1><p className="mt-2 max-w-2xl text-slate-600">Practical courses for accounting, reconciliation, month-end close, audit, and secure client collaboration.</p></div>
        <div className="rounded-xl border bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"><span className="font-semibold text-slate-900">{COURSES.length} courses</span><span className="mx-2 text-slate-300">•</span>Self-paced learning</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {COURSES.map((course) => (
          <Link key={course.id} href={`/learning/${course.id}`} className="surface-hover group flex min-h-[220px] flex-col rounded-2xl border bg-white p-5 shadow-sm hover:border-isaca-medium/50">
            <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-isaca-light px-3 py-1 text-xs font-semibold text-isaca-dark">{course.level}</span><span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" />{course.duration}</span></div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-isaca-medium">{course.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.description}</p>
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm"><span className="text-slate-500">{course.lessons.length} lessons</span><span className="flex items-center gap-1 font-semibold text-isaca-medium">Start course <PlayCircle className="h-4 w-4" /><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
          </Link>
        ))}
      </div>
      <JcccAccountingCourse />
      <VideoLibrary />
      <section className="rounded-2xl border bg-gradient-to-br from-white to-isaca-light/60 p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-isaca-medium" /><h2 className="font-semibold text-slate-900">Quick start path</h2></div><p className="mt-2 text-sm text-slate-600">New to Finova? Start with Getting Started, then take Bank Reconciliation and Month-End Close to follow a typical accounting workflow.</p><Link href="/learning/getting-started" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:brightness-110">Begin learning <ArrowRight className="h-4 w-4" /></Link></section>
    </div>
  );
}
