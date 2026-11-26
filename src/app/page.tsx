"use client";

import { useState } from "react";
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
  Building2,
  UserRound,
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F4FAF8]">
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden px-12 py-14 lg:flex xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#E8F5F1_0%,_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <Logo size={148} className="finova-logo-float finova-logo-glow drop-shadow-sm" />

          <div className="mt-8 inline-flex items-center gap-2 self-start rounded-full border border-teal-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-teal-800 shadow-sm">
            <Sparkles className="h-4 w-4" />
            ACCOUNTING · AUDIT · AI
          </div>

          <h1 className="mt-7 max-w-lg text-5xl font-semibold leading-[1.06] tracking-tight text-slate-900 xl:text-[3.35rem]">
            Accounting made{" "}
            <span className="text-teal-700">clear, calm, and capable.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            Books, statements, bank reconciliation, month-end close, audit PBC, and client
            collaboration — one elegant firm workspace.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            {[
              { icon: BarChart3, label: "Reporting" },
              { icon: Landmark, label: "Banking" },
              { icon: ClipboardCheck, label: "Close" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="finova-pill-float inline-flex items-center gap-2.5 rounded-full border border-white/90 bg-white/95 px-5 py-3 text-base font-semibold text-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="relative mt-10 max-w-xl overflow-hidden rounded-3xl border border-teal-100/80 bg-gradient-to-br from-white via-[#f0faf7] to-[#e7f5fb] p-5 shadow-[0_20px_50px_rgba(7,100,157,0.08)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                  Market pulse
                </p>
                <p className="text-sm font-medium text-slate-600">Calm performance view</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                +2.4%
              </span>
            </div>
            <svg
              viewBox="0 0 560 180"
              className="h-36 w-full"
              role="img"
              aria-label="Light stock graph illustration"
            >
              <defs>
                <linearGradient id="finovaGraphFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#36ac91" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#36ac91" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="finovaGraphStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#07649d" />
                  <stop offset="55%" stopColor="#36ac91" />
                  <stop offset="100%" stopColor="#00a4e4" />
                </linearGradient>
              </defs>
              <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 6" opacity="0.7">
                <line x1="0" y1="40" x2="560" y2="40" />
                <line x1="0" y1="80" x2="560" y2="80" />
                <line x1="0" y1="120" x2="560" y2="120" />
                <line x1="0" y1="160" x2="560" y2="160" />
              </g>
              <path
                d="M0,140 C40,132 70,150 100,118 C130,88 150,96 180,110 C210,124 230,70 270,78 C310,86 330,50 370,58 C410,66 440,36 480,42 C510,46 540,30 560,28 L560,180 L0,180 Z"
                fill="url(#finovaGraphFill)"
              />
              <path
                d="M0,140 C40,132 70,150 100,118 C130,88 150,96 180,110 C210,124 230,70 270,78 C310,86 330,50 370,58 C410,66 440,36 480,42 C510,46 540,30 560,28"
                fill="none"
                stroke="url(#finovaGraphStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="finova-graph-draw"
              />
              <circle cx="270" cy="78" r="5" fill="#fff" stroke="#36ac91" strokeWidth="2.5" />
              <circle cx="370" cy="58" r="5" fill="#fff" stroke="#07649d" strokeWidth="2.5" />
              <circle cx="560" cy="28" r="5" fill="#fff" stroke="#00a4e4" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        <p className="relative z-10 mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Finova
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px] rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.08)] sm:p-8">
          <div className="mb-5 flex justify-center lg:hidden">
            <Logo size={72} className="finova-logo-float finova-logo-glow" />
          </div>
          <div className="mb-6 flex justify-center">
            <Logo size={64} className="hidden finova-logo-float finova-logo-glow lg:block" />
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

          <h2 className="mt-6 text-center text-2xl font-semibold tracking-tight text-slate-900">
            {tab === "signin" ? "Sign in to Finova" : "Create your workspace"}
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            {tab === "signin" ? "Secure firm workspace" : "Staff firm or client portal access"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
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
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
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
                    className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
                    className="w-full rounded-2xl border border-slate-200 bg-[#F7FBFA] py-3.5 pl-11 pr-11 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800 disabled:opacity-60"
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
  );
}
