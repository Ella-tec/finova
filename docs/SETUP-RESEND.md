# How to set up Resend API (PBC email notifications)

Finova sends PBC request emails via Resend when `RESEND_API_KEY` is set.
Without it, emails are logged to the database (`EmailLog`) and printed in the server console (demo mode).

## 1. Create a Resend account

1. Go to [https://resend.com](https://resend.com) and sign up.
2. Verify your email.

## 2. Get an API key

1. Open **API Keys** in the Resend dashboard.
2. Click **Create API Key**.
3. Name it e.g. `finova-dev`.
4. Copy the key (starts with `re_`). Store it securely — it is shown only once.

## 3. Verify a sending domain (production)

For production you must verify a domain:

1. Resend → **Domains** → **Add Domain**.
2. Add the DNS records (SPF, DKIM, optionally DMARC) at your DNS provider.
3. Wait until status is **Verified**.

For local testing you can use Resend’s onboarding domain limits, or send only to your own email.

## 4. Configure Finova

In `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Finova <noreply@yourdomain.com>
NEXTAUTH_URL=http://localhost:3000
```

- `EMAIL_FROM` must use a domain you verified in Resend (or their test domain rules).
- Restart the Next.js server after changing `.env`.

## 5. Test

1. Log in as firm user (`demo@finova.ai`).
2. Go to **Audit → PBC Requests**.
3. Create a request (or use an existing one with status REQUESTED).
4. Click **Send Email**.
5. Check:
   - Recipient inbox (or Resend **Logs** dashboard).
   - Server console if still in demo mode.
   - `GET /api/email` or Prisma `EmailLog` table for status `SENT` / `FAILED`.

## 6. Optional: SMTP instead of Resend

If you prefer SMTP, set:

```env
SMTP_HOST=smtp.example.com
# Wire nodemailer in src/lib/email/send.ts (placeholder is already there)
```

Resend is the path of least resistance for transactional email.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 403 / domain not verified | Verify domain in Resend or use an allowed test recipient |
| Email stays QUEUED | Ensure `RESEND_API_KEY` is loaded (restart `npm run dev`) |
| No client email | Seed creates `client@acme.com`; or pass `fallbackEmail` in the API body |
