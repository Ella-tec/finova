import Link from "next/link";
import { LogoWordmark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-isaca-light/50 px-4">
      <LogoWordmark />
      <h1 className="mt-8 text-4xl font-bold text-isaca-dark">404</h1>
      <p className="mt-2 text-slate-600">This page could not be found.</p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
