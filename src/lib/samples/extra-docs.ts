
import type { SampleDocument } from "./catalog";

/** Extra free samples mapped to full accounting & audit cycles */
export const EXTRA_SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "d-coa-acme",
    companyId: "c01",
    type: "TRIAL_BALANCE",
    title: "Acme — Chart of Accounts",
    period: "2026",
    description: "R2R / master data — standard COA extract",
    fileName: "ACME_Chart_of_Accounts.csv",
    content: `Code,Name,Type,NormalBalance
1000,Cash,ASSET,Debit
1100,Accounts Receivable,ASSET,Debit
1200,Inventory,ASSET,Debit
1500,Fixed Assets,ASSET,Debit
2000,Accounts Payable,LIABILITY,Credit
2100,Accrued Expenses,LIABILITY,Credit
3000,Common Stock,EQUITY,Credit
3100,Retained Earnings,EQUITY,Credit
4000,Revenue,REVENUE,Credit
5000,COGS,EXPENSE,Debit
6000,Operating Expenses,EXPENSE,Debit
`,
  },
  {
    id: "d-gl-acme",
    companyId: "c01",
    type: "GL_DETAIL",
    title: "Acme — General Ledger Extract Oct 2026",
    period: "2026-10",
    description: "R2R — GL posting detail for walkthroughs",
    fileName: "ACME_General_Ledger_2026-10.csv",
    content: `Date,JE,Account,Debit,Credit,Description
2026-10-02,JE-1001,1000,12500,0,Customer ACH
2026-10-02,JE-1001,1100,0,12500,Clear AR
2026-10-05,JE-1002,6000,1344.6,0,Office supplies
2026-10-05,JE-1002,2000,0,1344.6,AP invoice
2026-10-08,JE-1003,6000,28400,0,Payroll
2026-10-08,JE-1003,1000,0,28400,Payroll wire
2026-10-31,JE-1099,6400,14300,0,Depreciation
2026-10-31,JE-1099,1510,0,14300,Accum dep
`,
  },
  {
    id: "d-po-acme",
    companyId: "c01",
    type: "JOURNAL_ENTRY",
    title: "Acme — Purchase Order PO-5521 (P2P)",
    period: "2026-10",
    description: "P2P — PO for three-way match testing",
    fileName: "ACME_Purchase_Order_PO-5521.csv",
    content: `PO,Vendor,Item,Qty,UnitCost,Total,Status
PO-5521,Steel Source LLC,Raw steel coil,10,1800,18000,OPEN
PO-5521,Steel Source LLC,Freight,1,400,400,OPEN
`,
  },
  {
    id: "d-grn-acme",
    companyId: "c01",
    type: "JOURNAL_ENTRY",
    title: "Acme — Goods Receipt GR-5521",
    period: "2026-10",
    description: "P2P — goods receipt note vs PO",
    fileName: "ACME_Goods_Receipt_GR-5521.csv",
    content: `GR,PO,Item,QtyReceived,Date,Warehouse
GR-5521,PO-5521,Raw steel coil,10,2026-10-12,WH-A
GR-5521,PO-5521,Freight,1,2026-10-12,WH-A
`,
  },
  {
    id: "d-3way-acme",
    companyId: "c01",
    type: "JOURNAL_ENTRY",
    title: "Acme — Three-Way Match Worksheet",
    period: "2026-10",
    description: "P2P — PO vs GR vs Invoice match",
    fileName: "ACME_Three_Way_Match_PO-5521.csv",
    content: `Control,PO_Amount,GR_Amount,Invoice_Amount,Match
Steel coil,18000,18000,18000,YES
Freight,400,400,400,YES
TOTAL,18400,18400,18400,PASS
`,
  },
  {
    id: "d-so-orbit",
    companyId: "c04",
    type: "INVOICE",
    title: "Orbit — Sales Order SO-7781 (O2C)",
    period: "2026-09",
    description: "O2C — sales order prior to invoice",
    fileName: "ORBIT_Sales_Order_SO-7781.txt",
    content: `SALES ORDER SO-7781
Customer: Northwind Analytics
Product: Enterprise SaaS Annual
Amount: 24000 USD
Ship/Activate: 2026-09-01
Revenue recognition: over time (12 months)
`,
  },
  {
    id: "d-revrec-orbit",
    companyId: "c04",
    type: "JOURNAL_ENTRY",
    title: "Orbit — Revenue Recognition Schedule",
    period: "2026-09",
    description: "O2C / reporting — deferred to recognized revenue",
    fileName: "ORBIT_Revenue_Recognition_2026-09.csv",
    content: `Contract,Total,DeferredBeg,RecognizedMTD,DeferredEnd
SO-7781,24000,22000,2000,20000
SO-7700,12000,6000,1000,5000
TOTAL,36000,28000,3000,25000
`,
  },
  {
    id: "d-budget-acme",
    companyId: "c01",
    type: "INCOME_STATEMENT",
    title: "Acme — Budget vs Actual Oct 2026",
    period: "2026-10",
    description: "Management reporting — variance analysis sample",
    fileName: "ACME_Budget_vs_Actual_2026-10.csv",
    content: `Line,Budget,Actual,Variance,VarPct
Revenue,400000,405000,5000,1.3%
COGS,185000,180000,5000,2.7%
OpEx,140000,148000,-8000,-5.7%
Net Income,75000,77000,2000,2.7%
`,
  },
  {
    id: "d-notes-acme",
    companyId: "c01",
    type: "BALANCE_SHEET",
    title: "Acme — Sample Financial Statement Notes",
    period: "2026",
    description: "Reporting — outline of notes disclosures",
    fileName: "ACME_FS_Notes_Outline_2026.txt",
    content: `NOTES TO FINANCIAL STATEMENTS (SAMPLE OUTLINE)
1. Nature of operations
2. Summary of significant accounting policies
3. Cash and cash equivalents
4. Accounts receivable and allowance
5. Inventory
6. Property and equipment
7. Debt
8. Leases (ASC 842)
9. Revenue recognition
10. Commitments and contingencies
11. Subsequent events
`,
  },
  {
    id: "d-eng-letter",
    companyId: "c01",
    type: "CONFIRMATION",
    title: "Demo CPA — Engagement Letter Template",
    period: "2026",
    description: "Audit acceptance — engagement letter sample",
    fileName: "AUDIT_Engagement_Letter_Template.txt",
    content: `ENGAGEMENT LETTER (SAMPLE — NOT LEGAL ADVICE)
Client: Acme Manufacturing Co
Auditor: Demo CPA Firm LLP
Period: Year ending December 31, 2026
Services: Financial statement audit under AICPA standards
Responsibilities of management and auditor as standard...
Independence: confirmed subject to annual update
Fees: fixed fee arrangement (demo)
`,
  },
  {
    id: "d-materiality",
    companyId: "c01",
    type: "WORKPAPER_CASH",
    title: "Demo CPA — Materiality Worksheet",
    period: "2026",
    description: "Audit planning — materiality and performance materiality",
    fileName: "AUDIT_Materiality_Worksheet_2026.csv",
    content: `Metric,Amount,BenchmarkPct,Materiality
Revenue,405000,1.0%,4050
Total assets,437000,1.0%,4370
Selected overall materiality,, ,4000
Performance materiality (75%),,,3000
De minimis (5%),,,200
`,
  },
  {
    id: "d-risk-matrix",
    companyId: "c01",
    type: "PBC_LIST",
    title: "Demo CPA — Risk Assessment Matrix",
    period: "2026",
    description: "Audit risk — assertion-level risk sample",
    fileName: "AUDIT_Risk_Assessment_Matrix_2026.csv",
    content: `Cycle,Assertion,InherentRisk,ControlRisk,RMM,Response
Revenue,Occurrence,HIGH,MEDIUM,HIGH,Substantive + controls
Revenue,Cutoff,HIGH,MEDIUM,HIGH,Cutoff testing
AR,Existence,MEDIUM,MEDIUM,MEDIUM,Confirmations
Inventory,Valuation,HIGH,MEDIUM,HIGH,NRV testing
Cash,Existence,LOW,LOW,LOW,Bank confirm
`,
  },
  {
    id: "d-icq",
    companyId: "c01",
    type: "PBC_LIST",
    title: "Demo CPA — Internal Control Questionnaire",
    period: "2026",
    description: "Controls testing — ICQ extract",
    fileName: "AUDIT_ICQ_Revenue_2026.csv",
    content: `Question,YesNo,Evidence
Sales orders approved before ship?,Yes,SO system flag
Invoices matched to shipping docs?,Yes,3-way in ERP
Credit memos require dual approval?,No,Finding F-01
Access to price list restricted?,Yes,ITGC review
`,
  },
  {
    id: "d-walkthrough",
    companyId: "c01",
    type: "GL_DETAIL",
    title: "Demo CPA — Revenue Walkthrough Memo",
    period: "2026",
    description: "Risk assessment — process walkthrough narrative",
    fileName: "AUDIT_Walkthrough_Revenue_2026.txt",
    content: `WALKTHROUGH — ORDER TO CASH (SAMPLE)
1. Customer order entered in CRM by sales.
2. Credit check automated; exceptions to controller.
3. Warehouse picks and ships; bill of lading generated.
4. Billing runs nightly; invoice to AR subledger.
5. Cash receipts applied by AR clerk; unapplied to suspense.
Key IT systems: CRM, WMS, ERP.
`,
  },
  {
    id: "d-sample-sheet",
    companyId: "c01",
    type: "WORKPAPER_CASH",
    title: "Demo CPA — Revenue Sampling Worksheet",
    period: "2026",
    description: "Sampling — MUS / random sample log",
    fileName: "AUDIT_Sampling_Revenue_2026.csv",
    content: `SampleID,Invoice,Amount,SelectedBy,Result,Exception
S01,INV-9001,12500,MUS,OK,
S02,INV-9018,8200,MUS,OK,
S03,INV-9044,1500,Random,OK,
S04,INV-9052,22100,MUS,Exception,Cutoff — ship next period
`,
  },
  {
    id: "d-findings-reg",
    companyId: "c01",
    type: "PBC_LIST",
    title: "Demo CPA — Findings Register",
    period: "2026",
    description: "Audit findings — tracking log",
    fileName: "AUDIT_Findings_Register_2026.csv",
    content: `ID,Area,Description,Impact,Severity,ManagementResponse,Status
F-01,Revenue,Credit memos single approval,Control gap,MEDIUM,Will implement dual auth,OPEN
F-02,AP,Three-way match bypass code used,Potential misstatement,HIGH,Removed access,CLOSED
`,
  },
  {
    id: "d-mgmt-letter",
    companyId: "c01",
    type: "CONFIRMATION",
    title: "Demo CPA — Management Letter Draft",
    period: "2026",
    description: "Completion — management letter points",
    fileName: "AUDIT_Management_Letter_Draft_2026.txt",
    content: `MANAGEMENT LETTER (SAMPLE DRAFT)
We noted opportunities to strengthen controls over credit memo approval and user access reviews.
These matters do not modify our audit opinion on the financial statements.
`,
  },
  {
    id: "d-rep-letter",
    companyId: "c01",
    type: "CONFIRMATION",
    title: "Demo CPA — Management Representation Letter",
    period: "2026",
    description: "Completion — rep letter outline",
    fileName: "AUDIT_Rep_Letter_Template_2026.txt",
    content: `MANAGEMENT REPRESENTATION LETTER (SAMPLE)
We confirm financial statements are fairly presented...
All transactions recorded... subsequent events disclosed...
No unrecorded fraud or noncompliance known...
`,
  },
  {
    id: "d-opinion",
    companyId: "c01",
    type: "CONFIRMATION",
    title: "Demo CPA — Audit Opinion Template (Unmodified)",
    period: "2026",
    description: "Audit reporting — unmodified opinion shell",
    fileName: "AUDIT_Opinion_Unmodified_Template_2026.txt",
    content: `INDEPENDENT AUDITOR'S REPORT (SAMPLE TEMPLATE)
Opinion: Financial statements present fairly, in all material respects...
Basis for opinion: conducted in accordance with GAAS...
Responsibilities of management and auditors...
`,
  },
  {
    id: "d-inv-count",
    companyId: "c02",
    type: "JOURNAL_ENTRY",
    title: "Nexus — Inventory Count Sheet",
    period: "2026-01",
    description: "Inventory / substantive — count observation sheet",
    fileName: "NEXUS_Inventory_Count_Sheet_2026-01.csv",
    content: `SKU,Description,BookQty,CountQty,Variance,Status
SKU-100,Widget A,500,498,-2,OK
SKU-200,Widget B,1200,1200,0,OK
SKU-300,Widget C,80,95,15,Investigate
`,
  },
  {
    id: "d-cash-forecast",
    companyId: "c07",
    type: "BANK_RECON",
    title: "Atlas — 13-Week Cash Forecast",
    period: "2026-Q4",
    description: "Treasury — cash forecast sample",
    fileName: "ATLAS_Cash_Forecast_13Week.csv",
    content: `Week,Inflows,Outflows,Net,EndingCash
W1,120000,95000,25000,125000
W2,80000,110000,-30000,95000
W3,150000,90000,60000,155000
`,
  },
  {
    id: "d-debt-sched",
    companyId: "c10",
    type: "FIXED_ASSETS",
    title: "Summit — Debt Schedule",
    period: "2026-09",
    description: "Treasury — debt rollforward",
    fileName: "SUMMIT_Debt_Schedule_2026-09.csv",
    content: `Facility,Beg,Draws,Payments,End,Rate,Maturity
Term Loan A,5000000,0,200000,4800000,6.5%,2030-06-30
Revolver,1500000,300000,100000,1700000,SOFR+2%,2028-12-31
`,
  },
];
