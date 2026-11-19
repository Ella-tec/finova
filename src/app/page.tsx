"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-[#0c1222] text-white">
      {/* Ambient luxury backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#07649d]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-[#c4a35a]/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <LogoWordmark light />
          <a
            href="#sign-in"
            className="text-sm font-medium tracking-wide text-white/70 transition hover:text-[#e8d5a3]"
          >
            Sign in
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e8d5a3]">
            Private firm workspace
          </p>
          <h1 className="mt-6 max-w-xl font-serif text-4xl leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Precision for
            <span className="block text-[#e8d5a3]">every engagement.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/55">
            Accounting, audit, and client collaboration — designed with quiet confidence.
          </p>

          <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
            {[
              { k: "Close", v: "End-to-end" },
              { k: "Audit", v: "PBC ready" },
              { k: "Reports", v: "TB → CF" },
            ].map((item) => (
              <div key={item.k}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{item.k}</p>
                <p className="mt-1 text-sm font-medium text-[#e8d5a3]">{item.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="sign-in"
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <h2 className="font-serif text-2xl text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-white/45">Sign in to your firm</p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="home-email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="home-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#e8d5a3]/50 focus:ring-1 focus:ring-[#e8d5a3]/30"
                />
              </div>
            </div>
            <div>
              <label htmlFor="home-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="home-password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#e8d5a3]/50 focus:ring-1 focus:ring-[#e8d5a3]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c4a35a] to-[#e8d5a3] py-3.5 text-sm font-semibold text-[#0c1222] transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Enter workspace"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/30">
            Protected firm access
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-[11px] tracking-wide text-white/25">
        Finova · Accounting excellence
      </footer>
    </main>
  );
}
