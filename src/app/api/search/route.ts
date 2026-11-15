import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SAMPLE_COMPANIES, SAMPLE_DOCUMENTS, DOC_TYPE_LABELS } from "@/lib/samples/catalog";
import { ALL_PROCESSES, APP_NAV_TARGETS } from "@/lib/samples/processes";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firmId: true, clientId: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (!q) return NextResponse.json({ results: [], processes: ALL_PROCESSES });
  const results: { kind: string; id: string; title: string; subtitle?: string; href: string }[] = [];

  for (const item of APP_NAV_TARGETS) {
    const haystack = (item.name + " " + item.keywords + " " + item.href).toLowerCase();
    if (haystack.includes(q.toLowerCase())) {
      results.push({ kind: "Page", id: item.id, title: item.name, subtitle: item.href, href: item.href });
    }
  }

  for (const process of ALL_PROCESSES) {
    const haystack = (process.name + " " + process.short + " " + process.steps.join(" ") + " " + process.domain).toLowerCase();
    if (haystack.includes(q.toLowerCase())) {
      results.push({
        kind: process.domain === "AUDIT" ? "Audit process" : "Accounting process",
        id: process.id,
        title: process.name,
        subtitle: process.steps.slice(0, 3).join(" · "),
        href: `/dashboard/samples?process=${encodeURIComponent(process.id)}`,
      });
    }
  }

  const clients = user.role === "CLIENT"
    ? user.clientId ? [user.clientId] : []
    : user.firmId
      ? (await prisma.client.findMany({ where: { firmId: user.firmId }, select: { id: true } })).map((client) => client.id)
      : [];
  if (clients.length) {
    const [documents, requests] = await Promise.all([
      prisma.document.findMany({
        where: { clientId: { in: clients }, OR: [{ fileName: { contains: q } }, { name: { contains: q } }, { tags: { contains: q } }] },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, fileName: true, name: true, status: true, clientId: true },
      }),
      prisma.pbcRequest.findMany({
        where: { clientId: { in: clients }, OR: [{ title: { contains: q } }, { description: { contains: q } }] },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, clientId: true, client: { select: { name: true } } },
      }),
    ]);
    for (const document of documents) {
      results.push({
        kind: "Document",
        id: document.id,
        title: document.name || document.fileName,
        subtitle: `${document.status} · ${document.fileName}`,
        href: user.role === "CLIENT" ? "/portal/documents" : "/dashboard/documents",
      });
    }
    for (const request of requests) {
      results.push({
        kind: "PBC request",
        id: request.id,
        title: request.title,
        subtitle: `${request.client.name} · ${request.status.replaceAll("_", " ")}`,
        href: user.role === "CLIENT" ? "/portal/requests" : "/dashboard/audit/pbc",
      });
    }
  }

  if (user.role !== "CLIENT" && user.firmId) {
    const [workspaceRecords, workpapers] = await Promise.all([
      prisma.workspaceRecord.findMany({
        where: {
          firmId: user.firmId,
          OR: [{ title: { contains: q } }, { reference: { contains: q } }, { counterparty: { contains: q } }],
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, kind: true, status: true, area: true, reference: true },
      }),
      prisma.workpaper.findMany({
        where: {
          firmId: user.firmId,
          OR: [{ title: { contains: q } }, { accountName: { contains: q } }, { accountCode: { contains: q } }],
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, accountCode: true, status: true, clientId: true },
      }),
    ]);
    for (const record of workspaceRecords) {
      results.push({
        kind: "Accounting record",
        id: record.id,
        title: record.title,
        subtitle: `${record.kind} · ${record.status} · ${record.reference || record.area}`,
        href: "/dashboard/operations",
      });
    }
    for (const workpaper of workpapers) {
      results.push({
        kind: "Workpaper",
        id: workpaper.id,
        title: workpaper.title,
        subtitle: `${workpaper.accountCode || "No account code"} · ${workpaper.status}`,
        href: "/dashboard/audit/workpapers",
      });
    }
  }

  for (const company of SAMPLE_COMPANIES) {
    const haystack = (company.code + " " + company.name + " " + company.industry + " " + company.country).toLowerCase();
    if (haystack.includes(q.toLowerCase())) {
      results.push({ kind: "Sample company", id: company.id, title: `${company.code} — ${company.name}`, subtitle: `${company.industry} · ${company.currency}`, href: `/dashboard/samples?companyId=${encodeURIComponent(company.id)}` });
    }
  }
  for (const document of SAMPLE_DOCUMENTS) {
    const label = DOC_TYPE_LABELS[document.type] || document.type;
    const haystack = (document.title + " " + document.description + " " + document.fileName + " " + label + " " + document.id).toLowerCase();
    if (haystack.includes(q.toLowerCase())) {
      results.push({ kind: "Sample document", id: document.id, title: document.title, subtitle: `${label} · ${document.fileName}`, href: `/dashboard/samples?docId=${encodeURIComponent(document.id)}` });
    }
  }

  const deduplicated = Array.from(new Map(results.map((result) => [`${result.kind}:${result.id}`, result])).values());
  return NextResponse.json({ q, count: deduplicated.length, results: deduplicated.slice(0, 40) });
}
