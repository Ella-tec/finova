import { LogoWordmark } from "@/components/brand/Logo";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  Bot,
  Building2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-isaca-medium flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Finova <span className="text-isaca-medium">AI</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-isaca-medium transition">
                Features
              </a>
              <a href="#security" className="hover:text-isaca-medium transition">
                Security
              </a>
              <Link href="/learning" className="hover:text-isaca-medium transition">
                Learning
              </Link>
              <Link href="/faq" className="hover:text-isaca-medium transition">
                FAQ
              </Link>
              <Link href="/about" className="hover:text-isaca-medium transition">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-isaca-medium transition"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-isaca-dark transition"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-isaca-light border border-isaca-teal/30 px-4 py-1.5 text-sm font-medium text-isaca-dark mb-8">
            <Sparkles className="h-4 w-4" />
            Complete Accounting + Audit + AI Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            One platform for every{" "}
            <span className="text-isaca-medium">accounting process</span>, audit &
            client collaboration
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            From daily bookkeeping and month-end close to financial statements,
            full audit execution, tax filing, and SharePoint-style document
            workspaces  powered by AI and built with bank-grade security.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-isaca-medium px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-isaca-dark transition"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-isaca-medium" />
            SOC 2 Type II Ready
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-isaca-medium" />
            AES-256 Encryption
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-isaca-medium" />
            AI with Human Approval
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-isaca-medium" />
            Client Portal Included
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Everything in one place
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Designed for accountants, CPA firms, auditors, controllers, CFOs
              and their clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Full Accounting Suite",
                desc: "GL, AP, AR, Bank Rec, Fixed Assets, Inventory, Payroll  with continuous close agents.",
              },
              {
                icon: FileText,
                title: "Financial Statements",
                desc: "AI generates Balance Sheet, P&L, Cash Flow, Notes, Ratios and Management Reports instantly.",
              },
              {
                icon: Shield,
                title: "Audit Workspace",
                desc: "Planning, Risk Assessment, Workpapers, PBC Requests, Sampling, Findings and Reports.",
              },
              {
                icon: Users,
                title: "Client Portal",
                desc: "Beautiful mobile-first portal for document upload, requests, approvals and e-signatures.",
              },
              {
                icon: Bot,
                title: "AI Copilot",
                desc: "Natural language commands: Prepare March close, Generate cash flow, Create audit program.",
              },
              {
                icon: Building2,
                title: "Document Management",
                desc: "SharePoint-style workspaces with versioning, OCR, permissions, co-authoring and search.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-isaca-medium" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security highlight */}
      <section id="security" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold">Bank-grade security by design</h2>
              <p className="mt-4 text-slate-300 text-lg">
                Zero Trust architecture, mandatory MFA, immutable audit logs,
                customer-managed keys, and AI that can only propose  never
                post without human approval.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Microsoft Entra ID + Conditional Access",
                  "AES-256 at rest + TLS 1.3 in transit",
                  "Strict Segregation of Duties",
                  "Immutable centralized logging",
                  "SOC 2 Type II & ISO 27001 ready",
                  "Private Azure OpenAI deployments",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-fin-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Encryption</span>
                  <span className="font-medium text-fin-400">AES-256</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Authentication</span>
                  <span className="font-medium text-fin-400">MFA Required</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">AI Actions</span>
                  <span className="font-medium text-fin-400">Human Approval</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Audit Trail</span>
                  <span className="font-medium text-fin-400">Immutable</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Access Control</span>
                  <span className="font-medium text-fin-400">Least Privilege</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Ready to modernize your firm?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join the next generation of accounting platforms built for speed,
            security, and AI assistance.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-isaca-medium px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-isaca-dark transition"
          >
            Launch Finova
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-isaca-medium flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              Finova <span className="text-isaca-medium">AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            � 2026 Finova. Built for accountants who demand excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}