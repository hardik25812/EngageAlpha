# Supabase Deployment Guide for EngageAlpha

This guide will walk you through deploying EngageAlpha using Supabase as your backend.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at https://supabase.com)
- A Vercel account (for frontend deployment)
- Twitter Developer Account (for OAuth)

## Step 1: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose your organization
   - Enter project name: `engagealpha`
   - Generate a strong database password (save this!)
   - Select a region close to your users
   - Click "Create new project"

2. **Wait for project initialization** (takes ~2 minutes)

## Step 2: Run Database Migration

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   Find your project ref in your Supabase dashboard URL:
   `https://supabase.com/dashboard/project/[your-project-ref]`

4. **Run the migration:**
   ```bash
   supabase db push
   ```
   
   Or manually run the SQL migration:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents from `supabase/migrations/20260111_initial_schema.sql`
   - Paste and click "Run"

## Step 3: Configure Twitter OAuth in Supabase

1. **Get your Twitter OAuth credentials:**
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Create a new app or use existing
   - Enable OAuth 2.0
   - Note your Client ID and Client Secret

2. **Configure Twitter provider in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Find "Twitter" and enable it
   - Enter your Twitter Client ID
   - Enter your Twitter Client Secret
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Save changes

3. **Update Twitter app settings:**
   - Go back to Twitter Developer Portal
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Add website URL: `https://your-domain.vercel.app`
   - Save

## Step 4: Get Supabase API Keys

1. **Navigate to Project Settings:**
   - Supabase Dashboard → Settings → API

2. **Copy the following values:**
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: This is safe to use in the browser
   - **service_role key**: Keep this secret! Only use server-side

## Step 5: Set Up Environment Variables

1. **Create `.env.local` file in your project root:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your Supabase credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

## Step 6: Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/auth-helpers-nextjs` - Next.js auth helpers
- `@supabase/auth-helpers-react` - React auth hooks

## Step 7: Test Locally

1. **Run the development server:**
   ```bash
   npm run dev
   ```

2. **Open http://localhost:3000**

3. **Test authentication:**
   - Click "Sign in with Twitter"
   - Authorize the app
   - You should be redirected back and logged in

## Step 8: Deploy to Vercel

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Migrated to Supabase"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
     SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

5. **Update Twitter OAuth callback:**
   - Go to Twitter Developer Portal
   - Add your Vercel domain callback: `https://your-app.vercel.app/api/auth/callback`
   - Save

## Step 9: Verify Deployment

1. **Test your deployed app:**
   - Visit your Vercel URL
   - Try signing in with Twitter
   - Check that data is being saved to Supabase

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs
   - Monitor for any errors

## Database Schema Overview

Your Supabase database includes:

- **users** - User accounts (synced with Supabase Auth)
- **user_preferences** - User settings and preferences
- **targets** - Monitored accounts, keywords, lists
- **candidate_tweets** - Discovered tweets
- **scores** - AI-powered opportunity scores
- **alerts** - User notifications
- **replies** - User replies and tracking
- **predictions** - Outcome predictions
- **outcomes** - Measured results
- **learning_signals** - Personalization data
- **attention_decay** - Tweet engagement decay metrics
- **smart_alerts** - Intelligent notifications
- **engagement_snapshots** - Historical engagement data
- **user_learning** - Learning patterns

## Row Level Security (RLS)

Your database has RLS enabled by default. Users can only:
- View and edit their own data
- View public candidate tweets and scores
- Cannot access other users' private data

## Supabase Features You're Using

1. **Authentication** - Twitter OAuth
2. **Database** - PostgreSQL with real-time capabilities
3. **Row Level Security** - Automatic data protection
4. **Auto-generated APIs** - REST and GraphQL endpoints
5. **Realtime** - Live data subscriptions (optional to enable)

## Troubleshooting

### Authentication Issues
- Verify Twitter OAuth credentials in Supabase Dashboard
- Check callback URLs match exactly
- Ensure environment variables are set correctly

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check API keys are valid
- Ensure RLS policies allow your queries

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run build`
- Verify environment variables are set in Vercel

## Next Steps

1. **Enable Realtime** (optional):
   - Supabase Dashboard → Database → Replication
   - Enable replication for tables you want real-time updates

2. **Set up monitoring**:
   - Configure Supabase email alerts
   - Set up Vercel monitoring

3. **Optimize performance**:
   - Add database indexes for frequently queried fields
   - Enable caching in Vercel

4. **Backup strategy**:
   - Supabase automatically backs up your database
   - Consider exporting data periodically

## Cost Estimation

**Supabase Free Tier includes:**
- 500MB database space
- 2GB file storage
- 50,000 monthly active users
- Unlimited API requests

**Vercel Free Tier includes:**
- 100GB bandwidth
- Unlimited deployments
- Automatic HTTPS

Both should be sufficient for initial launch and testing.

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Vercel Docs: https://vercel.com/docs

## Migration Complete! 🎉

You've successfully migrated from Prisma to Supabase. Your app now uses:
- ✅ Supabase Auth instead of NextAuth
- ✅ Supabase Database instead of Prisma ORM
- ✅ Built-in Row Level Security
- ✅ Auto-generated REST APIs
- ✅ Real-time capabilities (optional)
