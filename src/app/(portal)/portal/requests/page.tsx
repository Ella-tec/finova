"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Loader2, CheckCircle2, FolderLock, RefreshCw, Share2, Download, FolderOpen } from "lucide-react";

type RequestRow = {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  dueDate?: string | null;
  priority?: string | null;
};

export default function PortalRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"requests" | "shared">("requests");
  const [folders, setFolders] = useState<any[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pbc", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load requests.");
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadSharedFolders = useCallback(async () => {
    setFoldersLoading(true);
    setFolderError(null);
    try {
      const response = await fetch("/api/shared-folders", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not load shared folders.");
      setFolders(data.folders || []);
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : "Could not load shared folders.");
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  const markUploaded = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch("/api/pbc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "UPLOADED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update request.");
      setNotice("Marked as uploaded. Your firm can review the response.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07649d]">Document requests</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">What your firm needs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Track due dates, priority, and status. Upload files in{" "}
          <Link href="/portal/documents" className="font-semibold text-[#07649d] underline">Documents</Link> first.
        </p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Document request sections">
        <button type="button" role="tab" aria-selected={tab === "requests"} onClick={() => setTab("requests")} className={"rounded-xl px-4 py-2.5 text-sm font-semibold " + (tab === "requests" ? "bg-[#1d2d5c] text-white" : "border border-slate-200 bg-white text-slate-700")}>Document Requests</button>
        <button type="button" role="tab" aria-selected={tab === "shared"} onClick={() => { setTab("shared"); void loadSharedFolders(); }} className={"inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold " + (tab === "shared" ? "bg-[#1d2d5c] text-white" : "border border-slate-200 bg-white text-slate-700")}><FolderLock className="h-4 w-4"/> Shared Folder</button>
      </div>
      {tab === "requests" ? <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">No open requests</p>
          </div>
        ) : (
          <div className="divide-y">
            {requests.map((r) => (
              <article key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{r.title || "Document request"}</p>
                  {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#e7f0f5] px-2 py-0.5 font-semibold text-[#07649d]">{r.status || "OPEN"}</span>
                    {r.priority && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">{r.priority}</span>}
                    {r.dueDate && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Due {new Date(r.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busyId === r.id || (r.status || "").toUpperCase() === "UPLOADED"}
                  onClick={() => void markUploaded(r.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1d2d5c] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Confirm uploaded
                </button>
              </article>
            ))}
          </div>
        )}
      </section> : <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><FolderLock className="h-5 w-5 text-[#07649d]"/> Secure shared folders</h2><p className="mt-1 text-sm text-slate-600">Only folders explicitly shared with your signed-in account appear here. Server-side permissions are checked for every file operation.</p></div>
          <button type="button" onClick={() => void loadSharedFolders()} disabled={foldersLoading} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"><RefreshCw className={"h-4 w-4 " + (foldersLoading ? "animate-spin" : "")}/> Refresh</button>
        </div>
        {folderError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{folderError}</p>}
        {foldersLoading ? <p className="py-8 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading authorized folders…</p> : folders.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center"><FolderOpen className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 font-medium text-slate-800">No folders have been shared with you yet</p><p className="mt-1 text-xs text-slate-500">Ask your firm contact to grant access to a folder.</p></div> : <div className="divide-y rounded-xl border">{folders.map((folder) => <article key={folder.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{folder.name}</p><p className="text-xs text-slate-500">Shared by {folder.sharedBy?.name || folder.sharedBy?.email || "your firm"} · {folder.documents?.length || 0} files · {folder.permissions?.canUpload ? "Upload allowed" : "View only"}</p><div className="mt-2 flex flex-wrap gap-3">{(folder.documents || []).map((doc: any) => <a key={doc.id} href={"/api/documents/" + doc.id + "/file" + (folder.permissions?.canDownload ? "?download=1" : "")} className="inline-flex items-center gap-1 text-xs font-medium text-[#07649d] underline"><Download className="h-3 w-3"/>{doc.fileName}</a>)}</div></div><span className="inline-flex items-center gap-1 rounded-full bg-[#e7f0f5] px-2 py-1 text-xs font-semibold text-[#07649d]"><Share2 className="h-3 w-3"/> Authorized</span></article>)}</div>}
      </section>}
    </div>
  );
}
