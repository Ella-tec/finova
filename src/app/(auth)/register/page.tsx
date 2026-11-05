"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

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
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/40 p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            Fin<span className="text-teal-700">Sphere</span>
            <span className="text-amber-600"> AI</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="text-2xl font-bold text-slate-900">Create your firm workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Simple setup — start closing and collaborating in minutes</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Account created — redirecting to sign in…
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {[
              { key: "name", label: "Full name", type: "text", ph: "Jane Smith" },
              { key: "email", label: "Work email", type: "email", ph: "jane@firm.com" },
              { key: "password", label: "Password", type: "password", ph: "Min. 8 characters" },
              { key: "firmName", label: "Firm name (optional)", type: "text", ph: "Smith & Co CPA" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  required={f.key !== "firmName"}
                  minLength={f.key === "password" ? 8 : undefined}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.ph}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 text-sm disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
