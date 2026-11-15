"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Loader2, CheckCircle2, RefreshCw, AlertCircle, Copy } from "lucide-react";
import { Role } from "@prisma/client";

type ClientOption = { id: string; name: string };

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

const ROLES: Role[] = [
  "CLIENT", "STAFF_ACCOUNTANT", "SENIOR_ACCOUNTANT", "CONTROLLER", "CFO",
  "AUDITOR", "AUDIT_MANAGER", "PARTNER", "TAX_MANAGER", "ADMIN",
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "STAFF_ACCOUNTANT" as Role, clientId: "" });
  const [inviting, setInviting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users/invite", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load firm users.");
      setUsers(data.users || []);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : "Could not load firm users.");
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
          ...(form.role === "CLIENT" ? { clientId: form.clientId } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "User invitation could not be completed.");
      if (!data.temporaryPassword) throw new Error("The user was created but no one-time setup credential was returned. Follow the configured invitation process.");
      setTempPassword(data.temporaryPassword);
      setForm({ name: "", email: "", role: "STAFF_ACCOUNTANT", clientId: "" });
      setNotice("Development user created. Share the one-time credential using a secure channel.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "User invitation failed.");
    } finally {
      setInviting(false);
    }
  };

  const copyPassword = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setNotice("One-time password copied. Share it only through an approved secure channel.");
    } catch {
      setError("Clipboard access was unavailable. Select the password and copy it manually.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-isaca-medium">Firm administration</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Users & Access</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Review firm membership and role assignments. Access is enforced by the server for every request.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
          </button>
          <button type="button" onClick={() => { setInviteOpen(true); setError(null); setNotice(null); }} className="inline-flex items-center gap-2 rounded-xl bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
            <UserPlus className="h-4 w-4" /> Invite user
          </button>
        </div>
      </header>

      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
        <strong>Invitation status:</strong> local development invitations can create a user and show a one-time temporary password. Production invitations are disabled until a secure password-setup or invitation email workflow is configured.
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {inviteOpen && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Create a firm user</h2>
              <p className="mt-1 text-xs text-slate-500">Available roles are validated against your own permission level on the server.</p>
            </div>
            <button type="button" onClick={() => { setInviteOpen(false); setTempPassword(null); }} className="text-sm font-medium text-slate-500 hover:text-slate-900">Close</button>
          </div>

          {tempPassword && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" /> Development user created</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-white px-3 py-2 text-sm text-emerald-950">{tempPassword}</code>
                <button type="button" onClick={() => void copyPassword()} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"><Copy className="h-3.5 w-3.5" /> Copy</button>
              </div>
              <p className="mt-2 text-xs text-emerald-800">This credential is shown once. Do not send it through ordinary email or chat.</p>
            </div>
          )}

          <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600">Full name
              <input required minLength={2} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Email
              <input required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Requested role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role, clientId: e.target.value === "CLIENT" ? form.clientId : "" })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900">
                {ROLES.map((role) => <option key={role} value={role}>{role.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            {form.role === "CLIENT" && (
              <label className="text-xs font-semibold text-slate-600 sm:col-span-3">
                Assign client workspace
                <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-900">
                  <option value="">Select a client workspace</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
                <span className="mt-1 block font-normal text-slate-500">This determines which client records the portal user can access.</span>
              </label>
            )}
            <div className="sm:col-span-3">
              <button type="submit" disabled={inviting} className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create user
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-semibold text-slate-900">Firm user register</h2><p className="mt-1 text-xs text-slate-500">{users.length} user(s) returned for your firm scope</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading users…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No firm users are available in this account scope.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{user.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{user.email}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{user.role.replace(/_/g, " ")}</span></td>
                  <td className="px-5 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
