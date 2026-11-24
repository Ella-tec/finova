"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, Video, Users, History } from "lucide-react";

const people = [
  { name: "Sarah Controller", role: "Controller", email: "controller@finova.ai", phone: "+1 (816) 555-0142" },
  { name: "Demo Accountant", role: "Staff Accountant", email: "demo@finova.ai", phone: "+1 (816) 555-0198" },
  { name: "James Partner", role: "Partner", email: "partner@finova.ai", phone: "+1 (816) 555-0110" },
];

export default function PortalContactPage() {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Contact professionals</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Your firm team</h1>
        <p className="mt-1 text-sm text-slate-600">Directory, messaging, and call shortcuts for collaboration.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {people.map((p) => (
          <article key={p.email} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f0f5] text-[#1d2d5c]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{p.name}</h2>
                <p className="text-sm text-slate-500">{p.role}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Mail className="h-3.5 w-3.5" /> Email</a>
              <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Phone className="h-3.5 w-3.5" /> Voice</a>
              <a href={`sms:${p.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><MessageSquare className="h-3.5 w-3.5" /> SMS</a>
              <button type="button" onClick={() => setSent(`Video request noted for ${p.name}. Your firm can schedule a secure call.`)} className="inline-flex items-center gap-1 rounded-lg bg-[#1d2d5c] px-3 py-2 text-xs font-semibold text-white">
                <Video className="h-3.5 w-3.5" /> Video call
              </button>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900"><History className="h-4 w-4" /> Message your firm</h2>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Describe what you need help with…" className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <button
          type="button"
          onClick={() => {
            if (!note.trim()) return;
            setSent("Message recorded for your engagement team.");
            setNote("");
          }}
          className="mt-3 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Send note
        </button>
        {sent && <p className="mt-3 text-sm text-emerald-800">{sent}</p>}
      </section>
    </div>
  );
}
