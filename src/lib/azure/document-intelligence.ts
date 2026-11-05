/**
 * Azure Document Intelligence (Form Recognizer) integration
 *
 * Set in .env:
 *   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR_RESOURCE.cognitiveservices.azure.com/
 *   AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key
 *
 * Falls back to local simulator when credentials are missing.
 */

import { analyzeDocumentText, simulateOcr, AnalyzedDocument } from "@/lib/documents/analyzer";

export type AzureAnalyzeResult = AnalyzedDocument & {
  provider: "azure" | "simulator";
  rawAzure?: unknown;
};

export async function analyzeWithAzure(
  fileBuffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<AzureAnalyzeResult> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

  if (!endpoint || !key) {
    // Local fallback
    const text = simulateOcr(fileName);
    const local = analyzeDocumentText(text, fileName);
    return { ...local, provider: "simulator" };
  }

  try {
    // Prefer prebuilt-invoice; fall back to prebuilt-read / layout
    const modelId = "prebuilt-invoice";
    const url = `${endpoint.replace(/\/$/, "")}/documentintelligence/documentModels/${modelId}:analyze?api-version=2024-11-30`;

    const analyzeRes = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": mimeType || "application/octet-stream",
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!analyzeRes.ok) {
      // Try generic read model
      const readUrl = `${endpoint.replace(/\/$/, "")}/documentintelligence/documentModels/prebuilt-read:analyze?api-version=2024-11-30`;
      const readRes = await fetch(readUrl, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": mimeType || "application/octet-stream",
        },
        body: new Uint8Array(fileBuffer),
      });
      if (!readRes.ok) {
        throw new Error(`Azure DI error: ${analyzeRes.status} ${await analyzeRes.text()}`);
      }
      return pollAndMap(readRes, fileName, key);
    }

    return pollAndMap(analyzeRes, fileName, key);
  } catch (err) {
    console.error("Azure Document Intelligence failed, using simulator:", err);
    const text = simulateOcr(fileName);
    const local = analyzeDocumentText(text, fileName);
    return { ...local, provider: "simulator" };
  }
}

async function pollAndMap(
  initialRes: Response,
  fileName: string,
  key: string
): Promise<AzureAnalyzeResult> {
  const operationLocation = initialRes.headers.get("operation-location");
  if (!operationLocation) {
    const text = simulateOcr(fileName);
    return { ...analyzeDocumentText(text, fileName), provider: "simulator" };
  }

  // Poll up to ~30s
  let result: any = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": key },
    });
    const json = await poll.json();
    if (json.status === "succeeded") {
      result = json;
      break;
    }
    if (json.status === "failed") {
      throw new Error("Azure analysis failed");
    }
  }

  if (!result) {
    const text = simulateOcr(fileName);
    return { ...analyzeDocumentText(text, fileName), provider: "simulator" };
  }

  return mapAzureInvoiceResult(result, fileName);
}

function mapAzureInvoiceResult(result: any, fileName: string): AzureAnalyzeResult {
  const docs = result?.analyzeResult?.documents || [];
  const doc = docs[0];
  const fields = doc?.fields || {};

  const getStr = (f: any) => f?.content || f?.valueString || f?.valueDate || undefined;
  const getNum = (f: any) => {
    if (f?.valueCurrency?.amount != null) return f.valueCurrency.amount;
    if (f?.valueNumber != null) return f.valueNumber;
    return undefined;
  };

  const vendor = getStr(fields.VendorName) || getStr(fields.MerchantName);
  const invoiceNumber = getStr(fields.InvoiceId) || getStr(fields.InvoiceNumber);
  const invoiceDate = getStr(fields.InvoiceDate);
  const dueDate = getStr(fields.DueDate);
  const totalAmount = getNum(fields.InvoiceTotal) || getNum(fields.AmountDue);
  const taxAmount = getNum(fields.TotalTax);

  // Content text for fallback classification
  const content =
    result?.analyzeResult?.content ||
    (result?.analyzeResult?.pages || [])
      .map((p: any) => (p.lines || []).map((l: any) => l.content).join(" "))
      .join("\n") ||
    "";

  const base = analyzeDocumentText(content || fileName, fileName);

  return {
    docType: totalAmount || invoiceNumber ? "INVOICE" : base.docType,
    vendor: vendor || base.vendor,
    invoiceNumber: invoiceNumber || base.invoiceNumber,
    invoiceDate: invoiceDate || base.invoiceDate,
    dueDate: dueDate || base.dueDate,
    totalAmount: totalAmount ?? base.totalAmount,
    taxAmount: taxAmount ?? base.taxAmount,
    currency: fields.InvoiceTotal?.valueCurrency?.currencyCode || "USD",
    confidence: doc?.confidence ?? base.confidence,
    summary:
      totalAmount != null
        ? `Azure DI: Invoice${invoiceNumber ? ` #${invoiceNumber}` : ""} from ${vendor || "vendor"} for $${Number(totalAmount).toFixed(2)}`
        : base.summary,
    suggestedFolder: "Accounts Payable",
    suggestedTags: ["invoice", "azure-di"],
    provider: "azure",
    rawAzure: result,
  };
}
