/**
 * Standard audit workpaper / lead schedule templates
 */

export type WorkpaperTemplate = {
  accountCode: string;
  accountName: string;
  title: string;
  procedures: string[];
  defaultLines: { description: string; lineCode?: string }[];
};

export const WORKPAPER_TEMPLATES: WorkpaperTemplate[] = [
  {
    accountCode: "1000",
    accountName: "Cash",
    title: "Cash — Lead Schedule",
    procedures: [
      "Agree lead schedule to trial balance",
      "Obtain bank reconciliations for all accounts",
      "Test outstanding checks and deposits in transit",
      "Confirm year-end bank balances with financial institutions",
      "Review bank statements for unusual items",
    ],
    defaultLines: [
      { description: "Operating account — Bank of America ****4821", lineCode: "1000.01" },
      { description: "Payroll account — Bank of America ****4822", lineCode: "1000.02" },
      { description: "Petty cash", lineCode: "1000.03" },
    ],
  },
  {
    accountCode: "1100",
    accountName: "Accounts Receivable",
    title: "Accounts Receivable — Lead Schedule",
    procedures: [
      "Agree AR aging to trial balance",
      "Select sample for confirmation",
      "Test subsequent collections",
      "Evaluate allowance for doubtful accounts",
      "Review credit memos and unusual items",
    ],
    defaultLines: [
      { description: "Trade receivables — current", lineCode: "1100.01" },
      { description: "Trade receivables — 30–60 days", lineCode: "1100.02" },
      { description: "Trade receivables — 60–90 days", lineCode: "1100.03" },
      { description: "Trade receivables — over 90 days", lineCode: "1100.04" },
      { description: "Allowance for doubtful accounts", lineCode: "1100.99" },
    ],
  },
  {
    accountCode: "1500",
    accountName: "Fixed Assets",
    title: "Fixed Assets — Lead Schedule",
    procedures: [
      "Agree rollforward to general ledger",
      "Vouch significant additions to invoices and approvals",
      "Test depreciation expense calculation",
      "Review disposals and related gains/losses",
      "Inspect selected assets (if applicable)",
    ],
    defaultLines: [
      { description: "Furniture & fixtures — cost", lineCode: "1500.01" },
      { description: "Equipment — cost", lineCode: "1500.02" },
      { description: "Accumulated depreciation", lineCode: "1500.99" },
    ],
  },
  {
    accountCode: "2000",
    accountName: "Accounts Payable",
    title: "Accounts Payable — Lead Schedule",
    procedures: [
      "Agree AP listing to trial balance",
      "Perform search for unrecorded liabilities",
      "Test subsequent disbursements",
      "Review vendor statements",
    ],
    defaultLines: [
      { description: "Trade payables", lineCode: "2000.01" },
      { description: "Accrued expenses", lineCode: "2000.02" },
    ],
  },
  {
    accountCode: "4000",
    accountName: "Revenue",
    title: "Revenue — Lead Schedule / Analytical",
    procedures: [
      "Agree revenue to trial balance by stream",
      "Perform substantive analytical procedures",
      "Test cut-off of sales near period end",
      "Review unusual or significant transactions",
    ],
    defaultLines: [
      { description: "Product revenue", lineCode: "4000.01" },
      { description: "Service revenue", lineCode: "4000.02" },
    ],
  },
];

export function createWorkpaperFromTemplate(
  template: WorkpaperTemplate,
  period: string,
  tbBalance?: number
) {
  return {
    accountCode: template.accountCode,
    accountName: template.accountName,
    title: template.title,
    period,
    leadBalance: tbBalance ?? 0,
    status: "DRAFT" as const,
    procedures: JSON.stringify(template.procedures),
    schedules: template.defaultLines.map((l, i) => ({
      lineCode: l.lineCode,
      description: l.description,
      priorBalance: 0,
      currentBalance: i === 0 && tbBalance ? tbBalance : 0,
      adjustments: 0,
      finalBalance: i === 0 && tbBalance ? tbBalance : 0,
      sortOrder: i,
    })),
  };
}
