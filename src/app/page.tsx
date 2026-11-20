"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Landmark,
  ClipboardCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function FinovaMark({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect width="80" height="80" rx="22" fill="#0F766E" />
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
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #0f766e 1.5px, transparent 1.5px), radial-gradient(circle at 80% 40%, #0f766e 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute -left-24 -top-20 h-[460px] w-[460px] rounded-full bg-[#CDEADF] blur-3xl opacity-80" />
      <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] rounded-full bg-[#D7E8F5] blur-3xl opacity-70" />

      <header className="relative z-20 border-b border-teal-900/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <FinovaMark className="h-12 w-12 rounded-2xl shadow-md shadow-teal-900/10" />
            <span className="text-xl font-semibold tracking-tight text-slate-900">Finova</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/guide" className="hidden text-slate-600 hover:text-teal-700 sm:inline">
              App Guide
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-teal-700 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-12 px-5 py-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div className="text-center lg:text-left">
          <div className="mb-8 flex justify-center lg:justify-start">
            <FinovaMark className="h-28 w-28 rounded-[28px] shadow-2xl shadow-teal-900/15" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Accounting · Audit · AI
          </div>

          <h1 className="mt-6 text-[clamp(2.4rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-slate-900">
            Accounting made
            <span className="block text-teal-700">clear, calm, and capable.</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-600 lg:max-w-lg">
            Books, statements, bank reconciliation, month-end close, audit PBC, and client collaboration — one elegant firm workspace.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {[
              { icon: BarChart3, label: "Reporting" },
              { icon: Landmark, label: "Banking" },
              { icon: ClipboardCheck, label: "Close" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                <Icon className="h-4 w-4 text-teal-700" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] sm:p-8">
          <div className="mb-5 flex justify-center">
            <FinovaMark className="h-16 w-16 rounded-[18px] shadow-lg shadow-teal-900/10" />
          </div>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">Sign in to Finova</h2>
          <p className="mt-2 text-center text-sm text-slate-500">Secure firm workspace</p>

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
                  className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
                  className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-11 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Enter workspace"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 border-t border-teal-900/5 bg-white/60 py-6 text-center text-sm text-slate-500">
        Finova · Modern accounting, audit, and finance workflows
      </footer>
    </main>
  );
}
