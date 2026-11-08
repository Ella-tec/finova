import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#39;");
}

/** Serve document bytes (and optional Office HTML preview). */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        fileName: true,
        mimeType: true,
        storageKey: true,
      },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const uploadRoot = path.resolve(process.cwd(), "uploads", access.client.id);
    const filePath = path.resolve(process.cwd(), "uploads", document.storageKey);
    if (!filePath.startsWith(uploadRoot + path.sep)) {
      return NextResponse.json({ error: "Invalid document location" }, { status: 400 });
    }

    const bytes = await readFile(filePath);
    const forceDownload = req.nextUrl.searchParams.get("download") === "1";
    const officePreview = req.nextUrl.searchParams.get("preview") === "1";
    const extension = path.extname(document.fileName).toLowerCase();
    const safeName = document.fileName.replace(/[\r\n"]/g, "_");

    if (officePreview && !forceDownload && extension === ".docx") {
      const converted = await mammoth.convertToHtml({
        buffer: Buffer.from(bytes) as unknown as Parameters<
          typeof mammoth.convertToHtml
        >[0]["buffer"],
      });
      const html =
        "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{font:15px/1.65 system-ui,sans-serif;color:#263746;padding:28px;max-width:960px;margin:auto}h1,h2,h3{color:#173447}table{border-collapse:collapse;width:100%}td,th{border:1px solid #dce5df;padding:8px;text-align:left}img{max-width:100%;height:auto}</style></head><body>" +
        converted.value +
        "</body></html>";
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store, max-age=0",
          "Content-Security-Policy":
            "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (officePreview && !forceDownload && extension === ".xlsx") {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(bytes as unknown as ExcelJS.Buffer);
      const sheets = workbook.worksheets
        .map((sheet) => {
          const rowLimit = Math.min(sheet.rowCount, 200);
          const colLimit = Math.min(sheet.columnCount, 30);
          let rows = "";
          for (let rowIndex = 1; rowIndex <= rowLimit; rowIndex++) {
            let cells = "";
            for (let colIndex = 1; colIndex <= colLimit; colIndex++) {
              cells +=
                "<td>" +
                escapeHtml(sheet.getRow(rowIndex).getCell(colIndex).text || "") +
                "</td>";
            }
            rows += "<tr>" + cells + "</tr>";
          }
          return (
            "<section><h2>" +
            escapeHtml(sheet.name) +
            "</h2><div class=\"table-wrap\"><table><tbody>" +
            rows +
            "</tbody></table></div></section>"
          );
        })
        .join("");
      const html =
        "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{font:14px/1.5 system-ui,sans-serif;color:#263746;padding:20px}h2{color:#173447}.table-wrap{overflow:auto;margin-bottom:24px}table{border-collapse:collapse;min-width:100%}td{border:1px solid #dce5df;padding:7px 10px;white-space:pre-wrap;min-width:80px}</style></head><body>" +
        sheets +
        "</body></html>";
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store, max-age=0",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition":
          (forceDownload ? "attachment" : "inline") + '; filename="' + safeName + '"',
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Document preview failed:", error);
    return NextResponse.json({ error: "Unable to open document" }, { status: 404 });
  }
}
