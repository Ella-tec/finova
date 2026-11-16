import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Banknote, Bot, CalendarDays,
  CheckCircle2, Clock3, FileText, Plus, Receipt, Sparkles, Wallet,
} from "lucide-react";

const metrics = [
  { label: "Cash on hand", value: "$4,208,650", change: "+4.8%", note: "vs. previous period", icon: Wallet, href: "/dashboard/bank-rec", tone: "green" },
  { label: "Income", value: "$8,524,300", change: "+8.2%", note: "vs. previous period", icon: ArrowUpRight, href: "/dashboard/reporting", tone: "blue" },
  { label: "Expenses", value: "$6,201,850", change: "+2.1%", note: "vs. previous period", icon: Receipt, href: "/dashboard/reporting", tone: "amber" },
  { label: "Net profit", value: "$2,322,450", change: "+12.6%", note: "vs. previous period", icon: Banknote, href: "/dashboard/reporting/statements", tone: "purple" },
];

const tasks = [
  { title: "Reconcile operating account", detail: "Main checking · October 2026", due: "Today", status: "In progress", href: "/dashboard/bank-rec", tone: "blue" },
  { title: "Review vendor bills", detail: "6 bills waiting for approval", due: "Today", status: "Needs review", href: "/dashboard/operations", tone: "amber" },
  { title: "Complete payroll journal", detail: "October payroll accrual", due: "Nov 18", status: "Not started", href: "/dashboard/close", tone: "slate" },
  { title: "Send bank statement request", detail: "Acme Manufacturing · PBC", due: "Nov 19", status: "Waiting on client", href: "/dashboard/audit/pbc", tone: "green" },
];

const activity = [
  { title: "Bank statement uploaded", detail: "Acme Manufacturing · October statement", time: "12 min ago", href: "/dashboard/documents", icon: FileText },
  { title: "Journal entry approved", detail: "JE-2026-1042 · Accrued expenses", time: "1 hr ago", href: "/dashboard/operations", icon: CheckCircle2 },
  { title: "AI close summary prepared", detail: "October close · 4 suggested follow-ups", time: "2 hrs ago", href: "/dashboard/ai", icon: Bot },
];

const quickActions = [
  { label: "Create invoice", detail: "Bill a customer", href: "/dashboard/clients", icon: Plus },
  { label: "Enter expense", detail: "Record a purchase", href: "/dashboard/operations", icon: Receipt },
  { label: "Reconcile account", detail: "Match bank activity", href: "/dashboard/bank-rec", icon: Wallet },
  { label: "Run a report", detail: "View financial results", href: "/dashboard/reporting", icon: FileText },
];

function Status({ tone, children }: { tone: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    green: "bg-[#e8f5ed] text-[#16834a]",
    blue: "bg-[#eaf2ff] text-[#2864b4]",
    amber: "bg-[#fff4df] text-[#a76808]",
    slate: "bg-[#f0f2f1] text-[#66736b]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone] || styles.slate}`}>{children}</span>;
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#718078]">Monday, let's make it count</p>
          <h1 className="mt-1 text-[30px] font-semibold tracking-[-.04em] text-[#23352a]">Good morning 👋</h1>
          <p className="mt-1 text-sm text-[#77857c]">Here’s your business at a glance. Let’s take care of what matters today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-xs font-medium text-[#69776e]"><CalendarDays className="h-4 w-4 text-[#16834a]" />{today}</span>
          <Link href="/dashboard/operations" className="inline-flex items-center gap-2 rounded-lg bg-[#16834a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#116b3c]"><Plus className="h-4 w-4" />Create new</Link>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e5eee7] bg-[#f0f8f2] px-4 py-2.5 text-xs text-[#55735e]">
        <span>Sample workspace · Figures and activity below are illustrative, not live financial records.</span>
        <Link href="/dashboard/admin" className="font-semibold text-[#16834a] hover:underline">Manage workspace</Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, change, note, icon: Icon, href, tone }) => (
          <Link key={label} href={href} className="group rounded-xl border border-[#e5ebe6] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b9d9c2] hover:shadow-[0_10px_28px_-18px_rgba(26,75,43,.35)]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#718078]">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone === "green" ? "bg-[#e8f5ed] text-[#16834a]" : tone === "blue" ? "bg-[#eaf2ff] text-[#2864b4]" : tone === "amber" ? "bg-[#fff4df] text-[#a76808]" : "bg-[#f1edff] text-[#7252b8]"}`}><Icon className="h-[18px] w-[18px]" /></span>
            </div>
            <p className="mt-4 text-[27px] font-semibold tracking-[-.04em] text-[#26372d]">{value}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px]"><span className="font-semibold text-[#16834a]">{change}</span><span className="text-[#96a198]">{note}</span></div>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_.9fr]">
        <div className="rounded-xl border border-[#e5ebe6] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-base font-semibold text-[#2d3d32]">Income and expenses</h2><p className="mt-1 text-xs text-[#8a978e]">A simple view of your business performance</p></div>
            <Link href="/dashboard/reporting" className="text-xs font-semibold text-[#16834a] hover:underline">View reports <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div><p className="text-xs text-[#8a978e]">Total income</p><p className="mt-1 text-xl font-semibold text-[#26372d]">$8.52M</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf2ee]"><div className="h-full w-[82%] rounded-full bg-[#239b59]" /></div></div>
            <div><p className="text-xs text-[#8a978e]">Total expenses</p><p className="mt-1 text-xl font-semibold text-[#26372d]">$6.20M</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf2ee]"><div className="h-full w-[60%] rounded-full bg-[#83a6d8]" /></div></div>
          </div>
          <div className="mt-7 grid h-[160px] grid-cols-6 items-end gap-3 border-b border-[#edf1ed] px-1 pb-2">
            {[["Jun",62,40],["Jul",75,49],["Aug",68,44],["Sep",83,58],["Oct",92,63],["Nov",78,51]].map(([month,income,expense]) => (
              <div key={month} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div title={`Income ${month}`} className="w-[42%] rounded-t-sm bg-[#239b59]" style={{ height: `${income}%` }} />
                  <div title={`Expenses ${month}`} className="w-[42%] rounded-t-sm bg-[#a9c2e5]" style={{ height: `${expense}%` }} />
                </div>
                <span className="text-[10px] text-[#89968d]">{month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-5 text-[11px] text-[#77857c]"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#239b59]" />Income</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#a9c2e5]" />Expenses</span></div>
        </div>

        <div className="rounded-xl border border-[#e5ebe6] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-[#2d3d32]">Bank accounts</h2><p className="mt-1 text-xs text-[#8a978e]">Balances at a glance</p></div><Link href="/dashboard/bank-rec" className="text-xs font-semibold text-[#16834a] hover:underline">Go to banking</Link></div>
          <div className="mt-5 space-y-4">
            {[{name:"Operating Checking",bank:"Commerce Bank",amount:"$2,845,200"},{name:"Payroll Account",bank:"U.S. Bank",amount:"$985,450"},{name:"Reserve Savings",bank:"Commerce Bank",amount:"$378,000"}].map((account) => <div key={account.name} className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6f0] text-[#16834a]"><LandmarkIcon /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#34443a]">{account.name}</p><p className="mt-0.5 text-[11px] text-[#8a978e]">{account.bank}</p></div><p className="text-sm font-semibold tabular-nums text-[#34443a]">{account.amount}</p></div>)}
          </div>
          <div className="mt-5 border-t border-[#edf1ed] pt-4"><Link href="/dashboard/bank-rec" className="flex items-center justify-between text-xs font-semibold text-[#16834a] hover:underline">Review transactions <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <div className="overflow-hidden rounded-xl border border-[#e5ebe6] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf1ed] px-5 py-4"><div><h2 className="text-base font-semibold text-[#2d3d32]">Tasks that need your attention</h2><p className="mt-1 text-xs text-[#8a978e]">Keep your accounting work moving</p></div><Link href="/dashboard/close" className="text-xs font-semibold text-[#16834a] hover:underline">See all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
          <div className="divide-y divide-[#edf1ed]">{tasks.map((task) => <Link key={task.title} href={task.href} className="flex flex-col gap-2 px-5 py-4 transition hover:bg-[#fbfdfb] sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-[#34443a]">{task.title}</p><p className="mt-1 text-xs text-[#8a978e]">{task.detail}</p></div><div className="flex items-center gap-3"><span className="text-[11px] text-[#8a978e]">Due {task.due}</span><Status tone={task.tone}>{task.status}</Status><ArrowRight className="hidden h-4 w-4 text-[#a1ada4] sm:block" /></div></Link>)}</div>
        </div>

        <div className="rounded-xl border border-[#e5ebe6] bg-white p-5">
          <h2 className="text-base font-semibold text-[#2d3d32]">Shortcuts</h2><p className="mt-1 text-xs text-[#8a978e]">Get to your next task faster</p>
          <div className="mt-4 grid grid-cols-2 gap-2">{quickActions.map(({label,detail,href,icon:Icon}) => <Link key={label} href={href} className="rounded-lg border border-[#e9eeea] p-3 transition hover:border-[#b9d9c2] hover:bg-[#f7fbf7]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf5ed] text-[#16834a]"><Icon className="h-4 w-4" /></span><span className="mt-3 block text-xs font-semibold text-[#34443a]">{label}</span><span className="mt-1 block text-[10px] text-[#8a978e]">{detail}</span></Link>)}</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-xl border border-[#e5ebe6] bg-white p-5">
          <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-[#2d3d32]">Recent activity</h2><p className="mt-1 text-xs text-[#8a978e]">The latest updates across your workspace</p></div><Clock3 className="h-4 w-4 text-[#8a978e]" /></div>
          <div className="mt-4 space-y-4">{activity.map(({title,detail,time,href,icon:Icon}) => <Link key={title} href={href} className="flex items-start gap-3 rounded-lg p-2 transition hover:bg-[#f8fbf8]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6f0] text-[#16834a]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#34443a]">{title}</span><span className="mt-1 block text-xs text-[#8a978e]">{detail}</span></span><span className="whitespace-nowrap text-[10px] text-[#9aa59d]">{time}</span></Link>)}</div>
        </div>
        <div className="rounded-xl bg-[#183d2a] p-6 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#a7e0b8]"><Sparkles className="h-5 w-5" /></span>
          <h2 className="mt-4 text-lg font-semibold">Your AI accounting partner</h2>
          <p className="mt-2 text-sm leading-6 text-[#d0e1d4]">Ask Finova to explain transactions, summarize workpapers, spot unusual balances, or prepare a close checklist for your review.</p>
          <Link href="/dashboard/ai" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#b9e7c5] px-4 py-2.5 text-sm font-semibold text-[#183d2a] hover:bg-white">Ask Finova AI <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}

function LandmarkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true"><path d="m3 9 9-6 9 6M4 10h16M6 10v8m4-8v8m4-8v8m4-8v8M3 20h18M2 22h20" /></svg>;
}
