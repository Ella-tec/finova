# How to use the Azure Document Intelligence hook

Finova analyzes uploaded invoices/statements via Azure Document Intelligence when credentials are present. Otherwise it uses the built-in simulator so development works offline.

## 1. Create an Azure resource

1. Azure Portal → **Create a resource** → search **Document Intelligence** (formerly Form Recognizer).
2. Create the resource (same region as your other Azure services if possible).
3. After deployment, open the resource → **Keys and Endpoint**.
4. Copy **Endpoint** and **Key 1**.

## 2. Configure Finova

In `.env`:

```env
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR_RESOURCE_NAME.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-32-char-key
```

Restart the dev server.

## 3. How the code uses it

- Module: `src/lib/azure/document-intelligence.ts`
- Called from: `src/app/api/documents/analyze/route.ts` after a file is stored under `uploads/`
- Model used first: **prebuilt-invoice**
- Fallback model: **prebuilt-read**
- If Azure fails or keys are missing → local `simulateOcr` + `analyzeDocumentText`

Mapped fields include vendor, invoice number, dates, total, tax, confidence.

## 4. Test

1. Log in as firm or client user.
2. Go to **Documents** (`/dashboard/documents` or `/portal/documents`).
3. Upload a real invoice PDF (or image).
4. Click **Analyze** (or wait for auto-analyze after upload).
5. Response includes `provider: "azure"` when Azure was used, or `"simulator"` when not.

Check server logs for any Azure HTTP errors (wrong key, wrong endpoint, unsupported file type).

## 5. Pricing / limits

- Azure bills per page analyzed.
- Free tier exists for light testing — check current Azure pricing.
- Large PDFs: ensure file size limits in the upload API still fit your plan.

## 6. Security notes

- Never commit keys to git.
- Prefer Azure Key Vault in production and inject env vars at deploy time.
- Upload storage should stay private (local `uploads/` is fine for MVP; use Azure Blob + private endpoints later).
