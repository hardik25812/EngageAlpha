# Supabase Setup Guide for EngageAlpha

## Overview
This guide covers the complete Supabase setup for EngageAlpha, including database schema, authentication, and API configuration.

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `engagealpha` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works for development

## 2. Database Setup

### Option A: Using Prisma (Recommended)

1. **Set up your `.env` file**:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

2. **Run Prisma migrations**:
```bash
npx prisma generate
npx prisma db push
```

### Option B: Direct SQL (Alternative)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist table (for landing page)
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

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  max_alerts_per_day INTEGER DEFAULT 10,
  min_predicted_impressions INTEGER DEFAULT 1000,
  time_window_start INTEGER DEFAULT 9,
  time_window_end INTEGER DEFAULT 21,
  preferred_reply_styles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Targets (accounts/keywords to monitor)
CREATE TABLE IF NOT EXISTS public.targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ACCOUNT', 'KEYWORD', 'LIST')),
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate tweets
CREATE TABLE IF NOT EXISTS public.candidate_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_id TEXT UNIQUE NOT NULL,
  author_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_followers INTEGER NOT NULL,
  author_image TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  is_thread BOOLEAN DEFAULT false,
  thread_position INTEGER
);

-- Scores
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID NOT NULL REFERENCES public.candidate_tweets(id) ON DELETE CASCADE,
  velocity_score FLOAT NOT NULL,
  velocity_raw JSONB NOT NULL,
  saturation_score FLOAT NOT NULL,
  saturation_raw JSONB NOT NULL,
  author_fatigue_score FLOAT NOT NULL,
  author_fatigue_raw JSONB NOT NULL,
  audience_overlap_score FLOAT NOT NULL,
  audience_overlap_raw JSONB NOT NULL,
  reply_fit_score FLOAT NOT NULL,
  reply_fit_raw JSONB NOT NULL,
  final_score FLOAT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attention decay tracking
CREATE TABLE IF NOT EXISTS public.attention_decay (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID UNIQUE NOT NULL REFERENCES public.candidate_tweets(id) ON DELETE CASCADE,
  half_life INTEGER NOT NULL,
  active_lifespan INTEGER NOT NULL,
  revive_probability FLOAT NOT NULL,
  decay_velocity FLOAT NOT NULL,
  current_phase TEXT DEFAULT 'GROWTH' CHECK (current_phase IN ('GROWTH', 'PEAK', 'DECAY', 'FLATLINE')),
  revive_window_start TIMESTAMPTZ,
  revive_window_end TIMESTAMPTZ,
  engagement_history JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart alerts
CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_tweet_id UUID REFERENCES public.candidate_tweets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('REPLY_NOW', 'REVIVE_SIGNAL', 'WINDOW_CLOSING', 'AUTHOR_ACTIVE', 'VELOCITY_SPIKE')),
  urgency TEXT NOT NULL CHECK (urgency IN ('CRITICAL', 'HIGH', 'MEDIUM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  optimal_window INTEGER,
  closing_window INTEGER,
  dismissed BOOLEAN DEFAULT false,
  acted_on BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Engagement snapshots
CREATE TABLE IF NOT EXISTS public.engagement_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_tweet_id UUID NOT NULL REFERENCES public.candidate_tweets(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL,
  retweets INTEGER NOT NULL,
  replies INTEGER NOT NULL,
  quotes INTEGER DEFAULT 0,
  impressions INTEGER,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- User learning data
CREATE TABLE IF NOT EXISTS public.user_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  best_authors JSONB DEFAULT '[]',
  best_topics JSONB DEFAULT '[]',
  best_reply_styles JSONB DEFAULT '[]',
  best_posting_hours JSONB DEFAULT '[]',
  avg_half_life FLOAT,
  avg_revival_success FLOAT,
  total_replies INTEGER DEFAULT 0,
  successful_replies INTEGER DEFAULT 0,
  avg_impressions_gained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON public.targets(user_id);
CREATE INDEX IF NOT EXISTS idx_targets_type_value ON public.targets(type, value);
CREATE INDEX IF NOT EXISTS idx_candidate_tweets_tweet_id ON public.candidate_tweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tweets_author_id ON public.candidate_tweets(author_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tweets_created_at ON public.candidate_tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_scores_candidate_tweet_id ON public.scores(candidate_tweet_id);
CREATE INDEX IF NOT EXISTS idx_scores_final_score ON public.scores(final_score);
CREATE INDEX IF NOT EXISTS idx_attention_decay_phase ON public.attention_decay(current_phase);
CREATE INDEX IF NOT EXISTS idx_attention_decay_revive_prob ON public.attention_decay(revive_probability);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_dismissed ON public.smart_alerts(user_id, dismissed);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_type ON public.smart_alerts(type);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_urgency ON public.smart_alerts(urgency);
CREATE INDEX IF NOT EXISTS idx_engagement_snapshots_tweet_time ON public.engagement_snapshots(candidate_tweet_id, captured_at);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waitlist (public insert only)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view waitlist" ON public.waitlist
  FOR SELECT USING (false);

-- RLS Policies for users (users can view their own data)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for targets
CREATE POLICY "Users can manage own targets" ON public.targets
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for smart alerts
CREATE POLICY "Users can view own alerts" ON public.smart_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.smart_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user learning
CREATE POLICY "Users can view own learning data" ON public.user_learning
  FOR SELECT USING (auth.uid() = user_id);
```

## 3. Authentication Setup

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Email** provider
3. Configure email templates (optional but recommended)

### Enable OAuth (Twitter/X)

1. Go to **Authentication** → **Providers**
2. Enable **Twitter** provider
3. Add your Twitter OAuth credentials:
   - **Client ID**: From Twitter Developer Portal
   - **Client Secret**: From Twitter Developer Portal
   - **Callback URL**: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### Twitter Developer Setup

1. Go to [https://developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Enable OAuth 2.0
4. Add callback URL: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

## 4. API Keys

Get your keys from Supabase Dashboard → **Settings** → **API**:

- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **Anon/Public Key**: Used in client-side code
- **Service Role Key**: Used in server-side code (KEEP SECRET!)

## 5. Storage Setup (Optional - for user avatars)

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket: `avatars`
3. Set bucket to **Public**
4. Add RLS policies:

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

## 6. Edge Functions (For Background Jobs)

### Create Edge Function for Tweet Monitoring

```bash
supabase functions new monitor-tweets
```

This will be used later for:
- Fetching tweets from Twitter API
- Computing attention decay scores
- Generating smart alerts

## 7. Environment Variables

Create `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Database (for Prisma)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Twitter API (for main app)
TWITTER_API_KEY=[YOUR-TWITTER-API-KEY]
TWITTER_API_SECRET=[YOUR-TWITTER-API-SECRET]
TWITTER_BEARER_TOKEN=[YOUR-TWITTER-BEARER-TOKEN]

# NextAuth (for main app)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[GENERATE-RANDOM-STRING]
```

## 8. Testing Connection

Create a test API route to verify Supabase connection:

```typescript
// app/api/test-supabase/route.ts
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('count')
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json({ success: true, data })
}
```

## 9. Waitlist API for Landing Page

The landing page needs a simple waitlist endpoint. Create:

```typescript
// app/api/waitlist/route.ts
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { email, name, twitterHandle, referralSource } = await request.json()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('waitlist')
    .insert([
      {
        email,
        name,
        twitter_handle: twitterHandle,
        referral_source: referralSource,
        status: 'pending'
      }
    ])
    .select()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
  
  return Response.json({ success: true, data })
}
```

## 10. Next Steps

1. ✅ Create Supabase project
2. ✅ Run database schema (SQL above)
3. ✅ Enable authentication providers
4. ✅ Copy API keys to `.env.local`
5. ✅ Create waitlist API endpoint
6. ✅ Test connection
7. 🚀 Deploy to Vercel

## Security Checklist

- [ ] Row Level Security enabled on all tables
- [ ] Service role key kept secret (never in client code)
- [ ] CORS configured properly
- [ ] Rate limiting enabled (Supabase Dashboard → Settings → API)
- [ ] Email verification enabled for production
- [ ] Backup policy configured

## Useful Supabase CLI Commands

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Generate TypeScript types
supabase gen types typescript --linked > types/supabase.ts

# Run migrations
supabase db push
```

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
