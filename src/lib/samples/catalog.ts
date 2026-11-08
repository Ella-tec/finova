/** Expanded Free Sample Library — synthetic training data only. */

import { EXTRA_SAMPLE_DOCUMENTS } from "./extra-docs";
import { buildCompanySampleDocs } from "./company-generated-docs";

export type SampleDocType =
  | "TRIAL_BALANCE" | "INCOME_STATEMENT" | "BALANCE_SHEET" | "CASH_FLOW"
  | "INVOICE" | "BANK_STATEMENT" | "BANK_RECON" | "PBC_LIST"
  | "CONSOLIDATION_PACK" | "FIXED_ASSETS" | "AR_AGING" | "AP_AGING"
  | "JOURNAL_ENTRY" | "PAYROLL_SUMMARY" | "LEASE_SCHEDULE"
  | "CONFIRMATION" | "WORKPAPER_CASH" | "GL_DETAIL";

export type SampleCompany = {
  id: string; code: string; name: string; industry: string; country: string;
  currency: string; fiscalYearEnd: string; ownershipPct?: number; parentCode?: string;
};

export type SampleDocument = {
  id: string; companyId: string; type: SampleDocType; title: string; period: string;
  description: string; content: string; fileName: string;
};

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

const tb = (rows: [string, string, number, number][]) =>
  ["Account Code,Account Name,Debit,Credit", ...rows.map((row) => row.join(","))].join("\\n");

const baseDocs: SampleDocument[] = [
  { id: "d-acme-tb", companyId: "c01", type: "TRIAL_BALANCE", title: "Acme — Trial Balance FY2026-10", period: "2026-10", description: "Balanced trial balance for close testing", fileName: "ACME_Trial_Balance_2026-10.csv", content: tb([["1000","Cash",125000,0],["1100","Accounts Receivable",85000,0],["1200","Inventory",62000,0],["1500","Fixed Assets",210000,0],["1510","Accumulated Depreciation",0,45000],["2000","Accounts Payable",0,48000],["2100","Accrued Expenses",0,12000],["3000","Common Stock",0,100000],["3100","Retained Earnings",0,95000],["4000","Revenue",0,405000],["5000","COGS",180000,0],["6000","Operating Expenses",148000,0]]) },
  { id: "d-acme-inv1", companyId: "c01", type: "INVOICE", title: "Acme — Vendor Invoice INV-2026-8842", period: "2026-10", description: "Office supplies invoice for AP and document AI tests", fileName: "ACME_Invoice_INV-2026-8842.txt", content: "INVOICE\\nInvoice #: INV-2026-8842\\nVendor: Office Supplies Co\\nDate: 10/15/2026\\nDue: 11/14/2026\\nLine: Office supplies and paper $1,245.00\\nTax: $99.60\\nTotal due: $1,344.60\\nTerms: Net 30\\nFICTIONAL TRAINING SAMPLE" },
  { id: "d-acme-bank", companyId: "c01", type: "BANK_STATEMENT", title: "Acme — Bank Statement Oct 2026", period: "2026-10", description: "Bank statement for reconciliation testing", fileName: "ACME_Bank_Statement_2026-10.csv", content: "Date,Description,Reference,Debit,Credit\\n2026-10-01,Opening balance,OPEN,0,42150.00\\n2026-10-05,Office supplies,CHECK-4521,1344.60,0\\n2026-10-15,Customer ACH,ACH-1015,0,8750.00\\n2026-10-28,Interest credit,INT-1028,0,42.15" },
  { id: "d-acme-ar", companyId: "c01", type: "AR_AGING", title: "Acme — AR Aging 2026-10-31", period: "2026-10", description: "Receivables aging for confirmations and allowance testing", fileName: "ACME_AR_Aging_2026-10.csv", content: "Customer,Current,30,60,90Plus,Total\\nBeta Foods,12000,3000,0,0,15000\\nCity Distributors,8000,5000,2000,500,15500\\nDelta Stores,20000,0,0,0,20000\\nTOTAL,40000,8000,2000,500,50500" },
  { id: "d-acme-ap", companyId: "c01", type: "AP_AGING", title: "Acme — AP Aging 2026-10-31", period: "2026-10", description: "Payables aging for unrecorded liability testing", fileName: "ACME_AP_Aging_2026-10.csv", content: "Vendor,Current,30,60,90Plus,Total\\nOffice Supplies Co,1344.60,0,0,0,1344.60\\nSteel Source LLC,18000,4000,0,0,22000\\nPower Utility,1240,0,0,0,1240\\nTOTAL,20584.60,4000,0,0,24584.60" },
  { id: "d-acme-fa", companyId: "c01", type: "FIXED_ASSETS", title: "Acme — Fixed Asset Register", period: "2026-10", description: "Asset register for depreciation testing", fileName: "ACME_Fixed_Assets_2026-10.csv", content: "AssetId,Description,Cost,AccumDep,NBV,Method,LifeYears\\nFA-001,CNC Machine,120000,28000,92000,SL,10\\nFA-002,Delivery Truck,45000,12000,33000,SL,5\\nFA-003,Warehouse Racking,25000,5000,20000,SL,7" },
  { id: "d-acme-pbc", companyId: "c01", type: "PBC_LIST", title: "Acme — PBC Request List FY2026", period: "2026", description: "Prepared-by-client checklist for audit testing", fileName: "ACME_PBC_List_FY2026.csv", content: "Item,Area,Priority,Status\\nFinal trial balance,Reporting,HIGH,REQUESTED\\nBank statements,Cash,HIGH,REQUESTED\\nAR aging,AR,HIGH,REQUESTED\\nAP listing,AP,MEDIUM,REQUESTED\\nFixed asset rollforward,Assets,MEDIUM,REQUESTED" },
];

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  ...baseDocs,
  ...EXTRA_SAMPLE_DOCUMENTS,
  ...buildCompanySampleDocs(SAMPLE_COMPANIES),
];

export function getCompany(id: string) { return SAMPLE_COMPANIES.find((company) => company.id === id); }
export function docsForCompany(companyId: string) { return SAMPLE_DOCUMENTS.filter((doc) => doc.companyId === companyId); }
export function getDoc(id: string) { return SAMPLE_DOCUMENTS.find((doc) => doc.id === id); }

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
