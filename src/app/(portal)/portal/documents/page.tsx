"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, Loader2, FolderOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

type Doc = {
  id: string;
  fileName: string;
  size: number;
  status: string;
  createdAt: string;
  folder?: { name: string } | null;
};

export default function PortalDocumentsPage() {
  const { data: session, status } = useSession();
  const clientId = (session?.user as { clientId?: string } | undefined)?.clientId;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setDocs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents?clientId=${encodeURIComponent(clientId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load client documents.");
      setDocs(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load client documents.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { void load(); }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!clientId) {
      setError("This account is not assigned to a client workspace. Contact your firm administrator.");
      return;
    }
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      let uploaded = 0;
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("clientId", clientId);
        const response = await fetch("/api/documents", { method: "POST", body: form });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `Could not upload ${file.name}.`);
        uploaded += 1;
        void fetch("/api/documents/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: data.id }),
        }).catch(() => undefined);
      }
      setNotice(`${uploaded} file(s) uploaded. Analysis is requested where available; review the document status before relying on extracted content.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Client workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">My Documents</h1>
          <p className="mt-2 text-sm text-slate-600">Upload requested files securely to your assigned accounting firm workspace.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || !clientId} className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload files
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx" className="hidden" onChange={(e) => void handleUpload(e.target.files)} />
      </header>

      {!clientId && status !== "loading" && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This account is not assigned to a client workspace. Contact your firm administrator.</div>}
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading || status === "loading" ? (
          <div className="p-10 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading documents…</div>
        ) : docs.length === 0 ? (
          <div className="p-10 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-2 font-semibold text-slate-800">No documents uploaded</h2>
            <p className="mt-1 text-sm text-slate-500">Use Upload files to send requested evidence to your assigned workspace.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600"><FileText className="h-5 w-5" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{doc.fileName}</p><p className="mt-1 text-xs text-slate-500">{doc.folder?.name || "Unfiled"} · {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.createdAt).toLocaleDateString()}</p></div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{doc.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
