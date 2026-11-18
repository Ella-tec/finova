# Deploy Finova (Vercel + Neon Postgres)

This repo is prepared for production Postgres. You only need to create free accounts and paste secrets.

## What is already done in the repo

- Prisma schema uses **PostgreSQL**
- `postinstall` + `build` run `prisma generate`
- `.env.example` lists all required variables
- `vercel.json` sets the Next.js build
- Seed script creates demo users and sample folders

## What you do once (accounts)

### A) Neon (database) — free

1. Open https://neon.tech and sign in with GitHub  
2. **Create project** → copy the connection string  
3. It looks like:

```text
postgresql://USER:PASSWORD@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### B) Vercel (app) — free hobby

1. Open https://vercel.com and sign in with GitHub  
2. **Add New Project** → import `Ella-tec/finova`  
3. **Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon connection string |
| `NEXTAUTH_SECRET` | long random string (see below) |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` (set after first deploy if needed) |

Generate secret on your PC:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Click **Deploy**

### C) Create tables + seed data

After the first successful deploy, on your PC:

```powershell
cd "C:\Users\EliyasEshtea\Project Repo\finova"
git pull origin main

# Use the SAME Neon URL as Vercel
$env:DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.../neondb?sslmode=require"

npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Demo logins (same as local):

- `demo@finova.ai` / `Demo123!`
- `admin@finova.ai` / `Demo123!`
- `client@acme.com` / `Demo123!` → `/portal`

### D) Fix auth URL

Vercel → Project → Settings → Environment Variables:

```text
NEXTAUTH_URL=https://your-actual-project.vercel.app
```

Redeploy (Deployments → … → Redeploy).

## Local development with Postgres

Option 1 — same Neon DB (simplest):

```powershell
Copy-Item .env.example .env
# Edit .env → paste Neon DATABASE_URL and a NEXTAUTH_SECRET
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Option 2 — Docker Postgres:

```powershell
docker run --name finova-pg -e POSTGRES_PASSWORD=finova -e POSTGRES_DB=finova -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:finova@localhost:5432/finova"
```

## Optional Azure / Google later

- Keep **Neon** as DB (free)
- Point Azure App Service or Cloud Run at the same GitHub repo and same env vars
- Set a **$1 budget alert** on any cloud account you open

## Checklist

- [ ] Neon project created
- [ ] Vercel project imported from `Ella-tec/finova`
- [ ] `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` set on Vercel
- [ ] `prisma db push` + `db:seed` against Neon
- [ ] Login works on the live URL
