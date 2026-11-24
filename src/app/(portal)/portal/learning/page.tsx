"use client";

import Link from "next/link";
import { BookOpen, FileText, GraduationCap, HelpCircle } from "lucide-react";

const courses = [
  { title: "Getting started with the client portal", blurb: "Upload, respond to requests, and message your firm." },
  { title: "Documents your accountant usually needs", blurb: "Bank statements, invoices, payroll, and tax packs." },
  { title: "Preparing for an audit PBC list", blurb: "How to respond cleanly and on time." },
  { title: "Reading basic financial statements", blurb: "Plain-language walkthrough of BS, P&L, and cash flow." },
];

export default function PortalLearningPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Learning center</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <GraduationCap className="h-7 w-7 text-[#07649d]" /> Guides for clients
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <article key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="h-5 w-5 text-[#07649d]" />
            <h2 className="mt-3 font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/faq" className="rounded-2xl border bg-white p-4 shadow-sm hover:border-[#07649d]/40">
          <HelpCircle className="h-5 w-5 text-[#07649d]" />
          <p className="mt-2 font-semibold">FAQs</p>
        </Link>
        <Link href="/guide" className="rounded-2xl border bg-white p-4 shadow-sm hover:border-[#07649d]/40">
          <FileText className="h-5 w-5 text-[#07649d]" />
          <p className="mt-2 font-semibold">App guide</p>
        </Link>
        <Link href="/learning" className="rounded-2xl border bg-white p-4 shadow-sm hover:border-[#07649d]/40">
          <GraduationCap className="h-5 w-5 text-[#07649d]" />
          <p className="mt-2 font-semibold">Full learning site</p>
        </Link>
      </div>
    </div>
  );
}
