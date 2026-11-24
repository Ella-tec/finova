"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Shield, Upload, Loader2, CheckCircle2, AlertTriangle, XCircle, Info,
  ListChecks, Eye, X, FileText, ScanSearch, LockKeyhole, RefreshCw, Download, FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SANITIZER_PLAYBOOK, type SanitizeResult } from "@/lib/security/sanitizer";

type ClientOption = { id: string; name: string };
type StoredDocument = {
  id: string; fileName: string; mimeType: string; size: number; status: string;
  folder?: { name: string } | null;
};

export default function SecuritySanitizerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SanitizeResult | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientMessage, setClientMessage] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [textHint, setTextHint] = useState("");

  const loadDocuments = useCallback(async (selectedClientId: string) => {
    if (!selectedClientId) { setDocuments([]); setLoadingDocuments(false); return; }
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/documents?clientId=${encodeURIComponent(selectedClientId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load client documents.");
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load client documents.");
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    setClientMessage(null);
    try {
      const response = await fetch("/api/clients", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load authorized client workspaces.");
      const rows: ClientOption[] = Array.isArray(data.clients) ? data.clients : [];
      setClients(rows);
      if (rows.length === 0) {
        setClientId("");
        setDocuments([]);
        setClientMessage("No client workspaces are assigned to this account. Run seed and sign in as demo@finova.ai.");
      } else {
        setClientId((current) =>
          current && rows.some((client) => client.id === current) ? current : rows[0].id
        );
        setClientMessage(null);
      }
    } catch (err) {
      setClients([]);
      setClientId("");
      setDocuments([]);
      setClientMessage(err instanceof Error ? err.message : "Could not load client workspaces.");
    } finally {
      setLoadingClients(false);
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => { void loadClients(); }, [loadClients]);
  useEffect(() => {
    if (clientId) void loadDocuments(clientId);
    else { setDocuments([]); setLoadingDocuments(false); }
  }, [clientId, loadDocuments]);

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
      setResult(data.result as SanitizeResult);
      setFileLabel(file?.name || "Pasted text");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The scan failed unexpectedly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Shield className="h-7 w-7 text-[#07649d]" /> File Sanitizer
        </h1>
        <p className="mt-1 text-slate-600">Scan files before firm storage or AI analysis.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Documents already uploaded</h2>
            <p className="text-sm text-slate-500">Select a client, then preview or scan.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Client workspace
              <select
                aria-label="Client workspace"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                disabled={clients.length === 0}
                className="mt-1 block min-w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">{clients.length ? "Select a client" : "No client workspaces"}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => void loadClients()} disabled={loadingClients} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <RefreshCw className={cn("h-4 w-4", loadingClients && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {loadingClients || loadingDocuments ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading clients and documents…</p>
        ) : !clientId ? (
          <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
            {clientMessage || "Select an authorized client workspace."}
          </div>
        ) : documents.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No uploaded documents for this client. Upload files in Documents first.</p>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB · {doc.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreview(doc)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><Eye className="h-4 w-4" /> Preview</button>
                  <a href={`/api/documents/${doc.id}?download=1`} className="rounded-lg border px-3 py-2 text-sm">Open / download</a>
                  <button type="button" disabled={scanningId === doc.id} onClick={() => void scanStored(doc)} className="rounded-lg bg-[#1d2d5c] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {scanningId === doc.id ? "Scanning…" : "Scan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void runScan(f); }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-5 py-9 text-center hover:border-[#07649d]"
        >
          <Upload className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-semibold text-slate-800">Drop a file here or choose a file to scan</p>
          <p className="mt-1 text-sm text-slate-500">PDF, Office, CSV, TXT and images</p>
          <input ref={inputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) void runScan(f); e.currentTarget.value = ""; }} />
        </div>
        <textarea value={textHint} onChange={(e) => setTextHint(e.target.value)} rows={3} placeholder="Optional text for PII checks…" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <button type="button" disabled={loading || !textHint.trim()} onClick={() => void runScan(null)} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />} Scan pasted text
        </button>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      </div>

      {result && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Scan findings {fileLabel ? `· ${fileLabel}` : ""}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className={cn("rounded-xl border p-4", result.safeToUpload ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
              <p className="text-xs font-semibold uppercase text-slate-500">Storage gate</p>
              <p className="mt-1 flex items-center gap-2 font-semibold">{result.safeToUpload ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <XCircle className="h-4 w-4 text-red-700" />}{result.safeToUpload ? "Allowed" : "Blocked"}</p>
            </div>
            <div className={cn("rounded-xl border p-4", result.safeForPublicAI ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
              <p className="text-xs font-semibold uppercase text-slate-500">Public AI gate</p>
              <p className="mt-1 flex items-center gap-2 font-semibold">{result.safeForPublicAI ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <AlertTriangle className="h-4 w-4 text-amber-700" />}{result.safeForPublicAI ? "Allowed" : "Do not send to public AI"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Classification</p>
              <p className="mt-1 font-semibold">{result.classification}</p>
            </div>
          </div>
          {result.findings?.length > 0 && (
            <ul className="mt-4 divide-y rounded-xl border">
              {result.findings.map((f, i) => (
                <li key={i} className="p-3 text-sm"><span className="font-semibold">{f.severity}</span> — {f.message}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="truncate font-semibold">{preview.fileName}</h3>
              <button type="button" onClick={() => setPreview(null)} className="rounded-lg border p-2"><X className="h-4 w-4" /></button>
            </div>
            <div className="min-h-[55vh] flex-1 bg-slate-100 p-3">
              {preview.mimeType.startsWith("image/") ? (
                <img src={`/api/documents/${preview.id}`} alt={preview.fileName} className="mx-auto max-h-[70vh] max-w-full object-contain" />
              ) : preview.mimeType === "application/pdf" ? (
                <iframe title={preview.fileName} src={`/api/documents/${preview.id}`} className="h-[70vh] w-full bg-white" />
              ) : (
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-white p-8 text-center">
                  <FileText className="h-12 w-12 text-[#07649d]" />
                  <a href={`/api/documents/${preview.id}?download=1`} className="rounded-lg border px-3 py-2 text-sm">Download</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
