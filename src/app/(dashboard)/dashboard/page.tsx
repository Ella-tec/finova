import { CheckCircle2, Clock3, AlertTriangle, FileText, Users, Bot, ArrowRight, ArrowUpRight, Wallet, CalendarDays, Sparkles } from "lucide-react";
import Link from "next/link";

const recentActivity = [
  { title: "Document uploaded", detail: "October Bank Statement.pdf · Acme Corp", time: "12 minutes ago", href: "/dashboard/documents", action: "Open documents", icon: FileText },
  { title: "Journal entry approved", detail: "JE-2026-1042 · Accrued Expenses", time: "1 hour ago", href: "/dashboard/accounting", action: "Open accounting", icon: CheckCircle2 },
  { title: "AI draft prepared", detail: "Four proposed entries for October close", time: "2 hours ago", href: "/dashboard/close", action: "Review draft", icon: Bot },
];

const stats = [
  { label: "Open tasks", value: "12", detail: "Across active engagements", icon: Clock3, tone: "amber", href: "/dashboard/close" },
  { label: "Pending approvals", value: "5", detail: "Ready for your review", icon: CheckCircle2, tone: "green", href: "/dashboard/close" },
  { label: "Client requests", value: "8", detail: "Waiting for a response", icon: Users, tone: "blue", href: "/dashboard/audit/pbc" },
  { label: "Exceptions", value: "3", detail: "Need attention", icon: AlertTriangle, tone: "rose", href: "/dashboard/bank-rec" },
];

const tasks = [
  { title: "Bank reconciliation — October", client: "Acme Corp", due: "Today", status: "In progress", href: "/dashboard/bank-rec", tone: "green" },
  { title: "Review AP accruals", client: "TechStart LLC", due: "Tomorrow", status: "Pending review", href: "/dashboard/close", tone: "amber" },
  { title: "Prepare trial balance", client: "Green Energy Inc", due: "Nov 5", status: "Not started", href: "/dashboard/reporting/statements", tone: "slate" },
  { title: "PBC request — bank statements", client: "Acme Corp", due: "Nov 4", status: "Client response", href: "/dashboard/audit/pbc", tone: "blue" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#087f68]">Your workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#172b3a]">Good morning, Accountant</h1><p className="mt-2 text-sm text-[#71817e]">Here’s what needs your attention today.</p></div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#e3ebe6] bg-white px-3 py-2 text-sm text-[#61736c] sm:self-auto"><CalendarDays className="h-4 w-4 text-[#087f68]" /> Friday, November 6</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({label,value,detail,icon:Icon,tone,href}) => <Link key={label} href={href} className="group rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-[0_3px_16px_-12px_rgba(23,43,58,.25)] transition hover:-translate-y-0.5 hover:border-[#b9d9ca] hover:shadow-lg"><div className="flex items-center justify-between"><span className="text-sm font-medium text-[#71817e]">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone === "green" ? "bg-[#e9f5ef] text-[#087f68]" : tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "blue" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"}`}><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-[#172b3a]">{value}</p><div className="mt-2 flex items-center justify-between"><span className="text-xs text-[#91a09b]">{detail}</span><ArrowUpRight className="h-4 w-4 text-[#a2b0aa] transition group-hover:text-[#087f68]" /></div></Link>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <div className="overflow-hidden rounded-2xl border border-[#e4ebe6] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-5 sm:px-6"><div><h2 className="font-semibold text-[#263e4a]">My work</h2><p className="mt-1 text-xs text-[#91a09b]">Your current priorities and deadlines</p></div><Link href="/dashboard/close" className="inline-flex items-center gap-1 text-sm font-semibold text-[#087f68] hover:text-[#066b59]">View all <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="divide-y divide-[#edf1ee]">{tasks.map(task => <Link key={task.title} href={task.href} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#f8fbf9] sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#2b414b]">{task.title}</p><p className="mt-1 text-xs text-[#87958f]">{task.client}</p></div><div className="flex shrink-0 items-center gap-3 sm:justify-end"><span className="text-xs text-[#87958f]">Due {task.due}</span><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${task.tone === "green" ? "bg-[#e9f5ef] text-[#087f68]" : task.tone === "amber" ? "bg-amber-50 text-amber-700" : task.tone === "blue" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"}`}>{task.status}</span><ArrowRight className="h-4 w-4 text-[#a5b1ab]" /></div></Link>)}</div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl bg-[#172f3d] p-6 text-white shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Bot className="h-5 w-5 text-[#9dd9bf]" /></span><Sparkles className="h-5 w-5 text-[#9dd9bf]" /></div><h2 className="mt-5 text-lg font-semibold">Finova AI Assistant</h2><p className="mt-2 text-sm leading-6 text-[#c1d1cb]">Get help understanding accounting workflows, drafting summaries, and preparing work for your review.</p><Link href="/dashboard/ai" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8fd3b6] px-4 py-2.5 text-sm font-semibold text-[#173a35] hover:bg-[#b0e2cb]">Open AI workspace <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-sm"><h2 className="font-semibold text-[#263e4a]">Quick actions</h2><p className="mt-1 text-xs text-[#91a09b]">Jump into a common workflow</p><div className="mt-4 space-y-1">{[{label:"Import trial balance",href:"/dashboard/reporting/statements"},{label:"Generate financial statements",href:"/dashboard/reporting/statements"},{label:"Create PBC request",href:"/dashboard/audit/pbc"},{label:"Start month-end close",href:"/dashboard/close"}].map(item=><Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[#526760] transition hover:bg-[#f1f7f3] hover:text-[#087f68]">{item.label}<ArrowUpRight className="h-4 w-4 text-[#9aaba3]" /></Link>)}</div></div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e4ebe6] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-[#263e4a]">Recent activity</h2><p className="mt-1 text-xs text-[#91a09b]">Open an activity to view the related workspace item</p></div><Wallet className="h-5 w-5 text-[#087f68]" /></div><div className="mt-5 grid gap-3 md:grid-cols-3">{recentActivity.map((item) => { const Icon = item.icon; return <Link key={item.title} href={item.href} aria-label={`${item.action}: ${item.title}`} className="group flex min-w-0 gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#dcebe2] hover:bg-[#f6faf7] focus:outline-none focus:ring-2 focus:ring-[#087f68]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf6f0] text-[#087f68]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#344b58]">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#82918d]">{item.detail}</span><span className="mt-2 block text-[11px] text-[#a0ada7]">{item.time}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#087f68]">{item.action}<ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></span></Link>; })}</div><div className="mt-3 flex justify-end"><Link href="/dashboard/documents" className="text-xs font-semibold text-[#087f68] hover:underline">View all documents →</Link></div></section>
    </div>
  );
}
