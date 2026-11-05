/**
 * Document / Invoice Analyzer
 * Simulates OCR + intelligent extraction for invoices, bank statements, receipts.
 * In production this would call Azure Document Intelligence / Form Recognizer.
 */

export type AnalyzedDocument = {
  docType: "INVOICE" | "BANK_STATEMENT" | "RECEIPT" | "CONTRACT" | "OTHER";
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: number;
  currency?: string;
  taxAmount?: number;
  lineItems?: { description: string; amount: number }[];
  confidence: number;
  summary: string;
  suggestedFolder?: string;
  suggestedTags?: string[];
};

const INVOICE_HINTS = ["invoice", "bill to", "remit", "amount due", "invoice #", "inv-"];
const BANK_HINTS = ["statement", "account ending", "beginning balance", "ending balance", "transaction"];
const RECEIPT_HINTS = ["receipt", "thank you for your purchase", "subtotal", "change due"];

export function analyzeDocumentText(text: string, fileName: string): AnalyzedDocument {
  const lower = (text + " " + fileName).toLowerCase();

  let docType: AnalyzedDocument["docType"] = "OTHER";
  if (INVOICE_HINTS.some((h) => lower.includes(h))) docType = "INVOICE";
  else if (BANK_HINTS.some((h) => lower.includes(h))) docType = "BANK_STATEMENT";
  else if (RECEIPT_HINTS.some((h) => lower.includes(h))) docType = "RECEIPT";
  else if (lower.includes("contract") || lower.includes("agreement")) docType = "CONTRACT";

  // Extract simple patterns
  const amountMatch = text.match(/(?:total|amount due|balance due)[:\s]*\$?([\d,]+\.?\d*)/i);
  const invNumMatch = text.match(/(?:invoice\s*#?|inv[#\s-]*)\s*([A-Z0-9-]+)/i);
  const dateMatch = text.match(/(?:date|invoice date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  const vendorMatch = text.match(/(?:from|vendor|sold by|billed by)[:\s]*([A-Za-z0-9 &.,]+)/i);

  const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : undefined;

  let confidence = 0.55;
  if (docType !== "OTHER") confidence += 0.2;
  if (totalAmount) confidence += 0.1;
  if (invNumMatch) confidence += 0.1;
  confidence = Math.min(0.95, confidence);

  const suggestedFolder =
    docType === "INVOICE"
      ? "Accounts Payable"
      : docType === "BANK_STATEMENT"
        ? "Bank Statements"
        : docType === "RECEIPT"
          ? "Expenses"
          : "Corporate Docs";

  const summary =
    docType === "INVOICE"
      ? `Invoice${invNumMatch ? ` #${invNumMatch[1]}` : ""} detected${totalAmount ? ` for $${totalAmount.toFixed(2)}` : ""}. Ready for AP processing.`
      : docType === "BANK_STATEMENT"
        ? "Bank statement detected. Can be used for reconciliation."
        : docType === "RECEIPT"
          ? `Receipt detected${totalAmount ? ` ($${totalAmount.toFixed(2)})` : ""}.`
          : "Document uploaded. Classification is approximate  please review.";

  return {
    docType,
    vendor: vendorMatch?.[1]?.trim(),
    invoiceNumber: invNumMatch?.[1],
    invoiceDate: dateMatch?.[1],
    totalAmount,
    currency: "USD",
    confidence,
    summary,
    suggestedFolder,
    suggestedTags: [docType.toLowerCase(), suggestedFolder.toLowerCase().replace(/\s+/g, "-")],
  };
}

/** Simulate OCR from file name + optional text content */
export function simulateOcr(fileName: string, optionalText?: string): string {
  if (optionalText && optionalText.length > 20) return optionalText;

  // Generate plausible text based on file name for demo
  const lower = fileName.toLowerCase();
  if (lower.includes("invoice") || lower.includes("inv")) {
    return `
INVOICE
Invoice #: INV-2026-8842
Date: 10/15/2026
Bill To: Acme Corporation
From: Office Supplies Co.
Description: Office supplies and paper
Subtotal: $1,245.00
Tax: $99.60
Total Amount Due: $1,344.60
Please remit payment within 30 days.
`;
  }
  if (lower.includes("bank") || lower.includes("statement")) {
    return `
BANK STATEMENT
Account ending 4821
Period: October 1  October 31, 2026
Beginning Balance: $42,150.00
Ending Balance: $38,920.50
Transactions listed below...
`;
  }
  if (lower.includes("receipt")) {
    return `
RECEIPT
Thank you for your purchase
Date: 10/22/2026
Subtotal: $86.40
Tax: $6.91
Total: $93.31
`;
  }
  return `Document content extracted from ${fileName}. No structured data detected.`;
}