"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Building2, Plus, Trash2, Loader2, Save, AlertCircle } from "lucide-react";

type Entity = {
  id: string;
  code: string;
  name: string;
  currency: string;
  ownershipPct: number;
  parentId?: string | null;
  isEliminating?: boolean;
};

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "INR"];
const WRITE_ROLES = ["CONTROLLER", "PARTNER", "ADMIN"];

export default function EntitiesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role || "";
  const canManage = WRITE_ROLES.includes(role);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", currency: "USD", ownershipPct: 100 });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/entities", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load entities.");
      setEntities(data.entities || []);
    } catch (err) {
      setEntities([]);
      setError(err instanceof Error ? err.message : "Could not load entities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const resetForm = () => {
    setEditId(null);
    setForm({ code: "", name: "", currency: "USD", ownershipPct: 100 });
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Entity could not be saved.");
      resetForm();
      setNotice(editId ? "Entity updated." : "Entity created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entity could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this entity only if it has no saved balance history?")) return;
    setRemovingId(id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Entity could not be deleted.");
      setNotice("Entity deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entity could not be deleted.");
    } finally {
      setRemovingId(null);
    }
  };

  const startEdit = (entity: Entity) => {
    setEditId(entity.id);
    setForm({
      code: entity.code,
      name: entity.name,
      currency: entity.currency || "USD",
      ownershipPct: entity.ownershipPct,
    });
    setNotice(null);
  };

  if (sessionStatus === "loading") {
    return <div className="flex h-64 items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading entity workspace…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Company structure</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Building2 className="h-7 w-7 text-isaca-medium" /> Entity Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Maintain the legal entities used for ownership analysis, reporting currency, and consolidation.</p>
        </div>
        <Link href="/dashboard/consolidation" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open Consolidation</Link>
      </header>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {canManage ? (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-semibold text-slate-900">{editId ? "Edit entity" : "Add entity"}</h2>
            <p className="mt-1 text-xs text-slate-500">Entity code must be unique within this firm. Changes are recorded in the audit history.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-600">Entity code
              <input required maxLength={20} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUB-EU" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Legal name
              <input required maxLength={180} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Legal entity name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Reporting currency
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900">
                {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Ownership %
              <input type="number" min={0} max={100} step={0.01} value={form.ownershipPct} onChange={(e) => setForm({ ...form, ownershipPct: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900" />
              <span className="mt-1 block font-normal text-slate-400">Non-controlling interest: {(100 - form.ownershipPct).toFixed(2)}%</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editId ? "Save changes" : "Add entity"}
            </button>
            {editId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button>}
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">Read-only entity access. Creating, changing, or deleting entities requires Controller, Partner, or Administrator permission.</div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-semibold text-slate-900">Legal entity register</h2><p className="mt-1 text-xs text-slate-500">{entities.length} entity record(s)</p></div>
          <button type="button" onClick={() => void load()} disabled={loading} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th><th className="px-4 py-3">Legal name</th><th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3 text-right">Owned %</th><th className="px-4 py-3 text-right">NCI %</th><th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading entities…</td></tr>
              ) : entities.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No entities are configured for this firm. Add a legal entity to begin consolidation setup.</td></tr>
              ) : entities.map((entity) => (
                <tr key={entity.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{entity.code}</td>
                  <td className="px-4 py-3 text-slate-700">{entity.name}</td>
                  <td className="px-4 py-3">{entity.currency}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{entity.ownershipPct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">{(100 - entity.ownershipPct).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">
                    {canManage ? <div className="inline-flex gap-3">
                      <button type="button" onClick={() => startEdit(entity)} className="text-xs font-semibold text-isaca-medium hover:underline">Edit</button>
                      <button type="button" onClick={() => void remove(entity.id)} disabled={removingId === entity.id} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
                        {removingId === entity.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                      </button>
                    </div> : <span className="text-xs text-slate-400">Read only</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
