
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

  // ═══════════════════════════════════════════════════════════════
  // BNSF Railway / KDOT — Real-style Construction Invoice Pack
  // Project: 11X-3082-01 / CMS 006203006 — Flashing Light Signals
  // Location: Coal Valley Rd, Scammon KS (Cherokee County)
  // Use under: Sample Library → GRANITE → Invoice / AP / Audit
  // ═══════════════════════════════════════════════════════════════

  {
    id: "d-bnsf-invoice-summary",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF — Invoice Register (Project 11X-3082-01)",
    period: "2020-2022",
    description: "Full invoice register for KDOT Flashing Light Signals contract. Open each invoice, then open linked Pay Estimate and Refund docs.",
    fileName: "BNSF_Invoice_Register_11X-3082-01.csv",
    content: `Invoice#,Date,Service From,Service To,Amount,Type,Status,Notes
90204760,2020-05-13,2020-03-01,2020-04-30,52740.26,Progress,Paid,Partial #1 — Labor + Material + Signal
90203270,2020-04-13,2020-03-01,2020-03-31,2937.35,Progress,Paid,Partial #1 (early)
90204814,2020-05-14,2020-04-01,2020-04-30,56232.90,Progress,Paid,Partial #2
90206334,2020-06-16,2020-05-01,2020-05-31,41117.36,Progress,Paid,Partial #3 — materials heavy
90207672,2020-07-20,2020-06-01,2020-06-30,3840.54,Progress,Paid,Partial #4
90209000,2020-08-20,2020-07-01,2020-07-31,55051.83,Progress,Paid,Partial #5
90210242,2020-09-18,2020-08-01,2020-08-31,59789.90,Progress,Paid,Partial #6
90211739,2020-10-16,2020-09-01,2020-09-30,8163.74,Progress,Paid,Partial #7
90214649,2020-12-14,2020-10-01,2020-11-30,2111.00,Progress,Paid,Partial #8 — gates/flashers
REF90216092,2021-01-21,,,15946.03,Refund,Issued,Duplicate payment refund to KDOT
REF90233338,2022-02-17,,,39342.00,Refund,Issued,Additional refund — see check 0016167576
`,
  },

  {
    id: "d-bnsf-inv-90204760",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Invoice 90204760 — $52,740.26",
    period: "2020-05",
    description: "Progress invoice Partial #1. Customer: KDOT. Contract BF10015969. Project 11X-3082-01 Coal Valley Rd flashing signals.",
    fileName: "BNSF_Invoice_90204760.txt",
    content: `BNSF RAILWAY — INVOICE
════════════════════════════════════════════════════════
Invoice Number     : 90204760
Customer Number    : 1003795
Invoice Date       : 05/13/2020
Amount             : $52,740.26
Billable %         : 100.00%
Invoice Total      : $52,740.26

Bill To:
  Kansas Department of Transportation
  Freight and Rail Unit
  700 SW Harrison Street, Topeka KS 66603

Contract No.       : BF10015969
Project            : 11X-3082-01
WBS                : 7-0180-20
Location           : Coal Valley Rd - Scammon, KS
                     Install Constant Warning/Flashers/Gates
                     Heartland Div; Kansas Subdiv; LS 1040
                     MP 136.43-138.43, DOT# 669897L
Service Period     : 03/01/2020 – 04/30/2020
Months Accounts    : 05/2020
Partial            : #1
100% KSDOT

COST BREAKDOWN (from audit workpaper)
  Labor                    $  1,897.78
  Material                 $ 40,082.04
  Labor Additive (Signal)  $  4,134.44
  Other / Vouchers         $  6,626.00
  ────────────────────────────────────
  Total Costs              $ 52,740.26

Payment terms: Due within 30 days of invoice date.
Make checks payable to: BNSF Railway Company
3115 Solutions Center, Chicago IL 60677-3001

TIN: 41-6034000
Wire/ACH: Northern Trust-Chicago IL | ABA 071000152 | Acct 31099171
`,
  },

  {
    id: "d-bnsf-inv-90204814",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Invoice 90204814 — $56,232.90",
    period: "2020-05",
    description: "Progress invoice Partial #2. Same KDOT project — April 2020 work.",
    fileName: "BNSF_Invoice_90204814.txt",
    content: `BNSF RAILWAY — INVOICE
════════════════════════════════════════════════════════
Invoice Number     : 90204814
Customer Number    : 1003795
Invoice Date       : 05/14/2020
Amount             : $56,232.90
Billable %         : 100.00%
Invoice Total      : $56,232.90

Bill To: Kansas Department of Transportation (same as 90204760)
Contract / Project : BF10015969 / 11X-3082-01
Service Period     : 04/01/2020 – 04/30/2020
Partial            : #2

COST SUMMARY (workpaper C-1)
  Labor                    $  9,748.32
  Material                 $ 40,453.83
  Other Costs              $  6,030.75
  ────────────────────────────────────
  Total                    $ 56,232.90
`,
  },

  {
    id: "d-bnsf-inv-90209000",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Invoice 90209000 — $55,051.83",
    period: "2020-08",
    description: "Progress invoice Partial #5 — July 2020. High signal labor additive.",
    fileName: "BNSF_Invoice_90209000.txt",
    content: `BNSF RAILWAY — INVOICE
════════════════════════════════════════════════════════
Invoice Number     : 90209000
Date               : 08/20/2020
Amount             : $55,051.83
Service Period     : 07/01/2020 – 07/31/2020
Partial            : #5
Project            : 11X-3082-01 | Coal Valley Rd flashers/gates

COST SUMMARY
  Labor                    $  5,152.17
  Labor Additive (Signal)  $ 11,265.74
  Other Costs              $ 38,633.86
  ────────────────────────────────────
  Total                    $ 55,051.83
`,
  },

  {
    id: "d-bnsf-inv-90214649",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Invoice 90214649 — $2,111.00",
    period: "2020-12",
    description: "Small progress invoice Partial #8 (Oct–Nov 2020).",
    fileName: "BNSF_Invoice_90214649.txt",
    content: `BNSF RAILWAY — INVOICE
════════════════════════════════════════════════════════
Invoice Number     : 90214649
Date               : 12/14/2020
Amount             : $2,111.00
Service Period     : 10/01/2020 – 11/30/2020
Partial            : #8
Project            : 11X-3082-01

Total Costs        : $2,111.00
Billable Pct       : 100.00%
Invoice Total      : $2,111.00
`,
  },

  {
    id: "d-bnsf-refund-90216092",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Refund REF90216092 — ($15,946.03)",
    period: "2021-01",
    description: "Refund due to duplicate payment — WBS 7-0180-20. Credit back to KDOT.",
    fileName: "BNSF_Refund_REF90216092.txt",
    content: `BNSF RAILWAY — REFUND / CREDIT MEMO
════════════════════════════════════════════════════════
Invoice Number     : REF90216092
Invoice Date       : 01/21/2021
Invoice Amount     : ($15,946.03)

REFUND DUE TO DUPLICATE PAYMENT – WBS # 7-0180-20

Project            : COAL VALLEY RD - SCAMMON, KS
                     Install Constant Warning/Flashers/Gates
                     Heartland Div; Kansas Subdiv; LS 1040
                     MP 136.43-138.43, DOT# 669897L
Agreement          : 006203006
Project #          : 11X-3082-01

Refund to KDOT     : $15,946.03

Issue check to:
  Kansas Dept of Transportation
  Eisenhower State Office Bldg
  700 South West Harrison Street
  Topeka, KS 66603

*** Please mail the check to the address above ***
`,
  },

  {
    id: "d-bnsf-pay-est-10",
    companyId: "c05",
    type: "AP_AGING",
    title: "KDOT Payment Estimate #10 — Contract 006203006",
    period: "2022-01",
    description: "KDOT Payment Estimate for Contractor (BNSF). 95% complete by dollar. Remaining $19,498.13 retainage.",
    fileName: "KDOT_Pay_Estimate_10_006203006.txt",
    content: `KANSAS DEPARTMENT OF TRANSPORTATION
Payment Estimate for Contractor
════════════════════════════════════════════════════════
Contract             : 006203006 — FLASHING LIGHT SIGNALS
Prime Contractor     : BNSF RAILWAY COMPANY
Estimate Number      : 10
Estimate Period End  : 1/31/2022
Previous Period End  : 5/1/2021
Estimate Status      : Pending Approval
Estimate Type        : 1 Non C Progress - Progress
County / District    : CHEROKEE / District 4
Location             : BNSF & Coal Valley Road 1 mile south of Cherokee
Federal Project No.  : RRP-X308(201)
IRS Number           : 41-6034000

Awarded Amount       : $240,037.00
Current Contract Amt : $389,962.64
Remaining Value      : $19,498.13
Percent Complete $   : 95.00%
Percent Complete Time: 33.18%

Award Date / Work Began: 1/27/2020
`,
  },

  {
    id: "d-bnsf-pay-est-12",
    companyId: "c05",
    type: "AP_AGING",
    title: "KDOT Semi-Final Pay Est #12 — Approved",
    period: "2025-03",
    description: "Semi-final payment estimate. Total pay $315,176.48 after retainage. Status: Approved.",
    fileName: "KDOT_Pay_Estimate_12_SemiFinal.txt",
    content: `Contract: 006203006 - FLASHING LIGHT SIGNALS
Payment Est Number: 0012
Period End Date   : 03/17/2025
Status            : Approved
Type              : 2 Non C Semi-Final - Semi-Final

                         Previous      This Est      Total
Posted Item Pay        334,674.61       0.00     334,674.61
Gross Item Adjustments       0.00       0.00           0.00
Gross Item Pay         334,674.61       0.00     334,674.61
Retainage (Cash)       -19,498.13       0.00     -19,498.13
Total Pay Amount       315,176.48       0.00     315,176.48
`,
  },

  {
    id: "d-bnsf-refund-check",
    companyId: "c05",
    type: "INVOICE",
    title: "BNSF Refund Check #0016167576 — $55,288.03",
    period: "2024-12",
    description: "State of Kansas refund check covering two credit memos (REF90233338 + REF90216092).",
    fileName: "BNSF_Refund_Check_0016167576.txt",
    content: `STATE OF KANSAS — REFUND CHECK DETAIL
════════════════════════════════════════════════════════
Check Number       : 0016167576
Date               : 12/12/2024
Payee              : BNSF Railway Company
                     P.O. BOX 961284
                     FORT WORTH, TX 76161-0284
Bank               : PNC Bank, N.A.

Invoice / Ref          Amount
REF90233338          39,342.00
REF90216092          15,946.03
021                       0.00
────────────────────────────────
TOTAL                55,288.03

Pay to the order of: STATE OF KANSAS
                     DEPT OF TRANSPORTATION
                     REFUND ONLY
                     C/O ATTN LINDA GUILLEN
                     3200 E 45TH ST N
                     WICHITA KS 67220
`,
  },

  {
    id: "d-bnsf-cost-summary",
    companyId: "c05",
    type: "GL_DETAIL",
    title: "BNSF Audit Cost Summary (Workpaper C-1)",
    period: "2020-2022",
    description: "Auditor cost summary from workpaper. Claimed $226,696.85. Contract max $315,176.48. Under by $88,479.63.",
    fileName: "BNSF_Audit_Cost_Summary_C1.csv",
    content: `Ref,Invoice No,Service From,Invoice Date,Labor,Material,Labor Additive Signal,Other Costs,Refund,TOTAL
F1,90204760,03/01/2020-04/30/2020,2020-05-13,1897.78,40082.04,4134.44,6626,,52740.26
F2,90203270,03/01/2020-03/31/2020,2020-04-13,315.76,674.59,0,1947,,2937.35
F3,90204814,04/01/2020-04/30/2020,2020-05-14,9748.32,40453.83,,6030.75,,56232.90
F4,90206334,05/01/2020-05/31/2020,2020-06-16,193.25,36429.49,1554.13,2940.49,,41117.36
F5,90207672,06/01/2020-06/30/2020,2020-07-20,1583.99,,,2256.55,,3840.54
F6,90209000,07/01/2020-07/31/2020,2020-08-20,5152.17,,11265.74,38633.86,,55051.77
F7,90210242,08/01/2020-08/31/2020,2020-09-18,17927.19,,38776.89,3085.88,,59789.96
F8,90211739,09/01/2020-09/30/2020,2020-10-16,1881.55,,3691.63,2590.56,,8163.74
F9,90214649,10/01/2020-11/30/2020,2020-12-14,,,,2111,,2111.00
,REF90216092,,, ,,,,-15946.03,-15946.03
,REF90233338,,, ,,,,-39342,-39342.00
TOTALS,,,,38700.01,117639.95,59422.83,66222.09,,226696.85

Contract Estimate (Net Fee) = 315176.48
Under (over) the Contract Estimate = 88479.63
`,
  },

  {
    id: "d-bnsf-audit-program",
    companyId: "c05",
    type: "PBC_LIST",
    title: "BNSF Audit Program (Workpaper A-1)",
    period: "2025-03",
    description: "Consultant / utility contract audit program checklist. Auditor initials EE. Desk audit 2025-03-28.",
    fileName: "BNSF_Audit_Program_A1.txt",
    content: `BNSF Railway Company — AUDIT PROGRAM (Consultants)
Project #: 11 X-3082-01 | CMS #: 006203006
════════════════════════════════════════════════════════
1. Does an effective agreement exist between State and Consultant?     Yes
2. Have KDOT files been reviewed for correspondence / scope changes?   Yes
3. Are reimbursement claims in accordance with the agreement?          Yes
4. Have extensions been verified?                                      Yes
5. Are claimed costs within authorization dates?                       Yes
6. The audit was:  Desk ☑   Site ☐
7. Are costs within appropriate State and Federal Regulations?         Yes
8. Has the Consultant's accounting system been reviewed?               Yes
9. Has the Consultant's overhead rate been accepted?                   N/A (utility)
10. Have correct adjustments been made for overhead rates?             N/A
11. If a subconsultant was used, did they have written approval?       N/A
12. Does the Consultant comply with 23 U.S.C. 313 (Buy America)?       Yes
13. Has the Consultant provided Buy America documentation?             Yes

AUDITOR COMMENTS: Contract Audit — 2025-03-28 — Initials EE
`,
  },

  {
    id: "d-bnsf-tickmarks",
    companyId: "c05",
    type: "WORKOBER_CASH",
    title: "BNSF Legend of Tick Marks (Workpaper B-1)",
    period: "2025",
    description: "Standard audit tick-mark legend used on the BNSF workpapers.",
    fileName: "BNSF_Tick_Marks_Legend.txt",
    content: `LEGEND OF TICK MARKS — BNSF Railway Company
Project 11 X-3082-01 / CMS 006203006
════════════════════════════════════════════════════════
√   EXTENSIONS AND FOOTINGS VERIFIED
T   EMPLOYEE TIME REPORTS
C   PER COMPUTER REPORT
P   PAY RATE PER PAYROLL LEDGER
I   PER VENDOR INVOICES
E   PERSONAL EXPENSE REPORT
`,
  },
];
