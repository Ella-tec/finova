import { NextRequest, NextResponse } from "next/server";
import {
  SAMPLE_COMPANIES,
  SAMPLE_DOCUMENTS,
  getDoc,
  docsForCompany,
  DOC_TYPE_LABELS,
} from "@/lib/samples/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const companyId = searchParams.get("companyId");
  const docId = searchParams.get("docId");
  const download = searchParams.get("download") === "1";

  if (docId) {
    const doc = getDoc(docId);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (download) {
      return new NextResponse(doc.content, {
        headers: {
          "Content-Type": doc.fileName.toLowerCase().endsWith(".txt") ? "text/plain; charset=utf-8" : "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${doc.fileName}"`,
        },
      });
    }
    return NextResponse.json({ document: doc, typeLabel: DOC_TYPE_LABELS[doc.type] });
  }

  if (companyId) {
    return NextResponse.json({
      company: SAMPLE_COMPANIES.find((c) => c.id === companyId) || null,
      documents: docsForCompany(companyId).map((d) => ({
        id: d.id,
        type: d.type,
        typeLabel: DOC_TYPE_LABELS[d.type],
        title: d.title,
        period: d.period,
        description: d.description,
        fileName: d.fileName,
      })),
    });
  }

  return NextResponse.json({
    companies: SAMPLE_COMPANIES,
    documentCount: SAMPLE_DOCUMENTS.length,
    types: DOC_TYPE_LABELS,
    documents: SAMPLE_DOCUMENTS.map((d) => ({
      id: d.id,
      companyId: d.companyId,
      type: d.type,
      typeLabel: DOC_TYPE_LABELS[d.type],
      title: d.title,
      period: d.period,
      description: d.description,
      fileName: d.fileName,
    })),
  });
}
