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
