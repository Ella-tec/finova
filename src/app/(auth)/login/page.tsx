"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  FileSpreadsheet,
  Landmark,
  ShieldCheck,
  BookOpen,
  TrendingUp,
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "CredentialsSignin"
      ? "Invalid email or password"
      : errorParam
        ? "Authentication failed. Please try again."
        : null
  );

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleEntraIdLogin = () => {
    setLoading(true);
    signIn("azure-ad", { callbackUrl });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F7F8F5]">
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#E8F5F1_0%,_transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-3 mb-10">
            <FinovaMark className="h-14 w-14 shadow-lg shadow-teal-900/10 rounded-[18px]" />
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">Finova</p>
              <p className="text-xs font-medium tracking-[0.14em] uppercase text-teal-700">
                Accounting · Audit · AI
              </p>
            </div>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Sign in to your firm workspace
          </h1>
          <p className="mt-3 text-slate-500 text-[15px] leading-relaxed">
            Clear books. Confident close. Secure collaboration for modern finance teams.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1f2933]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600/25 focus:border-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 text-sm shadow-lg shadow-teal-900/15 transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#cbd2d9]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-[#F7F8F5] px-3 text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEntraIdLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to FINOVA?{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>

          <p className="mt-8 text-center text-sm text-slate-500">
            Need help?{" "}
            <Link href="/guide" className="font-semibold text-teal-700 hover:text-teal-800">
              App Guide
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-white via-[#EEF7F3] to-[#E4F0EA] items-center justify-center p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-emerald-100/80 blur-3xl" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex justify-center mb-8">
            <FinovaMark className="h-24 w-24 shadow-xl shadow-teal-900/10 rounded-[28px]" />
          </div>

          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-800">
            Finance, close and audit — one workspace
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Trial balance to statements, bank rec, month-end close, PBC, and client collaboration.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: FileSpreadsheet, title: "Statements", text: "TB → P&L → BS → CF" },
              { icon: Landmark, title: "Banking", text: "Reconcile & lock" },
              { icon: BookOpen, title: "Close", text: "Checklists & approvals" },
              { icon: ShieldCheck, title: "Audit", text: "PBC & workpapers" },
              { icon: BarChart3, title: "Reporting", text: "Firm-ready views" },
              { icon: TrendingUp, title: "AI assist", text: "Drafts you approve" },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8F5] text-slate-500">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
