"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  Sparkles,
  FileStack,
  Wallet,
  CheckCircle2,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

const features = [
  { icon: Landmark, title: "Accounting workspace", text: "Keep entities, banking activity, journals, and close tasks connected." },
  { icon: BarChart3, title: "Financial reporting", text: "Turn trial balance information into useful financial and management reports." },
  { icon: ClipboardCheck, title: "Audit management", text: "Coordinate engagements, PBC requests, evidence, and reviewed workpapers." },
  { icon: FileStack, title: "Document control", text: "Organize client files, approvals, and supporting evidence in one place." },
  { icon: Sparkles, title: "AI-assisted work", text: "Get help with explanations, summaries, and first drafts while retaining human review." },
  { icon: ShieldCheck, title: "Governance & control", text: "Support clear ownership, review steps, and role-aware access." },
];

const metrics = [
  { label: "Cash position", value: "$482,600", note: "Illustrative preview", icon: Wallet },
  { label: "Open invoices", value: "42", note: "Across active clients", icon: FileStack },
  { label: "Close progress", value: "76%", note: "Current period", icon: CheckCircle2 },
  { label: "Due this week", value: "11", note: "Tasks to review", icon: Clock3 },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f6] text-[#172b3a]">
      <header className="sticky top-0 z-20 border-b border-[#e5eae7] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 lg:px-8">
          <Link href="/" aria-label="Finova home"><LogoWordmark /></Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/about" className="hidden text-slate-600 hover:text-[#087f68] md:inline">Platform</Link>
            <Link href="/learning" className="hidden text-slate-600 hover:text-[#087f68] md:inline">Learning</Link>
            <Link href="/faq" className="hidden text-slate-600 hover:text-[#087f68] md:inline">Help center</Link>
            <Link href="/login" className="rounded-xl bg-[#087f68] px-5 py-3 font-semibold text-white shadow-sm hover:bg-[#066b59]">Sign in <ArrowUpRight className="ml-1 inline h-4 w-4" /></Link>
          </nav>
        </div>
      </header>
      <section className="relative">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#dcefe8] blur-3xl" />
        <div className="pointer-events-none absolute -left-48 top-56 h-[420px] w-[420px] rounded-full bg-[#e8edf1] blur-3xl" />
        <div className="relative mx-auto grid max-w-[1380px] items-center gap-14 px-5 py-20 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cce5dc] bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#087f68]"><span className="h-2 w-2 rounded-full bg-[#16a37d]" /> Accounting · Audit · Finance</div>
            <h1 className="mt-7 text-[clamp(2.8rem,5.4vw,5.25rem)] font-semibold leading-[1.04] tracking-[-.055em] text-[#172b3a]">Clarity for every number. <span className="text-[#087f68]">Confidence in every close.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#60717a]">Finova brings accounting operations, financial reporting, audit coordination, and client collaboration into one thoughtful workspace.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-3 rounded-xl bg-[#087f68] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 hover:-translate-y-0.5 hover:bg-[#066b59]">Enter your workspace <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-[#d8e1dc] bg-white px-6 py-4 text-sm font-semibold text-[#344b58] hover:border-[#087f68]">Explore Finova <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#60717a]"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#087f68]" /> Role-aware workflows</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#087f68]" /> Human-reviewed outputs</span></div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-br from-[#d9eee5] via-white to-[#e6edf1] blur-xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-[#e1e9e4] bg-white p-4 shadow-[0_28px_90px_-38px_rgba(23,43,58,.32)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ee] pb-5">
                <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#81918e]">Workspace overview</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#172b3a]">Good morning, team</h2></div>
                <span className="rounded-full bg-[#e9f5ef] px-3 py-1.5 text-xs font-semibold text-[#087f68]">Illustrative preview</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {metrics.map(({ label, value, note, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#edf1ee] bg-[#fbfcfb] p-4"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#71817e]">{label}</span><Icon className="h-4 w-4 text-[#087f68]" /></div><p className="mt-3 text-2xl font-semibold tracking-tight text-[#172b3a]">{value}</p><p className="mt-1 text-[11px] text-[#91a09b]">{note}</p></div>)}
              </div>
              <div className="mt-4 rounded-2xl bg-[#172f3d] p-5 text-white">
                <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#a9c6bb]">Month-end close</p><p className="mt-1 text-lg font-semibold">April close checklist</p></div><span className="text-2xl font-semibold">76%</span></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[76%] rounded-full bg-[#65c6a3]" /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#c4d4ce]"><span>19 of 25 tasks complete</span><span>6 remaining</span></div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#edf1ee] p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f5ef] text-[#087f68]"><ClipboardCheck className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#263e4a]">Review queue</p><p className="mt-1 text-xs text-[#82918d]">Keep approvals and supporting evidence moving</p></div><ArrowUpRight className="h-4 w-4 text-[#087f68]" /></div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-[#e6ece8] bg-white">
        <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-9 sm:grid-cols-3 lg:px-8">
          {[
            ["One connected workspace", "Accounting, audit, and client collaboration"],
            ["Clear ownership", "Tasks, approvals, and review responsibilities"],
            ["Decisions with context", "Reports and evidence kept close together"],
          ].map(([title, description]) => <div key={title} className="border-l-2 border-[#9bcfba] pl-5"><p className="font-semibold text-[#263e4a]">{title}</p><p className="mt-1 text-sm text-[#7b8b87]">{description}</p></div>)}
        </div>
      </section>
      <section className="mx-auto max-w-[1380px] px-5 py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#087f68]">A connected finance platform</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-[#172b3a] sm:text-4xl">Designed around the work your team already does.</h2></div><p className="max-w-md text-sm leading-7 text-[#71817e]">Bring daily operations into a more organized experience, with clear workflows and people responsible for each decision.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="group rounded-2xl border border-[#e5ebe7] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#b7d8ca] hover:shadow-[0_18px_45px_-28px_rgba(23,43,58,.3)]"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5ef] text-[#087f68]"><Icon className="h-5 w-5" /></span><span className="text-xs font-semibold text-[#b3c1bb]">0{index + 1}</span></div><h3 className="mt-6 text-lg font-semibold text-[#263e4a]">{title}</h3><p className="mt-2 text-sm leading-7 text-[#71817e]">{text}</p></article>)}</div>
      </section>
      <section className="mx-5 mb-16 overflow-hidden rounded-[28px] bg-[#172f3d] px-7 py-12 text-white sm:px-12 lg:mx-auto lg:max-w-[1320px] lg:py-16"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-center"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#8fd3b6]">Make work flow</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A clearer view of your finance operations starts here.</h2><p className="mt-4 text-sm leading-7 text-[#c1d1cb]">Bring your team into one workspace for better visibility across the work that matters.</p></div><Link href="/login" className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[#8fd3b6] px-6 py-4 text-sm font-bold text-[#173a35] hover:bg-[#b0e2cb]">Sign in to Finova <ArrowUpRight className="h-4 w-4" /></Link></div></section>
      <footer className="border-t border-[#e5ebe7] bg-white px-5 py-8"><div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-4 text-sm text-[#81918e] sm:flex-row sm:items-center lg:px-3"><LogoWordmark /><p>Finova · Accounting, audit, and finance workflows.</p></div></footer>
    </main>
  );
}
