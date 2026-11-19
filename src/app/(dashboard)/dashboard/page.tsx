"use client";

import {
  ArrowRight, ArrowUpRight, AlertTriangle, BarChart3, Bot, Building2,
  CalendarDays, CheckCircle2, Clock3, FileText, Receipt, Sparkles,
  TrendingUp, Users, Wallet, DollarSign, BookOpen, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const moneyKpis = [
  { label: "Cash position", value: "$4.2M", detail: "Across operating accounts", icon: Wallet, href: "/dashboard/bank-rec", tone: "green" },
  { label: "YTD revenue", value: "$8.5M", detail: "Current financial year", icon: TrendingUp, href: "/dashboard/reporting/statements", tone: "blue" },
  { label: "Open bills", value: "$220K", detail: "Awaiting payment", icon: Receipt, href: "/dashboard/operations#accounting", tone: "orange" },
  { label: "Net income", value: "$2.3M", detail: "Year to date", icon: DollarSign, href: "/dashboard/reporting/statements", tone: "purple" },
];

const workStats = [
  { label: "Open tasks", value: "12", detail: "Across engagements", icon: Clock3, href: "/dashboard/close", tone: "orange" },
  { label: "Approvals", value: "5", detail: "Ready for review", icon: CheckCircle2, href: "/dashboard/close", tone: "green" },
  { label: "Client requests", value: "8", detail: "Waiting on response", icon: Users, href: "/dashboard/audit/pbc", tone: "blue" },
  { label: "Exceptions", value: "3", detail: "Bank & books", icon: AlertTriangle, href: "/dashboard/bank-rec", tone: "red" },
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

      <section aria-label="Financial overview" className="space-y-3">
        <div className="finova-section-heading"><div><h2>Financial overview</h2><p>A quick view of the numbers that matter.</p></div><Link href="/dashboard/reporting/statements">View reports <ArrowRight size={15}/></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {moneyKpis.map(({ label, value, detail, icon: Icon, href, tone }) => (
            <Link key={label} href={href} className="finova-kpi-card group">
              <div className="flex items-center justify-between"><span className="finova-card-label">{label}</span><span className={`finova-icon-tile ${toneClasses(tone)}`}><Icon size={19}/></span></div>
              <p className="finova-kpi-value">{value}</p>
              <div className="flex items-center justify-between"><span className="finova-card-detail">{detail}</span><ArrowUpRight size={17} className="text-slate-300 transition group-hover:text-[var(--page-primary)]"/></div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Work overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {workStats.map(({ label, value, detail, icon: Icon, href, tone }) => (
          <Link key={label} href={href} className="finova-work-stat group">
            <span className={`finova-icon-tile h-11 w-11 ${toneClasses(tone)}`}><Icon size={20}/></span>
            <span className="min-w-0 flex-1"><span className="finova-card-label">{label}</span><strong>{value}</strong><span className="finova-card-detail">{detail}</span></span>
            <ArrowUpRight size={16} className="text-slate-300 transition group-hover:text-[var(--page-primary)]"/>
          </Link>
        ))}
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
