"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileText,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string;
  customer: string;
  invoiceNo: string;
  date: string;
  due: string;
  amount: number;
  paid: number;
  status: "Open" | "Partial" | "Paid" | "Overdue";
};

const SAMPLE: Invoice[] = [
  {
    id: "1",
    customer: "Beta Foods Inc",
    invoiceNo: "INV-1001",
    date: "2026-09-15",
    due: "2026-10-15",
    amount: 15000,
    paid: 0,
    status: "Overdue",
  },
  {
    id: "2",
    customer: "City Distributors",
    invoiceNo: "INV-1002",
    date: "2026-10-01",
    due: "2026-10-31",
    amount: 15500,
    paid: 5000,
    status: "Partial",
  },
  {
    id: "3",
    customer: "Delta Stores",
    invoiceNo: "INV-1003",
    date: "2026-10-20",
    due: "2026-11-20",
    amount: 20000,
    paid: 0,
    status: "Open",
  },
  {
    id: "4",
    customer: "Eagle Wholesale",
    invoiceNo: "INV-1004",
    date: "2026-08-10",
    due: "2026-09-10",
    amount: 14000,
    paid: 0,
    status: "Overdue",
  },
  {
    id: "5",
    customer: "Delta Stores",
    invoiceNo: "INV-1005",
    date: "2026-09-01",
    due: "2026-09-30",
    amount: 8500,
    paid: 8500,
    status: "Paid",
  },
];

function daysPastDue(due: string) {
  const d = (Date.now() - new Date(due).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(d);
}

function bucket(inv: Invoice) {
  const open = inv.amount - inv.paid;
  if (open <= 0) return "paid";
  const d = daysPastDue(inv.due);
  if (d <= 0) return "current";
  if (d <= 30) return "30";
  if (d <= 60) return "60";
  if (d <= 90) return "90";
  return "90+";
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function ArAgingPage() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "overdue">("all");

  const rows = useMemo(() => {
    return SAMPLE.filter((r) => {
      if (filter === "open") return r.amount - r.paid > 0;
      if (filter === "overdue") return bucket(r) !== "current" && bucket(r) !== "paid";
      return true;
    });
  }, [filter]);

  const aging = useMemo(() => {
    const totals = { current: 0, b30: 0, b60: 0, b90: 0, b90p: 0, total: 0 };
    for (const inv of SAMPLE) {
      const open = inv.amount - inv.paid;
      if (open <= 0) continue;
      const b = bucket(inv);
      totals.total += open;
      if (b === "current") totals.current += open;
      else if (b === "30") totals.b30 += open;
      else if (b === "60") totals.b60 += open;
      else if (b === "90") totals.b90 += open;
      else totals.b90p += open;
    }
    return totals;
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard/operations"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> Accounting
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Customers & AR Aging</h1>
          <p className="mt-1 text-sm text-slate-600">
            Open invoices by age — click a row for detail (demo data)
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "open", "overdue"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold capitalize",
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Current", value: aging.current, icon: DollarSign, tone: "text-emerald-700 bg-emerald-50" },
          { label: "1–30 days", value: aging.b30, icon: FileText, tone: "text-sky-700 bg-sky-50" },
          { label: "31–60", value: aging.b60, icon: Users, tone: "text-amber-700 bg-amber-50" },
          { label: "61–90", value: aging.b90, icon: AlertTriangle, tone: "text-orange-700 bg-orange-50" },
          { label: "90+", value: aging.b90p, icon: AlertTriangle, tone: "text-rose-700 bg-rose-50" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", k.tone)}>
              <k.icon className="h-4 w-4" />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">{k.label}</p>
            <p className="text-lg font-semibold text-slate-900">{money(k.value)}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3 text-right">Open</th>
              <th className="px-4 py-3">Bucket</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const open = r.amount - r.paid;
              const b = bucket(r);
              return (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="cursor-pointer hover:bg-emerald-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{r.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{r.invoiceNo}</td>
                  <td className="px-4 py-3 text-slate-600">{r.due}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{money(open)}</td>
                  <td className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">{b}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        r.status === "Overdue"
                          ? "bg-rose-100 text-rose-800"
                          : r.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "Partial"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">{selected.invoiceNo}</h2>
            <p className="text-sm text-slate-500">{selected.customer}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Invoice date</dt>
                <dd>{selected.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Due date</dt>
                <dd>{selected.due}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium">{money(selected.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Paid</dt>
                <dd>{money(selected.paid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Open</dt>
                <dd className="font-semibold">{money(selected.amount - selected.paid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Aging bucket</dt>
                <dd className="uppercase">{bucket(selected)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl border py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
