"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Receipt,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  DollarSign,
  BookOpen,
  Landmark,
  Scale,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

const heroSlides = [
  { src: "/images/finova-hero-1.png", label: "Audit workspace" },
  { src: "/images/finova-hero-2.png", label: "AI audit intelligence" },
  { src: "/images/finova-hero-3.png", label: "Future of accounting" },
  { src: "/images/finova-hero-4.png", label: "Financial analysis" },
  { src: "/images/finova-hero-5.png", label: "Audit confidence" },
];

function HeroImageCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        aria-hidden="true"
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url("${slide.src}")` }}
          />
        ))}
        {/* Soft left shade only — image stays clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f3a]/50 via-[#0b1f3a]/15 to-transparent" />
      </div>

      <div
        className="absolute bottom-5 right-6 z-30 flex items-center gap-2"
        aria-label="Hero slides"
      >
        {heroSlides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${index + 1}: ${slide.label}`}
            aria-current={active === index ? "true" : undefined}
            onClick={() => setActive(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              active === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function WelcomeHero({
  hello,
  firstName,
  today,
}: {
  hello: string;
  firstName: string;
  today: string;
}) {
  return (
    <section className="finova-welcome-hero relative isolate min-h-[320px] overflow-hidden rounded-2xl">
      <HeroImageCarousel />

      <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            YOUR FINANCIAL WORKSPACE
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <CalendarDays size={14} />
            {today}
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-4xl">
            {hello}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-white/90 drop-shadow sm:text-base">
            Accounting, reporting, and client work in one place.
          </p>
        </div>
      </div>
    </section>
  );
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
    <div className="mx-auto max-w-[1480px] space-y-6">
      <WelcomeHero hello={hello} firstName={firstName} today={today} />

      <div className="finova-demo-note">
        <span />
        Demo snapshot — figures and activity below are sample data, not live books.
      </div>

      <section aria-label="Financial dashboard" className="space-y-4">
        <div className="finova-section-heading">
          <div>
            <h2>Financial overview</h2>
            <p>12 key accounting measures, each shown in its own card.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">12 financial measures</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {financialGroups.flatMap((group) => group.cards).map(({ label, value, detail, icon: Icon, href, tone }) => (
            <Link
              key={label}
              href={href}
              className="finova-kpi-card group min-h-[164px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="finova-card-label">{label}</span>
                <span className={`finova-icon-tile ${toneClasses(tone)}`}>
                  <Icon size={19} />
                </span>
              </div>
              <p className="finova-kpi-value mt-4">{value}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="finova-card-detail">{detail}</span>
                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-slate-300 transition group-hover:text-[var(--page-primary)]"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
        <div className="finova-panel overflow-hidden">
          <div className="finova-panel-heading">
            <div>
              <h2>Work to move forward</h2>
              <p>Your priorities and upcoming deadlines.</p>
            </div>
            <Link href="/dashboard/close">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <Link key={task.title} href={task.href} className="finova-task-row">
                <span className="min-w-0">
                  <strong>{task.title}</strong>
                  <small>{task.client}</small>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <small>Due {task.due}</small>
                  <span className={`finova-status ${toneClasses(task.tone)}`}>{task.status}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="finova-ai-card">
            <div className="flex items-center gap-2">
              <span className="finova-ai-mark">
                <Bot size={19} />
              </span>
              <span className="font-semibold">Finova AI</span>
              <Sparkles size={15} className="text-amber-300" />
            </div>
            <h2>Make the next decision with clarity.</h2>
            <p>
              Explore balances, summarize workpapers, prepare journal drafts,
              and identify close gaps — with your review and approval.
            </p>
            <Link href="/dashboard/ai" className="finova-ai-button">
              Ask Finova AI <ArrowRight size={16} />
            </Link>
          </div>

          <div className="finova-panel p-5">
            <div className="finova-panel-heading !border-0 !p-0">
              <div>
                <h2>Insights</h2>
                <p>Signals worth a closer look.</p>
              </div>
              <Sparkles size={17} className="text-[var(--page-accent)]" />
            </div>
            <ul className="mt-4 space-y-3">
              {insights.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-6 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--page-accent)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="finova-panel p-5">
          <div className="finova-panel-heading !border-0 !p-0">
            <div>
              <h2>Quick actions</h2>
              <p>Get straight to the work.</p>
            </div>
            <Sparkles size={17} className="text-[var(--page-accent)]" />
          </div>
          <div className="mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className="finova-quick-link">
                <span>
                  <Icon size={17} />
                  {label}
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>

        <div className="finova-panel p-5">
          <div className="finova-panel-heading !border-0 !p-0">
            <div>
              <h2>Recent activity</h2>
              <p>A connected view of the work happening across your firm.</p>
            </div>
            <Building2 size={19} className="text-[var(--page-accent)]" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { title: "Document uploaded", detail: "October Bank Statement.pdf · Acme", time: "12 min ago", action: "Open documents", href: "/dashboard/documents", icon: FileText },
              { title: "Journal approved", detail: "JE-2026-1042 · Accrued expenses", time: "1 hour ago", action: "Open accounting", href: "/dashboard/operations#accounting", icon: CheckCircle2 },
              { title: "AI draft ready", detail: "Four proposed close entries", time: "2 hours ago", action: "Review AI", href: "/dashboard/ai", icon: Bot },
            ].map((item) => (
              <article key={item.title} className="finova-activity-card">
                <span className="finova-icon-tile finova-tone-teal">
                  <item.icon size={18} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <small>{item.time}</small>
                <Link href={item.href}>
                  {item.action}
                  <ArrowUpRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}