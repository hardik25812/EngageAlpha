# EngageAlpha - Quick Start Guide

Get EngageAlpha running with Supabase in under 10 minutes.

## 1. Create Supabase Project (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `engagealpha`
4. Generate and save database password
5. Choose region
6. Click **"Create new project"**

## 2. Run Database Migration (1 minute)

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy all content from `supabase/migrations/20260111_initial_schema.sql`
3. Paste and click **"Run"**

**Option B: Using Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 3. Configure Twitter OAuth (3 minutes)

1. **Twitter Developer Portal:**
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create app or use existing
   - Enable OAuth 2.0
   - Copy Client ID and Client Secret

2. **Supabase Dashboard:**
   - Go to **Authentication → Providers**
   - Enable **Twitter**
   - Paste Client ID and Secret
   - Copy the callback URL shown
   - Save

3. **Back to Twitter:**
   - Add callback URL from Supabase
   - Save

## 4. Get Supabase Keys (1 minute)

1. Supabase Dashboard → **Settings → API**
2. Copy:
   - **Project URL**
   - **anon public key**
   - **service_role key** (keep secret!)

## 5. Configure Environment (1 minute)

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 6. Install & Run (2 minutes)

```bash
npm install
npm run dev
```

Open http://localhost:3000 🎉

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

**Full deployment guide:** See `SUPABASE_DEPLOYMENT.md`

## Need Help?

- **Deployment Guide:** `SUPABASE_DEPLOYMENT.md`
- **Migration Details:** `MIGRATION_SUMMARY.md`
- **Supabase Docs:** https://supabase.com/docs
