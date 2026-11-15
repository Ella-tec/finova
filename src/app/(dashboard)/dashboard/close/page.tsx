"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  SkipForward,
  Bot,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ClosePeriod, CloseTaskStatus } from "@/lib/close/checklist";
import { cn } from "@/lib/utils";

type Client = { id: string; name: string };

const statusIcon = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  WAITING: Clock,
  COMPLETED: CheckCircle2,
  SKIPPED: SkipForward,
};

const statusColor = {
  NOT_STARTED: "text-slate-400",
  IN_PROGRESS: "text-amber-500",
  WAITING: "text-blue-500",
  COMPLETED: "text-emerald-500",
  SKIPPED: "text-slate-400",
};

export default function ClosePage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isClient = role === "CLIENT";
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [close, setClose] = useState<ClosePeriod | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientId || isClient) {
      setClose(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/close?period=${encodeURIComponent(period)}&clientId=${encodeURIComponent(clientId)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the close checklist.");
      setClose(data.close || null);
    } catch (err) {
      setClose(null);
      setError(err instanceof Error ? err.message : "Could not load the close checklist.");
    } finally {
      setLoading(false);
    }
  }, [clientId, period, isClient]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load authorized clients.");
        const rows: Client[] = data.clients || [];
        if (!active) return;
        setClients(rows);
        if (rows.length === 1) setClientId(rows[0].id);
        if (!rows.length && !isClient) setError("No client workspaces are assigned to this firm account.");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not load client workspaces.");
      } finally {
        if (active) setLoadingClients(false);
      }
    })();
    return () => { active = false; };
  }, [isClient]);

  useEffect(() => { void load(); }, [load]);

  const postAction = async (body: Record<string, string>) => {
    if (!clientId) throw new Error("Select an authorized client workspace first.");
    const response = await fetch("/api/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, period, clientId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The close action could not be completed.");
    if (data.close) setClose(data.close);
    return data;
  };

  const updateTask = async (taskId: string, nextStatus: CloseTaskStatus) => {
    setSavingId(taskId);
    setError(null);
    setNotice(null);
    try {
      await postAction({ taskId, status: nextStatus });
      setNotice("Close task updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the close task.");
    } finally {
      setSavingId(null);
    }
  };

  const startClose = async () => {
    setStarting(true);
    setError(null);
    setNotice(null);
    try {
      await postAction({ action: "start" });
      setNotice("The close process has been started.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the close process.");
    } finally {
      setStarting(false);
    }
  };

  if (sessionStatus === "loading" || loadingClients) {
    return <div className="flex h-64 items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading close workspace…</div>;
  }

  if (isClient) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <AlertCircle className="h-6 w-6" />
        <h1 className="text-xl font-semibold">Month-End Close is an internal firm workspace</h1>
        <p className="text-sm leading-6">Client users can respond to document requests and upload evidence in the Client Portal. Contact your accounting firm for close status or questions.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Accounting operations</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Month-End Close</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Coordinate close tasks for an authorized client and accounting period. Record task completion only after the required work and evidence are ready.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-600">
            Client workspace
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={!clients.length} className="mt-1 block min-w-56 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm">
              <option value="">Select client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Period
            <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm" />
          </label>
          <button type="button" onClick={() => void load()} disabled={!clientId || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </header>

      {!clientId && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Select an authorized client workspace to view its close checklist. Finova no longer assumes a demo client.</div>}
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {loading ? (
        <div className="flex h-56 items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading close checklist…</div>
      ) : !clientId ? null : !close ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No close checklist is available for this client and period.</div>
      ) : (
        <>
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">Close status</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{close.status.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs text-slate-500">Period {period} · {close.tasks.length} checklist items</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Progress</p>
                <p className="text-3xl font-bold tabular-nums text-isaca-medium">{close.progress}%</p>
              </div>
              {close.status === "OPEN" && (
                <button type="button" onClick={() => void startClose()} disabled={starting} className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start Close
                </button>
              )}
              {close.status === "CLOSED" && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"><Lock className="h-4 w-4" /> Closed</span>}
            </div>
          </section>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-isaca-medium transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, close.progress))}%` }} />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Close task register</h2>
              <p className="mt-1 text-xs text-slate-500">Task changes are recorded by the close workflow; final period close requires a separate authorized approver.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {close.tasks.map((task) => {
                const Icon = statusIcon[task.status];
                const busy = savingId === task.id || close.status === "CLOSED";
                return (
                  <article key={task.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <Icon className={cn("mt-0.5 h-6 w-6 shrink-0", statusColor[task.status])} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">Step {task.step}</span>
                          {task.aiCanHelp && <span className="inline-flex items-center gap-1 rounded-full bg-isaca-light px-2 py-0.5 text-xs font-medium text-isaca-dark"><Bot className="h-3 w-3" /> AI can help</span>}
                        </div>
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        {task.description && <p className="mt-0.5 text-sm text-slate-600">{task.description}</p>}
                        {task.ownerRole && <p className="mt-1 text-xs text-slate-400">Owner: {task.ownerRole.replace(/_/g, " ")}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                      {task.status !== "COMPLETED" && task.status !== "SKIPPED" && close.status !== "CLOSED" && (
                        <>
                          <button type="button" onClick={() => void updateTask(task.id, "IN_PROGRESS")} disabled={busy} className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50">Start</button>
                          <button type="button" onClick={() => void updateTask(task.id, "COMPLETED")} disabled={busy} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">Complete</button>
                        </>
                      )}
                      {task.status === "COMPLETED" && <span className="text-sm font-medium text-emerald-600">Completed</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
