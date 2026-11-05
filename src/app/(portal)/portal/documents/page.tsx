"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Loader2, FolderOpen } from "lucide-react";
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
  const { data: session } = useSession();
  const clientId = (session?.user as any)?.clientId || "demo-client-001";
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
  }, [clientId]);

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
          // Auto-analyze in background
          fetch("/api/documents/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: doc.id }),
          }).catch(() => {});
        }
      } catch (e) {
        console.error(e);
      }
    }
    setUploading(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
          <p className="text-slate-600 mt-1">Upload files for your accounting firm</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center"
      >
        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <p className="font-medium text-slate-700">Drop files here or tap Upload</p>
        <p className="text-sm text-slate-500 mt-1">PDF, photos, spreadsheets — camera capture works on mobile</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No documents uploaded yet.</div>
        ) : (
          docs.map((d) => (
            <div key={d.id} className="px-5 py-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-isaca-medium shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{d.fileName}</p>
                <p className="text-xs text-slate-500">
                  {(d.size / 1024).toFixed(1)} KB · {new Date(d.createdAt).toLocaleDateString()}
                  {d.folder && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" /> {d.folder.name}
                    </span>
                  )}
                </p>
              </div>
              <span className="text-xs rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
                {d.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
