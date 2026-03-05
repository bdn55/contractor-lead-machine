# 🔧 Contractor Lead Machine — Full Deployment Guide

> Stack: Next.js (Vercel) · Node/Express (Railway) · PostgreSQL · Stripe · OpenAI

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Local Development Setup](#3-local-development-setup)
4. [Stripe Setup (Step-by-Step)](#4-stripe-setup)
5. [Deploy Backend to Railway](#5-deploy-backend-to-railway)
6. [Deploy Frontend to Vercel](#6-deploy-frontend-to-vercel)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Database Setup](#8-database-setup)
9. [Stripe Webhook Configuration](#9-stripe-webhook-configuration)
10. [Testing Your Deployment](#10-testing-your-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Install these on your machine before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | (comes with Node) |
| Git | any | https://git-scm.com |
| Docker Desktop | any | https://docker.com/desktop (optional, for local DB) |
| Stripe CLI | any | https://stripe.com/docs/stripe-cli |

You'll also need free accounts at:
- **Vercel** → https://vercel.com/signup
- **Railway** → https://railway.app (backend + database)
- **Stripe** → https://dashboard.stripe.com/register
- **OpenAI** → https://platform.openai.com

---

## 2. Project Structure

```
contractor-lead-machine/
├── frontend/               ← Next.js app (deploy to Vercel)
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── billing/
│   │   └── api/            ← Next.js API routes (thin wrappers)
│   ├── components/
│   ├── .env.local          ← frontend env vars (never commit)
│   └── package.json
│
├── backend/                ← Express API (deploy to Railway)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── leads.js
│   │   │   ├── estimates.js
│   │   │   ├── stripe.js   ← Stripe billing (provided)
│   │   │   └── followups.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── openai.js
│   │   │   └── email.js
│   │   └── db/
│   │       ├── index.js
│   │       ├── schema.sql
│   │       └── seed.sql
│   ├── .env                ← backend env vars (never commit)
│   └── package.json
│
├── docker-compose.yml      ← local dev environment
└── .env.example            ← template (safe to commit)
```

---

## 3. Local Development Setup

### Step 1 — Clone and install dependencies

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/contractor-lead-machine.git
cd contractor-lead-machine

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Set up environment variables

```bash
# From the root of the project
cp .env.example backend/.env
cp .env.example frontend/.env.local

# Now edit both files and fill in your real keys
# See Section 4 for how to get your Stripe keys
```

### Step 3 — Start the database with Docker

```bash
# From root of project — starts PostgreSQL + Redis
docker compose up db redis -d

# Verify it's running
docker compose ps
```

### Step 4 — Run database migrations

```bash
cd backend

# This creates all tables and loads seed data
npm run db:migrate
npm run db:seed
```

### Step 5 — Start the backend

```bash
cd backend
npm run dev
# API running at http://localhost:4000
```

### Step 6 — Start the frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

### Step 7 — Forward Stripe webhooks locally (optional)

```bash
# Install Stripe CLI first: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe

# Copy the webhook signing secret it prints and add to backend/.env
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 4. Stripe Setup

### Step 1 — Get your API keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** → `STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → `STRIPE_SECRET_KEY`

> ⚠️ Use **test mode keys** (starting with `pk_test_` / `sk_test_`) while developing. Switch to live keys only when ready to charge real customers.

### Step 2 — Create your subscription products

1. Go to **Stripe Dashboard → Products → Add Product**
2. Create three products:

**Product 1: Starter**
- Name: `Contractor Lead Machine — Starter`
- Price: `$19.00` · Recurring · Monthly
- Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_STARTER`

**Product 2: Pro**
- Name: `Contractor Lead Machine — Pro`
- Price: `$49.00` · Recurring · Monthly
- Copy the **Price ID** → `STRIPE_PRICE_PRO`

**Product 3: Agency**
- Name: `Contractor Lead Machine — Agency`
- Price: `$99.00` · Recurring · Monthly
- Copy the **Price ID** → `STRIPE_PRICE_AGENCY`

### Step 3 — Add all values to your .env files

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...

# frontend/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 5. Deploy Backend to Railway

Railway gives you a PostgreSQL database + Node.js server in one place for ~$5/month.

### Step 1 — Create Railway project

1. Go to https://railway.app → New Project
2. Choose **Deploy from GitHub repo**
3. Connect your GitHub account and select your repo
4. Set the **root directory** to `/backend`

### Step 2 — Add a PostgreSQL database

1. In your Railway project → **New Service → Database → PostgreSQL**
2. Railway will automatically inject `DATABASE_URL` into your environment

### Step 3 — Add environment variables

In Railway → your backend service → **Variables**, add each variable from your `backend/.env`:

```
NODE_ENV=production
JWT_SECRET=<your 64-char random string>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4 — Set start command

In Railway → Settings → Deploy:
- **Start Command**: `npm start`
- **Build Command**: `npm install`

### Step 5 — Run migrations on Railway

After first deploy, open Railway shell:

```bash
# Railway → your service → Shell tab
npm run db:migrate
npm run db:seed
```

### Step 6 — Copy your Railway URL

Your API will be live at something like:
`https://contractor-lead-machine-api.up.railway.app`

Save this — you'll need it for Vercel.

---

## 6. Deploy Frontend to Vercel

### Step 1 — Install Vercel CLI (optional but helpful)

```bash
npm install -g vercel
```

### Step 2 — Connect to Vercel

Option A — via CLI:
```bash
cd frontend
vercel
# Follow prompts: link to your account, create new project
```

Option B — via dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework: **Next.js** (auto-detected)

### Step 3 — Add environment variables in Vercel

Go to Vercel → your project → **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4 — Deploy

```bash
# Via CLI
vercel --prod

# Or just push to main branch — Vercel auto-deploys
git push origin main
```

Your app is now live at `https://your-app.vercel.app` 🎉

---

## 7. Environment Variables Reference

### Backend (Railway / .env)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Railway auto-injects |
| `JWT_SECRET` | Random 64-char string | `node -e "require('crypto').randomBytes(64).toString('hex')"` |
| `STRIPE_SECRET_KEY` | Stripe secret key | dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | dashboard.stripe.com/webhooks |
| `STRIPE_PRICE_STARTER` | Price ID for $19 plan | Stripe → Products |
| `STRIPE_PRICE_PRO` | Price ID for $49 plan | Stripe → Products |
| `STRIPE_PRICE_AGENCY` | Price ID for $99 plan | Stripe → Products |
| `OPENAI_API_KEY` | OpenAI key for AI features | platform.openai.com/api-keys |
| `SENDGRID_API_KEY` | Email sending | app.sendgrid.com/settings/api_keys |
| `FRONTEND_URL` | Your Vercel app URL | After Vercel deploy |

### Frontend (Vercel / .env.local)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (safe to expose) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL |

---

## 8. Database Setup

### Running migrations manually

```bash
cd backend

# Create tables
psql $DATABASE_URL -f src/db/schema.sql

# Load seed/demo data
psql $DATABASE_URL -f src/db/seed.sql
```

### Seed data included

The seed file loads 10 demo leads across Houston, TX with realistic names, job descriptions, and values so the app has data immediately.

### Resetting the database (dev only)

```bash
# ⚠️ DESTROYS ALL DATA — dev only
npm run db:reset
```

---

## 9. Stripe Webhook Configuration

Webhooks tell your app when payments succeed, fail, or subscriptions change.

### Step 1 — Create webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://your-api.up.railway.app/api/webhooks/stripe`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Railway

### Step 2 — Verify webhook is working

After deploying:
1. Stripe Dashboard → Webhooks → your endpoint
2. Click **Send test webhook**
3. Choose `checkout.session.completed`
4. You should see a `200 OK` response

### Important: Raw body parsing

The Stripe webhook route MUST receive the raw request body (not JSON-parsed). In your Express app.js:

```javascript
// ⚠️ Register webhook BEFORE express.json() middleware
app.use('/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }), 
  require('./routes/stripe').webhook
);

// Then add JSON parsing for all other routes
app.use(express.json());
```

---

## 10. Testing Your Deployment

### Test Stripe payments (use test card numbers)

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

### Test the full subscription flow

1. Register a new account on your live app
2. Go to Billing → choose Pro plan
3. Complete checkout with test card `4242 4242 4242 4242`
4. Verify your plan updated to "Pro" in the dashboard
5. Check Railway logs to confirm webhook fired

### Verify AI features

1. Go to AI Estimator → type a job description → click Generate
2. If you get an error, check your `OPENAI_API_KEY` in Railway variables

---

## 11. Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` is set in Railway
- Make sure migrations have run: `npm run db:migrate`
- Verify PostgreSQL service is running in Railway dashboard

### "Stripe webhook signature invalid"
- Make sure `STRIPE_WEBHOOK_SECRET` is the webhook secret, NOT the API secret key
- Ensure webhook route uses `express.raw()` not `express.json()`
- In local dev, use `stripe listen` CLI — don't manually send test requests

### "401 Unauthorized on API calls"
- Check `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
- No trailing slash on the URL
- JWT_SECRET must be the same in all environments

### "OpenAI returning errors"
- Verify `OPENAI_API_KEY` starts with `sk-`
- Check OpenAI account has billing set up (needs credits)
- API errors will show in Railway logs

### CORS errors in browser
- Add your Vercel URL to CORS whitelist in backend:
```javascript
// backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Vercel build fails
- Check `frontend/package.json` has a `build` script: `"build": "next build"`
- Verify all `NEXT_PUBLIC_` env vars are set in Vercel dashboard

---

## Quick Reference — Key URLs

| Service | URL |
|---------|-----|
| Your App (Vercel) | `https://your-app.vercel.app` |
| Your API (Railway) | `https://your-api.up.railway.app` |
| Stripe Dashboard | `https://dashboard.stripe.com` |
| Stripe Webhooks | `https://dashboard.stripe.com/webhooks` |
| Railway Dashboard | `https://railway.app/dashboard` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| OpenAI Keys | `https://platform.openai.com/api-keys` |

---

## Going Live Checklist

- [ ] Switch Stripe keys from `pk_test_` / `sk_test_` → `pk_live_` / `sk_live_`
- [ ] Update Stripe webhook endpoint to production URL
- [ ] Set `NODE_ENV=production` in Railway
- [ ] Add a custom domain in Vercel (Settings → Domains)
- [ ] Set up SendGrid verified sender domain for emails
- [ ] Enable Railway backups for PostgreSQL
- [ ] Test full checkout flow with a real card in live mode

---

*Generated for Contractor Lead Machine · Questions? Check the code comments or open an issue.*
