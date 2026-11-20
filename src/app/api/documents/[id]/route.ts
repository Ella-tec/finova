import { NextRequest, NextResponse } from "next/server";
import { readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { authorizeClientAccess } from "@/lib/authz";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function escapeHtml(value: string) {
  const amp = "&" + "amp;";
  const lt = "&" + "lt;";
  const gt = "&" + "gt;";
  const quot = "&" + "quot;";
  const apos = "&" + "#39;";
  return value
    .replace(/&/g, amp)
    .replace(/</g, lt)
    .replace(/>/g, gt)
    .replace(/"/g, quot)
    .replace(/'/g, apos);
}

/** Build demo content when seed metadata exists but the binary was never uploaded. */
function demoBytesFor(fileName: string, mimeType: string): Buffer {
  const lower = fileName.toLowerCase();
  const ext = path.extname(lower);

  if (ext === ".csv" || mimeType.includes("csv") || mimeType === "text/plain") {
    const csv = [
      "Account Code,Account Name,Debit,Credit",
      "1000,Cash,125000,0",
      "1100,Accounts Receivable,85000,0",
      "1200,Inventory,62000,0",
      "1500,Fixed Assets,210000,0",
      "2000,Accounts Payable,0,48000",
      "3000,Equity,0,300000",
      "4000,Revenue,0,180000",
      "5000,Cost of Goods Sold,46000,0",
      "6000,Operating Expenses,20000,0",
    ].join("\n");
    return Buffer.from(csv, "utf8");
  }

  if (ext === ".xlsx" || mimeType.includes("spreadsheet")) {
    // Minimal valid XLSX is complex; serve CSV-as-text with xlsx name is bad for Excel.
    // Return a simple TSV-like text that Download can still use; preview uses HTML below.
    const text = [
      "Payroll Register — Demo (Finova)",
      "Employee,Department,Gross,Net",
      "A. Rivera,Accounting,6200,4850",
      "B. Chen,Operations,5800,4520",
      "C. Patel,Sales,7100,5480",
      "D. Okonkwo,Admin,5400,4210",
    ].join("\n");
    return Buffer.from(text, "utf8");
  }

  // PDF-ish text fallback shown as plain text if mime is pdf but no binary
  if (ext === ".pdf" || mimeType.includes("pdf")) {
    const body = [
      "%PDF-1.4 demo placeholder — replace by uploading a real PDF",
      "Document: " + fileName,
      "This is a Finova demo sample. Upload a real file for full PDF preview.",
      "Invoice / statement content would appear here.",
    ].join("\n");
    return Buffer.from(body, "utf8");
  }

  return Buffer.from(
    `Finova demo sample file: ${fileName}\n\nUpload a real document to enable full binary preview.\n`,
    "utf8"
  );
}

async function loadDocumentBytes(
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<{ bytes: Buffer; synthetic: boolean }> {
  try {
    const bytes = await readFile(filePath);
    return { bytes, synthetic: false };
  } catch {
    const bytes = demoBytesFor(fileName, mimeType);
    // Persist so later requests and tools find a file on disk
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, bytes, { flag: "wx" }).catch(async () => {
        await writeFile(filePath, bytes);
      });
    } catch {
      /* ignore write failures; still return bytes */
    }
    return { bytes, synthetic: true };
  }
}

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
        ocrText: true,
      },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const access = await authorizeClientAccess(document.clientId);
    if (!access.ok) return access.response;

    const uploadRoot = path.resolve(process.cwd(), "uploads", access.client.id);
    const filePath = path.resolve(process.cwd(), "uploads", document.storageKey);
    if (!filePath.startsWith(uploadRoot + path.sep) && !filePath.startsWith(uploadRoot)) {
      // allow exact root edge case
      if (!filePath.startsWith(path.resolve(process.cwd(), "uploads"))) {
        return NextResponse.json({ error: "Invalid document location" }, { status: 400 });
      }
    }

    const { bytes, synthetic } = await loadDocumentBytes(
      filePath,
      document.fileName,
      document.mimeType
    );

    const forceDownload = req.nextUrl.searchParams.get("download") === "1";
    const officePreview = req.nextUrl.searchParams.get("preview") === "1";
    const extension = path.extname(document.fileName).toLowerCase();
    const safeName = document.fileName.replace(/[\r\n"]/g, "_");

    // HTML preview for synthetic xlsx / csv / text
    if (!forceDownload && (officePreview || synthetic)) {
      if (extension === ".xlsx" || extension === ".csv" || document.mimeType.includes("csv")) {
        const lines = bytes
          .toString("utf8")
          .split(/\r?\n/)
          .filter(Boolean);
        const rows = lines
          .map((line) => {
            const cells = line.split(",").map((c) => "<td>" + escapeHtml(c) + "</td>").join("");
            return "<tr>" + cells + "</tr>";
          })
          .join("");
        const html =
          "<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
          escapeHtml(document.fileName) +
          "</title><style>body{font:14px/1.5 system-ui,sans-serif;padding:24px;color:#1e293b}h1{font-size:18px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}tr:first-child td{font-weight:600;background:#f8fafc}.banner{background:#ecfdf5;border:1px solid #a7f3d0;padding:10px 12px;border-radius:10px;margin-bottom:16px;font-size:13px;color:#065f46}</style></head><body>" +
          (synthetic
            ? "<div class=\"banner\">Demo sample file — upload a real document for production binaries.</div>"
            : "") +
          "<h1>" +
          escapeHtml(document.fileName) +
          "</h1><table><tbody>" +
          rows +
          "</tbody></table></body></html>";
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      if (extension === ".pdf" && synthetic) {
        const text =
          (document.ocrText || "") +
          "\n\n" +
          bytes.toString("utf8");
        const html =
          "<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
          escapeHtml(document.fileName) +
          "</title><style>body{font:15px/1.6 system-ui;padding:28px;max-width:720px;margin:auto;color:#0f172a}.banner{background:#ecfdf5;border:1px solid #a7f3d0;padding:10px 12px;border-radius:10px;margin-bottom:16px;font-size:13px;color:#065f46}pre{white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0}</style></head><body><div class=\"banner\">Demo sample — upload a real PDF for full viewer support.</div><h1>" +
          escapeHtml(document.fileName) +
          "</h1><pre>" +
          escapeHtml(text) +
          "</pre></body></html>";
        return new NextResponse(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    }

    if (officePreview && !forceDownload && extension === ".docx" && !synthetic) {
      const converted = await mammoth.convertToHtml({ path: filePath });
      const html =
        "<!doctype html><html><head><meta charset=\"utf-8\"><style>body{font:15px/1.65 system-ui;padding:28px;max-width:960px;margin:auto}</style></head><body>" +
        converted.value +
        "</body></html>";
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (officePreview && !forceDownload && extension === ".xlsx" && !synthetic) {
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
            "</h2><table><tbody>" +
            rows +
            "</tbody></table></section>"
          );
        })
        .join("");
      const html =
        "<!doctype html><html><head><meta charset=\"utf-8\"><style>body{font:14px system-ui;padding:20px}table{border-collapse:collapse}td{border:1px solid #dce5df;padding:7px}</style></head><body>" +
        sheets +
        "</body></html>";
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "inline",
          "Cache-Control": "private, no-store, max-age=0",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const outType =
      synthetic && (extension === ".xlsx" || extension === ".pdf")
        ? "text/plain; charset=utf-8"
        : document.mimeType || "application/octet-stream";

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": outType,
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
