
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  FolderOpen,
} from "lucide-react";

type Doc = {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: string;
  tags?: string | null;
  ocrText?: string | null;
  createdAt: string;
  folder?: { id: string; name: string } | null;
};

type Analysis = {
  docType: string;
  vendor?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  confidence: number;
  summary: string;
  suggestedFolder?: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, Analysis>>({});
  const [clientId, setClientId] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load documents");
      setClientId(data.clientId || "");
      setDocs(data.documents || []);
      setLoadError(data.clientId ? null : "No client workspace is assigned to this account yet.");
    } catch (error) {
      setDocs([]);
      setLoadError(error instanceof Error ? error.message : "Could not load documents");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!clientId) {
      setLoadError("No client workspace is assigned to this account. Ask a workspace administrator to assign one.");
      return;
    }
    setLoadError(null);
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("clientId", clientId);

        try {
          const res = await fetch("/api/documents", {
            method: "POST",
            body: fd,
          });

          if (!res.ok) {
            console.error(`Upload failed for ${file.name}`);
            continue;
          }

          const doc = await res.json();

          if (!doc?.id) {
            console.error("Upload response did not contain a document ID");
            continue;
          }

          // Automatically analyze the uploaded document.
          setAnalyzing(doc.id);

          try {
            const aRes = await fetch("/api/documents/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ documentId: doc.id }),
            });

            if (aRes.ok) {
              const result = await aRes.json();

              if (result?.analysis) {
                setAnalysis((prev) => ({
                  ...prev,
                  [doc.id]: result.analysis,
                }));
              }
            } else {
              console.error(`Analysis failed for ${file.name}`);
            }
          } finally {
            setAnalyzing(null);
          }
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          setAnalyzing(null);
        } else {
          const problem = await res.json().catch(() => ({}));
          setLoadError(problem.error || "A file could not be uploaded.");
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "A file could not be uploaded.");
      }
    } finally {
      setUploading(false);
      await load();
    }
  };

  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const openDocument = (doc: Doc) => setPreviewDoc(doc);

  const analyze = async (id: string) => {
    setAnalyzing(id);

    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId: id }),
      });

      if (!res.ok) {
        throw new Error("Document analysis failed");
      }

      const result = await res.json();

      if (result?.analysis) {
        setAnalysis((prev) => ({
          ...prev,
          [id]: result.analysis,
        }));
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(null);
      await load();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {loadError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</div>}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Documents
          </h1>

          <p className="text-slate-600 mt-1">
            Upload, OCR & AI file analysis (invoices, statements, receipts)
          </p>

          <p className="text-sm mt-2">
            <Link
              href="/dashboard/security"
              className="text-isaca-medium font-medium hover:underline"
            >
              Run File Sanitizer first
            </Link>
            {" "}— malware type check, PII hints, classification before AI
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload files"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            void handleUpload(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      {/* Drag and drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleUpload(e.dataTransfer.files);
        }}
        className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:border-fin-400 transition"
      >
        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />

        <p className="font-medium text-slate-700">
          Drag & drop files here
        </p>

        <p className="text-sm text-slate-500 mt-1">
          PDF, images, CSV — invoices auto-detected
        </p>
      </div>

      {/* Document list */}
      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading documents...
          </div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No documents yet. Upload an invoice or bank statement to test
            analysis.
          </div>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-8 w-8 text-isaca-medium shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{d.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {(d.size / 1024).toFixed(1)} KB · {d.status}
                    {d.folder && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" /> {d.folder.name}
                      </span>
                    )}
                  </p>
                  {analysis[d.id] && (
                    <div className="mt-2 rounded-lg bg-isaca-light border border-isaca-light px-3 py-2 text-sm">
                      <p className="font-medium text-isaca-dark flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        {analysis[d.id].docType} · {(analysis[d.id].confidence * 100).toFixed(0)}% confidence
                      </p>
                      <p className="text-isaca-dark mt-0.5">{analysis[d.id].summary}</p>
                      {analysis[d.id].totalAmount != null && (
                        <p className="text-fin-900 font-semibold mt-1">
                          Amount: ${analysis[d.id].totalAmount?.toFixed(2) ?? "—"}
                        </p>
                      )}
                    </p>

                    {docAnalysis && (
                      <div className="mt-2 rounded-lg bg-isaca-light border border-isaca-light px-3 py-2 text-sm">
                        <p className="font-medium text-isaca-dark flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {docAnalysis.docType} ·{" "}
                          {(docAnalysis.confidence * 100).toFixed(0)}%
                          confidence
                        </p>

                        <p className="text-isaca-dark mt-0.5">
                          {docAnalysis.summary}
                        </p>

                        {docAnalysis.totalAmount != null && (
                          <p className="text-fin-900 font-semibold mt-1">
                            Amount: $
                            {docAnalysis.totalAmount.toFixed(2)}
                          </p>
                        )}

                        {docAnalysis.vendor && (
                          <p className="text-slate-600 mt-1">
                            Vendor: {docAnalysis.vendor}
                          </p>
                        )}

                        {docAnalysis.invoiceNumber && (
                          <p className="text-slate-600">
                            Invoice: {docAnalysis.invoiceNumber}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void analyze(d.id)}
                  disabled={analyzing === d.id}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60 inline-flex items-center gap-1"
                >
                  {analyzing === d.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-isaca-medium" />
                  )}

                  {analyzing === d.id ? "Analyzing..." : "Analyze"}
                </button>
              </div>
              <button type="button" onClick={() => openDocument(d)} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                Open
              </button>
              <a href={`/api/documents/${encodeURIComponent(d.id)}`} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                New tab
              </a>
              <button
                onClick={() => analyze(d.id)}
                disabled={analyzing === d.id}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1"
              >
                {analyzing === d.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-isaca-medium" />
                )}
                Analyze
              </button>
            </div>
          ))
        )}
      </div>
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" role="dialog" aria-modal="true">
          <section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{previewDoc.fileName}</h2><p className="text-xs text-slate-500">{previewDoc.mimeType} · {(previewDoc.size / 1024).toFixed(1)} KB</p></div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={`/api/documents/${encodeURIComponent(previewDoc.id)}?download=1`} className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Download</a>
                <button type="button" onClick={() => setPreviewDoc(null)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">Close</button>
              </div>
            </header>
            <div className="min-h-[55vh] flex-1 overflow-auto bg-slate-100 p-2 sm:p-4">
              {previewDoc.mimeType === "application/pdf" ? (
                <iframe title="Document preview" src={`/api/documents/${encodeURIComponent(previewDoc.id)}#toolbar=1`} className="h-[72vh] w-full rounded-lg border bg-white" />
              ) : previewDoc.mimeType.startsWith("image/") ? (
                <div className="flex min-h-[55vh] items-center justify-center"><img src={`/api/documents/${encodeURIComponent(previewDoc.id)}`} alt={previewDoc.fileName} className="max-h-[72vh] max-w-full rounded-lg object-contain" /></div>
              ) : previewDoc.mimeType === "text/plain" || previewDoc.mimeType === "text/csv" || previewDoc.mimeType === "application/vnd.ms-excel" ? (
                <iframe title="Text document preview" src={`/api/documents/${encodeURIComponent(previewDoc.id)}`} className="h-[72vh] w-full rounded-lg border bg-white" />
              ) : previewDoc.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || previewDoc.mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                <iframe title="Office document preview" sandbox="" src={`/api/documents/${encodeURIComponent(previewDoc.id)}?preview=1`} className="h-[72vh] w-full rounded-lg border bg-white" />
              ) : (
                <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                  <h3 className="mt-3 font-semibold text-slate-900">Use a compatible viewer for this file</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">This file type is not supported by the in-app viewer. You can still open it with a compatible app.</p>
                  <a href={`/api/documents/${encodeURIComponent(previewDoc.id)}?download=1`} className="mt-4 rounded-lg bg-[#087f68] px-4 py-2 text-sm font-semibold text-white">Open file</a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
