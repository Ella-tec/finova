# Finova

Complete Accounting ERP + Audit Management + Client Portal + AI Copilot

## Quick start (Windows PowerShell)

```powershell
cd finova
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

**Demo logins**

| Email | Password | Role |
|-------|----------|------|
| demo@finova.ai | Demo123! | Staff Accountant |
| controller@finova.ai | Demo123! | Controller |
| partner@finova.ai | Demo123! | Partner |
| admin@finova.ai | Demo123! | Admin |
| client@acme.com | Demo123! | Client (use /portal) |

## Main modules

- Dashboard & tasks
- Documents + OCR / AI analysis
- Sample Library (40+ free audit & accounting samples)
- File Sanitizer (pre-AI security gate)
- Bank Reconciliation (AI matching)
- Financial statements from trial balance
- Month-end close checklist
- Multi-entity consolidation (NCI)
- Entities
- Market Pulse (FX / benchmarks)
- Audit / PBC / Workpapers
- Client portal
- AI Assistant
- Users & invites
- Learning Center (courses + progress)
- Administration hub

## Stack

Next.js 15 · TypeScript · Tailwind · Prisma · SQLite (demo) · NextAuth (Credentials + optional Entra ID)

## Brand

**Finova** — professional accounting & audit platform with ISACA-inspired color system.

## Accounting workspace foundation

The `/dashboard/operations` workspace groups the next accounting workflows into four areas:

- **Accounting:** company setup, chart of accounts, journal entries, and general ledger records.
- **Sales:** customers, invoices, and receipts.
- **Purchasing:** vendors, bills, and expenses.
- **Banking & Payroll:** bank accounts, statement records, employees, and payroll runs.

New entries are stored in the Prisma `WorkspaceRecord` table as **DRAFT** records and create an `AuditLog` event. This is an initial record-capture foundation; it does not yet post double-entry journals, calculate payroll/tax, process OCR, or replace the existing bank reconciliation and financial statement workflows.

After pulling this branch locally, run:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run build
npm run dev
```

Open `http://localhost:3000/dashboard/operations` after signing in.
