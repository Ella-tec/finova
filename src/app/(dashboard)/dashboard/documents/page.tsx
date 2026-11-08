"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  FolderOpen,
  X,
  Download,
  ExternalLink,
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
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Doc | null>(null);
  const fileUrl = (doc: Doc) => `/api/documents/${doc.id}/file`;
  const canInlinePreview = (doc: Doc) => doc.mimeType === "application/pdf" || doc.mimeType.startsWith("image/") || doc.mimeType.startsWith("text/") || doc.mimeType === "application/json";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not load documents");
      setClientId(data.clientId || "");
      setDocs(data.documents || []);
      setLoadError(
        data.clientId
          ? null
          : "No client workspace is assigned to this account yet."
      );
    } catch (error) {
      setDocs([]);
      setLoadError(
        error instanceof Error ? error.message : "Could not load documents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (!clientId) {
      setLoadError(
        "No client workspace is assigned to this account. Ask a workspace administrator to assign one."
      );
      return;
    }

    setLoadError(null);
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", clientId);

        try {
          const uploadResponse = await fetch("/api/documents", {
            method: "POST",
            body: formData,
          });
          const uploaded = await uploadResponse.json().catch(() => ({}));

          if (!uploadResponse.ok || !uploaded?.id) {
            throw new Error(
              uploaded.error || `Could not upload ${file.name}`
            );
          }

          setAnalyzing(uploaded.id);
          try {
            const analysisResponse = await fetch("/api/documents/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documentId: uploaded.id }),
            });
            const result = await analysisResponse.json().catch(() => ({}));

            if (!analysisResponse.ok) {
              throw new Error(
                result.error || `Analysis failed for ${file.name}`
              );
            }
            if (result.analysis) {
              setAnalysis((previous) => ({
                ...previous,
                [uploaded.id]: result.analysis,
              }));
            }
          } finally {
            setAnalyzing(null);
          }
        } catch (error) {
          setLoadError(
            error instanceof Error
              ? error.message
              : `There was a problem processing ${file.name}`
          );
          setAnalyzing(null);
        }
      }
    } finally {
      setUploading(false);
      await load();
    }
  };

  const openPreview = async (doc: Doc) => {
    setPreviewDoc(doc); setPreviewLoading(true); setPreviewError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null);
    try {
      const response = await fetch("/api/documents/" + encodeURIComponent(doc.id) + "/file", { cache: "no-store" });
      if (!response.ok) throw new Error("The file could not be opened. Check that it is still stored and that you have access.");
      const blob = await response.blob(); setPreviewUrl(URL.createObjectURL(blob));
    } catch (error) { setPreviewError(error instanceof Error ? error.message : "Preview failed."); }
    finally { setPreviewLoading(false); }
  };

  const closePreview = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setPreviewDoc(null); setPreviewError(null); };
  const analyze = async (id: string) => {
    setAnalyzing(id);
    setLoadError(null);
    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Document analysis failed");
      if (result.analysis) {
        setAnalysis((previous) => ({
          ...previous,
          [id]: result.analysis,
        }));
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Document analysis failed"
      );
    } finally {
      setAnalyzing(null);
      await load();
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {loadError}
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700"
          >
            <span aria-hidden="true">←</span> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Document Inbox</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload invoices, bills, receipts, and statements. Finova will
            analyze each file and prepare its details for review.
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/dashboard/security"
              className="font-medium text-teal-700 hover:underline"
            >
              Run File Sanitizer first
            </Link>{" "}
            <span className="text-slate-500">
              — check files before AI analysis.
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading and analyzing…" : "Upload documents"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            void handleUpload(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
      </header>

      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleUpload(event.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 px-6 py-10 text-center transition hover:border-teal-400"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
          <Upload className="h-6 w-6" />
        </div>
        <h2 className="mt-3 font-semibold text-slate-900">
          Drop documents here
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          PDF, JPG, PNG, CSV, Excel, and Word files
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Files are analyzed into suggested records. Review and approve before
          anything is posted to the ledger.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Uploaded documents</h2>
            <p className="text-xs text-slate-500">
              {docs.length} {docs.length === 1 ? "document" : "documents"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
            Loading documents…
          </div>
        ) : docs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">Your inbox is empty</p>
            <p className="mt-1 text-sm text-slate-500">
              Upload an invoice or receipt to start extracting its details.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((doc) => {
              const result = analysis[doc.id];
              return (
                <article
                  key={doc.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold text-slate-900">
                        {doc.fileName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {(doc.size / 1024).toFixed(1)} KB · {doc.status}
                        {doc.folder && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {doc.folder.name}
                          </span>
                        )}
                      </p>

                      {result ? (
                        <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/60 p-3 text-sm">
                          <p className="flex flex-wrap items-center gap-2 font-semibold text-teal-900">
                            <Sparkles className="h-4 w-4" />
                            {result.docType}
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-teal-800">
                              {Math.round(result.confidence * 100)}% confidence
                            </span>
                          </p>
                          <p className="mt-1 text-slate-700">{result.summary}</p>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                            {result.vendor && <span>Vendor: {result.vendor}</span>}
                            {result.invoiceNumber && (
                              <span>Invoice: {result.invoiceNumber}</span>
                            )}
                            {result.totalAmount != null && (
                              <span className="font-semibold text-slate-900">
                                Total: {result.totalAmount.toLocaleString(
                                  undefined,
                                  { style: "currency", currency: "USD" }
                                )}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-medium text-amber-800">
                            Suggested extraction — verify before approving or posting.
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500">
                          {analyzing === doc.id
                            ? "AI is reading this document…"
                            : "Not analyzed yet"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Preview
                    </button>
                    <a
                      href={`/api/documents/${encodeURIComponent(doc.id)}?download=1`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => void analyze(doc.id)}
                      disabled={analyzing === doc.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                      {analyzing === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {analyzing === doc.id ? "Analyzing…" : "Analyze"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewDoc.fileName}`}
        >
          <section className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  {previewDoc.fileName}
                </h2>
                <p className="text-xs text-slate-500">
                  {previewDoc.mimeType} · {(previewDoc.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/api/documents/${encodeURIComponent(previewDoc.id)}?download=1`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  aria-label="Close preview"
                  className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
                </div>
              </div>
            </header>
            <div className="min-h-[55vh] flex-1 overflow-auto bg-slate-100 p-2 sm:p-4">
              {previewDoc.mimeType === "application/pdf" ? (
                <iframe
                  title="PDF document preview"
                  src={`/api/documents/${encodeURIComponent(previewDoc.id)}#toolbar=1`}
                  className="h-[75vh] w-full rounded-lg border bg-white"
                />
              ) : previewDoc.mimeType.startsWith("image/") ? (
                <div className="flex min-h-[55vh] items-center justify-center">
                  <img
                    src={`/api/documents/${encodeURIComponent(previewDoc.id)}`}
                    alt={previewDoc.fileName}
                    className="max-h-[75vh] max-w-full rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                  <h3 className="mt-3 font-semibold text-slate-900">
                    Preview not available for this file type
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Download the original file to open it in a compatible application.
                  </p>
                  <a
                    href={`/api/documents/${encodeURIComponent(previewDoc.id)}?download=1`}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open file
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
