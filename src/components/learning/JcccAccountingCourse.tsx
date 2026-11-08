"use client";

import { useState } from "react";
import { BookOpen, ExternalLink, PlayCircle, Clock } from "lucide-react";

const PLAYLIST_ID = "PL259DBFA47F3B4761";

const LESSONS = [
  "Introduction to Class",
  "Basic Accounting Concepts",
  "Transaction Analysis",
  "Intro to Financial Statements",
  "Financial Statements",
  "Intro to Debits and Credits",
  "Debits and Credits",
  "Journal Entries and the Trial Balance",
  "Analyzing and Recording Transactions",
  "Wrapping Up Chapters 1 and 2",
  "Adjusting Journal Entries",
  "Adjusting Journal Entries",
  "Adjusting Journal Entries",
  "Intro to Closing Journal Entries",
  "Closing Journal Entries",
  "Closing Journal Entries Conclusion",
  "Accounting Basics For Merchandisers",
  "Purchase Cycle Journal Entries",
  "Sales Cycle Journal Entries",
  "Merchandising Operations Conclusion",
  "Inventory Methods - FIFO, LIFO",
  "Inventory Methods - Weighted Average, Specific ID",
  "Inventory Methods - Continued Discussion",
  "Inventory Methods - Conclusion",
  "Internal Control",
  "Internal Control and Petty Cash",
  "Bank Reconciliations",
  "Bank Reconciliations",
  "Receivables and Bad Debt",
  "The Allowance Methods for Bad Debt Expense",
  "The Allowance Methods for Bad Debt Expense (continued)",
  "Accounts Receivable Conclusion",
  "Intro to Fixed Assets",
  "Intro to Fixed Assets",
  "Continuation of Fixed Assets",
  "Fixed Assets Conclusion",
  "Current Liabilities",
  "Current Liabilities",
  "Class Conclusion",
];

export function JcccAccountingCourse() {
  const [selected, setSelected] = useState(0);
  const title = `Accounting 1 Program ${selected + 1} - ${LESSONS[selected]}`;

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-isaca-medium">Free recorded course · JCCC</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><BookOpen className="h-6 w-6 text-isaca-medium" />Accounting 1 (ACCT 121)</h2>
          <p className="mt-1 text-sm text-slate-600">Recorded Fall 2011 · Johnson County Community College · 39 lessons</p>
        </div>
        <a href={`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-isaca-medium hover:underline">Open full YouTube playlist <ExternalLink className="h-4 w-4" /></a>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.85fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
          <div className="aspect-video">
            <iframe
              key={selected}
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/videoseries?list=${PLAYLIST_ID}&index=${selected}&rel=0`}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-isaca-medium">Now selected · Lesson {selected + 1} of 39</p>
            <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">Playback is provided by the original YouTube playlist. If embedding is unavailable, open the playlist on YouTube.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Course lessons</h3><span className="text-xs text-slate-500">39 videos</span></div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {LESSONS.map((lesson, index) => (
              <button key={index} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selected === index ? "border-isaca-medium bg-isaca-light/60 ring-1 ring-isaca-medium/20" : "border-slate-200 bg-white hover:border-isaca-medium/50 hover:bg-slate-50"}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-isaca-light text-xs font-bold text-isaca-dark">{index + 1}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">Program {index + 1}: {lesson}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> Recorded lecture</span></span>
                <PlayCircle className="h-4 w-4 shrink-0 text-isaca-medium" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs leading-5 text-slate-500">Course videos remain hosted by JCCCvideo / the original YouTube publisher. Finova links to and embeds the playlist; it does not download or re-host the videos.</p>
    </section>
  );
}
