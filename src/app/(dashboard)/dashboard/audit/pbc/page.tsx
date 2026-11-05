"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Clock, CheckCircle2, Upload, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

const STATUS_FLOW = ["REQUESTED", "UPLOADED", "IN_REVIEW", "ACCEPTED", "REJECTED"];

export default function PbcPage() {
  const [requests, setRequests] = useState<Pbc[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "HIGH",
    dueDate: "",
    clientId: "demo-client-001",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/pbc?clientId=demo-client-001");
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/pbc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", priority: "HIGH", dueDate: "", clientId: "demo-client-001" });
    setCreating(false);
    load();
  };

  const sendPbcEmail = async (id: string) => {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pbc_request", pbcId: id, fallbackEmail: "client@acme.com" }),
    });
    alert("Notification queued (check server console / EmailLog in demo mode)");
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/pbc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const priorityColor: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PBC Requests</h1>
        <p className="text-slate-600 mt-1">
          Prepared-by-Client requests — track what auditors need from clients
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={create} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> New PBC Request
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="e.g. December Bank Statement"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <textarea
            placeholder="Description / instructions for client"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
        >
          {creating && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Request
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No PBC requests yet. Create one above (e.g. “December Bank Statement”).
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{r.title}</h3>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", priorityColor[r.priority] || priorityColor.MEDIUM)}>
                    {r.priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {r.status}
                  </span>
                </div>
                {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
                <p className="text-xs text-slate-400 mt-1">
                  {r.client?.name || "Client"} · Due:{" "}
                  {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status === "REQUESTED" && (
                  <>
                    <button
                      onClick={() => sendPbcEmail(r.id)}
                      className="rounded-lg border border-isaca-teal/30 bg-isaca-light px-3 py-1.5 text-xs font-medium text-isaca-dark hover:bg-isaca-light"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "UPLOADED")}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" /> Mark Uploaded
                    </button>
                  </>
                )}
                {r.status === "UPLOADED" && (
                  <button
                    onClick={() => updateStatus(r.id, "IN_REVIEW")}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                  >
                    Start Review
                  </button>
                )}
                {r.status === "IN_REVIEW" && (
                  <>
                    <button
                      onClick={() => updateStatus(r.id, "ACCEPTED")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "REJECTED")}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
