import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_COMPANIES, SAMPLE_DOCUMENTS, DOC_TYPE_LABELS } from "@/lib/samples/catalog";
import { ALL_PROCESSES, APP_NAV_TARGETS } from "@/lib/samples/processes";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], processes: ALL_PROCESSES });
  }

  const results: {
    kind: string;
    id: string;
    title: string;
    subtitle?: string;
    href: string;
  }[] = [];

  for (const n of APP_NAV_TARGETS) {
    const hay = (n.name + " " + n.keywords + " " + n.href).toLowerCase();
    if (hay.includes(q)) {
      results.push({ kind: "Page", id: n.id, title: n.name, subtitle: n.href, href: n.href });
    }
  }

  for (const p of ALL_PROCESSES) {
    const hay = (p.name + " " + p.short + " " + p.steps.join(" ") + " " + p.domain).toLowerCase();
    if (hay.includes(q)) {
      results.push({
        kind: p.domain === "AUDIT" ? "Audit process" : "Accounting process",
        id: p.id,
        title: p.name,
        subtitle: p.steps.slice(0, 3).join(" · "),
        href: `/dashboard/samples?process=${p.id}`,
      });
    }
  }

  for (const c of SAMPLE_COMPANIES) {
    const hay = (c.code + " " + c.name + " " + c.industry + " " + c.country).toLowerCase();
    if (hay.includes(q)) {
      results.push({
        kind: "Company",
        id: c.id,
        title: `${c.code} — ${c.name}`,
        subtitle: `${c.industry} · ${c.currency}`,
        href: `/dashboard/samples?companyId=${c.id}`,
      });
    }
  }

  for (const d of SAMPLE_DOCUMENTS) {
    const label = DOC_TYPE_LABELS[d.type] || d.type;
    const hay = (d.title + " " + d.description + " " + d.fileName + " " + label + " " + d.id).toLowerCase();
    if (hay.includes(q)) {
      results.push({
        kind: "Sample document",
        id: d.id,
        title: d.title,
        subtitle: `${label} · ${d.fileName}`,
        href: `/dashboard/samples?docId=${d.id}`,
      });
    }
  }

  return NextResponse.json({ q, count: results.length, results: results.slice(0, 40) });
}
