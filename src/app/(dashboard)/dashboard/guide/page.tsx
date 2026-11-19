"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  LogIn,
  LayoutDashboard,
  FileText,
  Library,
  Shield,
  BookMarked,
  Wallet,
  Landmark,
  CalendarCheck,
  BarChart3,
  Building2,
  ClipboardCheck,
  Users,
  Phone,
  Bot,
  GraduationCap,
  Settings,
  ArrowRight,
  CheckCircle2,
  Upload,
  Download,
  Eye,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { title: string; detail: string; href?: string };

type Section = {
  id: string;
  title: string;
  audience: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: Step[];
};

const SECTIONS: Section[] = [
  {
    id: "access",
    title: "1. Sign in & access",
    audience: "Everyone",
    path: "/ → Sign in",
    icon: LogIn,
    steps: [
      {
        title: "Open the app",
        detail: "Go to the home page (localhost:3000 or your live URL).",
        href: "/",
      },
      {
        title: "Sign in on the same page",
        detail: "Enter work email and password, then click Enter workspace.",
      },
      {
        title: "Demo accounts",
        detail:
          "demo@finova.ai (staff) · controller@finova.ai · partner@finova.ai · client@acme.com (portal) · admin@finova.ai — use the password set in FINOVA_DEMO_PASSWORD when you seeded the database.",
      },
      {
        title: "Where you land",
        detail: "Staff → /dashboard. Client role → /portal.",
        href: "/dashboard",
      },
    ],
  },
  {
    id: "navigation",
    title: "2. Move around the app",
    audience: "Everyone",
    path: "Top bar · Sidebar",
    icon: LayoutDashboard,
    steps: [
      {
        title: "Back",
        detail: "Top-left Back returns to the previous page anywhere in the app.",
      },
      {
        title: "Home",
        detail: "Home goes to the firm dashboard (/dashboard) or portal home.",
        href: "/dashboard",
      },
      {
        title: "Sidebar",
        detail: "Left menu groups Workspace, Accounting, Audit & Clients, Administration.",
      },
      {
        title: "Search",
        detail: "Top search finds pages, clients, documents, and workflows.",
      },
      {
        title: "Ask AI / Contact",
        detail: "Shortcuts in the top bar open AI Assistant and Contact Center.",
        href: "/dashboard/ai",
      },
    ],
  },
  {
    id: "documents",
    title: "3. Documents (upload · view · download)",
    audience: "Staff & clients",
    path: "Workspace → Documents",
    icon: FileText,
    steps: [
      {
        title: "Open Documents",
        detail: "Sidebar → Documents, or /dashboard/documents.",
        href: "/dashboard/documents",
      },
      {
        title: "Choose company",
        detail: "Use the company filter (Acme, Nexus, Orbit, …) when available.",
      },
      {
        title: "Upload",
        detail: "Click Upload, pick files (PDF, Excel, images). Wait for status.",
      },
      {
        title: "View & download",
        detail: "Use View to open, Download to save a local copy.",
      },
      {
        title: "Client side",
        detail: "Clients use Portal → Documents to upload what the firm requested.",
        href: "/portal/documents",
      },
    ],
  },
  {
    id: "sanitizer",
    title: "4. File Sanitizer (before AI)",
    audience: "Staff",
    path: "Workspace → File Sanitizer",
    icon: Shield,
    steps: [
      {
        title: "Open Sanitizer",
        detail: "/dashboard/security",
        href: "/dashboard/security",
      },
      {
        title: "Scan",
        detail: "Upload or select a file. Run malware / metadata / PII checks.",
      },
      {
        title: "Clean copy",
        detail: "Download the cleaned file before sharing or sending to AI.",
      },
    ],
  },
  {
    id: "samples",
    title: "5. Sample Library",
    audience: "Training & demos",
    path: "Workspace → Sample Library",
    icon: Library,
    steps: [
      {
        title: "Open library",
        detail: "/dashboard/samples — packs by company (Acme, Nexus, …).",
        href: "/dashboard/samples",
      },
      {
        title: "Download samples",
        detail: "Trial balances, statements, invoices, confirmations for practice.",
      },
      {
        title: "Use in workflows",
        detail: "Import sample TB into reporting; attach samples to PBC requests.",
      },
    ],
  },
  {
    id: "accounting",
    title: "6. Daily accounting path",
    audience: "Accountants",
    path: "Accounting → Operations",
    icon: BookMarked,
    steps: [
      {
        title: "Accounting hub",
        detail: "/dashboard/operations — Chart of Accounts, journals, GL entry points.",
        href: "/dashboard/operations",
      },
      {
        title: "AR Aging",
        detail: "/dashboard/ar — customers, invoices, aging buckets, status chips.",
        href: "/dashboard/ar",
      },
      {
        title: "Bank reconciliation",
        detail: "/dashboard/bank-rec — match bank lines, AI match assist, complete & lock.",
        href: "/dashboard/bank-rec",
      },
      {
        title: "Typical day",
        detail: "Post journals → review AR → clear bank matches → file source docs.",
      },
    ],
  },
  {
    id: "statements",
    title: "7. Full financial statement process",
    audience: "Accountants · Controllers",
    path: "Financial Reporting → Statements",
    icon: BarChart3,
    steps: [
      {
        title: "Open reporting",
        detail: "/dashboard/reporting or /dashboard/reporting/statements",
        href: "/dashboard/reporting",
      },
      {
        title: "Select company & period",
        detail: "Choose entity (Acme, etc.) and the close period.",
      },
      {
        title: "Step 1 — Trial Balance",
        detail: "Upload or open TB. Review, then Download if needed.",
      },
      {
        title: "Step 2 — Journal Entries",
        detail: "Review adjusting entries tied to the period.",
      },
      {
        title: "Step 3 — Income Statement",
        detail: "Generate / review P&L. Upload supporting schedules; download export.",
      },
      {
        title: "Step 4 — Balance Sheet",
        detail: "Review assets, liabilities, equity; download for board packs.",
      },
      {
        title: "Step 5 — Cash Flow",
        detail: "Complete the CF statement; export for management.",
      },
      {
        title: "Rule",
        detail: "Every step supports Upload · Review · Download.",
      },
    ],
  },
  {
    id: "close",
    title: "8. Month-end close",
    audience: "Controllers",
    path: "Accounting → Month-End Close",
    icon: CalendarCheck,
    steps: [
      {
        title: "Open close",
        detail: "/dashboard/close",
        href: "/dashboard/close",
      },
      {
        title: "Checklist",
        detail: "Work through accruals, prepaids, reclasses, reviews, approvals.",
      },
      {
        title: "Attach evidence",
        detail: "Link documents from the repository for each task.",
      },
      {
        title: "Approve",
        detail: "Controllers / partners sign off; period can lock when complete.",
      },
    ],
  },
  {
    id: "consolidation",
    title: "9. Consolidation & entities",
    audience: "Controllers · Partners",
    path: "Consolidation · Entities",
    icon: Building2,
    steps: [
      {
        title: "Entities",
        detail: "Maintain parent / sub structure.",
        href: "/dashboard/entities",
      },
      {
        title: "Consolidation",
        detail: "/dashboard/consolidation — eliminate intercompany, view group view.",
        href: "/dashboard/consolidation",
      },
    ],
  },
  {
    id: "audit",
    title: "10. Audit & PBC",
    audience: "Auditors · Staff",
    path: "Audit / PBC",
    icon: ClipboardCheck,
    steps: [
      {
        title: "PBC list",
        detail: "/dashboard/audit/pbc — create requests, track status, due dates.",
        href: "/dashboard/audit/pbc",
      },
      {
        title: "New PBC Request",
        detail: "Click New PBC Request, set client, document type, due date, send.",
      },
      {
        title: "Client response",
        detail: "Client sees items under Portal → Requests and uploads files.",
        href: "/portal/requests",
      },
      {
        title: "Workpapers",
        detail: "/dashboard/audit/workpapers — lead schedules, testing notes, findings.",
        href: "/dashboard/audit/workpapers",
      },
    ],
  },
  {
    id: "clients",
    title: "11. Clients & Contact Center",
    audience: "All staff",
    path: "Clients → Contact Center",
    icon: Phone,
    steps: [
      {
        title: "Client list",
        detail: "/dashboard/clients — open a client workspace.",
        href: "/dashboard/clients",
      },
      {
        title: "Contact Center",
        detail:
          "/dashboard/clients/contact-center — video, voice, email, SMS, attachments, record, filters.",
        href: "/dashboard/clients/contact-center",
      },
      {
        title: "Video / call",
        detail: "Select contact → Video or Call. Mute, camera, blur, warm, record, end.",
      },
      {
        title: "Attach files",
        detail: "Attach in the thread; View or Download from the attachments panel.",
      },
    ],
  },
  {
    id: "ai",
    title: "12. AI Assistant",
    audience: "Staff",
    path: "Ask AI",
    icon: Bot,
    steps: [
      {
        title: "Open AI",
        detail: "Top bar Ask AI or /dashboard/ai",
        href: "/dashboard/ai",
      },
      {
        title: "Ask",
        detail: "Close checklists, variance notes, draft journal ideas, audit programs.",
      },
      {
        title: "Approve before posting",
        detail: "AI drafts only — humans approve before books change.",
      },
      {
        title: "Sanitize first",
        detail: "Run sensitive files through File Sanitizer before AI analysis.",
        href: "/dashboard/security",
      },
    ],
  },
  {
    id: "admin",
    title: "13. Administration",
    audience: "Admins",
    path: "Settings",
    icon: Settings,
    steps: [
      {
        title: "Admin home",
        detail: "/dashboard/admin",
        href: "/dashboard/admin",
      },
      {
        title: "Users & invites",
        detail: "/dashboard/admin/users — invite, roles, review membership.",
        href: "/dashboard/admin/users",
      },
    ],
  },
  {
    id: "endtoend",
    title: "14. End-to-end demo path (recommended)",
    audience: "Presentations · training",
    path: "Full story",
    icon: CheckCircle2,
    steps: [
      {
        title: "A. Sign in as staff",
        detail: "demo@finova.ai → dashboard home.",
        href: "/dashboard",
      },
      {
        title: "B. Sample Library",
        detail: "Download an Acme trial balance pack.",
        href: "/dashboard/samples",
      },
      {
        title: "C. Documents",
        detail: "Upload the pack; view and download.",
        href: "/dashboard/documents",
      },
      {
        title: "D. Statements",
        detail: "TB → JE → IS → BS → CF with upload/review/download.",
        href: "/dashboard/reporting",
      },
      {
        title: "E. Bank Rec",
        detail: "Match sample lines; show complete & lock.",
        href: "/dashboard/bank-rec",
      },
      {
        title: "F. Month-End Close",
        detail: "Walk the checklist and approvals.",
        href: "/dashboard/close",
      },
      {
        title: "G. PBC",
        detail: "Create a New PBC Request for Acme.",
        href: "/dashboard/audit/pbc",
      },
      {
        title: "H. Contact Center",
        detail: "Open a client thread; start a short video demo.",
        href: "/dashboard/clients/contact-center",
      },
      {
        title: "I. Client portal",
        detail: "Sign in as client@acme.com → upload to a request.",
        href: "/portal",
      },
    ],
  },
];

export default function AppGuidePage() {
  const [openId, setOpenId] = useState<string | null>("access");

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#07649d]">
          User manual
        </p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[#1d2d5c]">
          <BookOpen className="h-8 w-8 text-[#07649d]" />
          Finova App Guide
        </h1>
        <p className="max-w-2xl text-slate-600">
          Your path through the system — how to sign in, move around, process transactions,
          produce statements, close the period, run audit PBC, and talk to clients.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1d2d5c] px-3.5 py-1.5 text-sm font-semibold text-white"
          >
            Go to Home <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard/learning"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700"
          >
            <GraduationCap className="h-3.5 w-3.5" /> Learning Center
          </Link>
        </div>
      </header>

      {/* Legend */}
      <div className="grid gap-3 rounded-2xl border border-[#d7e3ec] bg-white p-4 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Upload className="h-4 w-4 text-[#07649d]" /> Upload files where you see Upload
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Eye className="h-4 w-4 text-[#07649d]" /> View opens the document or detail
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Download className="h-4 w-4 text-[#07649d]" /> Download saves a local copy
        </div>
      </div>

      {/* TOC */}
      <nav className="rounded-2xl border border-slate-200 bg-[#f8fbfd] p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Contents</p>
        <ol className="grid gap-1 sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setOpenId(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-[#1d2d5c] hover:bg-white"
              >
                {i + 1}. {s.title.replace(/^\d+\.\s*/, "")}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const open = openId === section.id;
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : section.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f0f5] text-[#07649d]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#1d2d5c]">{section.title}</span>
                  <span className="block text-xs text-slate-500">
                    {section.audience} · {section.path}
                  </span>
                </span>
                <ChevronDown
                  className={cn("h-5 w-5 text-slate-400 transition", open && "rotate-180")}
                />
              </button>
              {open && (
                <ol className="space-y-3 border-t border-slate-100 px-5 py-4">
                  {section.steps.map((step, idx) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1d2d5c] text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1d2d5c]">{step.title}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{step.detail}</p>
                        {step.href && (
                          <Link
                            href={step.href}
                            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#07649d] hover:underline"
                          >
                            Open page <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <footer className="rounded-2xl border border-[#c5dceb] bg-[#e7f0f5] p-5 text-sm text-[#1d2d5c]">
        <p className="font-semibold">Tip for presenters</p>
        <p className="mt-1 text-slate-600">
          Follow section 14 in order. Use Back and Home anytime. Keep File Sanitizer before any AI
          demo with real-looking files.
        </p>
      </footer>
    </div>
  );
}
