"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  Sparkles,
  FileStack,
  Wallet,
  CheckCircle2,
  Clock3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

const features = [
  {
    icon: Landmark,
    title: "Accounting workspace",
    text: "Entities, banking, journals, and close tasks in one place.",
  },
  {
    icon: BarChart3,
    title: "Financial reporting",
    text: "Trial Balance → Journals → Income Statement → Balance Sheet → Cash Flow.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit & PBC",
    text: "Request evidence, track status, and keep an auditable history.",
  },
  {
    icon: FileStack,
    title: "Document control",
    text: "Upload, sanitize, review, and download client files securely.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted work",
    text: "Drafts and analysis with human approval before posting.",
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    text: "Roles, MFA-ready sign-in, and clear ownership of each step.",
  },
];

const metrics = [
  { label: "Cash position", value: "$482,600", note: "Illustrative", icon: Wallet },
  { label: "Open invoices", value: "42", note: "Active clients", icon: FileStack },
  { label: "Close progress", value: "76%", note: "Current period", icon: CheckCircle2 },
  { label: "Due this week", value: "11", note: "Tasks", icon: Clock3 },
];

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
    <main className="min-h-screen overflow-hidden bg-[#f4f7fb] text-[#1f2933]">
      <header className="sticky top-0 z-20 border-b border-[#d7e3ec] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Finova home">
            <LogoWordmark />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#features" className="hidden text-slate-600 hover:text-[#07649d] md:inline">
              Features
            </a>
            <a href="#sign-in" className="rounded-xl bg-[#1d2d5c] px-4 py-2.5 font-semibold text-white hover:bg-[#162447]">
              Sign in
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5dceb] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07649d]">
            Accounting · Audit · Finance
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#1d2d5c] sm:text-5xl">
            Clarity for every number.
            <span className="block text-[#07649d]">Confidence in every close.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Finova connects trial balance, journals, financial statements, bank reconciliation,
            month-end close, PBC requests, and secure document workflows in one firm workspace.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#36ac91]" /> Full statement process with upload &
              download
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#36ac91]" /> Sample companies & audit documents
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#36ac91]" /> Role-aware access for staff and clients
            </li>
          </ul>
        </div>

        {/* Sign in on the same page */}
        <div id="sign-in" className="rounded-3xl border border-[#d7e3ec] bg-white p-6 shadow-xl shadow-[#1d2d5c]/10 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Secure access</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1d2d5c]">Sign in to Finova</h2>
          <p className="mt-1 text-sm text-slate-500">Firm staff and client portal users</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="home-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Work email
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
                  placeholder="demo@finova.ai"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/30"
                />
              </div>
            </div>
            <div>
              <label htmlFor="home-password" className="mb-1.5 block text-sm font-medium text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Prefer a dedicated page?{" "}
            <Link href="/login" className="font-semibold text-[#07649d] hover:underline">
              Open full sign-in
            </Link>
          </p>
        </div>
      </section>

      <section className="border-y border-[#d7e3ec] bg-white">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-[#e7f0f5] bg-[#f8fbfd] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <Icon className="h-4 w-4 text-[#07649d]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#1d2d5c]">{value}</p>
              <p className="text-[11px] text-slate-400">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-[#1d2d5c]">Built for modern finance teams</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          From daily books to audit evidence — with clear buttons to upload, review, and download at
          every step.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#e7f0f5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f0f5] text-[#07649d]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-[#1d2d5c]">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#d7e3ec] bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
          <LogoWordmark />
          <p>Finova · Accounting, audit, and finance workflows.</p>
        </div>
      </footer>
    </main>
  );
}
