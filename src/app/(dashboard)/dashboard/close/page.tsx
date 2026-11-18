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
  AlertCircle,
  RefreshCw,
  Loader2,
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
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isClient = role === "CLIENT";
  const canApproveClose = ["CONTROLLER", "CFO", "PARTNER", "ADMIN"].includes(
    role || ""
  );

  const [period, setPeriod] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [close, setClose] = useState<ClosePeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isClient) {
      setClose(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/close?period=${period}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        setError(data.error || "Could not load close checklist");
        setClose(null);
      } else {
        setClose(data.close ?? null);
        if (!data.close) setError("No close period returned. Try Start Close.");
      }
    } catch {
      setError("Network error loading close checklist");
      setClose(null);
    } finally {
      setLoading(false);
    }
  }, [isClient, period]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not load authorized clients.");
        const rows: Client[] = data.clients || [];
        if (!active) return;
        setClients(rows);
        if (rows.length === 1) setClientId(rows[0].id);
        if (!rows.length && !isClient)
          setError("No client workspaces are assigned to this firm account.");
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Could not load client workspaces."
          );
      } finally {
        if (active) setLoadingClients(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isClient]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateTask = async (taskId: string, status: CloseTaskStatus) => {
    setSavingId(taskId);
    try {
      const res = await fetch("/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, taskId, status }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.close) setClose(data.close);
    } catch {
      /* keep current state */
    } finally {
      setSavingId(null);
    }
  };

  const startClose = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, action: "start" }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.close) {
        setClose(data.close);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Could not start close period");
    } finally {
      setStarting(false);
    }
  };

  const approveClose = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, action: "approve" }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.close) {
        setClose(data.close);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Could not approve close period");
    } finally {
      setStarting(false);
    }
  };

  if (isClient) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <Lock className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900">
          Month-end close is internal
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Client portal users do not run firm close checklists. Contact your
          accountant for period status.
        </p>
      </div>
    );
  }

  if (loading || loadingClients) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
        <p>Loading close checklist…</p>
      </div>
    );
  }

  if (error || !close) {
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">
          Close checklist unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {error || "No data for this period."}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <label className="text-sm text-slate-600">Period</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => void startClose()}
            disabled={starting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start Close for {period}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">
            Accounting operations
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Month-End Close
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Coordinate close tasks for the selected period. Complete tasks only
            after the required work and evidence are ready.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-600">Period</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border px-3 py-1.5 text-sm"
            />
            {clients.length > 0 && (
              <>
                <label className="text-sm text-slate-600">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  <option value="">All / default</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Progress</p>
            <p className="text-2xl font-bold text-emerald-700">
              {close.progress}%
            </p>
          </div>
          {close.status === "OPEN" && (
            <button
              type="button"
              onClick={() => void startClose()}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Close
            </button>
          )}
          {close.status === "PENDING_APPROVAL" && canApproveClose && (
            <button
              type="button"
              onClick={() => void approveClose()}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Approve & lock
            </button>
          )}
          {close.status === "PENDING_APPROVAL" && !canApproveClose && (
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
              Awaiting approval
            </span>
          )}
          {close.status === "CLOSED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <Lock className="h-4 w-4" /> Closed
            </span>
          )}
        </div>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${close.progress}%` }}
        />
      </div>

      <div className="divide-y rounded-xl border bg-white shadow-sm">
        {close.tasks.map((task) => {
          const Icon = statusIcon[task.status] || Circle;
          const busy = savingId === task.id || close.status === "CLOSED";
          return (
            <article
              key={task.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-6 w-6 shrink-0",
                    statusColor[task.status] || "text-slate-400"
                  )}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      Step {task.step}
                    </span>
                    {task.aiCanHelp && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        <Bot className="h-3 w-3" /> AI can help
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  {task.description && (
                    <p className="mt-0.5 text-sm text-slate-600">
                      {task.description}
                    </p>
                  )}
                  {task.ownerRole && (
                    <p className="mt-1 text-xs text-slate-400">
                      Owner: {task.ownerRole.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                {task.status !== "COMPLETED" &&
                  task.status !== "SKIPPED" &&
                  close.status !== "CLOSED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => void updateTask(task.id, "IN_PROGRESS")}
                        disabled={busy}
                        className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateTask(task.id, "COMPLETED")}
                        disabled={busy}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    </>
                  )}
                {task.status === "COMPLETED" && (
                  <span className="text-sm font-medium text-emerald-600">
                    Completed
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
