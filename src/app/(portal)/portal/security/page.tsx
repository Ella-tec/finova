"use client";

import { useRef, useState } from "react";
import { Shield, Upload, Loader2, ScanSearch } from "lucide-react";

export default function PortalSecurityPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  const runScan = async (file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFileLabel(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/security/sanitize", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">File sanitizer</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Shield className="h-7 w-7 text-[#07649d]" /> Scan before you share
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Lightweight type, metadata, and PII pattern checks before firm storage or AI review.
        </p>
      </header>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void runScan(f);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"
      >
        <Upload className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 font-semibold text-slate-900">Drop a file or choose to scan</p>
        <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1d2d5c] px-5 py-2.5 text-sm font-semibold text-white">
          <ScanSearch className="h-4 w-4" /> Choose file
        </button>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void runScan(f); e.currentTarget.value = ""; }} />
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
          <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
        </div>
      )}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Scan results {fileLabel ? `· ${fileLabel}` : ""}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Classification</p>
              <p className="font-semibold">{result.classification || "—"}</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Storage gate</p>
              <p className="font-semibold">{result.safeToUpload ? "Allowed" : "Blocked"}</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Public AI gate</p>
              <p className="font-semibold">{result.safeForPublicAI ? "Allowed" : "Do not send"}</p>
            </div>
          </div>
          {Array.isArray(result.findings) && result.findings.length > 0 && (
            <ul className="mt-4 divide-y rounded-xl border">
              {result.findings.map((f: any, i: number) => (
                <li key={i} className="p-3 text-sm">
                  <span className="font-semibold">{f.severity}</span> — {f.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
