"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  TrendingUp,
  PieChart,
  Wallet,
  Shield,
} from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
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
    <main className="min-h-screen bg-[#f0f4f8]">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <LogoWordmark />
          <a
            href="#sign-in"
            className="rounded-lg bg-[#1d2d5c] px-3.5 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        {/* Left — short message + visuals */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07649d]">
            Finance · Audit · Close
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#1d2d5c] sm:text-5xl">
            Numbers clear.
            <br />
            <span className="text-[#07649d]">Close faster.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-500">
            Books, statements, and client work — one calm workspace.
          </p>

          {/* Finance visual cards */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#1d2d5c] to-[#07649d] p-4 text-white shadow-lg">
              <Wallet className="h-5 w-5 text-[#a8e6ff]" />
              <p className="mt-6 text-2xl font-bold">$4.2M</p>
              <p className="text-xs text-white/70">Cash position</p>
              <div className="mt-3 flex h-8 items-end gap-1">
                {[40, 55, 35, 70, 50, 80, 65].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm bg-white/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#d7e3ec] bg-white p-4 shadow-sm">
              <TrendingUp className="h-5 w-5 text-[#36ac91]" />
              <p className="mt-6 text-2xl font-bold text-[#1d2d5c]">+12%</p>
              <p className="text-xs text-slate-500">Revenue trend</p>
              <svg viewBox="0 0 120 36" className="mt-3 w-full text-[#36ac91]" aria-hidden>
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  points="0,28 20,22 40,24 60,14 80,16 100,8 120,10"
                />
              </svg>
            </div>
            <div className="rounded-2xl border border-[#d7e3ec] bg-white p-4 shadow-sm">
              <PieChart className="h-5 w-5 text-[#07649d]" />
              <p className="mt-6 text-2xl font-bold text-[#1d2d5c]">76%</p>
              <p className="text-xs text-slate-500">Month-end close</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[76%] rounded-full bg-[#07649d]" />
              </div>
            </div>
            <div className="rounded-2xl border border-[#d7e3ec] bg-white p-4 shadow-sm">
              <Shield className="h-5 w-5 text-[#6cb33f]" />
              <p className="mt-6 text-2xl font-bold text-[#1d2d5c]">Secure</p>
              <p className="text-xs text-slate-500">Roles · MFA ready</p>
              <div className="mt-3 flex gap-1">
                {["TB", "P&L", "BS", "CF"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-[#e7f0f5] px-2 py-1 text-[10px] font-bold text-[#07649d]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — sign in only */}
        <div
          id="sign-in"
          className="rounded-3xl border border-[#d7e3ec] bg-white p-7 shadow-xl shadow-[#1d2d5c]/8"
        >
          <h2 className="text-xl font-bold text-[#1d2d5c]">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Your firm workspace</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="home-email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/25"
                />
              </div>
            </div>
            <div>
              <label htmlFor="home-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d2d5c] py-3 text-sm font-semibold text-white hover:bg-[#162447] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#d7e3ec] py-6 text-center text-xs text-slate-400">
        Finova
      </footer>
    </main>
  );
}
