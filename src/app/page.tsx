"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Landmark, ClipboardCheck, Sparkles, FileStack, BarChart3 } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

const features = [
  { icon: Landmark, title: "Accounting workspace", text: "Organize financial activity, banking, entities, and monthly close work." },
  { icon: BarChart3, title: "Financial reporting", text: "Move from trial balance data to clear statements and management views." },
  { icon: ClipboardCheck, title: "Audit management", text: "Coordinate engagements, PBC requests, evidence, and workpaper reviews." },
  { icon: FileStack, title: "Document intelligence", text: "Centralize files and use assisted extraction with a review step." },
  { icon: Sparkles, title: "AI copilot", text: "Get workflow guidance and draft assistance while keeping people in control." },
  { icon: ShieldCheck, title: "Security & governance", text: "Use role-aware access, secure document handling, and activity visibility." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/"><LogoWordmark /></Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/about" className="hidden text-slate-600 hover:text-isaca-medium sm:inline">About</Link>
            <Link href="/faq" className="hidden text-slate-600 hover:text-isaca-medium sm:inline">FAQ</Link>
            <Link href="/learning" className="hidden text-slate-600 hover:text-isaca-medium sm:inline">Learning</Link>
            <Link href="/login" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Sign in</Link>
          </nav>
        </div>
      </header>
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/50 to-sky-50 px-5 py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800">ACCOUNTING • AUDIT • FINANCE</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Your finance work, <span className="text-emerald-700">connected.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Finova brings accounting operations, financial reporting, audit workflows, document management, and client collaboration into one organized workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#14324F] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4564]">Open Finova <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/about" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Explore platform</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between border-b pb-4"><div><p className="text-sm font-semibold text-slate-900">Workspace snapshot</p><p className="mt-1 text-xs text-slate-500">Illustrative dashboard preview</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">FINOVA</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[["Cash position","$482.6K"],["Open invoices","42"],["Close progress","76%"],["Audit requests","11"]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
            </div>
            <div className="mt-4 rounded-xl bg-[#14324F] p-4 text-white"><p className="text-sm font-semibold">One workflow. Clear ownership.</p><p className="mt-1 text-xs text-slate-200">Review activity, assign work, and keep supporting documents connected.</p></div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Platform capabilities</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Built around the work finance teams do every day.</h2><p className="mt-3 text-slate-600">A shared experience for accountants, controllers, audit teams, administrators, and client users.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({icon:Icon,title,text}) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
      </section>
      <footer className="border-t bg-white px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row"><LogoWordmark /><p>Finova — accounting, audit, and finance workflows.</p></div></footer>
    </main>
  );
}
