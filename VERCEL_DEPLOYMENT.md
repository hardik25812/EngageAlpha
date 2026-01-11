# Vercel Deployment Guide - Landing Page Only

## Overview
This guide shows you how to deploy **only the landing page** to Vercel while keeping the main app for later deployment.

## Strategy

We'll deploy the landing page first, then later deploy the full app. This approach:
- ✅ Gets your landing page live quickly
- ✅ Allows you to collect waitlist signups
- ✅ Keeps the main app in development
- ✅ Uses the same codebase (no duplication needed)

## Prerequisites

1. ✅ Supabase project created (see `SUPABASE_SETUP.md`)
2. ✅ Waitlist table created in Supabase
3. ✅ Waitlist API endpoint created
4. ✅ GitHub account
5. ✅ Vercel account (free tier works)

## Step 1: Prepare Your Repository

### Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Landing page ready"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR-USERNAME/engagealpha.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add:

```bash
# Supabase (Required for waitlist)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Database (Not needed for landing page, but add for future)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important**: 
- Add these to **all environments** (Production, Preview, Development)
- Never commit `.env.local` to git

## Step 4: Verify Deployment

1. Vercel will provide a URL like: `https://engagealpha.vercel.app`
2. Visit the URL
3. Test the waitlist form
4. Check Supabase dashboard to confirm entries are being saved

## Step 5: Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `engagealpha.com`)
3. Follow DNS configuration instructions:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (5-60 minutes)

## Current Landing Page Routes

Your deployment will have these routes available:

- `/` - Landing page (public)
- `/api/waitlist` - Waitlist signup endpoint

## Routes NOT Deployed Yet

These routes exist in your codebase but you'll deploy them later:

- `/feed` - Main app feed (requires auth)
- `/learn` - Learning dashboard (requires auth)
- `/onboarding` - User onboarding (requires auth)
- `/api/auth/*` - Authentication endpoints
- `/api/alerts/*` - Alert endpoints
- `/api/learning/*` - Learning endpoints

**These routes will return 404 or redirect to landing page until you deploy the full app.**

## Protecting Main App Routes (Optional)

If you want to ensure users can't access incomplete routes, add middleware:

```typescript
// middleware.ts (create this file in root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // List of routes that should be blocked for now
  const blockedRoutes = ['/feed', '/learn', '/onboarding']
  
  if (blockedRoutes.some(route => path.startsWith(route))) {
    // Redirect to landing page
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/feed/:path*', '/learn/:path*', '/onboarding/:path*']
}
```

## Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Landing page loads successfully
- [ ] Waitlist form works
- [ ] Supabase receives waitlist entries
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

## Monitoring & Analytics

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Add Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Fix**: Run `npm install` locally and commit `package-lock.json`

**Error**: `Environment variable not found`
- **Fix**: Add all required env vars in Vercel dashboard

### Waitlist Form Not Working

**Error**: `Failed to fetch` or CORS error
- **Fix**: Check Supabase API settings → CORS configuration
- Add your Vercel domain to allowed origins

**Error**: `Row Level Security policy violation`
- **Fix**: Ensure RLS policy allows public inserts to waitlist table

### Page Not Found (404)

- **Fix**: Ensure `app/page.tsx` exists and exports default component
- Check build logs in Vercel dashboard

## Next Steps: Deploying Full App

When ready to deploy the full app:

1. Complete authentication setup
2. Add Twitter API credentials to Vercel env vars
3. Test all protected routes locally
4. Remove middleware blocking (if added)
5. Deploy with `git push` (auto-deploys)

## Useful Commands

```bash
# Preview deployment (doesn't affect production)
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

## Performance Optimization

Your landing page is already optimized with:
- ✅ Next.js 15 App Router
- ✅ Server Components
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Font optimization (if using next/font)

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge caching
- ✅ Automatic HTTPS
- ✅ DDoS protection

## Cost Estimate

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics

**Supabase Free Tier includes:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**This is more than enough for your landing page!**

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
