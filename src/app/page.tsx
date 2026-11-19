"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  FileSpreadsheet,
  Wallet,
  BookOpen,
  TrendingUp,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

function FinovaMark({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect width="80" height="80" rx="20" fill="#0F766E" />
      <path
        d="M22 52V28h10.5c6.2 0 10.2 3.2 10.2 8.1 0 3.2-1.7 5.7-4.6 6.9L46 52h-8.2l-6.6-8.4H30V52H22zm8-13.2h2.4c2.6 0 4.1-1.2 4.1-3.2s-1.5-3.1-4.1-3.1H30v6.3z"
        fill="white"
      />
      <path d="M48 52V28h14v6.2H56v3.6h5.2v5.6H56V52h-8z" fill="white" opacity="0.92" />
      <circle cx="62" cy="22" r="5" fill="#99F6E4" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7F5] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#D8EFE6] blur-3xl opacity-80" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-[#E8EEF5] blur-3xl opacity-70" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#F0EADF] blur-3xl opacity-50" />
      </div>

      <header className="relative z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <FinovaMark className="h-10 w-10 rounded-xl shadow-md shadow-teal-900/10" />
            <span className="text-lg font-semibold tracking-tight text-slate-900">Finova</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/guide" className="hidden text-slate-600 hover:text-teal-700 sm:inline">
              App Guide
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-teal-700 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
            Accounting · Audit · AI
          </div>
          <h1 className="mt-5 text-[clamp(2.4rem,4.5vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-slate-900">
            Clarity for every number.
            <span className="block text-teal-700">Confidence in every close.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
            One light, modern workspace for books, statements, bank rec, month-end close, audit PBC, and client collaboration.
          </p>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_30px_80px_-40px_rgba(15,118,110,0.35)]">
            <div className="bg-gradient-to-br from-teal-50 via-white to-slate-50 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FinovaMark className="h-12 w-12 rounded-2xl shadow-md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Finance overview</p>
                    <p className="text-sm font-semibold text-slate-800">Illustrative firm dashboard</p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">Live style</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Cash", value: "$4.2M", icon: Wallet },
                  { label: "Close", value: "76%", icon: ClipboardCheck },
                  { label: "Invoices", value: "42", icon: FileSpreadsheet },
                  { label: "PBC", value: "11", icon: ShieldCheck },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">{label}</span>
                      <Icon className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Landmark, title: "Bank Rec", text: "Match & lock" },
                  { icon: BookOpen, title: "Statements", text: "TB → CF" },
                  { icon: TrendingUp, title: "Reporting", text: "Firm views" },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 px-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="mb-6 flex justify-center">
            <FinovaMark className="h-16 w-16 rounded-[20px] shadow-lg shadow-teal-900/10" />
          </div>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">Sign in to Finova</h2>
          <p className="mt-2 text-center text-sm text-slate-500">Secure firm workspace for accountants and auditors</p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="home-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@finova.ai"
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FAF9] py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor="home-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FAF9] py-3.5 pl-11 pr-11 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Enter workspace"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: BarChart3, label: "Reports" },
              { icon: Landmark, label: "Banking" },
              { icon: ClipboardCheck, label: "Close" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-[#F8FAF9] px-2 py-3">
                <Icon className="mx-auto h-4 w-4 text-teal-700" />
                <p className="mt-1 text-[11px] font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/70 bg-white/60 py-6 text-center text-sm text-slate-500">
        Finova · Accounting, audit and finance workflows
      </footer>
    </main>
  );
}
