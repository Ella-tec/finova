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
  Shield,
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — form on soft ISACA light */}
      <div className="flex flex-col justify-center bg-[#f6f9fc] px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex">
            <LogoWordmark />
          </Link>

          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e7f0f5] px-3 py-1 text-xs font-semibold text-[#07649d]">
            <Shield className="h-3.5 w-3.5" />
            Secure firm workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#1d2d5c] sm:text-3xl">
            Sign in to Finova
          </h1>
          <p className="mt-2 text-sm text-[#52606d]">
            Accounting, audit, and client collaboration for modern firms
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1f2933]">
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52606d]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-xl border border-[#cbd2d9] bg-white py-3 pl-10 pr-4 text-sm text-[#1f2933] placeholder:text-[#9aa5b1] transition focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1f2933]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52606d]" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#cbd2d9] bg-white py-3 pl-10 pr-11 text-sm text-[#1f2933] placeholder:text-[#9aa5b1] transition focus:border-[#07649d] focus:outline-none focus:ring-2 focus:ring-[#00a4e4]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52606d] hover:text-[#1d2d5c]"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#1d2d5c] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1d2d5c]/25 transition hover:bg-[#162447] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#cbd2d9]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-[#f6f9fc] px-3 text-[#9aa5b1]">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEntraIdLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd2d9] bg-white py-3 text-sm font-semibold text-[#1f2933] transition hover:bg-[#e7f0f5] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Sign in with Microsoft Entra ID
          </button>

          <p className="mt-6 text-center text-xs leading-relaxed text-[#52606d]">
            MFA supported · Protected firm access
          </p>

          <p className="mt-8 text-center text-sm text-[#52606d]">
            New firm?{" "}
            <Link href="/register" className="font-semibold text-[#07649d] hover:text-[#1d2d5c]">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — ISACA navy brand story */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1d2d5c] via-[#07649d] to-[#36ac91] lg:flex lg:items-center lg:justify-center lg:p-12">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 w-full max-w-md text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8e6ff]">
            Finova platform
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">
            Accounting, audit & secure collaboration
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            One workspace for trial balance, statements, bank rec, month-end close,
            PBC requests, and AI-assisted document workflows.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: FileSearch, label: "File scan & intake" },
              { icon: Eraser, label: "Sanitize & redact" },
              { icon: BadgeCheck, label: "Compliance checks" },
              { icon: Database, label: "Secure firm storage" },
            ].map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{step.label}</span>
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
        <div className="flex min-h-screen items-center justify-center bg-[#f6f9fc] text-[#52606d]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
