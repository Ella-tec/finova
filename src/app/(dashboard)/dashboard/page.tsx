"use client";

import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  Users,
  Bot,
  ArrowRight,
  ArrowUpRight,
  Wallet,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Receipt,
  DollarSign,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const moneyKpis = [
  {
    label: "Cash",
    value: "$4.2M",
    detail: "Across operating accounts",
    icon: Wallet,
    href: "/dashboard/bank-rec",
    tone: "green" as const,
  },
  {
    label: "Income",
    value: "$8.5M",
    detail: "YTD revenue",
    icon: TrendingUp,
    href: "/dashboard/reporting/statements",
    tone: "blue" as const,
  },
  {
    label: "Bills",
    value: "$220K",
    detail: "Open payables",
    icon: Receipt,
    href: "/dashboard/operations#accounting",
    tone: "amber" as const,
  },
  {
    label: "Profit",
    value: "$2.3M",
    detail: "YTD net income",
    icon: DollarSign,
    href: "/dashboard/reporting/statements",
    tone: "green" as const,
  },
];

const workStats = [
  {
    label: "Open tasks",
    value: "12",
    detail: "Across engagements",
    icon: Clock3,
    tone: "amber" as const,
    href: "/dashboard/close",
  },
  {
    label: "Approvals",
    value: "5",
    detail: "Ready for review",
    icon: CheckCircle2,
    tone: "green" as const,
    href: "/dashboard/close",
  },
  {
    label: "Client requests",
    value: "8",
    detail: "Waiting on response",
    icon: Users,
    tone: "blue" as const,
    href: "/dashboard/audit/pbc",
  },
  {
    label: "Exceptions",
    value: "3",
    detail: "Bank & books",
    icon: AlertTriangle,
    tone: "rose" as const,
    href: "/dashboard/bank-rec",
  },
];

const tasks = [
  {
    title: "Bank reconciliation — October",
    client: "Acme Corp",
    due: "Today",
    status: "In progress",
    href: "/dashboard/bank-rec",
    tone: "blue",
  },
  {
    title: "Review AP accruals",
    client: "TechStart LLC",
    due: "Tomorrow",
    status: "Needs review",
    href: "/dashboard/close",
    tone: "amber",
  },
  {
    title: "Prepare trial balance",
    client: "Green Energy Inc",
    due: "Nov 18",
    status: "Not started",
    href: "/dashboard/reporting/statements",
    tone: "slate",
  },
  {
    title: "PBC — bank statements",
    client: "Acme Corp",
    due: "Nov 20",
    status: "Client response",
    href: "/dashboard/audit/pbc",
    tone: "blue",
  },
];

const insights = [
  "Revenue up ~12% vs prior period (demo sample).",
  "3 bank items still need review before close.",
  "2 PBC requests are past suggested due date.",
];

function toneClasses(tone: string) {
  if (tone === "green") return "bg-emerald-50 text-emerald-700";
  if (tone === "amber") return "bg-amber-50 text-amber-700";
  if (tone === "blue") return "bg-sky-50 text-sky-700";
  if (tone === "rose") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";

  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Friendly header — QuickBooks style */}
      <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {hello}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 sm:self-auto">
          <CalendarDays className="h-4 w-4 text-emerald-600" />
          {today}
        </div>
      </section>

      <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-2.5 text-xs text-sky-900">
        Demo snapshot — KPI amounts and task names are sample data for product
        design, not live books.
      </div>

      {/* Business money KPIs — like QuickBooks */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {moneyKpis.map(({ label, value, detail, icon: Icon, href, tone }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses(tone)}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-400">{detail}</span>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-600" />
            </div>
          </Link>
        ))}
      </section>

      {/* Work queue stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {workStats.map(({ label, value, detail, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-emerald-200"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses(tone)}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="text-xl font-semibold text-slate-900">{value}</p>
              <p className="truncate text-[11px] text-slate-400">{detail}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        {/* My work */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-800">To do</h2>
              <p className="text-xs text-slate-400">Priorities and deadlines</p>
            </div>
            <Link
              href="/dashboard/close"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <Link
                key={task.title}
                href={task.href}
                className="flex flex-col gap-2 px-5 py-3.5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{task.client}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">Due {task.due}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses(task.tone)}`}
                  >
                    {task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* AI */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-300" />
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span className="text-sm font-semibold">Ask Finova AI</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Draft journals, explain balances, find close gaps, or summarize a
              workpaper — always with your approval.
            </p>
            <Link
              href="/dashboard/ai"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300"
            >
              Open AI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800">Insights</h2>
            <ul className="mt-3 space-y-2.5">
              {insights.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-sm text-slate-600"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800">Quick actions</h2>
            <div className="mt-3 space-y-1">
              {[
                {
                  label: "Create journal entry",
                  href: "/dashboard/operations#accounting",
                },
                {
                  label: "Import trial balance",
                  href: "/dashboard/reporting/statements",
                },
                { label: "Match bank transactions", href: "/dashboard/bank-rec" },
                { label: "Start month-end close", href: "/dashboard/close" },
                { label: "New PBC request", href: "/dashboard/audit/pbc" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent activity — soft rows */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Recent activity</h2>
            <p className="text-xs text-slate-400">
              Open the related workspace to continue
            </p>
          </div>
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Document uploaded",
              detail: "October Bank Statement.pdf · Acme",
              time: "12 min ago",
              action: "Documents",
              href: "/dashboard/documents",
            },
            {
              title: "Journal approved",
              detail: "JE-2026-1042 · Accrued expenses",
              time: "1 hour ago",
              action: "Accounting",
              href: "/dashboard/operations#accounting",
            },
            {
              title: "AI draft ready",
              detail: "Four proposed close entries",
              time: "2 hours ago",
              action: "Review AI",
              href: "/dashboard/ai",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-emerald-200 hover:bg-white"
            >
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
              >
                {item.action} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
