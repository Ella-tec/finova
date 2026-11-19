# Finova — Wireframe & Path Guide

For presenters and users. Interactive version: `/guide` (public) and `/dashboard/guide` (signed in).

---

## 1. Where do files come from?

```
Client camera / email / drive
        ↓
Client Portal upload  ──→  Documents inbox (firm)
        ↓
File Sanitizer (clean)
        ↓
Books · PBC · AI · Archive
```

| Source | How |
|--------|-----|
| **Client** | Portal → Documents or Requests |
| **Staff** | Dashboard → Documents → Upload |
| **Practice** | Sample Library (Acme, Nexus, …) |
| **Bank** | CSV / statement upload on Bank Rec |
| **Email** | Save file → Sanitizer → Documents |

---

## 2. Recording path (transactions from scratch)

```
Company setup
  → Chart of Accounts
  → Source document (invoice, bank, receipt)
  → Journal entry
  → General Ledger post
  → AR / AP / Bank match
  → Trial Balance
```

**Screens:** Accounting hub → AR Aging → Bank Rec → Documents

---

## 3. Generating financial statements

```
Trial Balance
  → Journal Entries (adjustments)
  → Income Statement
  → Balance Sheet
  → Cash Flow
```

On **each** step: **Upload · Review · Download**

**Screen:** Financial Reporting / Statements

---

## 4. Month-end close path

```
Checklist tasks
  → Accruals / prepaids / reclasses
  → Attach evidence
  → Reviewer approval
  → Period lock
```

**Screen:** Month-End Close

---

## 5. Audit path

```
Planning
  → PBC request to client
  → Client uploads in Portal
  → Workpapers / testing
  → Findings
  → Report
```

**Screens:** Audit/PBC · Workpapers · Portal Requests

---

## 6. Page map (wireframe boxes)

| Page | URL | Purpose |
|------|-----|---------|
| Sign in | `/` | Access |
| Public guide | `/guide` | Paths before login |
| Full guide | `/dashboard/guide` | Detailed steps + links |
| Documents | `/dashboard/documents` | Upload view download |
| Sanitizer | `/dashboard/security` | Clean files |
| Samples | `/dashboard/samples` | Demo packs |
| Accounting | `/dashboard/operations` | Books hub |
| AR | `/dashboard/ar` | Customers invoices aging |
| Bank Rec | `/dashboard/bank-rec` | Match lock |
| Statements | `/dashboard/reporting` | TB→CF |
| Close | `/dashboard/close` | Month end |
| Consolidation | `/dashboard/consolidation` | Group |
| PBC | `/dashboard/audit/pbc` | Evidence requests |
| Contact Center | `/dashboard/clients/contact-center` | Call email SMS |
| Portal | `/portal` | Client home |

---

## 7. Demo story (slides order)

1. Sign in page + App Guide (top left)  
2. Where files come from  
3. Recording path  
4. Statement generation TB→CF  
5. Close  
6. PBC + client portal  
7. Contact Center  
