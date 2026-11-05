# Finova File Sanitizer

Simple, built-in checks before storing files or sending them to AI.

## How to use (simple)

1. Open **File Sanitizer** in the sidebar (`/dashboard/security`).
2. Drop a file **or** paste text (invoice body, CSV snippet).
3. Read the traffic lights:
   - **OK for Finova upload** — allowed into firm document store
   - **Not for public AI** — keep in private Copilot / Azure OpenAI / Finova only
   - **Classification** — PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED
4. Follow **What to do next**.
5. Then upload under **Documents** if allowed.

## What it checks

| Check | Examples |
|-------|----------|
| Dangerous types | `.exe`, `.bat`, `.ps1`, … |
| Macro-enabled Office | `.xlsm`, `.docm` |
| Size | 25 MB limit |
| PII patterns | SSN, PAN, IBAN, API keys, password assignments |
| Classification | Payroll, bank, tax → CONFIDENTIAL/RESTRICTED |
| Public-AI gate | Blocks restricted/confidential from consumer ChatGPT-style use |

## Not a replacement for

Microsoft Defender, Purview DLP, OPSWAT/Votiro CDR, CrowdStrike — use those in enterprise pipelines. Finova adds a **fast, accountant-friendly** gate inside the product.

## API

`POST /api/security/sanitize`

- `multipart/form-data` with `file` (+ optional `textHint`)
- or JSON `{ fileName, mimeType, size, textContent }`

Logged to `AuditLog` as `FILE_SANITIZE_SCAN`.
