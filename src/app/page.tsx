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
  UserPlus,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reg, setReg] = useState({ name: "", email: "", password: "", firmName: "" });

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reg),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      const login = await signIn("credentials", {
        email: reg.email.toLowerCase().trim(),
        password: reg.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (login?.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setTab("signin");
      setEmail(reg.email);
      setError("Account created. Please sign in.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  const handleMicrosoft = () => {
    setLoading(true);
    setError(null);
    void signIn("azure-ad", { callbackUrl: "/dashboard" });
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
            <Logo size={44} className="rounded-2xl shadow-md shadow-teal-900/10" />
            <span className="text-xl font-semibold tracking-tight text-slate-900">Finova</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-full bg-teal-700 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-teal-800">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-12 px-5 py-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div className="text-center lg:text-left">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Logo size={112} className="rounded-[28px] shadow-2xl shadow-teal-900/15" />
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
            <Logo size={56} className="rounded-[18px] shadow-lg shadow-teal-900/10" />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setError(null);
              }}
              className={
                "rounded-xl py-2.5 text-sm font-semibold transition " +
                (tab === "signin" ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-700")
              }
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("create");
                setError(null);
              }}
              className={
                "rounded-xl py-2.5 text-sm font-semibold transition " +
                (tab === "create" ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-700")
              }
            >
              Create account
            </button>
          </div>

          <h2 className="text-center text-xl font-semibold tracking-tight text-slate-900">
            {tab === "signin" ? "Sign in to Finova" : "Create your workspace"}
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            {tab === "signin" ? "Secure firm workspace" : "You become the firm administrator"}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {tab === "signin" ? (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
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
          ) : (
            <form onSubmit={handleRegister} className="mt-5 space-y-3">
              {(
                [
                  ["name", "Full name", "text", "Jane Smith"],
                  ["email", "Work email", "email", "jane@firm.com"],
                  ["password", "Password (12+ chars)", "password", "••••••••••••"],
                  ["firmName", "Firm name", "text", "Smith & Co CPA"],
                ] as const
              ).map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    type={type}
                    required
                    minLength={key === "password" ? 12 : 2}
                    value={reg[key]}
                    onChange={(e) => setReg({ ...reg, [key]: e.target.value })}
                    placeholder={ph}
                    className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-teal-800 disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-3 text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMicrosoft}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Microsoft works when Azure AD is configured on the server.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-teal-900/5 bg-white/60 py-6 text-center text-sm text-slate-500">
        Finova · Modern accounting, audit, and finance workflows
      </footer>
    </main>
  );
}
