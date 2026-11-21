"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  Shield,
  Calendar,
  User,
  Pencil,
  Trash2,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

type ClientOption = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

const ROLES: Role[] = [
  "CLIENT",
  "STAFF_ACCOUNTANT",
  "SENIOR_ACCOUNTANT",
  "CONTROLLER",
  "CFO",
  "AUDITOR",
  "AUDIT_MANAGER",
  "PARTNER",
  "TAX_MANAGER",
  "ADMIN",
];

function roleTone(role: string) {
  if (role === "ADMIN" || role === "PARTNER") return "bg-violet-100 text-violet-800";
  if (role === "CONTROLLER" || role === "CFO") return "bg-sky-100 text-sky-800";
  if (role === "CLIENT") return "bg-amber-100 text-amber-800";
  if (role.includes("AUDIT")) return "bg-indigo-100 text-indigo-800";
  return "bg-emerald-100 text-emerald-800";
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "create">(
    searchParams.get("tab") === "create" ? "create" : "list"
  );
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STAFF_ACCOUNTANT" as Role,
    clientId: "",
    password: "",
  });
  const [inviting, setInviting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/invite");
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (!res.ok && data.error) setError(data.error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clients", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) setClients(data.clients || []);
    } catch {
      setClients([]);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadClients();
  }, [load, loadClients]);

  useEffect(() => {
    if (searchParams.get("tab") === "create") setTab("create");
  }, [searchParams]);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviting(true);
    setError(null);
    setNotice(null);
    setTempPassword(null);
    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.role === "CLIENT" && form.clientId ? { clientId: form.clientId } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invite failed");
      setTempPassword(data.temporaryPassword);
      setNotice("Account created successfully.");
      setForm({ name: "", email: "", role: "STAFF_ACCOUNTANT", clientId: "", password: "" });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setInviting(true);
    setError(null);
    try {
      const response = await fetch("/api/users/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name: form.name,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setNotice("Account updated.");
      setEditing(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setError(null);
    try {
      const response = await fetch("/api/users/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");
      setNotice(`Deleted ${user.email}`);
      setSelected(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const copyPassword = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setNotice("One-time password copied. Share it only through a secure channel.");
    } catch {
      setError("Clipboard unavailable. Copy the password manually.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" /> Settings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="mt-1 text-slate-600">
            Create, edit, or delete firm accounts for access verification
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTab("create");
            setSelected(null);
            setEditing(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          <UserPlus className="h-4 w-4" />
          Create account
        </button>
      </div>

      <div className="flex w-fit gap-1 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold",
            tab === "list" ? "bg-white text-teal-800 shadow-sm" : "text-slate-500"
          )}
        >
          All accounts
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold",
            tab === "create" ? "bg-white text-teal-800 shadow-sm" : "text-slate-500"
          )}
        >
          Create
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total users</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Admins / partners</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {users.filter((u) => ["ADMIN", "PARTNER"].includes(u.role)).length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Clients</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {users.filter((u) => u.role === "CLIENT").length}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      )}

      {tab === "create" && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </span>
            <h2 className="font-semibold text-slate-900">Create account</h2>
          </div>
          {tempPassword && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Account created
              </p>
              <p className="mt-1 text-emerald-700">
                Temporary password:{" "}
                <code className="rounded bg-white px-1.5 py-0.5">{tempPassword}</code>
              </p>
              <button type="button" onClick={() => void copyPassword()} className="mt-2 text-xs font-semibold text-emerald-800 underline">
                Copy password
              </button>
            </div>
          )}
          <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-3">
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
            {form.role === "CLIENT" && clients.length > 0 && (
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:col-span-3">
                <option value="">Select client workspace</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2 sm:col-span-3">
              <button type="submit" disabled={inviting} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
                {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create account
              </button>
              <button type="button" onClick={() => setTab("list")} className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === "list" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Email</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Role</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Joined</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users yet — create an account</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-teal-50/50">
                    <td className="cursor-pointer px-6 py-3.5 font-medium text-slate-900" onClick={() => setSelected(u)}>{u.name}</td>
                    <td className="cursor-pointer px-6 py-3.5 text-slate-600" onClick={() => setSelected(u)}>{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", roleTone(u.role))}>{u.role.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="space-x-2 px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(u);
                          setForm({ name: u.name || "", email: u.email, role: u.role, clientId: "", password: "" });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-900">Edit account</h3>
            <p className="text-sm text-slate-500">{editing.email}</p>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="Name" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full rounded-xl border px-3 py-2.5 text-sm">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
            <input type="password" minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" placeholder="New password (optional, 12+)" />
            <button type="submit" disabled={inviting} className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
              {inviting ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {selected && !editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">
                  {(selected.name || selected.email).slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.name || "User"}</h2>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <User className="h-4 w-4 text-slate-400" />
                <div><dt className="text-xs text-slate-500">User ID</dt><dd className="font-mono text-xs text-slate-700">{selected.id}</dd></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Email</dt><dd className="text-slate-800">{selected.email}</dd></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Shield className="h-4 w-4 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Role</dt>
                  <dd><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", roleTone(selected.role))}>{selected.role.replace(/_/g, " ")}</span></dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div><dt className="text-xs text-slate-500">Joined</dt><dd className="text-slate-800">{new Date(selected.createdAt).toLocaleString()}</dd></div>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(selected);
                  setForm({ name: selected.name || "", email: selected.email, role: selected.role, clientId: "", password: "" });
                  setSelected(null);
                }}
                className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
              <button type="button" onClick={() => void handleDelete(selected)} className="flex-1 rounded-xl border border-red-100 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
