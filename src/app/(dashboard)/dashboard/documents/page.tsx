"use client";

import Link from "next/link";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2, Sparkles, FolderOpen, CheckCircle2 } from "lucide-react";

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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?clientId=${clientId}`);
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : data.documents || []);
    } catch {
      setDocs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("clientId", clientId);
      try {
        const res = await fetch("/api/documents", { method: "POST", body: fd });
        if (res.ok) {
          const doc = await res.json();
          // Auto-analyze
          setAnalyzing(doc.id);
          const aRes = await fetch("/api/documents/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: doc.id }),
          });
          if (aRes.ok) {
            const { analysis: a } = await aRes.json();
            setAnalysis((prev) => ({ ...prev, [doc.id]: a }));
          }
          setAnalyzing(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setUploading(false);
    load();
  };

  const analyze = async (id: string) => {
    setAnalyzing(id);
    const res = await fetch("/api/documents/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: id }),
    });
    if (res.ok) {
      const { analysis: a } = await res.json();
      setAnalysis((prev) => ({ ...prev, [id]: a }));
    }
    setAnalyzing(null);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-1">Upload, OCR & AI file analysis (invoices, statements, receipts)</p>
          <p className="text-sm mt-2">
            <Link href="/dashboard/security" className="text-isaca-medium font-medium hover:underline">
              Run File Sanitizer first
            </Link>
            {" "}— malware type check, PII hints, classification before AI
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:border-fin-400 transition"
      >
        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <p className="font-medium text-slate-700">Drag & drop files here</p>
        <p className="text-sm text-slate-500 mt-1">PDF, images, CSV — invoices auto-detected</p>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No documents yet. Upload an invoice or bank statement to test analysis.</div>
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
                          Amount: ${analysis[d.id].totalAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
}
