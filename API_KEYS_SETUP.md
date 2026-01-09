# EngageAlpha - API Keys & Environment Variables Complete Setup

---

## 🔑 ALL REQUIRED KEYS & CREDENTIALS

### 1. TWITTER API v2 - Bearer Token

**Purpose:** Real-time tweet discovery, engagement metrics, user data

**How to Get:**
1. Visit https://developer.twitter.com/en/portal/dashboard
2. Create/Select your Project
3. Go to **Keys and Tokens** tab
4. Under **Bearer Token**, click **Generate**
5. Copy the token immediately (shown only once)
6. Store securely in `.env`

**Environment Variable:**
```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAAAA...
```

**Free Tier Limits:**
- 500,000 tweets/month read
- 300 requests/15 minutes
- Sufficient for development & production

**Usage in Code:**
```typescript
// lib/tweet-discovery.ts
const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
  headers: {
    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
})
```

**API Endpoints Available:**
- `GET /2/tweets/search/recent` - Search recent tweets
- `GET /2/users/:id/tweets` - Get user's tweets
- `GET /2/tweets/:id` - Get tweet details
- `GET /2/tweets/:id/liking_users` - Get who liked
- `GET /2/tweets/:id/retweeted_by` - Get who retweeted

---

### 2. Twitter OAuth - Client ID & Secret

**Purpose:** User authentication via Twitter OAuth 2.0

**How to Get:**

#### Step 1: Enable OAuth 2.0
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Select your App
3. Go to **App Settings**
4. Scroll to **Authentication Settings**
5. Enable **OAuth 2.0**
6. Set **Callback URLs:**
   - Development: `http://localhost:3000/api/auth/callback/twitter`
   - Production: `https://yourdomain.com/api/auth/callback/twitter`
7. Set **Website URL:** `https://yourdomain.com`
8. Save

#### Step 2: Get Credentials
1. Go to **Keys and Tokens** tab
2. Copy **API Key** → `TWITTER_CLIENT_ID`
3. Copy **API Secret Key** → `TWITTER_CLIENT_SECRET`

**Environment Variables:**
```env
TWITTER_CLIENT_ID=your_api_key_here
TWITTER_CLIENT_SECRET=your_api_secret_here
```

**Usage in Code:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import TwitterProvider from "next-auth/providers/twitter"

export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
  ],
}
```

---

### 3. NextAuth Configuration

**Purpose:** Session management and authentication

#### NEXTAUTH_URL
```env
# Development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://yourdomain.com
```

#### NEXTAUTH_SECRET
Generate a secure random string (minimum 32 characters):

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Using online generator**
Visit https://generate-secret.vercel.app/

**Store in .env:**
```env
NEXTAUTH_SECRET=your-random-secret-min-32-chars
```

---

### 4. Database - PostgreSQL

**Purpose:** Store users, tweets, scores, outcomes, learning data

**How to Get:**

#### Option A: Local Development
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Linux

# Start service
brew services start postgresql

# Create database
createdb engagealpha

# Get connection string
DATABASE_URL="postgresql://username:password@localhost:5432/engagealpha"
```

#### Option B: Cloud Database (Recommended for Production)

**Using Supabase (PostgreSQL):**
1. Visit https://supabase.com
2. Create new project
3. Go to **Settings** → **Database**
4. Copy **Connection string** (URI format)
5. Use in `.env`

**Using Railway:**
1. Visit https://railway.app
2. Create new project
3. Add PostgreSQL plugin
4. Copy connection string

**Using Vercel Postgres:**
1. Visit https://vercel.com/storage/postgres
2. Create new database
3. Copy connection string

**Environment Variable:**
```env
DATABASE_URL="postgresql://user:password@host:5432/engagealpha"
```

**Prisma Configuration:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 5. Optional: Email Service (For Notifications)

**Purpose:** Send email alerts and notifications

#### Using SendGrid
1. Visit https://sendgrid.com
2. Create account
3. Go to **Settings** → **API Keys**
4. Create new API key
5. Store in `.env`

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@engagealpha.pro
```

#### Using Resend
1. Visit https://resend.com
2. Create account
3. Go to **API Keys**
4. Copy API key

```env
RESEND_API_KEY=re_your_api_key_here
```

---

### 6. Optional: Analytics & Monitoring

#### Using Sentry (Error Tracking)
```env
SENTRY_DSN=https://key@sentry.io/project_id
```

#### Using PostHog (Product Analytics)
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 📝 COMPLETE .env TEMPLATE

Create `.env.local` in project root:

```env
# ============================================
# REQUIRED - Twitter API
# ============================================
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAAAA...
TWITTER_CLIENT_ID=your_api_key_here
TWITTER_CLIENT_SECRET=your_api_secret_here

# ============================================
# REQUIRED - NextAuth
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

# ============================================
# REQUIRED - Database
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/engagealpha"

# ============================================
# OPTIONAL - Email Service
# ============================================
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@engagealpha.pro

# ============================================
# OPTIONAL - Cron Jobs
# ============================================
CRON_SECRET=your-cron-secret-key

# ============================================
# OPTIONAL - Redis (for caching)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# OPTIONAL - Analytics
# ============================================
SENTRY_DSN=https://key@sentry.io/project_id
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
```

---

## 🚀 SETUP CHECKLIST

### Step 1: Twitter Developer Account
- [ ] Create Twitter Developer Account
- [ ] Create App
- [ ] Enable OAuth 2.0
- [ ] Set Callback URLs
- [ ] Copy API Key → `TWITTER_CLIENT_ID`
- [ ] Copy API Secret → `TWITTER_CLIENT_SECRET`
- [ ] Generate Bearer Token → `TWITTER_BEARER_TOKEN`

### Step 2: Database
- [ ] Create PostgreSQL database (local or cloud)
- [ ] Get connection string → `DATABASE_URL`
- [ ] Test connection: `npx prisma db push`

### Step 3: NextAuth
- [ ] Generate secure secret → `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` (localhost for dev)

### Step 4: Create .env.local
- [ ] Copy template above
- [ ] Fill in all REQUIRED values
- [ ] Keep file secure (never commit to git)

### Step 5: Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with mock data
npx prisma db seed
```

### Step 6: Test Setup
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Try signing in with Twitter
```

---

## 🔒 SECURITY BEST PRACTICES

### Never Commit Secrets
```bash
# .gitignore should include:
.env
.env.local
.env.*.local
```

### Rotate Keys Regularly
- Twitter API keys: Every 90 days
- NEXTAUTH_SECRET: When deploying to production
- Database password: Every 6 months

### Use Environment-Specific Secrets
```env
# Development
TWITTER_CLIENT_ID=dev_key_...
DATABASE_URL=postgresql://localhost/engagealpha_dev

# Production (set in deployment platform)
TWITTER_CLIENT_ID=prod_key_...
DATABASE_URL=postgresql://prod-host/engagealpha
```

### Deployment Platforms

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select which environments (Development/Preview/Production)
4. Deploy

#### Railway
1. Go to Variables
2. Add each variable
3. Automatic redeploy on change

#### Heroku
```bash
heroku config:set TWITTER_BEARER_TOKEN=...
heroku config:set DATABASE_URL=...
```

---

## 🧪 TESTING YOUR SETUP

### Test Twitter API Connection
```bash
# Create test script: test-twitter-api.js
const fetch = require('node-fetch')

async function testTwitterAPI() {
  const response = await fetch(
    'https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10',
    {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  )
  const data = await response.json()
  console.log('Twitter API Response:', data)
}

testTwitterAPI()
```

Run:
```bash
TWITTER_BEARER_TOKEN=your_token node test-twitter-api.js
```

### Test Database Connection
```bash
# In Node REPL
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  const users = await prisma.user.findMany()
  console.log('Database connected! Users:', users)
}

test()
```

### Test NextAuth
1. Visit `http://localhost:3000`
2. Click "Sign In"
3. Click "Sign in with Twitter"
4. Authorize app
5. Should redirect back with session

---

## 🆘 TROUBLESHOOTING

### "Invalid Bearer Token"
- [ ] Check token is copied correctly (no spaces)
- [ ] Token hasn't expired (regenerate if needed)
- [ ] Bearer token is for API v2 (not v1.1)

### "Callback URL mismatch"
- [ ] Check `NEXTAUTH_URL` matches registered callback
- [ ] For localhost: `http://localhost:3000`
- [ ] For production: `https://yourdomain.com`
- [ ] No trailing slash

### "Database connection refused"
- [ ] PostgreSQL service is running
- [ ] Connection string is correct
- [ ] Database exists
- [ ] User has permissions

### "NEXTAUTH_SECRET is invalid"
- [ ] Must be minimum 32 characters
- [ ] Can't be empty
- [ ] Regenerate if needed

---

## 📊 API RATE LIMITS

### Twitter API v2 (Free Tier)
```
Tweets Search: 300 requests / 15 minutes
User Tweets: 300 requests / 15 minutes
Tweet Details: 300 requests / 15 minutes
```

**Strategy:**
- Batch requests when possible
- Implement exponential backoff
- Cache results for 5 minutes
- Use Redis for rate limit tracking

### NextAuth
- No rate limits (self-hosted)
- Implement your own if needed

### Database
- Depends on provider
- Supabase free: 500MB storage
- Railway free: $5 credit/month

---

## 🎯 NEXT STEPS

1. **Complete Setup Checklist** above
2. **Create .env.local** with all credentials
3. **Run `npm run dev`** to start development
4. **Test Twitter OAuth** by signing in
5. **Verify Database** with `npx prisma studio`
6. **Start Building** features from USE_CASES_DETAILED.md

---

## 📞 SUPPORT

**Twitter API Issues:**
- Docs: https://developer.twitter.com/en/docs/twitter-api
- Support: https://twittercommunity.com

**NextAuth Issues:**
- Docs: https://next-auth.js.org
- GitHub: https://github.com/nextauthjs/next-auth

**Database Issues:**
- Supabase: https://supabase.com/docs
- Railway: https://docs.railway.app
- PostgreSQL: https://www.postgresql.org/docs

**EngageAlpha Issues:**
- GitHub: https://github.com/hardik25812/EngageAlpha
- Email: support@engagealpha.pro
