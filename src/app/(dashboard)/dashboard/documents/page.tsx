
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  FolderOpen,
  Eye,
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
  const [clientId] = useState("demo-client-001");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Doc | null>(null);
  const fileUrl = (doc: Doc) => `/api/documents/${doc.id}/file`;
  const canInlinePreview = (doc: Doc) => doc.mimeType === "application/pdf" || doc.mimeType.startsWith("image/") || doc.mimeType.startsWith("text/") || doc.mimeType === "application/json";

  const load = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/documents?clientId=${encodeURIComponent(clientId)}`
      );

      if (!res.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await res.json();

      setDocs(
        Array.isArray(data)
          ? data
          : Array.isArray(data.documents)
            ? data.documents
            : []
      );
    } catch (error) {
      console.error("Document loading error:", error);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;

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
        }
      }
    } finally {
      setUploading(false);
      await load();
    }
  };

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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          docs.map((d) => {
            const docAnalysis = analysis[d.id];

            return (
              <div
                key={d.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-isaca-medium shrink-0" />

                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 break-words">
                      {d.fileName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(d.size / 1024).toFixed(1)} KB · {d.status}

                      {d.folder && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {d.folder.name}
                        </span>
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

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <button type="button" onClick={() => setPreview(d)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <Eye className="h-4 w-4 text-isaca-medium" /> Preview
                  </button>
                  <a href={`${fileUrl(d)}?download=1`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-4 w-4" /> Download
                  </a>
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
              </div>
            );
          })
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Preview ${preview.fileName}`} onClick={() => setPreview(null)}>
          <section className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{preview.fileName}</h2><p className="mt-0.5 text-xs text-slate-500">{preview.mimeType} · {(preview.size / 1024).toFixed(1)} KB</p></div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={`${fileUrl(preview)}?download=1`} className="inline-flex items-center gap-1.5 rounded-lg bg-isaca-medium px-3 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"><Download className="h-4 w-4" /> Download</a>
                <a href={fileUrl(preview)} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Open in new tab"><ExternalLink className="h-4 w-4" /></a>
                <button type="button" onClick={() => setPreview(null)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Close preview"><X className="h-4 w-4" /></button>
              </div>
            </header>
            <div className="min-h-[55vh] flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">
              {preview.mimeType.startsWith("image/") ? (
                <div className="flex min-h-[55vh] items-center justify-center"><img src={fileUrl(preview)} alt={preview.fileName} className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-sm" /></div>
              ) : preview.mimeType === "application/pdf" ? (
                <iframe title={preview.fileName} src={fileUrl(preview)} className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white" />
              ) : canInlinePreview(preview) ? (
                <iframe title={preview.fileName} src={fileUrl(preview)} className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white" />
              ) : (
                <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <FileText className="h-12 w-12 text-isaca-medium" /><h3 className="mt-3 font-semibold text-slate-900">Preview is not supported for this file type</h3><p className="mt-1 max-w-md text-sm text-slate-500">You can still open the original file in a compatible desktop application by downloading it.</p><a href={`${fileUrl(preview)}?download=1`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" /> Download original</a>
                </div>
              )}
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3"><span className="text-xs text-slate-500">Secure document preview · Finova</span><button type="button" onClick={() => setPreview(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close preview</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
