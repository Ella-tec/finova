# FINOVA — Enterprise Product Requirements Document

**Version:** 1.0  
**Status:** Proposed target-state specification  
**Audience:** Product, engineering, accounting operations, audit, security, implementation, and QA  
**Planning horizon:** 90-day foundation and staged delivery

---

## 1. Executive Vision

Finova is an AI-enabled Accounting, Audit, Close Management, Compliance, and CPA Firm Operating System. It connects financial operations, firm delivery, client collaboration, evidence management, approvals, and decision support in one controlled workspace.

Finova is not a collection of disconnected dashboards. A transaction should be traceable from source evidence through preparation, review, approval, posting, reconciliation, reporting, and audit. The same authoritative record should be reused by each workflow rather than re-keyed into separate modules.

### Product outcomes

1. One controlled financial record: company, entity, account, period, transaction, document, and engagement records use stable identifiers and consistent ownership.
2. End-to-end work management: work moves through explicit states, assigned owners, due dates, dependencies, approval gates, and escalation rules.
3. Evidence-first operations: documents, supporting schedules, comments, and decisions remain linked to the record they support.
4. Reliable accounting: journal entries balance, posting is controlled, closed periods are protected, and statements reconcile to the ledger.
5. Audit-ready history: changes, access-sensitive actions, approvals, exports, AI suggestions, and status transitions are attributable and time-stamped.
6. Useful AI with human control: AI can classify, extract, match, summarize, explain, and recommend; authorized people retain responsibility for approval and posting.
7. Firm and client separation: each firm, entity, engagement, and client sees only the information permitted by its scope and role.
8. Actionable reporting: leaders can drill from KPIs to the underlying ledger, close task, document, workpaper, or client request.
9. Accessible, coherent experience: responsive navigation, searchable modules, clear empty/error/loading states, and consistent enterprise design.
10. Incremental delivery: build reliable foundations first, then accounting, reporting, banking, audit, AI, and broader firm operations.

### Executive acceptance criteria

- A financial balance can be traced to contributing journal lines and original evidence.
- A posted journal cannot be silently edited or deleted; corrections use a controlled reversal or adjusting entry.
- A period cannot be closed while required tasks, reconciliations, or approvals remain outstanding.
- A reviewer can see who prepared, reviewed, approved, and posted an item, with timestamps and comments.
- AI-generated content is labelled as AI-assisted, includes source references and confidence where applicable, and cannot independently approve or post.
- Cross-client access is rejected by the server, not merely hidden in the interface.
- Dashboard values are calculated from authorized source records, carry an as-of date, and support drill-down.

---

## 2. Target Users, Roles, and Permissions

Finova supports business owners, accounting teams, controllers, CFOs, CPA firms, audit firms, tax teams, and client personnel. Permissions are based on both role and data scope: firm, client, entity, engagement, and period. UI visibility is not a security boundary.

| Persona | Main goals | Typical authority |
|---|---|---|
| Business Owner | Understand performance, cash, obligations, and approvals | View company reports; approve designated business items |
| Staff Accountant | Record transactions, prepare reconciliations, attach evidence | Create and edit permitted drafts |
| Senior Accountant | Review reconciliations, journals, and close tasks | Review and return work; limited approvals |
| Controller | Own books, close, accounting policies, and statements | Approve journals and close activities within scope |
| CFO | Review performance, cash, forecasts, and material approvals | Executive read access and configured approvals |
| Audit Staff | Perform procedures, collect evidence, document testing | Access assigned engagements and workpapers |
| Audit Manager | Supervise engagement progress, findings, and workpapers | Review and sign off assigned audit work |
| Tax Team | Organize tax source documents and deliverables | Access assigned tax clients and work |
| CPA Partner / Firm Admin | Manage portfolio, staffing, client service, and risk | Firm-level administration subject to separation of duties |
| Client User | Respond to requests, upload records, and view shared deliverables | Assigned client portal scope only |
| System Administrator | Manage configuration, security, users, and integrations | Technical administration; no automatic financial approval rights |

### Shared permission requirements

1. Define granular permissions such as journal.create, journal.review, journal.approve, journal.post, period.close, document.download, workpaper.signoff, and user.manage.
2. Every request is constrained by firm and client membership; entity and engagement access may narrow the result further.
3. Configurable separation-of-duties rules prevent preparers from approving or posting their own material transactions where required.
4. Temporary delegation has a start/end date, scope, authorizer, and audit event.
5. New users receive a restricted default role; elevated permissions are explicitly granted.
6. Client portal users cannot enumerate or retrieve another client's files, IDs, messages, or workpapers.
7. Invitations, role changes, exports, period unlocks, and integration changes require elevated permission and are logged.
8. Administrators can review users, roles, assignments, last sign-in, dormant accounts, and excessive access.
9. Session expiry, sign-out, MFA/SSO policy, and suspicious activity handling are centrally configured.
10. AI retrieval uses the same authorization filters as the user and cannot reveal out-of-scope records.

**Acceptance:** automated authorization tests cover allowed and denied reads/writes for every role and scope combination, including direct API requests with guessed IDs.

---

## 3. Navigation Architecture

The navigation reflects users' work rather than exposing a long, ungrouped list. The global shell includes Finova identity, company/entity context, accounting period, search, notifications, AI entry point, help, and profile.

### Target navigation

- **Home:** Executive dashboard and assigned work.
- **Accounting:** Company Setup, Chart of Accounts, Journal Entries, General Ledger, Trial Balance, Financial Statements.
- **Revenue:** Customers, invoices, receipts, collections, and AR aging.
- **Expenses:** Vendors, bills, expense coding, payments, and 1099 readiness.
- **Banking:** Bank accounts, statement imports, matching, reconciliation, and exceptions.
- **Close:** Close calendar, tasks, reconciliations, evidence, review, and period lock.
- **Audit:** Engagements, risks, PBC requests, workpapers, findings, and reports.
- **Documents:** Uploads, folders, versions, metadata, review, retention, and sanitizer status.
- **Clients:** Client directory, client workspace, portal activity, service status, and engagement assignments.
- **AI:** AI Accountant, AI Controller, AI Auditor, and AI CFO experiences.
- **Administration:** Firm setup, entities, users, roles, integrations, policies, notifications, and audit logs.

### Navigation requirements

1. Each menu item points to one canonical route; redirects preserve older valid URLs during migration.
2. Grouped navigation is collapsible and shows a clear active state.
3. Switching modules preserves selected firm, client, entity, and accounting period when applicable.
4. Global search is permission-aware and returns categorized links to clients, documents, journals, accounts, invoices, workpapers, and tasks.
5. Users can return to recent or pinned records without bypassing authorization.
6. Breadcrumbs show route hierarchy and contextual record.
7. Mobile navigation opens and closes accessibly and does not permanently obscure required actions.
8. Deep links recheck authorization on the server when opened.
9. Notifications link to the exact authorized work item and show meaningful unread counts.
10. Route errors and dead links are monitored without collecting unnecessary sensitive content.

**Acceptance:** every visible navigation item resolves to a working page or a deliberate “not yet available” page with scope and status; no unexplained 404s.

---

## 4. Executive Dashboard

The dashboard is a decision and action center, not a static collection of decorative figures.

1. Show revenue, gross margin, operating expenses, net income, cash, AR, AP, and debt with period comparisons and drill-down.
2. Show cash by bank account/entity, recent movement, upcoming receipts/payments, and reconciled versus unreconciled balances.
3. Show profitability trends with entity, department, customer, and period filters where data supports them.
4. Show close completion, late tasks, blocked dependencies, outstanding reviews, unreconciled accounts, and days to target close.
5. Show audit PBC requests, overdue evidence, in-review workpapers, high-risk findings, and engagement milestones.
6. Show AI insights for unusual movements, duplicate candidates, stale tasks, and forecast variances, each linked to its supporting records.
7. Show pending approvals, exceptions, overdue items, failed imports, and policy breaches by priority.
8. Support date range, fiscal period, company, entity, and currency filters; display the selected scope visibly.
9. Display data as-of time, source status, calculation basis, and whether values are provisional.
10. Personalize assigned work and approvals using the signed-in user's permissions and workload.

**Acceptance:** selecting a KPI reaches a filtered detail view whose total reconciles to the displayed KPI. Empty datasets show “No data yet,” never fabricated financial values.

---

## 5. Company Setup and Entity Management

1. Maintain legal name, trading name, addresses, tax identifiers, industry, reporting contacts, and document settings.
2. Configure fiscal year start, periods, adjustment periods, and supported calendars; changes after posting require controlled approval.
3. Define functional, presentation, and transaction currencies, precision, and exchange-rate source/date.
4. Configure tax jurisdictions, registrations, tax codes, filing frequency, and defaults; tax calculations remain subject to validated rules and review.
5. Select the applicable reporting basis, such as GAAP or IFRS, with effective dates; do not imply compliance without validated configuration.
6. Maintain parent/subsidiary hierarchy, ownership percentage, consolidation method, intercompany relationships, and elimination entities.
7. Configure dimensions such as departments, locations, projects, and cost centers, with active dates and allowed combinations.
8. Route sensitive changes through maker-checker approval with before/after values and reason.
9. Import, map, validate, reconcile, approve, and lock opening balances before routine posting.
10. Provide a setup checklist and explain which workflows are blocked by incomplete configuration.

**Acceptance:** journals cannot post to an inactive entity, invalid account, or closed period; company configuration changes are auditable and effective-dated.

---

## 6. Chart of Accounts

1. Maintain account code, name, type, normal balance, description, active status, and posting/control classification.
2. Provide optional industry templates for professional services, nonprofit, retail, construction, and general business.
3. Support parent/child rollups while preserving unique posting accounts and valid summary accounts.
4. Map accounts to financial statement lines, cash flow categories, tax categories, and consolidation groups.
5. Prevent duplicate codes within an entity, invalid account types, and postings to summary or inactive accounts.
6. Configure required dimensions and allowed combinations per account.
7. Require reason and configured approval for additions, deactivations, and mapping changes.
8. Support validated CSV/XLSX import with preview, mapping, row-level errors, and rollback before commit.
9. Preserve historical integrity with effective dates and mapping history; changes must not silently rewrite posted history.
10. Show account activity, opening balance, period movement, ending balance, and linked journals.

**Acceptance:** every posted journal line references a valid posting account, and trial balance totals are reproducible from those lines.

---

## 7. Journal Entries

1. Capture entity, accounting date, period, source, description, currency, reference, dimensions, and supporting attachments.
2. Each journal line identifies account, debit or credit, memo, dimensions, and optional counterparty/reference.
3. Require total debits to equal total credits before submission; rounding rules are explicit.
4. Support Draft, Submitted, In Review, Returned, Approved, Posted, Reversed, and Rejected states.
5. Route approvals by entity, amount, source, account, period, and policy; require reviewer comments on return/rejection.
6. Post atomically after checking period status and account validity; create ledger lines and record posting user/time.
7. Support recurring and reversing entries with schedules, previews, generated drafts, and controlled auto-reversal policy.
8. Retain source invoices, calculations, contracts, schedules, and external references with version history.
9. Keep posted entries immutable; corrections use linked reversing/adjusting entries and preserve the original.
10. Provide journal register, approval aging, posting batches, and exports with stable IDs and totals.

**Acceptance:** an unbalanced or unauthorized entry cannot post; concurrent attempts cannot create duplicate ledger lines; posted entries cannot be silently edited.

---

## 8. General Ledger

1. Build the authoritative transaction-level ledger from posted journal lines, with source module and source record references.
2. Drill from account balance to period, journal, line, counterparty, attachment, approval, and audit history.
3. Filter by entity, account range, date/period, journal source, dimensions, currency, and posting status.
4. Calculate opening, debit movement, credit movement, and ending balance with documented normal-balance display.
5. Show linked supporting documents and workpapers without duplicating files into unmanaged locations.
6. Allow scoped comments and review notes with resolution status and preserved prior messages.
7. Link accounts to bank, subledger, or control reconciliations and show unreconciled differences.
8. Make closed periods read-only except through formally authorized reopen.
9. Capture posting, reversal, reclassification, export, and access-sensitive events.
10. Provide account detail, general ledger, journal register, and dimension-based extracts.

**Acceptance:** a ledger balance equals the sum of posted lines for the selected scope and agrees to the trial balance.

---

## 9. Trial Balance

1. Generate the trial balance from posted ledger lines for an entity and period.
2. Show opening debit/credit, period debit/credit, ending debit/credit, and optional prior-period comparison.
3. Identify total imbalance, abnormal balances, inactive-account postings, and missing mappings.
4. Compare AR/AP control accounts to underlying open-item totals where subledgers are enabled.
5. Display unposted adjustments separately; only posted journals affect the official balance.
6. Validate imported balances, account mapping, sign conventions, duplicate rows, and source totals before acceptance.
7. Link each account to ledger details and related journals.
8. Record preparer and reviewer sign-offs with period, version, and timestamp.
9. Retain a versioned trial-balance snapshot used to prepare approved statements and audit deliverables.
10. Export unresolved validation items with owner, severity, and resolution status.

**Acceptance:** debit and credit totals reconcile to the ledger; exceptions remain visible and cannot be hidden by manual dashboard adjustments.

---

## 10. Financial Statements

1. Produce Balance Sheet, Income Statement, Cash Flow Statement, and Statement of Changes in Equity/Retained Earnings.
2. Use approved account-to-line mappings and surface unmapped accounts as blockers or explicit exceptions.
3. Support current/prior period, year-to-date, budget, and variance where source data exists.
4. Support a documented indirect-method cash flow workflow first; direct-method support requires a separately validated design.
5. Produce entity and consolidated statements with elimination and ownership effects visible.
6. Label whether a statement uses posted-only data or an explicitly marked draft-adjustment view.
7. Route statements for preparer/reviewer/approver sign-off and lock approved report versions.
8. Link material line items to trial balance, ledger, workpapers, and supporting documents.
9. Export PDF/XLSX/CSV with title, entity, period, currency, basis, version, and generation timestamp.
10. Support configurable notes and accounting policy disclosures; users approve final wording.

**Acceptance:** statement totals tie to a frozen trial-balance snapshot and the balance sheet balances; unsupported amounts are disclosed, not silently omitted.

---

## 11. Accounts Receivable

1. Maintain customer legal name, billing contacts, payment terms, currency, tax details, and active status.
2. Support invoice draft, review, approval, issuance, delivery, and void/credit-note workflow with unique numbering.
3. Capture invoice lines, description, quantity, rate, tax code, revenue account, dimensions, and service/delivery period.
4. Record cash receipts with date, method, bank reference, payer, amount, and applied/unapplied allocation.
5. Support partial payments, one payment to multiple invoices, credit memos, overpayments, and unapplied cash.
6. Track aging buckets, promise-to-pay, dispute status, owner, next action, and collection history.
7. Configure approvals for invoice thresholds, credit notes, write-offs, and customer credit changes.
8. Retain invoice PDFs, delivery evidence, remittance advice, and customer messages.
9. Provide AR aging, customer statements, unapplied receipts, DSO, and collections forecast.
10. Let AI suggest invoice extraction, duplicate detection, payment matching, collection prioritization, and explanations with source links.

**Acceptance:** customer balances equal open invoices less receipts/credits; every adjustment and write-off is approved and traceable.

---

## 12. Accounts Payable

1. Maintain vendor legal name, remit-to details, payment terms, currency, tax classification, and vendor status.
2. Extract candidate invoice fields and validate vendor, duplicate reference, dates, currency, tax, and total.
3. Assign expense/asset accounts, dimensions, tax codes, and entity; suggested coding is reviewable.
4. Route approvals by entity, department, amount, vendor, and risk; prohibit self-approval where policy requires.
5. Track bills as approved, scheduled, partially paid, paid, voided, or disputed.
6. Capture payment date, method, bank reference, batch, payee, amount, and evidence; execution requires an authorized integration.
7. Retain vendor tax classification and reportable payment categories for 1099 review; do not promise filing correctness without validated tax rules.
8. Flag likely duplicate invoices, changed bank details, unusual amounts, split invoices, and first-time vendors.
9. Provide AP aging, cash requirements, vendor spend, discounts, payment history, and 1099 review queues.
10. Let AI extract invoices, propose coding, identify variances, and explain flags; humans approve coding, bills, and payments.

**Acceptance:** a bill is not marked paid merely because AI suggested it; payment status requires a recorded payment transaction or confirmed integration event.

---

## 13. Banking and Bank Reconciliation

1. Maintain entity ownership, institution, account type, currency, masked account reference, and active dates; never display full credentials.
2. Support CSV and OFX statement intake first, with file validation, duplicate import detection, and source retention.
3. Match bank-side items against posted ledger/subledger transactions, not only draft capture records.
4. Evaluate amount, date, reference, description, counterparty, and currency; expose score and matching rationale.
5. Separate high-confidence suggestions, ambiguous candidates, unmatched bank items, and unmatched book items.
6. Support bank fees, interest, transfers, returned payments, timing differences, and corrections through appropriate workflows.
7. Require preparer completion and authorized reviewer approval; differences beyond tolerance require explicit resolution.
8. Show statement ending balance, book balance, outstanding items, adjustments, and calculated difference.
9. Preserve completed reconciliations; post-sign-off changes require reopen approval and an audit event.
10. Let AI explain suggested matches, detect unusual patterns, and draft exception notes with source links.

**Acceptance:** a reconciliation cannot be approved unless its difference is zero or an explicitly approved tolerance/exception is documented.

---

## 14. Month-End Close

1. Create a close instance for each client/entity/period from a versioned template.
2. Each task has owner, due date, dependency, priority, status, required evidence, and reviewer.
3. Support Not Started, In Progress, Blocked, Ready for Review, Returned, Complete, and Waived; waiver requires permission and rationale.
4. Block dependent tasks until prerequisites are complete or formally waived.
5. Attach reconciliations, schedules, journal references, explanations, and sign-offs to each close task.
6. Separate task completion from review; configured roles approve material tasks and final close.
7. Calculate progress from eligible tasks; blocked/waived tasks are never silently counted as complete.
8. Surface late tasks, missing evidence, out-of-balance trial balance, unreconciled control accounts, and pending journals.
9. Closing a period blocks new postings and edits; reopening requires reason, authorization, and audit history.
10. Let AI summarize blockers, propose owners, draft variance explanations, and identify unusual balances; AI cannot sign off or lock periods.

**Acceptance:** the period cannot close while mandatory tasks or unresolved control exceptions remain; the final close package is frozen and reproducible.

---

## 15. Audit Platform

1. Maintain engagement client, type, period, team, status, materiality, milestones, and scope.
2. Record risk, assertion, likelihood, impact, related account/process, planned response, owner, and assessment history.
3. Track PBC title, instructions, requester, client owner, due date, priority, and status.
4. Version client uploads, scan and classify them, link them to requests, and allow acceptance or return with reasons.
5. Use workpaper templates with objective, population, procedure, evidence, sample, results, exceptions, conclusion, preparer, and reviewer.
6. Track review notes with owner, due date, severity, resolution response, and immutable history.
7. Classify findings with criteria, condition, cause, effect/risk, recommendation, management response, owner, due date, and status.
8. Separate preparer, reviewer, and engagement partner sign-offs with permission controls.
9. Report engagement progress, open requests, review notes, findings, milestones, and final report status.
10. Preserve workpaper revisions, evidence versions, sampling changes, review notes, and sign-off events.

**Acceptance:** a signed-off workpaper is locked from silent modification; later changes create a new version and require re-review.

---

## 16. Client Portal

1. Map each client user to explicitly authorized clients and permitted folders/engagements.
2. Show requested item, instructions, owner, due date, priority, status, and firm contact.
3. Support file type/size validation, scanning, upload progress, and clear success/failure feedback.
4. Show Submitted, In Review, Accepted, or Returned; internal-only review notes remain hidden.
5. Link message threads to requests/documents/engagements with controlled visibility and retention.
6. Capture client approvals/acknowledgements with identity, action, timestamp, and acknowledged version.
7. Notify on invitations, requests, reminders, returns, acceptance, and deliverables-ready events with preferences.
8. Publish only explicitly approved statements, reports, tax deliverables, or engagement outputs.
9. Show clients their own uploads, messages, and status events; firm users see full authorized history.
10. Support keyboard navigation and narrow mobile viewports for upload and response workflows.

**Acceptance:** client users cannot access internal workpapers, other clients, internal comments, or unpublished deliverables through UI or direct API requests.

---

## 17. AI Platform

Finova exposes task-specific AI roles: **AI Accountant**, **AI Controller**, **AI Auditor**, and **AI CFO**. These are permission-scoped assistants over approved Finova data, not autonomous officers or substitutes for professional judgment.

1. AI Accountant classifies transactions, extracts invoice/receipt fields, suggests coding, explains journal differences, and drafts reconciliations.
2. AI Controller summarizes close status, identifies unusual balances, compares periods, drafts variance explanations, and lists control exceptions.
3. AI Auditor summarizes evidence, maps evidence to procedures, identifies missing support, drafts review questions, and highlights risk indicators.
4. AI CFO summarizes performance, explains cash movement, generates scenario assumptions, and drafts management commentary based on available data.
5. Material answers identify source records/documents and link to sources where the user has access.
6. Extracted fields and recommendations include confidence/uncertainty; low-confidence results route to human review.
7. AI cannot independently approve journals, release payments, sign workpapers, publish statements, close periods, or change permissions.
8. Protect prompts and data; do not expose secrets or another tenant's data; apply retention and redaction policies.
9. Record model/provider/version, user, task, source identifiers, timestamp, outcome, and whether a human accepted or changed the suggestion.
10. Provide rate limits, error handling, fallback behavior, monitoring, cost controls, and a disabled state when providers are unavailable.

**Acceptance:** AI output is distinguished from verified source data; every AI action that changes a record requires user confirmation and normal authorization checks.

---

## 18. Security, Privacy, and Compliance Controls

1. Provide secure credentials, password reset, session expiry, and supported MFA/SSO options; enforcement is configurable by firm policy.
2. Enforce role and scope in every server action/API route; deny by default.
3. Include firm/client/entity/engagement scope in queries and mutations; never trust client-supplied ownership IDs.
4. Use TLS in transit and managed encryption at rest for database, object storage, backups, and secrets.
5. Keep credentials in environment/secret storage; never commit .env files, tokens, or customer credentials.
6. Log authentication changes, permission changes, sensitive reads/exports as policy requires, approvals, posting, archive, and configuration changes.
7. Configure retention by record class/jurisdiction and preserve records under legal hold.
8. Validate extension, MIME, size, and content signatures; quarantine suspicious files. Do not represent a lightweight sanitizer as enterprise antivirus.
9. Maintain encrypted backups, restore testing, recovery objectives, and incident response contacts.
10. Use dependency checks, secret scanning, vulnerability management, authorization tests, and periodic external assessment.

**Acceptance:** tests demonstrate users cannot access cross-tenant data through route manipulation, API calls, exports, search, AI retrieval, or file URLs.

---

## 19. Database and Integration Architecture

### Current repository baseline

The reviewed repository uses Next.js 15, TypeScript, Tailwind, NextAuth, Prisma, and SQLite in its checked-in Prisma schema. Existing models include users, firms, clients, documents, approvals, audit logs, trial balances, close periods/tasks, bank transactions, document analysis, workpapers, consolidation balances, and flexible workspace records. Existing accounting operations capture stores records as DRAFT and the README states that it does not yet post double-entry journals or calculate tax/payroll. This is a starting point, not proof that the full target platform is implemented.

### Target architecture requirements

1. Migrate production to PostgreSQL with foreign keys, unique constraints, check constraints where appropriate, and explicit tenant-scope columns.
2. Introduce normalized chart-of-account, fiscal-period, journal-header, journal-line, posting-batch, reversal, and ledger structures.
3. Normalize tasks, approvals, comments, attachments, notifications, and state transitions rather than embedding all operational data in JSON text.
4. Use append-only audit events with actor, action, subject, scope, time, request metadata, and before/after or event details.
5. Store file bytes in private object storage; keep metadata, hash, version, classification, ownership, retention, scan status, and storage key in the database.
6. Use deliberate foreign-key and deletion rules; preserve referenced accounting evidence and posted records.
7. Index tenant/scope keys, period/date, status, references, foreign keys, and common search filters; validate query plans on realistic data.
8. Use database transactions and idempotency keys for posting, receipt application, bill payment allocation, and period close.
9. Isolate bank feeds, OCR/document intelligence, email, identity, tax, and payment providers behind adapters with retry/error logs.
10. Use Prisma migrations, versioned seeds, backup/restore tests, and compatibility checks; do not use db push as the production migration strategy.

### Data integrity principles

- Use fixed-precision decimal types for authoritative monetary amounts, not binary floating-point.
- Posted financial events are immutable; corrections are new linked events.
- All dates have explicit business timezone and accounting-period semantics.
- Retain currency and exchange-rate metadata for multi-currency transactions.
- Every financial record has entity and period context unless an explicit exception is documented.
- Use soft deletion/archive for controlled business records; audit evidence is not casually deleted.

**Acceptance:** a staging migration preserves record counts, foreign-key integrity, key financial totals, and access scopes; a tested rollback/restore plan exists before production migration.

---

## 20. Shared Workflow, Approvals, Comments, Attachments, Notifications

These capabilities apply across journals, invoices, bills, reconciliations, close tasks, PBC requests, workpapers, statements, and client communications.

1. Define valid states, allowed transitions, role requirements, conditions, and side effects for each record type.
2. Store approver, approval step, decision, reason, timestamp, delegation, and policy version.
3. Support comments and mentions, internal/client visibility, resolution, and edit history.
4. Link evidence to multiple authorized records without duplicating the underlying file; preserve file version and hash.
5. Provide in-app and configured email notifications with delivery status, retry, and user preferences.
6. Remind before due dates and escalate overdue work under configurable rules and business calendars.
7. Show activity timeline for creation, edits, comments, evidence, review decisions, approvals, posting, and state changes.
8. Provide reusable approval chains, close checklists, PBC request sets, workpaper templates, and notification content.
9. Search and filter work by owner, status, period, due date, client, entity, and priority subject to authorization.
10. Report cycle time, aging, overdue work, approval bottlenecks, returned items, and completion trends.

**Acceptance:** each workflow transition creates an attributable event; attachments/comments inherit scope; notifications never disclose information to unauthorized recipients.

---

## 21. Design System

1. Use a modern enterprise interface with clear hierarchy, whitespace, consistent cards, tables, forms, dialogs, and status indicators.
2. Support light and dark modes with sufficient contrast; never use color as the only status signal.
3. Provide persistent desktop navigation, responsive mobile navigation, active state, page context, and global search.
4. Use sortable/filterable/paginated data grids with labels, totals, empty states, export permissions, and accessible row actions.
5. Format accounting tables consistently: aligned references/dates, right-aligned amounts, debit/credit columns, subtotals, and clear negative values.
6. Provide labelled forms, validation, required indicators, helpful descriptions, save/cancel behavior, and unsaved-change protection.
7. Implement loading, success, error, empty, offline, and permission-denied states for data-driven screens.
8. Target WCAG 2.2 AA for keyboard access, focus, semantics, screen-reader labels, reduced motion, and contrast.
9. Support laptop, tablet, and phone widths without clipped tables or inaccessible controls.
10. Use shared components and tokens; page-specific themes must not make control or status semantics inconsistent.

**Acceptance:** core flows pass keyboard-only navigation, responsive viewport checks, and contrast review; no visible button is decorative or inert.

---

## 22. Reporting, Exports, and Analytics

1. Scope reports by authorized firm, client, entity, engagement, and period.
2. State filters, currency, accounting basis, source data, generated time, and version on every report.
3. Apply the same row/field permissions to exports as to the screen.
4. Log sensitive exports with actor, filters, output type, and scope.
5. Version report templates and preserve issued deliverables for reproducibility.
6. Provide CSV/XLSX/PDF according to permissions and data sensitivity.
7. Require recipient validation and authorization for scheduled delivery.
8. Label AI commentary separately from calculated report values.
9. Share calculation services between dashboard metrics and reports to prevent inconsistent numbers.
10. Mark failed/incomplete report generation clearly; never publish a partial result as final.

---

## 23. Non-Functional Requirements

- Performance: common lists use bounded server-side queries and pagination; large imports/exports run asynchronously.
- Scalability: support multiple firms/clients with indexed tenant-scoped data and private file storage.
- Reliability: posting and close operations are transactional and idempotent; background jobs retry safely.
- Observability: structured logs, correlation IDs, metrics, health checks, and alerts without logging passwords or unnecessary sensitive data.
- Maintainability: typed domain services, validated API inputs, shared UI components, and automated critical-rule tests.
- Portability: environment-specific configuration and documented migrations support local, staging, and production.
- Accessibility: WCAG 2.2 AA is the target for principal user journeys.
- Data portability: provide authorized export and documented retention/deletion processes.
- Disaster recovery: define recovery point/time objectives and test restoration before production launch.

---

## 24. 90-Day Roadmap

Dates are relative to project kickoff. Scope can be adjusted after code and workflow validation.

### Days 1–15 — Foundation and product integrity
- Confirm route inventory, user journeys, role matrix, and scope model.
- Define shared workflow, comment, attachment, notification, and audit-service contracts.
- Establish PostgreSQL target schema and migration plan while retaining local SQLite demo support until migration tests pass.
- Add CI checks for lint/type/build, Prisma validation, and authorization tests.
- Resolve duplicate/dead routes and align navigation to target taxonomy.
- Separate seeded/demo data from production data.

**Exit criteria:** route map is complete; core authorization tests exist; schema migration plan is reviewed; no known route points to an unexplained 404.

### Days 16–30 — Accounting core
- Implement company/entity context, fiscal periods, chart of accounts, and mappings.
- Implement normalized journal header/lines and debit-credit validation.
- Add draft → submit → review → approve → post flow with separation of duties.
- Add immutable posting and reversal rules.
- Generate General Ledger and Trial Balance from posted entries.

**Exit criteria:** balanced journal posts once; unbalanced/unauthorized journals do not post; ledger and trial balance reconcile to posted lines.

### Days 31–45 — Revenue, Expenses, and Banking
- Build customers, invoices, receipts, payment allocation, vendors, bills, expense coding, and payment records.
- Add statement import, match rationale, exception queues, and reconciliation sign-off.
- Link source documents to originating transactions and accounting entries.
- Add AP/AR aging and cash requirement reports.

**Exit criteria:** invoice/bill workflows have evidence and approvals; reconciliation totals are reproducible; unmatched items are visible and assigned.

### Days 46–60 — Close and reporting
- Build task dependencies, evidence gates, review notes, close approvals, and period lock/reopen.
- Tie statements to a versioned trial balance.
- Add statement review, sign-off, and versioned export.
- Upgrade executive dashboard to use authorized source data and traceable drill-down.

**Exit criteria:** a period cannot close with unresolved mandatory checks; statement values tie to the selected trial-balance snapshot.

### Days 61–75 — Audit and client portal
- Strengthen engagement, risk, PBC, workpaper, review-note, findings, and sign-off workflows.
- Improve client uploads, return/accept flow, portal messaging, and notification preferences.
- Add evidence versioning and access review.

**Exit criteria:** audit evidence and review history are versioned; clients cannot access internal or other-client information.

### Days 76–90 — AI, hardening, and release readiness
- Integrate permission-aware AI roles using approved sources and citation links.
- Add AI review/accept/reject flow and record model metadata.
- Complete security, accessibility, performance, backup/restore, and migration testing.
- Run end-to-end UAT with accountant, controller, audit reviewer, and client personas.
- Prepare deployment, monitoring, incident response, and user training.

**Exit criteria:** AI cannot bypass approval controls; critical journeys pass UAT; release checklist and rollback plan are approved.

---

## 25. Jira Backlog — Initial Epics and Acceptance Criteria

This backlog is a starting decomposition. Stories should be sized and refined with the team before sprint commitment.

| Epic | Priority | Initial stories | Dependencies / acceptance |
|---|---|---|---|
| E1 — Tenant, Identity & Permissions | P0 | Firm/client membership; role grants; scope guards; access review | Deny-by-default API and cross-tenant tests pass |
| E2 — Workflow & Approvals | P0 | State machine; approval steps; maker-checker; return/reject reasons | Every transition is validated and audited |
| E3 — Evidence & Documents | P0 | File metadata/version; private storage adapter; linked attachments; scan status | File access is authorized and versioned |
| E4 — Audit & Activity | P0 | Append-only events; activity timeline; immutable posting events | Critical events are queryable and attributable |
| E5 — Company & Fiscal Setup | P0 | Company profile; entity tree; fiscal periods; currencies | Invalid/inactive context blocks posting |
| E6 — Chart of Accounts | P0 | Account master; hierarchy; import; statement mapping | Duplicate codes blocked; mapping exceptions visible |
| E7 — Journals & Posting | P0 | Drafts; balance validation; approvals; atomic posting; reversal | Posted totals reconcile and duplicates prevented |
| E8 — Ledger & Trial Balance | P0 | Ledger query; balances; trial-balance snapshot; exception report | Reconciles to posted journal lines |
| E9 — AR | P1 | Customers; invoices; receipts; allocations; aging | Customer balance reconciles to open items |
| E10 — AP | P1 | Vendors; bills; approvals; payment records; 1099 review | Paid state requires evidence/confirmed event |
| E11 — Banking | P1 | Statement import; matching; exceptions; reconciliation | Difference and sign-off are reproducible |
| E12 — Close Management | P1 | Templates; dependencies; evidence; review; lock/reopen | Mandatory checks block close |
| E13 — Financial Reporting | P1 | Balance sheet; income statement; cash flow; statement versions | Totals tie to trial-balance snapshot |
| E14 — Audit Platform | P1 | Engagements; risk; PBC; workpapers; findings; sign-off | Signed workpapers are versioned and locked |
| E15 — Client Portal | P1 | Requests; uploads; statuses; messaging; published deliverables | Client scope tests pass |
| E16 — AI Assistants | P2 | Extraction; coding suggestions; close insights; audit evidence summary | Outputs cite sources and require human approval |
| E17 — Dashboard & Analytics | P2 | KPIs; drill-down; alert queues; portfolio overview | Metrics reconcile to source reports |
| E18 — Platform Operations | P0 | PostgreSQL migrations; CI; observability; backups; deployment runbook | Restore and release checks pass |
| E19 — UX & Accessibility | P1 | Shared tables/forms; navigation; empty/error states; keyboard support | Principal journeys meet accessibility target |

### Definition of Done for every story

- Business rules and acceptance criteria are documented.
- Server-side authorization and input validation are implemented.
- Loading, empty, success, error, and permission-denied UI states are handled.
- Sensitive mutations create audit events.
- Attachments/comments/notifications follow shared service contracts where applicable.
- Unit and integration tests cover expected and denied behavior.
- Keyboard use, responsive layout, and meaningful labels are reviewed.
- Documentation and migration notes are updated.
- A feature is not described as production-ready until dependencies, tests, and operational controls are complete.

---

## 26. Release Gates and Key Risks

### Release gates
1. No critical cross-tenant authorization defect.
2. Journal posting, reversal, ledger, and trial-balance reconciliation tests pass.
3. Period close/lock and reopen authorization tests pass.
4. Database migration and backup restore are verified in staging.
5. File access is private, scoped, and validated; sanitizer limitations are disclosed.
6. AI output is traceable, permission-scoped, and unable to perform prohibited approvals/postings.
7. Core journeys pass accessibility and responsive QA.
8. Operational owners, monitoring, support, and rollback procedures are assigned.

### Key risks and mitigations
- Accounting correctness: use decimal arithmetic, balanced posting invariants, immutable posted entries, and independent reconciliation tests.
- Tenant leakage: centralize authorization and test API, search, AI retrieval, file, and export paths.
- Scope expansion: deliver P0 accounting/security foundation before advanced automation.
- AI over-trust: display provenance, confidence, and human approval controls; prevent autonomous financial finalization.
- Migration risk: retain backups, test staged migrations, compare totals, and never replace local database configuration without a verified migration plan.
- Demo/production confusion: label seeded records and demo behavior; never present placeholder data as live financial results.

---

## 27. Current-State Gap Register (Repository Review)

This section records findings visible in the checked-in main source and README when this PRD was prepared. It is not a runtime QA result.

| Area | Current source evidence | Target gap / next action |
|---|---|---|
| Stack | Next.js 15, TypeScript, Tailwind, NextAuth, Prisma | Retain app foundation; formalize domain services and tests |
| Database | Prisma datasource is SQLite | Plan and test PostgreSQL production migration |
| Accounting operations | /dashboard/operations stores WorkspaceRecord drafts | Implement normalized ledgers, validated posting, and subledgers |
| Approval | Approval model exists; workspace approval is a simple role-gated status change | Add multi-step policy, segregation, and decision history |
| Audit | AuditLog exists; workspace create/update/approve events are written | Expand coverage, append-only controls, actor/scope metadata |
| Documents | Document and analysis models/routes exist | Add private storage, evidence versioning, retention, scan integration |
| Close | ClosePeriod and CloseTask models/routes exist | Add dependency gates, mandatory evidence, approvals, and locks |
| Bank reconciliation | Bank transaction model, matcher, and page exist | Match against posted ledger activity and formalize approval |
| Financial statements | Trial balance and statement generator exist | Enforce snapshot ties, mappings, versioning, and sign-off |
| Audit | Workpaper/PBC features exist | Add complete engagement/risk/finding and review lifecycle |
| Client portal | Portal and client-scoped models/routes exist | Verify isolation, message visibility, notifications, deliverable controls |
| AI | AI chat and document-analysis capabilities exist | Add task-specific agents with citations, permission filters, and action gates |
| UX | Dashboard shell, search, theme controls exist | Align menu to target architecture and complete consistent states |

### Explicit non-claims

A page, Prisma model, or API route does not by itself prove an end-to-end business workflow is complete. This repository review did not execute the app, run tests, validate accounting outputs, conduct a penetration test, or verify production deployment. Requirements in this document describe the desired target state unless specifically identified as current-state evidence.
