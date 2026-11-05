import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Bot,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good evening, Accountant
        </h1>
        <p className="mt-1 text-slate-600">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Open Tasks",
            value: "12",
            icon: Clock,
            color: "text-amber-600 bg-amber-50",
            href: "/dashboard/close",
          },
          {
            label: "Pending Approvals",
            value: "5",
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-50",
            href: "/dashboard/close",
          },
          {
            label: "Client Requests",
            value: "8",
            icon: Users,
            color: "text-blue-600 bg-blue-50",
            href: "/dashboard/audit/pbc",
          },
          {
            label: "Exceptions",
            value: "3",
            icon: AlertTriangle,
            color: "text-rose-600 bg-rose-50",
            href: "/dashboard/bank-rec",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border bg-white p-5 shadow-sm hover:border-isaca-teal hover:shadow-md transition block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-11 w-11 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Work */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">My Work</h2>
            <Link
              href="/dashboard/close"
              className="text-sm font-medium text-isaca-medium hover:text-isaca-dark flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y">
            {[
              { title: "Bank Reconciliation — October", client: "Acme Corp", due: "Today", status: "In Progress", href: "/dashboard/bank-rec" },
              { title: "Review AP Accruals", client: "TechStart LLC", due: "Tomorrow", status: "Pending", href: "/dashboard/close" },
              { title: "Prepare Trial Balance", client: "Green Energy Inc", due: "Nov 5", status: "Not Started", href: "/dashboard/reporting/statements" },
              { title: "PBC Request — Bank Statements", client: "Acme Corp", due: "Nov 4", status: "Waiting on Client", href: "/dashboard/audit/pbc" },
            ].map((task) => (
              <Link
                key={task.title}
                href={task.href}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-isaca-medium"
              >
                <div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{task.due}</p>
                  <p className="text-xs text-slate-500">{task.status}</p>
                </div>
                <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* AI & Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-gradient-to-br from-isaca-medium to-fin-800 text-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5" />
              <h2 className="font-semibold">AI Assistant</h2>
            </div>
            <p className="text-sky-100 text-sm mb-4">
              Ask anything or generate statements, close tasks, or audit
              workpapers.
            </p>
            <Link
              href="/dashboard/ai"
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-medium transition"
            >
              Open AI Chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Import Trial Balance", href: "/dashboard/reporting/statements" },
                { label: "Generate Financial Statements", href: "/dashboard/reporting/statements" },
                { label: "Create PBC Request", href: "/dashboard/audit/pbc" },
                { label: "Start Month-End Close", href: "/dashboard/close" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          {[
            {
              action: "Document uploaded",
              detail: "October Bank Statement.pdf by Client  Acme Corp",
              time: "12 minutes ago",
            },
            {
              action: "Journal entry approved",
              detail: "JE-2026-1042  Accrued Expenses by Controller",
              time: "1 hour ago",
            },
            {
              action: "AI proposed accruals",
              detail: "4 entries for October close  awaiting review",
              time: "2 hours ago",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.action}
                </p>
                <p className="text-sm text-slate-500">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}