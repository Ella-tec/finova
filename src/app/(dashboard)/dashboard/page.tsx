"use client";

import {
  ArrowRight, ArrowUpRight, AlertTriangle, BarChart3, Bot, Building2,
  CalendarDays, CheckCircle2, Clock3, FileText, Receipt, Sparkles,
  TrendingUp, Users, Wallet, DollarSign, BookOpen, ShieldCheck, ChevronLeft, ChevronRight, Landmark, Scale, Activity, FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const financialGroups = [
  {
    label: "Receivables & Payables",
    description: "Working capital, customer balances, supplier obligations, and cash.",
    cards: [
      { label: "Accounts receivable", value: "$1.24M", detail: "Customer balances outstanding", icon: Users, href: "/dashboard/ar", tone: "blue" },
      { label: "Accounts payable", value: "$684K", detail: "Supplier balances to settle", icon: Receipt, href: "/dashboard/operations#accounting", tone: "orange" },
      { label: "Cash & bank", value: "$4.2M", detail: "Across operating accounts", icon: Wallet, href: "/dashboard/bank-rec", tone: "green" },
      { label: "Open bills", value: "$220K", detail: "Awaiting payment", icon: FileText, href: "/dashboard/operations#accounting", tone: "purple" },
    ],
  },
  {
    label: "Financial Statements",
    description: "Performance and position across the core financial statements.",
    cards: [
      { label: "Revenue", value: "$8.5M", detail: "Year to date", icon: TrendingUp, href: "/dashboard/reporting/statements", tone: "blue" },
      { label: "Expenses", value: "$6.2M", detail: "Year to date", icon: Receipt, href: "/dashboard/reporting/statements", tone: "orange" },
      { label: "Net income", value: "$2.3M", detail: "Year to date", icon: DollarSign, href: "/dashboard/reporting/statements", tone: "green" },
      { label: "Operating cash flow", value: "$1.1M", detail: "Cash generated from operations", icon: Activity, href: "/dashboard/reporting/statements", tone: "teal" },
    ],
  },
  {
    label: "Accounting & Controls",
    description: "Ledger integrity, trial balance, journal activity, and close readiness.",
    cards: [
      { label: "Trial balance", value: "Balanced", detail: "Debits equal credits", icon: Scale, href: "/dashboard/reporting/statements", tone: "green" },
      { label: "General ledger", value: "128", detail: "Active accounts", icon: BookOpen, href: "/dashboard/operations#accounting", tone: "blue" },
      { label: "Journal entries", value: "42", detail: "Posted this period", icon: FileSpreadsheet, href: "/dashboard/operations#accounting", tone: "purple" },
      { label: "Bank reconciliation", value: "96%", detail: "Transactions matched", icon: Landmark, href: "/dashboard/bank-rec", tone: "teal" },
    ],
  },
];

const tasks = [
  { title: "Bank reconciliation — October", client: "Acme Corp", due: "Today", status: "In progress", href: "/dashboard/bank-rec", tone: "blue" },
  { title: "Review AP accruals", client: "TechStart LLC", due: "Tomorrow", status: "Needs review", href: "/dashboard/close", tone: "orange" },
  { title: "Prepare trial balance", client: "Green Energy Inc", due: "Nov 20", status: "Not started", href: "/dashboard/reporting/statements", tone: "slate" },
  { title: "PBC — bank statements", client: "Acme Corp", due: "Nov 21", status: "Client response", href: "/dashboard/audit/pbc", tone: "teal" },
];

const insights = [
  "Revenue is trending above the prior period in this demo dataset.",
  "Three bank items need review before the close can be completed.",
  "Two PBC requests are approaching their target due dates.",
];

const quickActions = [
  { label: "Create journal entry", href: "/dashboard/operations#accounting", icon: Receipt },
  { label: "Import trial balance", href: "/dashboard/reporting/statements", icon: BarChart3 },
  { label: "Match bank transactions", href: "/dashboard/bank-rec", icon: Wallet },
  { label: "Start month-end close", href: "/dashboard/close", icon: CalendarDays },
  { label: "Create PBC request", href: "/dashboard/audit/pbc", icon: FileText },
];

function toneClasses(tone: string) {
  const tones: Record<string, string> = {
    green: "finova-tone-green",
    blue: "finova-tone-blue",
    orange: "finova-tone-orange",
    purple: "finova-tone-purple",
    red: "finova-tone-red",
    teal: "finova-tone-teal",
    slate: "finova-tone-slate",
  };
  return tones[tone] || tones.slate;
}

function AccountingVisual() {
  return (
    <div className="finova-hero-art" aria-hidden="true">
      <div className="finova-art-orbit finova-art-orbit-one" />
      <div className="finova-art-orbit finova-art-orbit-two" />
      <div className="finova-art-glow" />
      <div className="finova-art-chart">
        <div className="finova-art-chart-head"><span /><span /><span /></div>
        <div className="finova-art-bars"><i /><i /><i /><i /><i /><i /><i /></div>
        <svg viewBox="0 0 260 100" className="finova-art-line" fill="none">
          <path d="M8 78 C38 72 45 50 76 56 S120 69 148 38 S202 43 250 8" stroke="#75e0c1" strokeWidth="4" strokeLinecap="round" />
          <path d="M8 78 C38 72 45 50 76 56 S120 69 148 38 S202 43 250 8 L250 100 L8 100Z" fill="url(#chartFill)" opacity=".2" />
          <defs><linearGradient id="chartFill" x1="130" y1="0" x2="130" y2="100"><stop stopColor="#75e0c1"/><stop offset="1" stopColor="#75e0c1" stopOpacity="0"/></linearGradient></defs>
        </svg>
      </div>
      <div className="finova-art-book">
        <div className="finova-book-left"><span /><span /><span /></div>
        <div className="finova-book-right"><span /><span /><span /></div>
        <div className="finova-book-spine" />
      </div>
      <div className="finova-art-float finova-art-float-top"><ShieldCheck size={17} /> Close controls</div>
      <div className="finova-art-float finova-art-float-bottom"><TrendingUp size={17} /> Financial clarity</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeFinancialGroup, setActiveFinancialGroup] = useState(0);
  const activeGroup = financialGroups[activeFinancialGroup];
  const firstName = session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      <section className="finova-welcome-hero">
        <div className="finova-welcome-copy">
          <div className="finova-eyebrow"><span className="finova-eyebrow-dot" /> YOUR FINANCIAL WORKSPACE</div>
          <h1>{hello}, {firstName}<span>.</span></h1>
          <p>Bring your accounting, reporting, and client work together. See what needs attention and move the business forward with confidence.</p>
          <div className="finova-hero-actions">
            <Link href="/dashboard/operations#accounting" className="finova-button-primary">Open accounting <ArrowRight size={16} /></Link>
            <Link href="/dashboard/reporting" className="finova-button-quiet">Explore reports <ArrowUpRight size={16} /></Link>
          </div>
          <div className="finova-hero-trust"><ShieldCheck size={15} /> Organized workflows · Clear approvals · Audit-ready activity</div>
        </div>
        <AccountingVisual />
        <div className="finova-hero-date"><CalendarDays size={15} /> {today}</div>
      </section>

      <div className="finova-demo-note"><span /> Demo snapshot — figures and activity below are sample data, not live books.</div>

      <section aria-label="Financial dashboard" className="space-y-4">
        <div className="finova-section-heading">
          <div><h2>Financial dashboard</h2><p>12 essential measures, organized by accounting area.</p></div>
          <span className="text-xs font-semibold text-slate-500">{activeFinancialGroup + 1} of {financialGroups.length} groups</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Financial KPI groups">
            {financialGroups.map((group, index) => (
              <button key={group.label} type="button" role="tab" aria-selected={activeFinancialGroup === index}
                onClick={() => setActiveFinancialGroup(index)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeFinancialGroup === index ? "border-[var(--page-primary)] bg-[var(--page-primary)] text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
                {group.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous KPI group" onClick={() => setActiveFinancialGroup((activeFinancialGroup + financialGroups.length - 1) % financialGroups.length)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><ChevronLeft size={18}/></button>
            <button type="button" aria-label="Next KPI group" onClick={() => setActiveFinancialGroup((activeFinancialGroup + 1) % financialGroups.length)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{activeGroup.description}</p>
          <span className="shrink-0 text-xs font-medium text-slate-400">4 cards · Demo data</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="tabpanel">
          {activeGroup.cards.map(({ label, value, detail, icon: Icon, href, tone }) => (
            <Link key={label} href={href} className="finova-kpi-card group min-h-[158px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg">
              <div className="flex items-center justify-between gap-3"><span className="finova-card-label">{label}</span><span className={`finova-icon-tile ${toneClasses(tone)}`}><Icon size={19}/></span></div>
              <p className="finova-kpi-value mt-4">{value}</p>
              <div className="mt-3 flex items-center justify-between gap-2"><span className="finova-card-detail">{detail}</span><ArrowUpRight size={17} className="shrink-0 text-slate-300 transition group-hover:text-[var(--page-primary)]"/></div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center gap-2" aria-label="KPI group slide position">
          {financialGroups.map((group, index) => <button key={group.label} type="button" aria-label={`Show ${group.label}`} aria-pressed={activeFinancialGroup === index} onClick={() => setActiveFinancialGroup(index)}
            className={`h-2 rounded-full transition-all ${activeFinancialGroup === index ? "w-8 bg-[var(--page-primary)]" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
        <div className="finova-panel overflow-hidden">
          <div className="finova-panel-heading"><div><h2>Work to move forward</h2><p>Your priorities and upcoming deadlines.</p></div><Link href="/dashboard/close">View all <ArrowRight size={15}/></Link></div>
          <div className="divide-y divide-slate-100">
            {tasks.map(task => <Link key={task.title} href={task.href} className="finova-task-row">
              <span className="min-w-0"><strong>{task.title}</strong><small>{task.client}</small></span>
              <span className="flex shrink-0 items-center gap-3"><small>Due {task.due}</small><span className={`finova-status ${toneClasses(task.tone)}`}>{task.status}</span></span>
            </Link>)}
          </div>
        </div>
        <div className="space-y-5">
          <div className="finova-ai-card">
            <div className="flex items-center gap-2"><span className="finova-ai-mark"><Bot size={19}/></span><span className="font-semibold">Finova AI</span><Sparkles size={15} className="text-amber-300"/></div>
            <h2>Make the next decision with clarity.</h2>
            <p>Explore balances, summarize workpapers, prepare journal drafts, and identify close gaps — with your review and approval.</p>
            <Link href="/dashboard/ai" className="finova-ai-button">Ask Finova AI <ArrowRight size={16}/></Link>
          </div>
          <div className="finova-panel p-5"><div className="finova-panel-heading !border-0 !p-0"><div><h2>Insights</h2><p>Signals worth a closer look.</p></div><Sparkles size={17} className="text-[var(--page-accent)]"/></div>
            <ul className="mt-4 space-y-3">{insights.map(line => <li key={line} className="flex gap-2.5 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--page-accent)]"/>{line}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="finova-panel p-5">
          <div className="finova-panel-heading !border-0 !p-0"><div><h2>Quick actions</h2><p>Get straight to the work.</p></div><Sparkles size={17} className="text-[var(--page-accent)]"/></div>
          <div className="mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-1">{quickActions.map(({label,href,icon:Icon})=><Link key={label} href={href} className="finova-quick-link"><span><Icon size={17}/>{label}</span><ArrowUpRight size={16}/></Link>)}</div>
        </div>
        <div className="finova-panel p-5">
          <div className="finova-panel-heading !border-0 !p-0"><div><h2>Recent activity</h2><p>A connected view of the work happening across your firm.</p></div><Building2 size={19} className="text-[var(--page-accent)]"/></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {title:"Document uploaded",detail:"October Bank Statement.pdf · Acme",time:"12 min ago",action:"Open documents",href:"/dashboard/documents",icon:FileText},
              {title:"Journal approved",detail:"JE-2026-1042 · Accrued expenses",time:"1 hour ago",action:"Open accounting",href:"/dashboard/operations#accounting",icon:CheckCircle2},
              {title:"AI draft ready",detail:"Four proposed close entries",time:"2 hours ago",action:"Review AI",href:"/dashboard/ai",icon:Bot},
            ].map(item=><article key={item.title} className="finova-activity-card"><span className="finova-icon-tile finova-tone-teal"><item.icon size={18}/></span><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small><Link href={item.href}>{item.action}<ArrowUpRight size={14}/></Link></article>)}
          </div>
        </div>
      </section>
    </div>
  );
}
