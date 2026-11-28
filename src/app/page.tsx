"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  Building2,
  UserRound,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type WorkspaceKind = "staff" | "client";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [workspace, setWorkspace] = useState<WorkspaceKind>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reg, setReg] = useState({ name: "", email: "", password: "", firmName: "" });

  const goAfterAuth = async (preferred: WorkspaceKind) => {
    const sess = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
    const role = (sess?.user?.role as string | undefined) || "";
    const isClient = role === "CLIENT";
    if (preferred === "client" && !isClient) setNotice("This account is a firm user. Opening the staff workspace.");
    if (preferred === "staff" && isClient) setNotice("This account is a client user. Opening the client portal.");
    router.push(isClient ? "/portal" : "/dashboard");
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        await goAfterAuth(workspace);
        return;
      }
      setError("Could not sign in. Please try again.");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reg, accountType: workspace }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      const login = await signIn("credentials", {
        email: reg.email.toLowerCase().trim(),
        password: reg.password,
        redirect: false,
      });
      if (login?.ok) {
        await goAfterAuth(workspace);
        return;
      }
      setNotice("Account created. Please sign in.");
      setTab("signin");
      setEmail(reg.email);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleMicrosoft = () => {
    setLoading(true);
    void signIn("azure-ad", {
      callbackUrl: workspace === "client" ? "/portal" : "/dashboard",
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 z-0 bg-slate-950">
        <video
          className="h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/sign-in-hero.mp4" type="video/mp4" />
          <source
            src="https://videos.pexels.com/video-files/18743334/18743334-hd_1920_1080_60fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-slate-950/40" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1600px] grid-cols-1 items-stretch gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:px-10 lg:py-5 xl:px-14">
        <section className="order-2 flex min-h-0 min-w-0 flex-col justify-end pb-2 text-center lg:order-1 lg:h-full lg:justify-end lg:pb-4 lg:text-left">
          <div className="mx-auto w-full max-w-2xl lg:mx-0">
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <Logo size={110} className="finova-logo-hero finova-logo-sway" />
              <p className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl">Finova</p>
            </div>
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white shadow-lg backdrop-blur-md sm:text-xs lg:mx-0">
              <Sparkles className="h-4 w-4 text-teal-200" />
              ACCOUNTING · AUDIT · AI
            </div>
            <h1 className="mt-3 text-[1.65rem] font-bold leading-[1.12] tracking-tight text-white drop-shadow-lg sm:text-4xl xl:text-[2.75rem]">
              The Smarter Side of <span className="text-teal-200">Finance.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/90 drop-shadow sm:text-[0.95rem] lg:mx-0">
              One connected workspace for accounting operations, financial reporting, audit workflows, and secure client collaboration.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {["Accounting", "Financial reporting", "Audit & assurance", "Client collaboration"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white/95 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="order-1 flex h-full min-h-0 items-center justify-center py-2 lg:order-2 lg:justify-end">
          <div className="finova-auth-card w-full max-w-[min(100%,360px)] max-h-[min(100dvh-1.25rem,920px)] overflow-y-auto rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-5">
            <div className="mb-3 flex justify-center">
              <Logo size={48} className="finova-logo-float finova-logo-glow" />
            </div>

            <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError(null);
                  setNotice(null);
                }}
                className={
                  "rounded-full py-2.5 text-sm font-semibold transition " +
                  (tab === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")
                }
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("create");
                  setError(null);
                  setNotice(null);
                }}
                className={
                  "rounded-full py-2.5 text-sm font-semibold transition " +
                  (tab === "create" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")
                }
              >
                Create account
              </button>
            </div>

            <h2 className="mt-3 text-center text-lg font-semibold tracking-tight text-slate-900">
              {tab === "signin" ? "Sign in to Finova" : "Create your workspace"}
            </h2>
            <p className="mt-1 text-center text-sm text-slate-500">
              {tab === "signin" ? "Secure firm workspace" : "Staff firm or client portal access"}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWorkspace("staff")}
                className={
                  "flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition " +
                  (workspace === "staff"
                    ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20"
                    : "border-slate-200 bg-white hover:border-slate-300")
                }
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Building2 className="h-4 w-4 text-teal-700" /> Staff
                </span>
                <span className="text-[11px] leading-snug text-slate-500">Accounting, close, audit</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspace("client")}
                className={
                  "flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition " +
                  (workspace === "client"
                    ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20"
                    : "border-slate-200 bg-white hover:border-slate-300")
                }
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <UserRound className="h-4 w-4 text-teal-700" /> Client
                </span>
                <span className="text-[11px] leading-snug text-slate-500">Documents & requests</span>
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {notice && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {notice}
              </div>
            )}

            {tab === "signin" ? (
              <form onSubmit={handleLogin} className="mt-3 space-y-3">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={workspace === "client" ? "client@acme.com" : "demo@finova.ai"}
                      className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3 pl-11 pr-11 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800 disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Enter workspace"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
                <p className="text-center text-[11px] text-slate-500">
                  Demo staff: demo@finova.ai · Demo client: client@acme.com
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-5 space-y-3">
                {(
                  [
                    ["name", "Full name", "text", "Jane Smith"],
                    [
                      "email",
                      "Work email",
                      "email",
                      workspace === "client" ? "you@company.com" : "jane@firm.com",
                    ],
                    ["password", "Password (12+ chars)", "password", "••••••••••••"],
                    [
                      "firmName",
                      workspace === "client" ? "Your company name" : "Firm name",
                      "text",
                      workspace === "client" ? "Acme Manufacturing" : "Smith & Co CPA",
                    ],
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
                  {loading
                    ? "Creating…"
                    : workspace === "client"
                      ? "Create client account"
                      : "Create firm account"}
                </button>
              </form>
            )}

            <div className="relative my-3">
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
        </div>
      </div>
    </div>
  );
}
