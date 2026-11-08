"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ListChecks,
  Eye,
  X,
  FileText,
  ScanSearch,
  LockKeyhole,
  RefreshCw,
  Download,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SANITIZER_PLAYBOOK, type SanitizeResult } from "@/lib/security/sanitizer";

type StoredDocument = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: string;
  folder?: { name: string } | null;
};

const severityStyle: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-sky-50 text-sky-800 border-sky-100",
};

type Tab = "original" | "findings" | "sanitized";

function isTextPreview(fileName: string, mimeType: string) {
  const ext = fileName.toLowerCase().split(".").pop();
  return mimeType.startsWith("text/") || ["csv", "txt", "json", "xml", "md"].includes(ext || "");
}
function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export default function SecuritySanitizerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [textHint, setTextHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SanitizeResult | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanTime, setScanTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("findings");

  const loadDocuments = async () => {
    const response = await fetch("/api/documents", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    }
  };
  useEffect(() => {
    void loadDocuments();
  }, []);

  const scanStored = async (doc: StoredDocument) => {
    setScanningId(doc.id);
    setFileLabel(doc.fileName);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/security/sanitize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      setResult(data.result);
      setActiveTab("findings");
      setScanTime(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanningId(null);
    }
  };

  const runScan = async (file?: File | null) => {
    if (!file && !textHint.trim()) {
      setError("Choose a file or enter text before starting a scan.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setScanTime(null);
    if (file) {
      setSelectedFile(file);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setPreviewText(
        isTextPreview(file.name, file.type) ? await file.text().catch(() => null) : null
      );
    }
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (textHint.trim()) fd.append("textHint", textHint.trim());
      if (!file) {
        fd.append("fileName", "pasted-text.txt");
        fd.append("mimeType", "text/plain");
      }
      const res = await fetch("/api/security/sanitize", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Scan request failed (${res.status}).`);
      if (!data.result) throw new Error("The scan endpoint returned no scan report.");
      setResult(data.result as SanitizeResult);
      setFileLabel(file?.name || "Pasted text");
      setScanTime(new Date().toLocaleString());
      setActiveTab("findings");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The scan failed unexpectedly.");
    } finally {
      setLoading(false);
    }
  };

  const downloadOriginal = () => {
    if (!previewUrl || !selectedFile) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
    { id: "original", label: "Original file", icon: Eye },
    { id: "findings", label: "Scan findings", icon: ScanSearch },
    { id: "sanitized", label: "Sanitized copy", icon: LockKeyhole },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Shield className="h-7 w-7 text-isaca-medium" />
          File Sanitizer
        </h1>
        <p className="mt-1 text-slate-600">
          Scan files before firm storage or AI — malware-style type checks, PII hints,
          classification, public-AI gate
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Documents already uploaded</h2>
            <p className="text-sm text-slate-500">
              Preview, open, or scan a document from your Documents workspace.
            </p>
          </div>
          <button onClick={() => void loadDocuments()} className="rounded-lg border px-3 py-2 text-sm">
            Refresh
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No uploaded documents found. Upload files in Documents first.
          </p>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {(doc.size / 1024).toFixed(1)} KB · {doc.status}
                    {doc.folder ? " · " + doc.folder.name : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPreview(doc)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  <a
                    href={"/api/documents/" + doc.id + "?download=1"}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Open / download
                  </a>
                  <button
                    disabled={scanningId === doc.id}
                    onClick={() => void scanStored(doc)}
                    className="rounded-lg bg-isaca-medium px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {scanningId === doc.id ? "Scanning…" : "Scan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{preview.fileName}</h3>
                <p className="text-xs text-slate-500">{preview.mimeType}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="rounded-lg border p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-[55vh] flex-1 bg-slate-100 p-3">
              {preview.mimeType.startsWith("image/") ? (
                <img
                  src={"/api/documents/" + preview.id}
                  alt={preview.fileName}
                  className="mx-auto max-h-[70vh] max-w-full object-contain"
                />
              ) : preview.mimeType === "application/pdf" ? (
                <iframe
                  title={preview.fileName}
                  src={"/api/documents/" + preview.id}
                  className="h-[70vh] w-full bg-white"
                />
              ) : (
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-white p-8 text-center">
                  <FileText className="h-12 w-12 text-cyan-700" />
                  <p className="font-medium">Preview is not available for this file type.</p>
                  <a
                    href={"/api/documents/" + preview.id + "?preview=1"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Open preview
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <button
                onClick={() => {
                  const doc = preview;
                  setPreview(null);
                  void scanStored(doc);
                }}
                className="rounded-lg bg-isaca-medium px-3 py-2 text-sm font-semibold text-white"
              >
                Scan this document
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void runScan(f);
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-5 py-9 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-semibold text-slate-800">Drop a file here or choose a file to scan</p>
          <p className="mt-1 text-sm text-slate-500">PDF, Office, CSV, TXT and images · maximum 25 MB</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-isaca-medium px-5 py-2.5 text-sm font-semibold text-white hover:bg-isaca-dark"
          >
            <Upload className="h-4 w-4" /> Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.png,.jpg,.jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void runScan(f);
              e.currentTarget.value = "";
            }}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="text-hint" className="text-sm font-medium text-slate-700">
            Optional text / OCR extract for deeper PII checks
          </label>
          <textarea
            id="text-hint"
            value={textHint}
            onChange={(e) => setTextHint(e.target.value)}
            rows={3}
            placeholder="Paste invoice text, email body, or CSV extract…"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || !textHint.trim()}
              onClick={() => void runScan(null)}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              Scan pasted text
            </button>
            {selectedFile && (
              <span className="text-sm text-slate-500">
                Selected: <strong className="text-slate-700">{selectedFile.name}</strong>
              </span>
            )}
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <strong>Action failed:</strong> {error}
          </div>
        )}
        {loading && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
            <Loader2 className="h-4 w-4 animate-spin" /> Scan in progress. Keep this page open until
            the report is returned.
          </div>
        )}
      </div>

      {result && (
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">File review workspace</h2>
              <p className="mt-1 text-xs text-slate-500">
                {fileLabel || "Current file"}
                {scanTime ? ` · Scanned ${scanTime}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => (selectedFile ? void runScan(selectedFile) : void runScan(null))}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Run scan again
            </button>
          </div>
          <div className="flex flex-wrap gap-2 border-b bg-slate-50 px-4 pt-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold",
                    activeTab === tab.id
                      ? "border-slate-200 bg-white text-emerald-800"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "original" && (
            <div className="p-5">
              {!previewUrl ? (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No original file is attached to this text-only scan.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <FileText className="h-5 w-5 text-emerald-700" /> {selectedFile?.name}
                    </div>
                    <button
                      onClick={downloadOriginal}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" /> Download original
                    </button>
                  </div>
                  <div className="min-h-64 overflow-auto rounded-xl border bg-slate-50 p-3">
                    {selectedFile && isImage(selectedFile.type) ? (
                      <img
                        src={previewUrl}
                        alt={selectedFile.name}
                        className="mx-auto max-h-[65vh] max-w-full object-contain"
                      />
                    ) : selectedFile?.type === "application/pdf" ||
                      selectedFile?.name.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        title={selectedFile.name}
                        src={previewUrl}
                        className="h-[70vh] w-full bg-white"
                      />
                    ) : previewText !== null ? (
                      <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap break-words text-xs text-slate-800">
                        {previewText}
                      </pre>
                    ) : (
                      <div className="mx-auto max-w-xl py-12 text-center">
                        <FileWarning className="mx-auto h-10 w-10 text-amber-600" />
                        <p className="mt-3 font-semibold text-slate-800">
                          In-app preview is not available for this format
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Download the original file and open it with its compatible application.
                        </p>
                        <button
                          onClick={downloadOriginal}
                          className="mt-4 rounded-full bg-isaca-medium px-4 py-2 text-sm font-semibold text-white"
                        >
                          Download original
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "findings" && (
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    result.safeToUpload
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Finova storage gate
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    {result.safeToUpload ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-700" />
                    )}
                    {result.safeToUpload ? "Allowed by current checks" : "Blocked by current checks"}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    result.safeForPublicAI
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Public AI gate
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    {result.safeForPublicAI ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                    )}
                    {result.safeForPublicAI
                      ? "Allowed by current checks"
                      : "Do not send to public AI"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Classification
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{result.classification}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
                  File type: {result.fileTypeOk ? "Accepted by extension/MIME checks" : "Rejected"}
                </span>
                <span className="rounded-full border bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
                  Findings: {result.findings.length}
                </span>
                <span className="rounded-full border bg-slate-50 px-3 py-1.5 font-semibold text-slate-700">
                  PII categories: {result.piiHits.length}
                </span>
              </div>

              {result.piiHits.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-red-900">
                    <AlertTriangle className="h-4 w-4" /> Possible sensitive data detected
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-800">
                    {result.piiHits.map((p) => (
                      <li key={p.type}>
                        {p.type}: {p.count} hit(s)
                        {p.sample ? ` · masked example: ${p.sample}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border">
                <div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                  Detailed findings
                </div>
                {result.findings.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">No findings reported for this scan.</p>
                ) : (
                  <ul className="divide-y">
                    {result.findings.map((f, i) => (
                      <li key={i} className="flex gap-3 p-4 text-sm">
                        <span
                          className={cn(
                            "h-fit shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                            severityStyle[f.severity] || severityStyle.info
                          )}
                        >
                          {f.severity}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">{f.title || f.message}</p>
                          {f.message && f.title && (
                            <p className="mt-1 text-slate-600">{f.message}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {SANITIZER_PLAYBOOK?.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <ListChecks className="h-4 w-4" /> Recommended next steps
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {SANITIZER_PLAYBOOK.slice(0, 6).map((step, i) => (
                      <li key={i}>{typeof step === "string" ? step : String(step)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "sanitized" && (
            <div className="space-y-3 p-5">
              <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Sanitized copy generation is limited in this build. Use the findings tab to decide
                  whether the original may be stored or sent to AI, then download the original if
                  approved.
                </p>
              </div>
              {previewUrl && selectedFile && (
                <button
                  onClick={downloadOriginal}
                  className="inline-flex items-center gap-2 rounded-full bg-isaca-medium px-4 py-2 text-sm font-semibold text-white"
                >
                  <Download className="h-4 w-4" /> Download original
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
