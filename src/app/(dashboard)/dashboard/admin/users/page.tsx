"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

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
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STAFF_ACCOUNTANT" as Role,
  });
  const [inviting, setInviting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/invite");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setTempPassword(null);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setTempPassword(data.temporaryPassword);
      setForm({ name: "", email: "", role: "STAFF_ACCOUNTANT" });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Invites</h1>
          <p className="mt-1 text-slate-600">
            Manage firm users — click a row for details
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInviteOpen(true);
            setSelected(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
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

      {inviteOpen && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Invite a new user</h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {tempPassword && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> User created
              </p>
              <p className="mt-1 text-emerald-700">
                Temporary password:{" "}
                <code className="rounded bg-white px-1.5 py-0.5">{tempPassword}</code>
              </p>
            </div>
          )}
          <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-3">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                disabled={inviting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteOpen(false);
                  setTempPassword(null);
                }}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Name</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Email</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Role</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No users yet
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={cn(
                    "cursor-pointer transition hover:bg-emerald-50/60",
                    selected?.id === u.id && "bg-emerald-50"
                  )}
                >
                  <td className="px-6 py-3.5 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        roleTone(u.role)
                      )}
                    >
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                  {(selected.name || selected.email).slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selected.name || "User"}
                  </h2>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">User ID</dt>
                  <dd className="font-mono text-xs text-slate-700">{selected.id}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="text-slate-800">{selected.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Shield className="h-4 w-4 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Role</dt>
                  <dd>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        roleTone(selected.role)
                      )}
                    >
                      {selected.role.replace(/_/g, " ")}
                    </span>
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Joined</dt>
                  <dd className="text-slate-800">
                    {new Date(selected.createdAt).toLocaleString()}
                  </dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              Role changes and deactivation are managed by firm administrators in
              production.
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
