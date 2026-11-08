"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  Download,
  FileText,
  Library,
  Copy,
  Check,
  ListTree,
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
    let value = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) { cells.push(value.trim()); value = ""; }
      else value += ch;
    }
    cells.push(value.trim());
    return cells;
  });
}
function isTabular(content: string) {
  const first = content.trim().split(/\r?\n/, 1)[0] || "";
  return first.includes(",") && !/^(INVOICE|BANK STATEMENT|STANDARD BANK CONFIRMATION)/i.test(first);
}
\nfunction SamplesInner() {
  const sp = useSearchParams();
  const router = useRouter();
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

  const types = useMemo(() => Array.from(new Set(documents.map((d) => d.type))).sort(), [documents]);

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
    if (type !== "all" && d.type !== type) return false;
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-isaca-dark flex items-center gap-2">
          <Library className="h-7 w-7 text-isaca-medium" />
          Free Sample Library
        </h1>
        <p className="text-slate-600 mt-1">
          {companies.length} companies · {documents.length} downloadable files · full R2R / P2P / O2C / audit lifecycle
          samples for training and testing
        </p>
      </div>

      {/* Process map */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-isaca-dark mb-2 flex items-center gap-1">
            <ListTree className="h-4 w-4" /> Accounting processes
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setProcessId("all")}
              className={cn(
                "text-[11px] rounded-full px-2.5 py-1 border",
                processId === "all" ? "bg-isaca-medium text-white border-isaca-medium" : "border-slate-200"
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
                  "text-[11px] rounded-full px-2.5 py-1 border",
                  processId === p.id ? "bg-isaca-medium text-white border-isaca-medium" : "border-slate-200 hover:border-isaca-teal"
                )}
                title={p.steps.join(", ")}
              >
                {p.short}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-isaca-dark mb-2">Audit processes</h2>
          <div className="flex flex-wrap gap-1.5">
            {AUDIT_PROCESSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProcessId(p.id)}
                className={cn(
                  "text-[11px] rounded-full px-2.5 py-1 border",
                  processId === p.id ? "bg-isaca-teal text-white border-isaca-teal" : "border-slate-200 hover:border-isaca-teal"
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
        <div className="rounded-lg bg-isaca-light/80 border border-isaca-teal/20 px-4 py-3 text-sm text-isaca-dark">
          <span className="font-semibold">
            {[...ACCOUNTING_PROCESSES, ...AUDIT_PROCESSES].find((p) => p.id === processId)?.name}
          </span>
          <span className="text-slate-600">
            {" "}
            — steps:{" "}
            {[...ACCOUNTING_PROCESSES, ...AUDIT_PROCESSES].find((p) => p.id === processId)?.steps.join(" → ")}
          </span>
        </div>
      )}

      {/* Companies */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-isaca-medium" /> Companies
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompanyId("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border",
              companyId === "all" ? "bg-isaca-medium text-white border-isaca-medium" : "bg-white border-slate-200"
            )}
          >
            All
          </button>
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCompanyId(c.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border",
                companyId === c.id ? "bg-isaca-medium text-white border-isaca-medium" : "bg-white border-slate-200"
              )}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Local search — fixed controlled input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter samples by name, id, type…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-isaca-blue/30"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {documents.find((d) => d.type === t)?.typeLabel || t}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-500">
        Showing <strong>{filtered.length}</strong> of {documents.length} samples
      </p>

      <div className="rounded-xl border bg-white shadow-sm divide-y">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No samples match. Clear filters or try another process.</div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-isaca-light/40">
              <div className="h-10 w-10 rounded-lg bg-isaca-light flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-isaca-medium" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">
                  ID: <span className="font-mono">{d.id}</span> · {companyName(d.companyId)} · {d.typeLabel} · {d.period}
                </p>
                <p className="text-sm text-slate-600 mt-1">{d.description}</p>
                <p className="text-[11px] font-mono text-slate-400">{d.fileName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openPreview(d.id)} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => copyContent(d.id)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  {copied === d.id ? <Check className="h-3.5 w-3.5 text-isaca-green" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => download(d.id)}
                  className="rounded-lg bg-isaca-medium px-3 py-1.5 text-xs font-semibold text-white hover:bg-isaca-dark inline-flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex justify-between bg-isaca-light/50">
              <h3 className="font-semibold text-sm text-isaca-dark">{preview.title}</h3>
              <button type="button" className="text-sm text-slate-500" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
              {isTabular(preview.content) ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Accounting workpaper</p><p className="mt-0.5 text-xs text-slate-500">Structured data preview · values shown as provided in the source file</p></div>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">Spreadsheet view</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-sm">
                      <thead className="sticky top-0 bg-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        <tr>{(parseDelimited(preview.content)[0] || []).map((cell, i) => <th key={i} className="whitespace-nowrap border-b border-r border-slate-200 px-4 py-3 last:border-r-0">{cell || `Column ${i + 1}`}</th>)}</tr>
                      </thead>
                      <tbody>{parseDelimited(preview.content).slice(1).map((row, ri) => <tr key={ri} className={/^(total|grand total|net income|difference)$/i.test(row[0] || "") ? "bg-teal-50 font-semibold text-slate-900" : ri % 2 ? "bg-white" : "bg-slate-50/70"}>
                        {(parseDelimited(preview.content)[0] || []).map((_, ci) => <td key={ci} className="whitespace-nowrap border-b border-r border-slate-100 px-4 py-2.5 text-slate-700 last:border-r-0">{row[ci] || "—"}</td>)}
                      </tr>)}</tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500">Preview preserves the source columns and figures. Download the original file for Excel analysis and editing.</div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal-700">Document preview</p>
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7 text-slate-700">{preview.content}</pre>
                </div>
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
