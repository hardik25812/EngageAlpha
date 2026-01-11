# 🚀 Landing Page Deployment Checklist

## Quick Start: Deploy Landing Page to Vercel in 15 Minutes

This checklist will get your EngageAlpha landing page live on Vercel with Supabase backend.

---

## ✅ Phase 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and sign up/login
- [ ] Click "New Project"
- [ ] Fill in:
  - Project name: `engagealpha`
  - Database password: (generate strong password - **SAVE THIS**)
  - Region: Choose closest to your users
- [ ] Wait for project to provision (~2 minutes)

### 1.2 Create Waitlist Table
- [ ] Go to **SQL Editor** in Supabase Dashboard
- [ ] Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  twitter_handle TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (join waitlist)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only service role can view (for admin access)
CREATE POLICY "Service role can view waitlist" ON public.waitlist
  FOR SELECT USING (auth.role() = 'service_role');
```

### 1.3 Get API Keys
- [ ] Go to **Settings** → **API** in Supabase Dashboard
- [ ] Copy these values (you'll need them for Vercel):
  - `Project URL`
  - `anon public` key
  - `service_role` key (keep this secret!)

---

## ✅ Phase 2: Local Testing (3 minutes)

### 2.1 Create Environment File
- [ ] Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Test Locally
```bash
npm run dev
```

- [ ] Open http://localhost:3000
- [ ] Test waitlist form
- [ ] Check Supabase dashboard to confirm entry was saved

---

## ✅ Phase 3: GitHub Setup (2 minutes)

### 3.1 Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - Landing page ready"
```

### 3.2 Create GitHub Repository
- [ ] Go to [github.com/new](https://github.com/new)
- [ ] Create new repository: `engagealpha`
- [ ] Don't initialize with README (you already have code)

### 3.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR-USERNAME/engagealpha.git
git branch -M main
git push -u origin main
```

---

## ✅ Phase 4: Vercel Deployment (5 minutes)

### 4.1 Import Project
- [ ] Go to [vercel.com](https://vercel.com) and sign up/login
- [ ] Click **"Add New Project"**
- [ ] Click **"Import Git Repository"**
- [ ] Select your `engagealpha` repository
- [ ] Click **"Import"**

### 4.2 Configure Build Settings
Vercel should auto-detect Next.js. Verify:
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`

### 4.3 Add Environment Variables
Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_SUPABASE_URL = https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY = [YOUR-SERVICE-ROLE-KEY]
```

**Important**: Add to **all environments** (Production, Preview, Development)

### 4.4 Deploy
- [ ] Click **"Deploy"**
- [ ] Wait 2-3 minutes for build to complete
- [ ] You'll get a URL like: `https://engagealpha.vercel.app`

---

## ✅ Phase 5: Verification (2 minutes)

### 5.1 Test Live Site
- [ ] Visit your Vercel URL
- [ ] Landing page loads correctly
- [ ] Animations work smoothly
- [ ] Navigation works

### 5.2 Test Waitlist Form
- [ ] Fill out waitlist form with test email
- [ ] Submit form
- [ ] Should see success message
- [ ] Check Supabase dashboard → **Table Editor** → `waitlist`
- [ ] Confirm your test entry appears

### 5.3 Test API Endpoint
- [ ] Visit: `https://your-site.vercel.app/api/waitlist`
- [ ] Should see: `{"message":"Waitlist API is running"}`

---

## 🎉 You're Live!

Your landing page is now deployed at: `https://engagealpha.vercel.app`

---

## 📊 Optional: Add Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
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

Redeploy:
```bash
git add .
git commit -m "Add Vercel Analytics"
git push
```

---

## 🌐 Optional: Custom Domain

### Add Your Domain
1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `engagealpha.com`)
3. Configure DNS at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

4. Wait 5-60 minutes for DNS propagation
5. Vercel will automatically provision SSL certificate

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Service role key is only in Vercel environment variables
- [ ] Row Level Security is enabled on waitlist table
- [ ] HTTPS is active (automatic with Vercel)
- [ ] Supabase anon key is safe to expose (it's public by design)

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found: Can't resolve '@supabase/supabase-js'`
- **Fix**: Ensure `@supabase/supabase-js` is in `dependencies` (not `devDependencies`)
- Run locally: `npm install @supabase/supabase-js`
- Commit and push: `git add package.json package-lock.json && git commit -m "Fix dependencies" && git push`

**Error**: `Environment variable not found`
- **Fix**: Double-check all 3 env vars are added in Vercel dashboard
- Make sure they're added to all environments

### Waitlist Form Not Working

**Error**: `Failed to fetch` or network error
- **Fix**: Check browser console for specific error
- Verify Supabase URL and keys are correct
- Test API endpoint: `https://your-site.vercel.app/api/waitlist`

**Error**: `This email is already on the waitlist`
- **Fix**: This is expected behavior - email is already registered
- Try a different email

**Error**: `Server configuration error`
- **Fix**: Environment variables not set correctly in Vercel
- Go to Vercel → Settings → Environment Variables
- Verify all 3 variables are present

### Page Loads But Looks Broken

**Error**: Styles not loading
- **Fix**: Clear browser cache
- Check Vercel build logs for CSS errors
- Verify Tailwind config is correct

---

## 📈 What's Next?

### Current Status
✅ Landing page is live  
✅ Waitlist is collecting emails  
✅ Analytics tracking (if added)  

### Future Deployment (Main App)
When ready to deploy the full app:
1. Complete Twitter API integration
2. Set up authentication (NextAuth + Supabase)
3. Add remaining environment variables
4. Test protected routes locally
5. Deploy with `git push` (auto-deploys to Vercel)

### Monitor Your Waitlist
- Check Supabase dashboard regularly for new signups
- Export waitlist: `SELECT * FROM waitlist ORDER BY created_at DESC`
- Track conversion rate with Vercel Analytics

---

## 📚 Resources

- **Supabase Setup**: See `SUPABASE_SETUP.md` for detailed configuration
- **Vercel Deployment**: See `VERCEL_DEPLOYMENT.md` for advanced options
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🆘 Need Help?

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Next.js Discord: [nextjs.org/discord](https://nextjs.org/discord)

---

**Estimated Total Time**: 15-20 minutes  
**Cost**: $0 (Free tiers for both Vercel and Supabase)  
**Difficulty**: Beginner-friendly ✨
