# Finova — URL map

| URL | File |
|-----|------|
| `/` | `src/app/page.tsx` |
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/register` | `src/app/(auth)/register/page.tsx` |
| `/about` `/faq` `/learning` | public pages |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` |
| `/dashboard/documents` | `.../dashboard/documents/page.tsx` |
| `/dashboard/samples` | `.../dashboard/samples/page.tsx` |
| `/dashboard/security` | File Sanitizer |
| `/dashboard/bank-rec` | Bank reconciliation |
| `/dashboard/reporting/statements` | Statements |
| `/dashboard/close` | Month-end close |
| `/dashboard/consolidation` | Consolidation |
| `/dashboard/entities` | Entities |
| `/dashboard/market` | Market pulse |
| `/dashboard/audit` `/pbc` `/workpapers` | Audit |
| `/dashboard/admin/users` | Users |
| `/portal` | Client portal home |
| `/portal/documents` | Client documents |
| `/portal/requests` | Client PBC requests |

`(dashboard)` and `(portal)` are **route groups** — they do not appear in the URL.
All firm pages live under the real `dashboard/` folder.
