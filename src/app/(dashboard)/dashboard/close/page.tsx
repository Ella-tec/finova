"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  SkipForward,
  Bot,
  Lock,
} from "lucide-react";
import { ClosePeriod, CloseTaskStatus } from "@/lib/close/checklist";
import { cn } from "@/lib/utils";

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
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [close, setClose] = useState<ClosePeriod | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/close?period=${period}`);
    const data = await res.json();
    setClose(data.close);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [period]);

  const updateTask = async (taskId: string, status: CloseTaskStatus) => {
    const res = await fetch("/api/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, taskId, status }),
    });
    const data = await res.json();
    if (data.close) setClose(data.close);
  };

  const startClose = async () => {
    const res = await fetch("/api/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, action: "start" }),
    });
    const data = await res.json();
    if (data.close) setClose(data.close);
  };

  if (loading || !close) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading close checklist&
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Month-End Close</h1>
          <p className="text-slate-600 mt-1">
            Guided checklist for period{" "}
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="ml-1 rounded border border-slate-300 px-2 py-0.5 text-sm"
            />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Progress</p>
            <p className="text-2xl font-bold text-isaca-medium">{close.progress}%</p>
          </div>
          {close.status === "OPEN" && (
            <button
              onClick={startClose}
              className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"
            >
              <Play className="h-4 w-4" />
              Start Close
            </button>
          )}
          {close.status === "CLOSED" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <Lock className="h-4 w-4" /> Closed
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-isaca-medium transition-all duration-500"
          style={{ width: `${close.progress}%` }}
        />
      </div>

      {/* Tasks */}
      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {close.tasks.map((task) => {
          const Icon = statusIcon[task.status];
          return (
            <div
              key={task.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className={cn("h-6 w-6 mt-0.5 shrink-0", statusColor[task.status])} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      Step {task.step}
                    </span>
                    {task.aiCanHelp && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-isaca-light px-2 py-0.5 text-xs font-medium text-isaca-dark">
                        <Bot className="h-3 w-3" /> AI can help
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{task.description}</p>
                  {task.ownerRole && (
                    <p className="text-xs text-slate-400 mt-1">
                      Owner: {task.ownerRole.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                {task.status !== "COMPLETED" && task.status !== "SKIPPED" && (
                  <>
                    <button
                      onClick={() => updateTask(task.id, "IN_PROGRESS")}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => updateTask(task.id, "COMPLETED")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Complete
                    </button>
                  </>
                )}
                {task.status === "COMPLETED" && (
                  <span className="text-sm font-medium text-emerald-600">Done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}