# 🚀 1-Click Vercel Deployment & Neon DB Guide

This guide walks you through connecting your **Neon Serverless PostgreSQL** database and deploying the fullstack **VyavaSahayam** platform to **Vercel** with one click.

---

## 🐘 1. Connecting Your Neon DB

1. Log in to [Neon Console](https://console.neon.tech/).
2. Select your Project (or create a new database).
3. In your **Dashboard / Connection Details**, copy the **Pooled connection** string.
   It looks like:
   ```text
   postgresql://neondb_owner:npg_abcdef123456@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### To use Neon locally:
Open [backend/.env](file:///c:/Users/Lokesh/OneDrive/Desktop/websitefarm/backend/.env) and replace `DATABASE_URL`:
```env
DATABASE_URL=postgresql://neondb_owner:npg_abcdef123456@ep-cool-fog-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
> *Tip: The backend automatically handles `postgres://` to `postgresql://` conversion and enables connection pooling (`pool_pre_ping=True`) for resilient serverless operation.*

---

## ⚡ 2. One-Click Vercel Deployment

The repository is already configured with [`vercel.json`](file:///c:/Users/Lokesh/OneDrive/Desktop/websitefarm/vercel.json) and [`api/index.py`](file:///c:/Users/Lokesh/OneDrive/Desktop/websitefarm/api/index.py) to build and deploy both the **React Frontend** and the **FastAPI Serverless Backend** together.

### Step 1: Push Code to GitHub / GitLab
```bash
git add .
git commit -m "Configure Neon DB and Vercel 1-click deployment"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New Project** and select your GitHub repository.
3. Keep default build settings (Vercel uses [`vercel.json`](file:///c:/Users/Lokesh/OneDrive/Desktop/websitefarm/vercel.json) automatically).

### Step 3: Add Environment Variables in Vercel
In the Vercel project settings (**Environment Variables**), add:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Your Neon connection string |
| `SECRET_KEY` | `your-secure-random-jwt-key` | Token signature key |
| `DATA_GOV_IN_API_KEY` | `579b464db66ec23bdd000001456ec7485a0249c67b45c29519ed076a` | Agmarknet live price API key |
| `MOCK_AI` | `True` | AI Quality & Freshness Engine |

### Step 4: Click Deploy!
Vercel will build the frontend into static assets and deploy FastAPI routes under `/api/*`.

---

## 🧪 Verification & Health Check
Once deployed, your Vercel URL will serve:
- **Web App**: `https://your-app.vercel.app/`
- **Interactive API Docs**: `https://your-app.vercel.app/docs`
- **Govt Mandi Prices API**: `https://your-app.vercel.app/api/v1/market-prices/daily`
- **Produce Marketplace API**: `https://your-app.vercel.app/api/v1/consumers/listings`
