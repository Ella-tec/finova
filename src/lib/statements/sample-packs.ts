import type { TBLine } from "./generator";

export type SamplePack = {
  id: string;
  code: string;
  name: string;
  industry: string;
  period: string;
  lines: TBLine[];
};

function pack(
  id: string,
  code: string,
  name: string,
  industry: string,
  period: string,
  rows: [string, string, number, number][]
): SamplePack {
  return {
    id,
    code,
    name,
    industry,
    period,
    lines: rows.map(([accountCode, accountName, debit, credit]) => ({
      accountCode,
      accountName,
      debit,
      credit,
    })),
  };
}

/** Realistic demo packs for TB → JE → statements practice */
export const STATEMENT_SAMPLE_PACKS: SamplePack[] = [
  pack("acme", "ACME", "Acme Corporation", "Manufacturing", "2026-10", [
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
  pack("nexus", "NEXUS", "Nexus Retail Group", "Retail", "2026-01", [
    ["1000", "Cash", 78000, 0],
    ["1100", "Accounts Receivable", 22000, 0],
    ["1200", "Inventory", 310000, 0],
    ["2000", "Accounts Payable", 0, 145000],
    ["3000", "Equity", 0, 120000],
    ["4000", "Retail Sales", 0, 520000],
    ["5000", "COGS", 340000, 0],
    ["6000", "Store Operating Expenses", 35000, 0],
  ]),
  pack("orbit", "ORBIT", "Orbit Software LLC", "Technology", "2026-09", [
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
  pack("pulse", "PULSE", "Pulse Health Clinics", "Healthcare", "2026-10", [
    ["1000", "Cash", 210000, 0],
    ["1100", "Patient Receivables", 145000, 0],
    ["1500", "Medical Equipment", 380000, 0],
    ["1510", "Accumulated Depreciation", 0, 90000],
    ["2000", "Accounts Payable", 0, 55000],
    ["2100", "Accrued Payroll", 0, 42000],
    ["3000", "Equity", 0, 250000],
    ["4000", "Patient Service Revenue", 0, 620000],
    ["5000", "Clinical Supplies", 88000, 0],
    ["6000", "Salaries", 234000, 0],
  ]),
  pack("granite", "GRANITE", "Granite Construction Partners", "Construction", "2026-09", [
    ["1000", "Cash", 95000, 0],
    ["1100", "Contract Receivables", 260000, 0],
    ["1200", "Job Materials", 175000, 0],
    ["1500", "Equipment", 520000, 0],
    ["1510", "Accumulated Depreciation", 0, 140000],
    ["2000", "Accounts Payable", 0, 110000],
    ["2200", "Billings in Excess", 0, 80000],
    ["3000", "Partners Capital", 0, 300000],
    ["4000", "Construction Revenue", 0, 890000],
    ["5000", "Job Costs", 470000, 0],
  ]),
  pack("leaf", "LEAF", "Leaf & Co Foods", "Food & Beverage", "2026-12", [
    ["1000", "Cash", 64000, 0],
    ["1100", "Accounts Receivable", 48000, 0],
    ["1200", "Inventory", 92000, 0],
    ["2000", "Accounts Payable", 0, 38000],
    ["3000", "Equity", 0, 80000],
    ["4000", "Product Sales", 0, 310000],
    ["5000", "COGS", 165000, 0],
    ["6000", "Operating Expenses", 59000, 0],
  ]),
  pack("atlas", "ATLAS", "Atlas Logistics Inc", "Transportation", "2026-11", [
    ["1000", "Cash", 132000, 0],
    ["1100", "Freight Receivables", 98000, 0],
    ["1500", "Fleet Assets", 640000, 0],
    ["1510", "Accumulated Depreciation", 0, 210000],
    ["2000", "Accounts Payable", 0, 72000],
    ["2200", "Equipment Loans", 0, 180000],
    ["3000", "Common Stock", 0, 150000],
    ["4000", "Freight Revenue", 0, 480000],
    ["5000", "Fuel & Maintenance", 142000, 0],
    ["6000", "Driver Payroll", 80000, 0],
  ]),
  pack("summit", "SUMMIT", "Summit Energy Holdings", "Energy", "2026-09", [
    ["1000", "Cash", 2100000, 0],
    ["1100", "Receivables", 980000, 0],
    ["1500", "PP&E net", 12500000, 0],
    ["2000", "Accounts Payable", 0, 640000],
    ["2500", "Long-term Debt", 0, 8000000],
    ["3000", "Common Stock", 0, 1000000],
    ["3100", "Retained Earnings", 0, 5940000],
  ]),
];

export function getSamplePack(id: string) {
  return STATEMENT_SAMPLE_PACKS.find((p) => p.id === id);
}
