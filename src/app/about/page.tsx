import Link from "next/link";
import { Sparkles, ArrowLeft, Shield, Target, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-isaca-medium flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              Finova <span className="text-isaca-medium">AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-isaca-medium flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-slate-900">About Finova</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl">
          Finova is a complete Accounting, Financial Statement, Audit &
          Client Collaboration Platform built for modern CPA firms, accounting
          teams, auditors, controllers, CFOs, and their clients.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Target,
              title: "Our Mission",
              text: "To give every accounting firm and finance team one unified system that handles daily books, continuous close, financial statements, full audits, tax, and client collaboration  powered by AI and protected by bank-grade security.",
            },
            {
              icon: Zap,
              title: "Why We Built It",
              text: "Accountants still jump between QuickBooks, Excel, SharePoint, email, and separate audit tools. We built one platform that replaces that chaos with a single, intelligent, secure workspace.",
            },
            {
              icon: Shield,
              title: "Security First",
              text: "Zero Trust, mandatory MFA, immutable audit logs, least privilege, human-in-the-loop AI, and SOC 2 / ISO 27001 readiness from day one. Financial data deserves the highest protection.",
            },
            {
              icon: Users,
              title: "Built for Real Work",
              text: "Designed with real accountants, auditors, and controllers. Every feature focuses on speed, clarity, and reducing month-end and audit stress.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-isaca-medium" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-slate-900 text-white p-10 text-center">
          <h2 className="text-2xl font-bold">One company. One platform. One vision.</h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            Finova is focused exclusively on serving accounting and audit
            professionals. We do not dilute our product with unrelated modules.
            Everything we build serves the complete accounting lifecycle.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-isaca-medium px-6 py-3 text-sm font-semibold hover:bg-isaca-dark transition"
          >
            Start using Finova
          </Link>
        </div>
      </main>
    </div>
  );
}