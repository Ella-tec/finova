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
  PieChart,
  Calculator,
  LineChart,
  Building2,
  Sparkles,
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
    <main className="relative min-h-screen overflow-hidden bg-[#F3F8F6] text-slate-900">
      {/* Soft teal accounting pattern wash */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #0f766e 1.5px, transparent 1.5px), radial-gradient(circle at 80% 40%, #0f766e 1px, transparent 1px), radial-gradient(circle at 40% 80%, #0f766e 1.2px, transparent 1.2px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute -left-24 -top-20 h-[460px] w-[460px] rounded-full bg-[#CDEADF] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] rounded-full bg-[#D7E8F5] blur-3xl opacity-60" />

      <header className="relative z-20 border-b border-teal-900/5 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <FinovaMark className="h-11 w-11 rounded-2xl shadow-md shadow-teal-900/10" />
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">Finova</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                Accounting · Audit · AI
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/guide" className="hidden text-slate-600 hover:text-teal-700 sm:inline">
              App Guide
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-teal-700 px-4 py-2.5 font-semibold text-white shadow-sm shadow-teal-900/10 hover:bg-teal-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
        {/* Left: modern finance story */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Modern finance workspace
          </div>

          <h1 className="mt-6 text-[clamp(2.5rem,4.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-900">
            Accounting made
            <span className="block bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              clear, calm, and capable.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600">
            Books, statements, bank reconciliation, month-end close, audit PBC, and client collaboration — in one elegant firm workspace.
          </p>

          {/* Big finance visual card inspired by charts + knowledge */}
          <div className="mt-8 overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_40px_100px_-48px_rgba(15,118,110,0.45)]">
            <div className="relative bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#155E75] p-6 text-white sm:p-7">
              <div className="absolute inset-0 opacity-20">
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                  }}
                />
              </div>

              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                    <BookOpen className="h-7 w-7 text-teal-50" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100">
                      Finance intelligence
                    </p>
                    <p className="text-lg font-semibold tracking-tight">Trial balance → statements → close</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-teal-50 ring-1 ring-white/20">
                  Firm-ready
                </span>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Cash", value: "$4.2M", icon: Wallet },
                  { label: "Close", value: "76%", icon: ClipboardCheck },
                  { label: "Invoices", value: "42", icon: FileSpreadsheet },
                  { label: "PBC", value: "11", icon: ShieldCheck },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-teal-100">{label}</span>
                      <Icon className="h-3.5 w-3.5 text-teal-100" />
                    </div>
                    <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  { icon: PieChart, title: "Statements", text: "TB · P&L · BS · CF" },
                  { icon: Calculator, title: "Bank Rec", text: "Match · review · lock" },
                  { icon: LineChart, title: "Reporting", text: "KPIs & close views" },
                ].map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-5 w-5 text-teal-50" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-teal-100/90">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-100 bg-white p-4 sm:grid-cols-3">
              {[
                { icon: Landmark, title: "Banking" },
                { icon: Building2, title: "Entities" },
                { icon: TrendingUp, title: "Insights" },
              ].map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-[#F7FBFA] px-3 py-2.5"
                >
                  <Icon className="h-4 w-4 text-teal-700" />
                  <span className="text-sm font-medium text-slate-700">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: elegant sign-in */}
        <div className="rounded-[32px] border border-white bg-white/95 p-6 shadow-[0_40px_100px_-50px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="mb-6 flex justify-center">
            <FinovaMark className="h-[72px] w-[72px] rounded-[22px] shadow-xl shadow-teal-900/15" />
          </div>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to Finova
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Secure workspace for accountants, auditors, and controllers
          </p>

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
                  className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
                  className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-11 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:from-teal-800 hover:to-teal-700 disabled:opacity-60"
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
              <div key={label} className="rounded-xl border border-slate-100 bg-[#F7FBFA] px-2 py-3">
                <Icon className="mx-auto h-4 w-4 text-teal-700" />
                <p className="mt-1 text-[11px] font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-teal-900/5 bg-white/70 py-6 text-center text-sm text-slate-500">
        Finova · Modern accounting, audit, and finance workflows
      </footer>
    </main>
  );
}
