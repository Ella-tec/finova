"use client";

import { useRef, useState } from "react";
import {
  Shield,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SANITIZER_PLAYBOOK, type SanitizeResult } from "@/lib/security/sanitizer";

const severityStyle: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-50 text-sky-800 border-sky-100",
};

export default function SecuritySanitizerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [textHint, setTextHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SanitizeResult | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async (file?: File | null) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (file) {
        setFileLabel(file.name);
        const fd = new FormData();
        fd.append("file", file);
        if (textHint) fd.append("textHint", textHint);
        const res = await fetch("/api/security/sanitize", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Scan failed");
        setResult(data.result);
      } else {
        // Text-only scan
        const res = await fetch("/api/security/sanitize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: "paste.txt",
            mimeType: "text/plain",
            size: textHint.length,
            textContent: textHint,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Scan failed");
        setFileLabel("pasted text");
        setResult(data.result);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="h-7 w-7 text-isaca-medium" />
          File Sanitizer
        </h1>
        <p className="text-slate-600 mt-1">
          Scan files before firm storage or AI — malware-style type checks, PII hints, classification, public-AI gate
        </p>
      </div>

      {/* Simple upload */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) runScan(f);
          }}
          className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-fin-400 transition"
        >
          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="font-medium text-slate-700">Drop a file or click to scan</p>
          <p className="text-sm text-slate-500 mt-1">PDF, Office, CSV, images — no executables</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => runScan(e.target.files?.[0])}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Optional: paste text / OCR extract for deeper PII scan
          </label>
          <textarea
            value={textHint}
            onChange={(e) => setTextHint(e.target.value)}
            rows={4}
            placeholder="Paste invoice text, email body, or CSV snippet…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <button
            type="button"
            disabled={loading || !textHint.trim()}
            onClick={() => runScan(null)}
            className="mt-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Scan pasted text only
          </button>
        </div>

        {loading && (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border",
                result.safeToUpload
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              )}
            >
              {result.safeToUpload ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {result.safeToUpload ? "OK for Finova upload" : "Block / fix before upload"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border",
                result.safeForPublicAI
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              )}
            >
              {result.safeForPublicAI ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {result.safeForPublicAI ? "May use public AI with care" : "Not for public ChatGPT-style tools"}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-sm font-semibold">
              {result.classification}
            </span>
          </div>

          {fileLabel && (
            <p className="text-sm text-slate-500">
              Scanned: <span className="font-medium text-slate-800">{fileLabel}</span>
              {result.cleanedFileName !== fileLabel && (
                <> · safe name: <code className="text-xs bg-slate-100 px-1 rounded">{result.cleanedFileName}</code></>
              )}
            </p>
          )}

          {result.suggestedActions.length > 0 && (
            <div className="rounded-xl border border-isaca-light bg-isaca-light p-4">
              <h3 className="text-sm font-semibold text-fin-900 mb-2">What to do next</h3>
              <ul className="space-y-1 text-sm text-isaca-dark">
                {result.suggestedActions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {result.piiHits.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Possible sensitive data</h3>
              <ul className="text-sm text-red-800 space-y-1">
                {result.piiHits.map((p) => (
                  <li key={p.type}>
                    {p.type}: {p.count} hit(s)
                    {p.sample ? ` (e.g. ${p.sample})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border bg-white shadow-sm divide-y">
            {result.findings.map((f, i) => (
              <div key={i} className="px-4 py-3 flex gap-3 text-sm">
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium h-fit", severityStyle[f.severity])}>
                  {f.severity}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{f.message}</p>
                  {f.recommendation && <p className="text-slate-600 mt-0.5">{f.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playbook */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <ListChecks className="h-5 w-5 text-isaca-medium" />
          Extra enterprise ideas (beyond this scanner)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SANITIZER_PLAYBOOK.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="font-medium text-sm text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600 mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 flex items-start gap-1">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          This built-in scanner is a first line of defense for accounting teams. Pair with Microsoft Defender,
          Purview DLP, and CDR gateways for production.
        </p>
      </div>
    </div>
  );
}
