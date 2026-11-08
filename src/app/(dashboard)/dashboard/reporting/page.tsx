import Link from "next/link";
import { FileText, BarChart3, ArrowRight } from "lucide-react";

export default function ReportingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Reporting</h1>
        <p className="text-slate-600 mt-1">
          Trial balance, statements, and management reports
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/reporting/statements"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition group"
        >
          <div className="h-11 w-11 rounded-lg bg-isaca-light flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-isaca-medium" />
          </div>
          <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">
            Financial Statements
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Import trial balance and generate Balance Sheet, P&L, Cash Flow and ratios.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link href="/dashboard/market" className="group rounded-xl border bg-white p-6 shadow-sm transition hover:border-isaca-medium/40 hover:shadow-md">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-isaca-light">
            <BarChart3 className="h-5 w-5 text-isaca-medium" />
          </div>
          <h2 className="font-semibold text-slate-900 group-hover:text-isaca-medium">Market & Finance Context</h2>
          <p className="mt-1 text-sm text-slate-600">Open the Market Pulse workspace for FX rates, market benchmarks, and accounting context.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-isaca-medium">Open <ArrowRight className="h-4 w-4" /></span>
        </Link>
      </div>
    </div>
  );
}