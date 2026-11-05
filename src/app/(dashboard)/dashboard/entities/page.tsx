"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Trash2, Loader2, Save } from "lucide-react";

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

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    currency: "USD",
    ownershipPct: 100,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/entities");
    const data = await res.json();
    setEntities(data.entities || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setForm({ code: "", name: "", currency: "USD", ownershipPct: 100 });
      setEditId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entity and its balances?")) return;
    await fetch("/api/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    load();
  };

  const startEdit = (e: Entity) => {
    setEditId(e.id);
    setForm({
      code: e.code,
      name: e.name,
      currency: e.currency || "USD",
      ownershipPct: e.ownershipPct,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="h-7 w-7 text-isaca-medium" />
          Entity Management
        </h1>
        <p className="text-slate-600 mt-1">
          Legal entities for consolidation — ownership %, reporting currency, hierarchy
        </p>
      </div>

      <form onSubmit={save} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">{editId ? "Edit entity" : "Add entity"}</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="Code (e.g. SUB-EU)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Legal name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div>
            <label className="text-xs text-slate-500">Ownership % (group)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={form.ownershipPct}
              onChange={(e) => setForm({ ...form, ownershipPct: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400 mt-0.5">
              NCI = 100% − ownership (e.g. 80% owned → 20% NCI)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editId ? "Update" : "Add entity"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({ code: "", name: "", currency: "USD", ownershipPct: 100 });
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">CCY</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Owned %</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">NCI %</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : entities.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No entities. Add one or open Consolidation to seed samples.</td></tr>
            ) : (
              entities.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{e.code}</td>
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.currency}</td>
                  <td className="px-4 py-3 text-right">{e.ownershipPct}%</td>
                  <td className="px-4 py-3 text-right text-slate-500">{(100 - e.ownershipPct).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(e)} className="text-isaca-medium text-xs font-medium hover:underline">Edit</button>
                    <button onClick={() => remove(e.id)} className="text-red-600 text-xs font-medium hover:underline inline-flex items-center gap-0.5">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
