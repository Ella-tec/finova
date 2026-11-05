"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  FileSearch,
  Eraser,
  BadgeCheck,
  Database,
} from "lucide-react";

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left — Enterprise Sign In */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex mb-10"><LogoWordmark /></Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Enterprise Sign In
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Secure access for accounting firms, auditors, and controllers
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
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
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 text-sm shadow-lg shadow-slate-300/40 transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-3 text-slate-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEntraIdLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-sm font-semibold text-slate-800 transition disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Sign in with Microsoft Entra ID
          </button>

          <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
            Multi-Factor Authentication (MFA) Required
            <br />
            Protected by Azure Sentinel
          </p>

          <p className="mt-8 text-center text-sm text-slate-500">
            New firm?{" "}
            <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Secure Document Gateway Pipeline */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/60 items-center justify-center p-12">
        {/* subtle network dots */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 max-w-md w-full">
          <h2 className="text-center text-lg font-semibold text-slate-700 mb-10">
            Secure Document Gateway Pipeline
          </h2>

          <div className="flex flex-col items-center gap-0">
            {[
              { icon: FileSearch, label: "File Scan", color: "from-teal-400 to-teal-600" },
              { icon: Eraser, label: "Redaction", color: "from-emerald-400 to-emerald-600" },
              { icon: BadgeCheck, label: "Compliance Check", color: "from-cyan-400 to-cyan-600" },
              { icon: Database, label: "Storage", color: "from-slate-500 to-slate-700" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex flex-col items-center">
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <div
                    className={`h-14 w-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-teal-200/50 ring-4 ring-white`}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-8 w-0.5 bg-gradient-to-b from-teal-300 to-teal-200 my-1 ml-[-8.5rem] self-center" />
                )}
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Every file passes scan → redaction → compliance → secure storage before AI or audit use.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
