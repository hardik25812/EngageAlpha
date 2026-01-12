# Vercel Environment Variables Setup

## ❌ Current Error

```
Error: supabaseUrl is required.
```

This means your Vercel deployment is missing the required environment variables.

## ✅ Required Environment Variables for Vercel

You need to add **ALL** of these environment variables to your Vercel project:

### 1. Supabase Variables (REQUIRED)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### 2. SMTP Variables (REQUIRED for email notifications)

```
GMAIL_USER
GMAIL_APP_PASSWORD
```

## 🚀 How to Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your **EngageAlpha** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Each Variable

For **each** variable below, click **Add New** and enter:

#### Supabase URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://abcdefghijk.supabase.co`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Supabase Anon Key
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key (starts with `eyJ...`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Supabase Service Role Key
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service role key (starts with `eyJ...`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Gmail User
- **Key**: `GMAIL_USER`
- **Value**: Your Gmail address (e.g., `hello@yourdomain.com`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Gmail App Password
- **Key**: `GMAIL_APP_PASSWORD`
- **Value**: Your 16-character Gmail app password (e.g., `abcd efgh ijkl mnop`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Find the latest failed deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**

OR simply push a new commit to trigger auto-deployment.

## 📍 Where to Find Your Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Select your **EngageAlpha** project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** section

You'll find:
- **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" to see it)

## 📍 Where to Get Gmail App Password

See the **SMTP_SETUP_GUIDE.md** file for detailed instructions on generating a Gmail App Password.

Quick steps:
1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Create app password for "EngageAlpha"
4. Copy the 16-character password

## ⚠️ Important Notes

- **Never commit `.env` file to Git** - It's already in `.gitignore`
- **All 5 variables are REQUIRED** - Missing any will cause build failures
- **Check all 3 environments** - Production, Preview, and Development
- **Redeploy after adding** - Changes only take effect after redeployment

## 🔍 Verify Setup

After adding variables and redeploying:

1. Check the Vercel deployment logs
2. Look for "✓ Compiled successfully" message
3. Visit your live site
4. Test the waitlist signup form
5. Verify you receive the confirmation email

## 🐛 Troubleshooting

### Build still failing?

1. **Double-check variable names** - They must match exactly (case-sensitive)
2. **Verify all 5 variables are added** - Missing even one will cause errors
3. **Check for typos** - Especially in the Supabase URL and keys
4. **Ensure environments are selected** - All three checkboxes should be checked
5. **Try manual redeploy** - Sometimes auto-deploy doesn't pick up changes

### "Invalid API key" error?

- Make sure you're using the **anon key** for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you're using the **service_role key** for `SUPABASE_SERVICE_ROLE_KEY`
- Don't mix them up!

### Email not sending?

- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
- Make sure you're using the **app password**, not your regular Gmail password
- Check that 2-Factor Authentication is enabled on your Google Account

## ✅ Checklist

Before redeploying, verify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel
- [ ] `GMAIL_USER` added to Vercel
- [ ] `GMAIL_APP_PASSWORD` added to Vercel
- [ ] All variables have Production, Preview, and Development checked
- [ ] No typos in variable names or values
- [ ] Ready to redeploy

## 🎯 Quick Summary

**The error occurs because:**
- Vercel doesn't have access to your local `.env` file
- You must manually add all environment variables to Vercel's dashboard

**To fix:**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add all 5 variables listed above
3. Redeploy your project
4. Build should succeed ✅

---

**Need the values?** Check your local `.env` file or Supabase dashboard for the credentials.
