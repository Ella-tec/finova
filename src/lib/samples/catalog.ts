/**
 * Free sample library — 15+ companies + audit/accounting test documents.
 * For training, demos, and pipeline testing (not real client data).
 */

import { EXTRA_SAMPLE_DOCUMENTS } from "./extra-docs";


export type SampleDocType =
  | "TRIAL_BALANCE"
  | "INCOME_STATEMENT"
  | "BALANCE_SHEET"
  | "CASH_FLOW"
  | "INVOICE"
  | "BANK_STATEMENT"
  | "BANK_RECON"
  | "PBC_LIST"
  | "CONSOLIDATION_PACK"
  | "FIXED_ASSETS"
  | "AR_AGING"
  | "AP_AGING"
  | "JOURNAL_ENTRY"
  | "PAYROLL_SUMMARY"
  | "LEASE_SCHEDULE"
  | "CONFIRMATION"
  | "WORKPAPER_CASH"
  | "GL_DETAIL";

export type SampleCompany = {
  id: string;
  code: string;
  name: string;
  industry: string;
  country: string;
  currency: string;
  fiscalYearEnd: string;
  ownershipPct?: number; // if sub in group
  parentCode?: string;
};

export type SampleDocument = {
  id: string;
  companyId: string;
  type: SampleDocType;
  title: string;
  period: string;
  description: string;
  /** CSV or plain text body for download / import */
  content: string;
  fileName: string;
};

/** 18 demo companies (group + standalones) */
export const SAMPLE_COMPANIES: SampleCompany[] = [
  { id: "c01", code: "ACME", name: "Acme Manufacturing Co", industry: "Manufacturing", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c02", code: "NEXUS", name: "Nexus Retail Group", industry: "Retail", country: "US", currency: "USD", fiscalYearEnd: "01-31" },
  { id: "c03", code: "PULSE", name: "Pulse Health Clinics", industry: "Healthcare", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c04", code: "ORBIT", name: "Orbit Software LLC", industry: "Technology", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c05", code: "GRANITE", name: "Granite Construction Partners", industry: "Construction", country: "US", currency: "USD", fiscalYearEnd: "09-30" },
  { id: "c06", code: "LEAF", name: "Leaf & Co Foods", industry: "Food & Beverage", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c07", code: "ATLAS", name: "Atlas Logistics Inc", industry: "Transportation", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c08", code: "SILVER", name: "Silverline Insurance Agency", industry: "Insurance", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c09", code: "CEDAR", name: "Cedar Community Bank", industry: "Financial Services", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c10", code: "SUMMIT", name: "Summit Energy Holdings", industry: "Energy", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c11", code: "PARENT", name: "Finova Parent Co (Demo Group)", industry: "Holding", country: "US", currency: "USD", fiscalYearEnd: "12-31", ownershipPct: 100 },
  { id: "c12", code: "SUB-A", name: "Subsidiary Alpha LLC", industry: "Services", country: "US", currency: "USD", fiscalYearEnd: "12-31", ownershipPct: 100, parentCode: "PARENT" },
  { id: "c13", code: "SUB-B", name: "Subsidiary Beta Inc", industry: "Services", country: "US", currency: "USD", fiscalYearEnd: "12-31", ownershipPct: 80, parentCode: "PARENT" },
  { id: "c14", code: "SUB-EU", name: "EU Operations GmbH", industry: "Services", country: "DE", currency: "EUR", fiscalYearEnd: "12-31", ownershipPct: 75, parentCode: "PARENT" },
  { id: "c15", code: "NORTH", name: "Northern Mining Ltd", industry: "Mining", country: "CA", currency: "CAD", fiscalYearEnd: "12-31" },
  { id: "c16", code: "PACIFIC", name: "Pacific Hotels Group", industry: "Hospitality", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
  { id: "c17", code: "EDU", name: "BrightPath Education Inc", industry: "Education", country: "US", currency: "USD", fiscalYearEnd: "06-30" },
  { id: "c18", code: "MEDIA", name: "ClearSignal Media Co", industry: "Media", country: "US", currency: "USD", fiscalYearEnd: "12-31" },
];

function tb(lines: [string, string, number, number][]) {
  return ["Account Code,Account Name,Debit,Credit", ...lines.map((l) => l.join(","))].join("\n");
}

function inv(opts: { num: string; vendor: string; date: string; due: string; total: number; lines: string }) {
  return `INVOICE
Invoice #: ${opts.num}
Date: ${opts.date}
Due Date: ${opts.due}
Vendor: ${opts.vendor}
Bill To: Sample Audit Client

Line items:
${opts.lines}

Subtotal: $${(opts.total * 0.93).toFixed(2)}
Tax: $${(opts.total * 0.07).toFixed(2)}
Total Amount Due: $${opts.total.toFixed(2)}

Remit within terms. Sample document for audit testing only.
`;
}

/** Named sample documents across companies */
const _BASE_SAMPLE_DOCUMENTS: SampleDocument[] = [
  // ACME — full TB + statements style
  {
    id: "d-acme-tb",
    companyId: "c01",
    type: "TRIAL_BALANCE",
    title: "Acme — Trial Balance FY2026-10",
    period: "2026-10",
    description: "Balanced trial balance for statement generation and close testing",
    fileName: "ACME_Trial_Balance_2026-10.csv",
    content: tb([
      ["1000", "Cash", 125000, 0],
      ["1100", "Accounts Receivable", 85000, 0],
      ["1200", "Inventory", 62000, 0],
      ["1500", "Fixed Assets", 210000, 0],
      ["1510", "Accumulated Depreciation", 0, 45000],
      ["2000", "Accounts Payable", 0, 48000],
      ["2100", "Accrued Expenses", 0, 12000],
      ["2200", "Short-term Debt", 0, 25000],
      ["3000", "Common Stock", 0, 100000],
      ["3100", "Retained Earnings", 0, 95000],
      ["4000", "Product Revenue", 0, 320000],
      ["4100", "Service Revenue", 0, 85000],
      ["5000", "Cost of Goods Sold", 180000, 0],
      ["6000", "Salaries Expense", 95000, 0],
      ["6100", "Rent Expense", 24000, 0],
      ["6200", "Utilities Expense", 8500, 0],
      ["6300", "Insurance Expense", 6200, 0],
      ["6400", "Depreciation Expense", 14300, 0],
    ]),
  },
  {
    id: "d-acme-inv1",
    companyId: "c01",
    type: "INVOICE",
    title: "Acme — Vendor Invoice INV-2026-8842",
    period: "2026-10",
    description: "Office supplies invoice for AP and document AI tests",
    fileName: "ACME_Invoice_INV-2026-8842.txt",
    content: inv({
      num: "INV-2026-8842",
      vendor: "Office Supplies Co",
      date: "10/15/2026",
      due: "11/14/2026",
      total: 1344.6,
      lines: "Office supplies and paper — $1,245.00",
    }),
  },
  {
    id: "d-acme-bank",
    companyId: "c01",
    type: "BANK_STATEMENT",
    title: "Acme — Bank Statement Oct 2026",
    period: "2026-10",
    description: "Sample bank statement narrative for recon / sanitizer",
    fileName: "ACME_Bank_Statement_2026-10.txt",
    content: `BANK STATEMENT
Account ending 4821 — Acme Manufacturing Co
Period: October 1 – October 31, 2026
Beginning Balance: $42,150.00
Ending Balance: $38,920.50

Transactions:
10/02 ACH DEPOSIT CUSTOMER PAYMENT 12,500.00
10/05 CHECK 4521 OFFICE SUPPLIES -1,344.60
10/08 WIRE PAYROLL -28,400.00
10/12 POS AMAZON -186.42
10/15 CUSTOMER ACH 8,750.00
10/18 UTILITY ELECTRIC -1,240.00
10/22 UNKNOWN TRANSFER -500.00
10/28 INTEREST CREDIT 42.15
`,
  },
  {
    id: "d-acme-ar",
    companyId: "c01",
    type: "AR_AGING",
    title: "Acme — AR Aging 2026-10-31",
    period: "2026-10",
    description: "Accounts receivable aging for confirmations and allowance testing",
    fileName: "ACME_AR_Aging_2026-10.csv",
    content: `Customer,Current,30,60,90Plus,Total
Beta Foods Inc,12000,3000,0,0,15000
City Distributors,8000,5000,2000,500,15500
Delta Stores,20000,0,0,0,20000
Eagle Wholesale,5000,4000,3000,2000,14000
Other,18000,2000,500,0,20500
TOTAL,63000,14000,5500,2500,85000
`,
  },
  {
    id: "d-acme-ap",
    companyId: "c01",
    type: "AP_AGING",
    title: "Acme — AP Aging 2026-10-31",
    period: "2026-10",
    description: "Accounts payable aging for search for unrecorded liabilities",
    fileName: "ACME_AP_Aging_2026-10.csv",
    content: `Vendor,Current,30,60,90Plus,Total
Office Supplies Co,1344.60,0,0,0,1344.60
Steel Source LLC,18000,4000,0,0,22000
Power Utility,1240,0,0,0,1240
Fleet Lease Co,3500,3500,0,0,7000
Misc vendors,11415.4,2000,1000,0,14415.4
TOTAL,35499.99,9500,1000,0,48000
`,
  },
  {
    id: "d-acme-fa",
    companyId: "c01",
    type: "FIXED_ASSETS",
    title: "Acme — Fixed Asset Register",
    period: "2026-10",
    description: "Asset rollforward sample for depreciation testing",
    fileName: "ACME_Fixed_Assets_2026-10.csv",
    content: `AssetId,Description,Cost,AccumDep,NBV,DepMethod,LifeYears
FA-001,CNC Machine,120000,28000,92000,SL,10
FA-002,Delivery Truck,45000,12000,33000,SL,5
FA-003,Warehouse Racking,25000,5000,20000,SL,7
FA-004,Office Buildout,20000,0,20000,SL,15
TOTAL,210000,45000,165000,,
`,
  },
  {
    id: "d-acme-pbc",
    companyId: "c01",
    type: "PBC_LIST",
    title: "Acme — PBC Request List FY2026",
    period: "2026",
    description: "Prepared-by-client checklist for audit engagement testing",
    fileName: "ACME_PBC_List_FY2026.csv",
    content: `Item,Area,Priority,Status,Due
TB final,Reporting,HIGH,REQUESTED,2026-11-15
Bank statements all accounts,Cash,HIGH,REQUESTED,2026-11-10
AR aging + subsequent receipts,AR,HIGH,REQUESTED,2026-11-12
AP listing + unmatched invoices,AP,MEDIUM,REQUESTED,2026-11-12
Fixed asset rollforward,Assets,MEDIUM,REQUESTED,2026-11-18
Debt agreements,Liabilities,HIGH,REQUESTED,2026-11-20
Board minutes,Governance,MEDIUM,REQUESTED,2026-11-25
Lease schedule ASC 842,Leases,MEDIUM,REQUESTED,2026-11-22
`,
  },
  {
    id: "d-acme-wp-cash",
    companyId: "c01",
    type: "WORKPAPER_CASH",
    title: "Acme — Cash Lead Schedule Sample",
    period: "2026-10",
    description: "Workpaper-style cash lead for audit workspace",
    fileName: "ACME_Workpaper_Cash_Lead.csv",
    content: `Line,Description,Prior,Current,Adjustments,Final
1000.01,Operating Bank ****4821,40000,38920.5,0,38920.5
1000.02,Payroll Bank ****4822,5000,4200,0,4200
1000.03,Petty cash,500,500,0,500
TOTAL,Cash,45500,43620.5,0,43620.5
`,
  },
  // ORBIT software
  {
    id: "d-orbit-tb",
    companyId: "c04",
    type: "TRIAL_BALANCE",
    title: "Orbit Software — Trial Balance 2026-09",
    period: "2026-09",
    description: "SaaS-style TB with deferred revenue",
    fileName: "ORBIT_Trial_Balance_2026-09.csv",
    content: tb([
      ["1000", "Cash", 420000, 0],
      ["1100", "Accounts Receivable", 95000, 0],
      ["1300", "Prepaid Expenses", 18000, 0],
      ["2000", "Accounts Payable", 0, 32000],
      ["2300", "Deferred Revenue", 0, 180000],
      ["3000", "Common Stock", 0, 50000],
      ["3100", "Retained Earnings", 0, 91000],
      ["4000", "Subscription Revenue", 0, 410000],
      ["6000", "R&D Expense", 120000, 0],
      ["6100", "Sales & Marketing", 85000, 0],
      ["6200", "G&A Expense", 25000, 0],
    ]),
  },
  {
    id: "d-orbit-inv",
    companyId: "c04",
    type: "INVOICE",
    title: "Orbit — Customer Invoice ORB-10991",
    period: "2026-09",
    description: "Subscription invoice sample",
    fileName: "ORBIT_Invoice_ORB-10991.txt",
    content: inv({
      num: "ORB-10991",
      vendor: "Orbit Software LLC",
      date: "09/01/2026",
      due: "09/30/2026",
      total: 24000,
      lines: "Annual SaaS platform license — $24,000.00",
    }),
  },
  // Group consolidation pack
  {
    id: "d-parent-consol",
    companyId: "c11",
    type: "CONSOLIDATION_PACK",
    title: "Demo Group — Consolidation Pack 2026-10",
    period: "2026-10",
    description: "Parent + Sub-A + Sub-B + Sub-EU balances for NCI and FX tests",
    fileName: "GROUP_Consolidation_Pack_2026-10.csv",
    content: `Entity,AccountCode,AccountName,Debit,Credit,Currency
PARENT,1000,Cash,500000,0,USD
PARENT,1150,Intercompany Receivable - Sub A,50000,0,USD
PARENT,4000,Revenue,0,300000,USD
PARENT,4100,Intercompany Revenue - Sub A,0,25000,USD
SUB-A,1000,Cash,80000,0,USD
SUB-A,2100,Intercompany Payable - Parent,0,50000,USD
SUB-A,5000,Intercompany Expense - Parent,25000,0,USD
SUB-B,1000,Cash,40000,0,USD
SUB-B,4000,Revenue,0,55000,USD
SUB-EU,1000,Cash,90000,0,EUR
SUB-EU,4000,Revenue,0,120000,EUR
`,
  },
  // NEXUS retail
  {
    id: "d-nexus-tb",
    companyId: "c02",
    type: "TRIAL_BALANCE",
    title: "Nexus Retail — Trial Balance 2026-01",
    period: "2026-01",
    description: "Retail TB with heavy inventory",
    fileName: "NEXUS_Trial_Balance_2026-01.csv",
    content: tb([
      ["1000", "Cash", 78000, 0],
      ["1100", "Accounts Receivable", 22000, 0],
      ["1200", "Inventory", 310000, 0],
      ["2000", "Accounts Payable", 0, 145000],
      ["3000", "Equity", 0, 120000],
      ["4000", "Retail Sales", 0, 520000],
      ["5000", "COGS", 340000, 0],
      ["6000", "Store Operating Expenses", 35000, 0],
    ]),
  },
  {
    id: "d-pulse-payroll",
    companyId: "c03",
    type: "PAYROLL_SUMMARY",
    title: "Pulse Health — Payroll Summary Oct 2026",
    period: "2026-10",
    description: "Payroll totals for expense and accrual testing (no SSNs)",
    fileName: "PULSE_Payroll_Summary_2026-10.csv",
    content: `Department,Gross,EmployerTax,Benefits,Net
Clinical,180000,13770,12000,154230
Admin,42000,3213,2800,35987
Billing,28000,2142,1500,24358
TOTAL,250000,19125,16300,214575
`,
  },
  {
    id: "d-granite-je",
    companyId: "c05",
    type: "JOURNAL_ENTRY",
    title: "Granite — Sample Adjusting JEs",
    period: "2026-09",
    description: "Month-end accruals and reclasses",
    fileName: "GRANITE_Adjusting_JEs_2026-09.csv",
    content: `JE,Date,Account,Debit,Credit,Memo
JE-901,2026-09-30,6100 Accrued Job Costs,25000,0,Accrue subcontractor
JE-901,2026-09-30,2100 Accrued Expenses,0,25000,Accrue subcontractor
JE-902,2026-09-30,6400 Depreciation,8200,0,Monthly depreciation
JE-902,2026-09-30,1510 Accumulated Depreciation,0,8200,Monthly depreciation
`,
  },
  {
    id: "d-leaf-lease",
    companyId: "c06",
    type: "LEASE_SCHEDULE",
    title: "Leaf & Co — Lease Schedule ASC 842",
    period: "2026-12",
    description: "Operating lease rollforward sample",
    fileName: "LEAF_Lease_Schedule_2026.csv",
    content: `LeaseId,Asset,Start,End,Monthly,RemainingPayments,ROU_Asset,LeaseLiability
L-01,Warehouse A,2024-01-01,2028-12-31,8500,204000,185000,192000
L-02,Store Front,2025-06-01,2030-05-31,4200,176400,160000,168000
`,
  },
  {
    id: "d-atlas-confirm",
    companyId: "c07",
    type: "CONFIRMATION",
    title: "Atlas — Bank Confirmation Template",
    period: "2026-12",
    description: "Blank-style bank confirmation for audit file testing",
    fileName: "ATLAS_Bank_Confirmation_Template.txt",
    content: `STANDARD BANK CONFIRMATION (SAMPLE)
Entity: Atlas Logistics Inc
Bank: Sample National Bank
Account: ****1190
As of: 2026-12-31

Please confirm balance and any contingent liabilities, guarantees, or compensating balances.
Auditor: Demo CPA Firm
Reply to: audit-confirmations@demo-cpa.example
`,
  },
  {
    id: "d-silver-gl",
    companyId: "c08",
    type: "GL_DETAIL",
    title: "Silverline — Revenue GL Detail Extract",
    period: "2026-Q3",
    description: "GL lines for cut-off testing",
    fileName: "SILVER_GL_Revenue_Q3.csv",
    content: `Date,Entry,Account,Debit,Credit,Description
2026-09-28,S-441,4000,0,12000,Policy premium batch
2026-09-29,S-442,4000,0,8500,Endorsement fees
2026-09-30,S-443,4000,0,15000,Monthly commission
2026-10-01,S-501,4000,0,9000,NEXT PERIOD — cut-off sample
`,
  },
  {
    id: "d-summit-bs",
    companyId: "c10",
    type: "BALANCE_SHEET",
    title: "Summit Energy — Sample Balance Sheet",
    period: "2026-09",
    description: "Condensed BS for presentation tests",
    fileName: "SUMMIT_Balance_Sheet_2026-09.csv",
    content: `Section,Line,Amount
Assets,Cash,2100000
Assets,Receivables,980000
Assets,PP&E net,12500000
Liabilities,AP,640000
Liabilities,Long-term debt,8000000
Equity,Common stock,1000000
Equity,Retained earnings,5940000
`,
  },
  {
    id: "d-north-tb",
    companyId: "c15",
    type: "TRIAL_BALANCE",
    title: "Northern Mining — TB CAD",
    period: "2026-10",
    description: "Canadian entity TB for FX translation practice",
    fileName: "NORTH_Trial_Balance_CAD_2026-10.csv",
    content: tb([
      ["1000", "Cash", 350000, 0],
      ["1500", "Mining Equipment", 2200000, 0],
      ["2000", "Accounts Payable", 0, 180000],
      ["3000", "Equity", 0, 1500000],
      ["4000", "Revenue", 0, 980000],
      ["6000", "Operating Costs", 110000, 0],
    ]),
  },
  {
    id: "d-edu-is",
    companyId: "c17",
    type: "INCOME_STATEMENT",
    title: "BrightPath — Income Statement FY2026",
    period: "2026",
    description: "Education nonprofit-style IS sample",
    fileName: "EDU_Income_Statement_FY2026.csv",
    content: `Line,Amount
Tuition revenue,2400000
Grants,350000
Total revenue,2750000
Instruction costs,1600000
Admin,420000
Total expenses,2020000
Change in net assets,730000
`,
  },
  {
    id: "d-media-recon",
    companyId: "c18",
    type: "BANK_RECON",
    title: "ClearSignal — Bank Rec Worksheet",
    period: "2026-10",
    description: "Book-to-bank reconciling items",
    fileName: "MEDIA_Bank_Rec_2026-10.csv",
    content: `Item,Type,Amount
Bank balance EOM,BANK,88200
Deposits in transit,BOOK_ADD,4500
Outstanding checks,BOOK_SUB,-12300
Book balance EOM,BOOK,80400
Difference,CHECK,0
`,
  },
];

export const SAMPLE_DOCUMENTS: SampleDocument[] = [..._BASE_SAMPLE_DOCUMENTS, ...EXTRA_SAMPLE_DOCUMENTS];

export function getCompany(id: string) {
  return SAMPLE_COMPANIES.find((c) => c.id === id);
}

export function docsForCompany(companyId: string) {
  return SAMPLE_DOCUMENTS.filter((d) => d.companyId === companyId);
}

export function getDoc(id: string) {
  return SAMPLE_DOCUMENTS.find((d) => d.id === id);
}

export const DOC_TYPE_LABELS: Record<SampleDocType, string> = {
  TRIAL_BALANCE: "Trial Balance",
  INCOME_STATEMENT: "Income Statement",
  BALANCE_SHEET: "Balance Sheet",
  CASH_FLOW: "Cash Flow",
  INVOICE: "Invoice",
  BANK_STATEMENT: "Bank Statement",
  BANK_RECON: "Bank Reconciliation",
  PBC_LIST: "PBC Request List",
  CONSOLIDATION_PACK: "Consolidation Pack",
  FIXED_ASSETS: "Fixed Assets Register",
  AR_AGING: "AR Aging",
  AP_AGING: "AP Aging",
  JOURNAL_ENTRY: "Journal Entries",
  PAYROLL_SUMMARY: "Payroll Summary",
  LEASE_SCHEDULE: "Lease Schedule",
  CONFIRMATION: "Audit Confirmation",
  WORKPAPER_CASH: "Cash Workpaper",
  GL_DETAIL: "GL Detail",
};
