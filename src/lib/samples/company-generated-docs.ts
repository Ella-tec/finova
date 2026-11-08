import type { SampleCompany, SampleDocument } from "./catalog";

export function buildCompanySampleDocs(companies: SampleCompany[]): SampleDocument[] {
  const vendors = ["Northstar Office Supply", "Apex Industrial Components", "Cedar Ridge Services"];
  const customers = ["Harbor Retail Group", "Summit Distribution", "Bluebird Enterprises"];
  const result: SampleDocument[] = [];
  companies.forEach((c, i) => {
    const code = c.code.replace(/[^A-Z0-9]+/g, "_");
    const currency = c.currency || "USD";
    const amount = 1250 + (i + 1) * 437.25;
    const vendor = vendors[i % vendors.length];
    const customer = customers[i % customers.length];
    const n = String(i + 1).padStart(4, "0");
    const ap = code + "-AP-2026-" + n;
    const ar = code + "-AR-2026-" + String(i + 51).padStart(4, "0");
    const add = (key: string, type: SampleDocument["type"], title: string, description: string, fileName: string, content: string) => result.push({
      id: "d-" + code.toLowerCase() + "-" + key, companyId: c.id, type,
      title: c.code + " — " + title, period: "2026-10", description, fileName, content
    });

    add("vendor-invoice", "INVOICE", "Vendor Invoice " + ap, "AP invoice with line items, tax, payment terms and remittance details", code + "_Vendor_Invoice_" + ap + ".txt",
      "VENDOR INVOICE — FICTIONAL TRAINING SAMPLE\nVendor: " + vendor + "\nBill to: " + c.name + "\nInvoice: " + ap + "\nInvoice date: 10/05/2026\nDue date: 11/04/2026\nPO: " + code + "-PO-2026-" + n + "\nCurrency: " + currency + "\n\nDescription,Qty,Unit Price,Line Total\nOperating supplies,1," + amount.toFixed(2) + "," + amount.toFixed(2) + "\nFreight,1,85.00,85.00\nSubtotal: " + currency + " " + (amount + 85).toFixed(2) + "\nIllustrative tax: " + currency + " " + (amount * 0.0825).toFixed(2) + "\nTOTAL DUE: " + currency + " " + (amount * 1.0825 + 85).toFixed(2) + "\nTerms: Net 30\nSynthetic sample only.\n");

    add("customer-invoice", "INVOICE", "Customer Invoice " + ar, "O2C invoice for revenue, receivables and cutoff testing", code + "_Customer_Invoice_" + ar + ".txt",
      "SALES INVOICE — FICTIONAL TRAINING SAMPLE\nSeller: " + c.name + "\nCustomer: " + customer + "\nInvoice: " + ar + "\nInvoice date: 10/12/2026\nDue date: 11/11/2026\nCurrency: " + currency + "\n\nDescription,Qty,Amount\n" + c.industry + " products and services,1," + (amount * 1.6).toFixed(2) + "\nImplementation and support,1,450.00\nSubtotal: " + currency + " " + (amount * 1.6 + 450).toFixed(2) + "\nTax (illustrative): " + currency + " " + ((amount * 1.6 + 450) * 0.0825).toFixed(2) + "\nTerms: Net 30\nStatus: Open — fictional training receivable.\n");

    add("purchase-order", "JOURNAL_ENTRY", "Purchase Order " + code + "-PO-2026-" + n, "P2P purchase authorization for three-way match testing", code + "_Purchase_Order_2026-10.csv",
      "PO,Date,Vendor,Company,Currency,Line,Description,Qty,UnitCost,Total,Approval\n" + code + "-PO-2026-" + n + ",2026-10-03," + vendor + "," + c.name + "," + currency + ",1,Operating supplies,1," + amount.toFixed(2) + "," + amount.toFixed(2) + ",Approved\n" + code + "-PO-2026-" + n + ",2026-10-03," + vendor + "," + c.name + "," + currency + ",2,Freight,1,85.00,85.00,Approved\n");

    add("bank-statement", "BANK_STATEMENT", "Operating Bank Statement October 2026", "Monthly bank activity for reconciliation and cash audit testing", code + "_Bank_Statement_2026-10.csv",
      "Account,Date,Description,Reference,Debit,Credit,Currency\nOperating ****" + String(4100 + i).slice(-4) + ",2026-10-01,Opening balance,OPEN,0,25000.00," + currency + "\nOperating ****" + String(4100 + i).slice(-4) + ",2026-10-05,Vendor payment," + ap + "," + (amount / 2).toFixed(2) + ",0," + currency + "\nOperating ****" + String(4100 + i).slice(-4) + ",2026-10-12,Customer receipt," + ar + ",0," + (amount * 1.6).toFixed(2) + "," + currency + "\nOperating ****" + String(4100 + i).slice(-4) + ",2026-10-20,Utilities ACH,ACH-1020,640.00,0," + currency + "\nOperating ****" + String(4100 + i).slice(-4) + ",2026-10-31,Bank fee,FEE-1031,25.00,0," + currency + "\n");

    add("journal-entry", "JOURNAL_ENTRY", "Month-End Adjusting Journal Entries", "Balanced accrual and depreciation entries for close testing", code + "_Adjusting_Journal_Entries_2026-10.csv",
      "JournalID,Date,Account,AccountName,Debit,Credit,Memo,Status\n" + code + "-JE-1001,2026-10-31,6100,Operating Expense," + (amount / 2).toFixed(2) + ",0,Accrue October cost,Pending Review\n" + code + "-JE-1001,2026-10-31,2100,Accrued Expenses,0," + (amount / 2).toFixed(2) + ",Accrue October cost,Pending Review\n" + code + "-JE-1002,2026-10-31,6400,Depreciation Expense,350.00,0,Monthly depreciation,Pending Review\n" + code + "-JE-1002,2026-10-31,1510,Accumulated Depreciation,0,350.00,Monthly depreciation,Pending Review\n");

    add("audit-evidence", "PBC_LIST", "Audit Evidence and PBC Request Register", "Audit evidence tracker with owner, due date and status", code + "_Audit_Evidence_Register_FY2026.csv",
      "RequestID,Company,Area,Evidence,Owner,DueDate,Status\n" + code + "-PBC-001," + c.name + ",Cash,October bank statement and reconciliation,Treasury,2026-11-10,Received\n" + code + "-PBC-002," + c.name + ",AP,Open invoice listing and subsequent payments,AP Manager,2026-11-12,Requested\n" + code + "-PBC-003," + c.name + ",Revenue,Sales invoices and delivery evidence,AR Manager,2026-11-14,In Progress\n" + code + "-PBC-004," + c.name + ",Journal Entries,Manual journal approvals,Controller,2026-11-15,Requested\n" + code + "-PBC-005," + c.name + ",Fixed Assets,Asset additions and depreciation rollforward,Asset Accountant,2026-11-18,Requested\n\nAll entities, names, references and amounts are fictional training data.\n");
  });
  return result;
}
