"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", firmName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/40 p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex mb-8"><LogoWordmark /></Link>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="text-2xl font-bold text-slate-900">Create your firm workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Set up your Finova accounting workspace.</p>
          {error && <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" />Account created.</div>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {[
              { key: "name", label: "Full name", type: "text", ph: "Jane Smith" },
              { key: "email", label: "Work email", type: "email", ph: "jane@firm.com" },
              { key: "password", label: "Password", type: "password", ph: "Min. 8 characters" },
              { key: "firmName", label: "Firm name (optional)", type: "text", ph: "Smith & Co CPA" },
            ].map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
                <input id={f.key} type={f.type} required={f.key !== "firmName"} minLength={f.key === "password" ? 8 : undefined}
                  value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.ph} className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30" />
              </div>
            ))}
            <button type="submit" disabled={loading || success} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60">
              {loading ? "Creating…" : "Create account"} {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
