"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Download,
  FileText,
  Library,
  Copy,
  Check,
  ListTree,
  FolderOpen,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNTING_PROCESSES, AUDIT_PROCESSES } from "@/lib/samples/processes";

type Company = {
  id: string;
  code: string;
  name: string;
  industry: string;
  currency: string;
};
type Doc = {
  id: string;
  companyId: string;
  type: string;
  typeLabel: string;
  title: string;
  period: string;
  description: string;
  fileName: string;
};

function parseDelimited(content: string) {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  return lines.map((line) => {
    const cells: string[] = [];
    let value = "",
      quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) {
        value += '"';
        i++;
      } else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) {
        cells.push(value.trim());
        value = "";
      } else value += ch;
    }
    cells.push(value.trim());
    return cells;
  });
}
function isTabular(content: string) {
  const first = content.trim().split(/\r?\n/, 1)[0] || "";
  return first.includes(",") && !/^(INVOICE|BANK STATEMENT|STANDARD BANK CONFIRMATION)/i.test(first);
}

const QUICK_TYPES: { id: string; label: string; match: string[] }[] = [
  { id: "all", label: "All types", match: [] },
  { id: "TRIAL_BALANCE", label: "Trial Balance", match: ["TRIAL_BALANCE"] },
  { id: "JOURNAL_ENTRY", label: "Journal Entry", match: ["JOURNAL_ENTRY"] },
  { id: "BALANCE_SHEET", label: "Balance Sheet", match: ["BALANCE_SHEET"] },
  { id: "INCOME_STATEMENT", label: "Income Statement", match: ["INCOME_STATEMENT"] },
  { id: "CASH_FLOW", label: "Cash Flow", match: ["CASH_FLOW"] },
  { id: "AR_AGING", label: "AR Aging", match: ["AR_AGING"] },
  { id: "AP_AGING", label: "AP Aging", match: ["AP_AGING"] },
  { id: "BANK_RECON", label: "Bank Rec", match: ["BANK_RECON", "BANK_STATEMENT"] },
];

function SamplesInner() {
  const sp = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [companyId, setCompanyId] = useState(sp.get("companyId") || "all");
  const [type, setType] = useState("all");
  const [processId, setProcessId] = useState(sp.get("process") || "all");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    fetch("/api/samples")
      .then((r) => r.json())
      .then((d) => {
        setCompanies(d.companies || []);
        setDocuments(d.documents || []);
        const docId = sp.get("docId");
        if (docId) {
          fetch(`/api/samples?docId=${docId}`)
            .then((r) => r.json())
            .then((x) => {
              if (x.document)
                setPreview({ title: x.document.title, content: x.document.content });
            });
        }
      })
      .catch(() => {});
  }, [sp]);

  const types = useMemo(
    () => Array.from(new Set(documents.map((d) => d.type))).sort(),
    [documents]
  );

  const processKeywords: Record<string, string[]> = {
    r2r: ["trial", "journal", "ledger", "gl", "adjust", "close", "chart of account"],
    p2p: ["purchase", "vendor", "three-way", "goods receipt", "po-"],
    o2c: ["sales order", "revenue recognition", "customer"],
    ar: ["receivable", "ar aging", "collection"],
    ap: ["payable", "ap aging"],
    fa: ["fixed asset", "depreciation", "disposal"],
    inv: ["inventory", "count"],
    treasury: ["bank", "cash forecast", "debt schedule", "recon"],
    payroll: ["payroll"],
    reporting: ["balance sheet", "income statement", "notes", "budget"],
    accept: ["engagement letter"],
    plan: ["materiality", "planning"],
    risk: ["risk assessment", "walkthrough"],
    controls: ["icq", "control"],
    substantive: ["confirmation", "observation", "count sheet"],
    sampling: ["sampling"],
    findings: ["findings"],
    completion: ["representation", "management letter"],
    "audit-report": ["opinion"],
  };

  const filtered = documents.filter((d) => {
    if (companyId !== "all" && d.companyId !== companyId) return false;
    if (type !== "all") {
      const qt = QUICK_TYPES.find((t) => t.id === type);
      if (qt && qt.match.length) {
        if (!qt.match.includes(d.type)) return false;
      } else if (d.type !== type) return false;
    }
    if (processId !== "all") {
      const keys = processKeywords[processId] || [];
      const hay = (d.title + d.description + d.fileName + d.typeLabel).toLowerCase();
      if (keys.length && !keys.some((k) => hay.includes(k))) return false;
    }
    if (q.trim()) {
      const hay = (d.title + d.description + d.fileName + d.typeLabel + d.id).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name || id;
  const selectedCompany = companies.find((c) => c.id === companyId);

  const download = (id: string) => {
    window.location.href = `/api/samples?docId=${encodeURIComponent(id)}&download=1`;
  };

  const openPreview = async (id: string) => {
    const res = await fetch(`/api/samples?docId=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.document) setPreview({ title: data.document.title, content: data.document.content });
  };

  const copyContent = async (id: string) => {
    const res = await fetch(`/api/samples?docId=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (data.document?.content) {
      await navigator.clipboard.writeText(data.document.content);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  const clearFilters = () => {
    setCompanyId("all");
    setType("all");
    setProcessId("all");
    setQ("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Library className="h-7 w-7 text-emerald-700" />
            Free Sample Library
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Training packs for R2R, P2P, O2C, and the full audit lifecycle — preview, copy, download
          </p>
        </div>
        {(companyId !== "all" || type !== "all" || processId !== "all" || q) && (
          <button
            type="button"
            onClick={clearFilters}
            className="self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Companies</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{companies.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <FolderOpen className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Files</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{documents.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sky-700">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Showing</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <ListTree className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">Types</span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{types.length}</p>
        </div>
      </div>

      {/* Company dropdown + document type quick buttons */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-emerald-700" /> Company
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All companies ({companies.length})</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.industry})
                </option>
              ))}
            </select>
            {selectedCompany && (
              <p className="mt-1.5 text-xs text-slate-500">
                {selectedCompany.name} · {selectedCompany.industry} · {selectedCompany.currency}
              </p>
            )}
          </div>
          <div className="sm:w-56">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, id, type…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Financial documents — click to filter
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  type === t.id
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <ListTree className="h-4 w-4 text-emerald-700" /> Accounting processes
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setProcessId("all")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                processId === "all"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
              )}
            >
              All
            </button>
            {ACCOUNTING_PROCESSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProcessId(p.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  processId === p.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                )}
                title={p.steps.join(", ")}
              >
                {p.short}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Audit processes</h2>
          <div className="flex flex-wrap gap-1.5">
            {AUDIT_PROCESSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProcessId(p.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  processId === p.id
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                )}
                title={p.steps.join(", ")}
              >
                {p.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {processId !== "all" && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-emerald-900">
            {[...ACCOUNTING_PROCESSES, ...AUDIT_PROCESSES].find((p) => p.id === processId)?.name}
          </span>
          <span className="text-slate-600">
            {" "}
            — steps:{" "}
            {[...ACCOUNTING_PROCESSES, ...AUDIT_PROCESSES]
              .find((p) => p.id === processId)
              ?.steps.join(" → ")}
          </span>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Showing <strong>{filtered.length}</strong> of {documents.length} samples
        {companyId !== "all" && selectedCompany && (
          <> · <strong>{selectedCompany.code}</strong></>
        )}
        {type !== "all" && (
          <> · type <strong>{QUICK_TYPES.find((t) => t.id === type)?.label || type}</strong></>
        )}
      </p>

      <div className="divide-y overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No samples match. Clear filters or try another company / type.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 p-4 transition hover:bg-emerald-50/40 sm:flex-row sm:items-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <FileText className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">
                  ID: <span className="font-mono">{d.id}</span> · {companyName(d.companyId)} ·{" "}
                  {d.typeLabel} · {d.period}
                </p>
                <p className="mt-1 text-sm text-slate-600">{d.description}</p>
                <p className="font-mono text-[11px] text-slate-400">{d.fileName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPreview(d.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-white"
                >
                  Preview / Review
                </button>
                <button
                  type="button"
                  onClick={() => copyContent(d.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-white"
                >
                  {copied === d.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => download(d.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b bg-emerald-50/50 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">{preview.title}</h3>
              <button type="button" className="text-sm text-slate-500" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
              {isTabular(preview.content) ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-sm">
                      <thead className="sticky top-0 bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        <tr>
                          {(parseDelimited(preview.content)[0] || []).map((cell, i) => (
                            <th
                              key={i}
                              className="whitespace-nowrap border-b border-r border-slate-200 px-4 py-3 last:border-r-0"
                            >
                              {cell || `Column ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parseDelimited(preview.content)
                          .slice(1)
                          .map((row, ri) => (
                            <tr
                              key={ri}
                              className={
                                /^(total|grand total|net income|difference)$/i.test(row[0] || "")
                                  ? "bg-emerald-50 font-semibold"
                                  : ri % 2
                                    ? "bg-white"
                                    : "bg-slate-50/70"
                              }
                            >
                              {(parseDelimited(preview.content)[0] || []).map((_, ci) => (
                                <td
                                  key={ci}
                                  className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-2.5 text-slate-700 last:border-r-0"
                                >
                                  {row[ci] || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words rounded-xl border bg-white p-5 font-mono text-sm leading-7 text-slate-700">
                  {preview.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SamplesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading samples…</div>}>
      <SamplesInner />
    </Suspense>
  );
}
