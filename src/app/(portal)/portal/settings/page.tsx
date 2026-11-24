"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Settings, Shield, Bell, User } from "lucide-react";

export default function PortalSettingsPage() {
  const { data: session } = useSession();
  const [notice, setNotice] = useState<string | null>(null);
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Settings</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Settings className="h-7 w-7 text-[#07649d]" /> Account preferences
        </h1>
      </header>

      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Profile</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3 border-b border-slate-100 py-2"><dt className="text-slate-500">Name</dt><dd className="font-medium">{session?.user?.name || "—"}</dd></div>
          <div className="flex justify-between gap-3 border-b border-slate-100 py-2"><dt className="text-slate-500">Email</dt><dd className="font-medium">{session?.user?.email || "—"}</dd></div>
          <div className="flex justify-between gap-3 py-2"><dt className="text-slate-500">Role</dt><dd className="font-medium">Client</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4" /> Notifications</h2>
        <label className="mt-3 flex items-center justify-between text-sm">
          <span>Email when the firm adds a request</span>
          <input type="checkbox" checked={emailOn} onChange={(e) => setEmailOn(e.target.checked)} />
        </label>
        <label className="mt-2 flex items-center justify-between text-sm">
          <span>SMS reminders for due dates</span>
          <input type="checkbox" checked={smsOn} onChange={(e) => setSmsOn(e.target.checked)} />
        </label>
        <button type="button" onClick={() => setNotice("Notification preferences saved for this session.")} className="mt-4 rounded-xl bg-[#1d2d5c] px-4 py-2 text-sm font-semibold text-white">
          Save preferences
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> Security</h2>
        <p className="mt-2 text-sm text-slate-600">
          Password changes and MFA are managed with your firm administrator. Sign out on shared devices when finished.
        </p>
      </section>
    </div>
  );
}
