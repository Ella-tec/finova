"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Loader2, Clock, CheckCircle2, Upload, AlertTriangle, Send, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Client = { id: string; name: string };
type Pbc = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: string | null;
  status: string;
  createdAt: string;
  client?: { id: string; name: string };
};

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

export default function PbcPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [requests, setRequests] = useState<Pbc[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "HIGH", dueDate: "" });

  const loadRequests = useCallback(async (selectedClientId: string) => {
    if (!selectedClientId) {
      setRequests([]);
      return;
    }
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/pbc?clientId=${encodeURIComponent(selectedClientId)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load PBC requests.");
      setRequests(data.requests || []);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load PBC requests." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/clients", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load authorized clients.");
        const rows: Client[] = data.clients || [];
        if (!active) return;
        setClients(rows);
        if (rows.length === 1) setClientId(rows[0].id);
      } catch (error) {
        if (active) setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not load clients." });
      } finally {
        if (active) setLoadingClients(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { void loadRequests(clientId); }, [clientId, loadRequests]);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) {
      setNotice({ kind: "error", text: "Choose an authorized client before creating a request." });
      return;
    }
    setCreating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/pbc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the request.");
      setForm({ title: "", description: "", priority: "HIGH", dueDate: "" });
      setNotice({ kind: "success", text: "PBC request created and added to the audit work queue." });
      await loadRequests(clientId);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not create the request." });
    } finally {
      setCreating(false);
    }
  };

  const sendPbcEmail = async (id: string) => {
    setBusyId(id);
    setNotice(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pbc_request", pbcId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not queue the client notification.");
      setNotice({ kind: "success", text: "Client notification processed. Check its delivery status in the email log." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not send the notification." });
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    setNotice(null);
    try {
      const res = await fetch("/api/pbc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update the request.");
      setNotice({ kind: "success", text: `Request moved to ${status.replaceAll("_", " ").toLowerCase()}.` });
      await loadRequests(clientId);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not update the request." });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Audit & assurance</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">PBC Requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Request evidence from clients, track review status, and preserve an auditable request history.</p>
        </div>
        <button type="button" onClick={() => void loadRequests(clientId)} disabled={!clientId || loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </header>

      {notice && (
        <div role="status" className={cn("rounded-xl border px-4 py-3 text-sm", notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800")}>
          {notice.text}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Plus className="h-4 w-4 text-isaca-medium" /> New PBC Request</h2>
            <p className="mt-1 text-xs text-slate-500">Requests are scoped to a client workspace you are authorized to access.</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="pbc-client" className="mb-1 block text-xs font-semibold text-slate-600">Client workspace</label>
            <select id="pbc-client" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={loadingClients || clients.length === 0} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
              <option value="">{loadingClients ? "Loading clients…" : "Select a client"}</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
        </div>

        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Request title</span>
              <input required minLength={3} maxLength={180} placeholder="e.g. December bank statement" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Instructions for the client</span>
              <textarea maxLength={2000} placeholder="Describe the records needed and the period they should cover." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-slate-600">Priority</span>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                <option value="HIGH">High priority</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-slate-600">Due date</span>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
          </div>
          <button type="submit" disabled={creating || !clientId} className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create request
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-semibold text-slate-900">Request register</h2><p className="mt-1 text-xs text-slate-500">{requests.length} request(s) for the selected workspace</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Evidence workflow</span>
        </div>
        {loading || loadingClients ? (
          <div className="p-10 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading authorized workspace…</div>
        ) : !clientId ? (
          <div className="p-10 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 font-semibold text-slate-800">Choose a client workspace</p><p className="mt-1 text-sm text-slate-500">Your authorized clients will appear in the selector above.</p></div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center"><Clock className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 font-semibold text-slate-800">No PBC requests yet</p><p className="mt-1 text-sm text-slate-500">Create the first evidence request for this client above.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <article key={request.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{request.title}</h3>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", PRIORITY_STYLES[request.priority] || PRIORITY_STYLES.MEDIUM)}>{request.priority}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{request.status.replaceAll("_", " ")}</span>
                  </div>
                  {request.description && <p className="mt-2 text-sm leading-6 text-slate-600">{request.description}</p>}
                  <p className="mt-2 text-xs text-slate-500">{request.client?.name || "Client"} · Due {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : "No due date"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.status === "REQUESTED" && <>
                    <button type="button" onClick={() => void sendPbcEmail(request.id)} disabled={busyId === request.id} className="inline-flex items-center gap-1.5 rounded-lg border border-isaca-teal/30 bg-isaca-light px-3 py-2 text-xs font-semibold text-isaca-dark disabled:opacity-50">
                      {busyId === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send notification
                    </button>
                    <button type="button" onClick={() => void updateStatus(request.id, "UPLOADED")} disabled={busyId === request.id} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">
                      <Upload className="h-3.5 w-3.5" /> Mark uploaded
                    </button>
                  </>}
                  {request.status === "UPLOADED" && <button type="button" onClick={() => void updateStatus(request.id, "IN_REVIEW")} disabled={busyId === request.id} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">Start review</button>}
                  {request.status === "IN_REVIEW" && <>
                    <button type="button" onClick={() => void updateStatus(request.id, "ACCEPTED")} disabled={busyId === request.id} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" /> Accept</button>
                    <button type="button" onClick={() => void updateStatus(request.id, "REJECTED")} disabled={busyId === request.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Return to client</button>
                  </>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
