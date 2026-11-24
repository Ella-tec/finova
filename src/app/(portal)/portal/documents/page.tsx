"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, FileText, Loader2, FolderOpen, Download, Eye,
} from "lucide-react";
import { useSession } from "next-auth/react";

type Doc = {
  id: string;
  fileName: string;
  size: number;
  status: string;
  createdAt: string;
  mimeType?: string;
  folder?: { name: string } | null;
};

const categories = ["All", "Statements", "Invoices", "Tax", "Contracts", "Other"];

export default function PortalDocumentsPage() {
  const { data: session } = useSession();
  const clientId = (session?.user as { clientId?: string } | undefined)?.clientId;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [preview, setPreview] = useState<Doc | null>(null);
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
      if (!response.ok) throw new Error(data.error || "Could not load documents.");
      setDocs(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || !clientId) {
      if (!clientId) setError("This account is not assigned to a client workspace.");
      return;
    }
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", clientId);
        const res = await fetch("/api/documents", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Could not upload ${file.name}`);
      }
      setNotice("Upload complete. Your firm can now review the file.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = docs.filter((d) => {
    if (category === "All") return true;
    const n = d.fileName.toLowerCase();
    if (category === "Statements") return n.includes("statement") || n.includes("bank");
    if (category === "Invoices") return n.includes("invoice") || n.includes("bill");
    if (category === "Tax") return n.includes("tax") || n.includes("1099") || n.includes("w-2");
    if (category === "Contracts") return n.includes("contract") || n.includes("agreement");
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Documents</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">My documents</h1>
          <p className="mt-1 text-sm text-slate-600">Upload, preview, download, and organize files shared with your firm.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !clientId}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d2d5c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162447] disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload documents
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { void handleUpload(e.target.files); e.currentTarget.value = ""; }} />
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (category === c ? "bg-[#1d2d5c] text-white" : "border border-slate-200 bg-white text-slate-600")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleUpload(e.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed border-[#c5dceb] bg-[#e7f0f5]/40 px-6 py-8 text-center"
      >
        <Upload className="mx-auto h-8 w-8 text-[#07649d]" />
        <p className="mt-2 font-semibold text-slate-900">Drop files here</p>
        <p className="text-sm text-slate-500">PDF, Office, images, CSV</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FolderOpen className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">No documents yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((doc) => (
              <article key={doc.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {(doc.size / 1024).toFixed(1)} KB · {doc.status}
                    {doc.folder ? ` · ${doc.folder.name}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreview(doc)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <a href={`/api/documents/${doc.id}?download=1`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="truncate font-semibold">{preview.fileName}</p>
              <button type="button" onClick={() => setPreview(null)} className="rounded-lg border px-3 py-1.5 text-sm">Close</button>
            </div>
            <div className="min-h-[50vh] bg-slate-100 p-3">
              {(preview.mimeType || "").includes("pdf") || preview.fileName.toLowerCase().endsWith(".pdf") ? (
                <iframe title={preview.fileName} src={`/api/documents/${preview.id}`} className="h-[70vh] w-full bg-white" />
              ) : (
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-slate-400" />
                  <a href={`/api/documents/${preview.id}?download=1`} className="rounded-lg bg-[#1d2d5c] px-4 py-2 text-sm font-semibold text-white">Download to open</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
