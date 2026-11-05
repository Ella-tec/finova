"use client";

import { useEffect, useState } from "react";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { Role } from "@prisma/client";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
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
    const res = await fetch("/api/users/invite");
    const data = await res.json();
    if (data.users) setUsers(data.users);
    setLoading(false);
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
      if (!res.ok) throw new Error(data.error);

      setTempPassword(data.temporaryPassword);
      setForm({ name: "", email: "", role: "STAFF_ACCOUNTANT" });
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Invites</h1>
          <p className="text-slate-600 mt-1">Manage firm users and send invitations</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {inviteOpen && (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Invite a new user</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {tempPassword && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm">
              <p className="font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> User created
              </p>
              <p className="mt-1 text-emerald-700">
                Temporary password: <code className="bg-white px-1.5 py-0.5 rounded">{tempPassword}</code>
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Share this password securely. In production this would be emailed.
              </p>
            </div>
          )}
          <form onSubmit={handleInvite} className="grid sm:grid-cols-3 gap-4">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <div className="sm:col-span-3 flex gap-2">
              <button
                type="submit"
                disabled={inviting}
                className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white hover:bg-isaca-dark disabled:opacity-60"
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
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-slate-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-slate-500">Email</th>
              <th className="text-left px-6 py-3 font-medium text-slate-500">Role</th>
              <th className="text-left px-6 py-3 font-medium text-slate-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Loading&
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
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-3 text-slate-600">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
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