"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ClipboardList, Upload, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Pbc = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  dueDate?: string | null;
  status: string;
};

export default function PortalRequestsPage() {
  const { data: session } = useSession();
  const clientId = (session?.user as any)?.clientId || "demo-client-001";
  const [requests, setRequests] = useState<Pbc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/pbc?clientId=${clientId}`);
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [clientId]);

  const markUploaded = async (id: string) => {
    await fetch("/api/pbc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "UPLOADED" }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Requests</h1>
        <p className="text-slate-600 mt-1">Items your firm has asked you to provide</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            No open requests. You&apos;re all caught up.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{r.title}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      r.priority === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {r.priority}
                  </span>
                </div>
                {r.description && <p className="text-sm text-slate-600 mt-1">{r.description}</p>}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due: {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "ASAP"} · Status:{" "}
                  {r.status}
                </p>
              </div>
              {r.status === "REQUESTED" && (
                <button
                  onClick={() => markUploaded(r.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"
                >
                  <Upload className="h-4 w-4" />
                  Mark as uploaded
                </button>
              )}
              {r.status !== "REQUESTED" && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> {r.status}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
