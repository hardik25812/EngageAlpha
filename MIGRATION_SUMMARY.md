# Prisma to Supabase Migration Summary

## What Changed

### Removed Dependencies
- ❌ `@prisma/client`
- ❌ `@auth/prisma-adapter`
- ❌ `next-auth`
- ❌ `prisma` (dev dependency)

### Added Dependencies
- ✅ `@supabase/supabase-js`
- ✅ `@supabase/auth-helpers-nextjs`
- ✅ `@supabase/auth-helpers-react`
- ✅ `supabase` CLI (dev dependency)

## File Changes

### New Files Created
1. **`lib/supabase/client.ts`** - Browser Supabase client
2. **`lib/supabase/server.ts`** - Server-side Supabase clients
3. **`types/supabase.ts`** - TypeScript database types
4. **`supabase/migrations/20260111_initial_schema.sql`** - Database schema migration
5. **`middleware.ts`** - Auth middleware for protected routes
6. **`app/api/auth/callback/route.ts`** - OAuth callback handler
7. **`app/api/auth/signout/route.ts`** - Sign out handler
8. **`SUPABASE_DEPLOYMENT.md`** - Deployment guide

### Files to Delete (After Testing)
- `lib/prisma.ts`
- `prisma/schema.prisma`
- `app/api/auth/[...nextauth]/route.ts`

### Modified Files
- **`package.json`** - Updated dependencies
- **`.env.example`** - New environment variables
- **`app/api/opportunities/route.ts`** - Uses Supabase queries
- **`app/api/alerts/route.ts`** - Uses Supabase queries

### Files That Need Updates (Not Yet Modified)
These files still reference Prisma and need to be updated:
- `lib/alert-engine.ts`
- `lib/attention-decay.ts`
- `lib/learning-engine.ts`
- `lib/prediction-engine.ts`
- `lib/realtime-scoring.ts`
- `lib/scoring-engine.ts`
- `lib/tweet-discovery.ts`
- `app/api/alerts/dismiss/route.ts`
- `app/api/learning/refresh/route.ts`
- `app/api/opportunities/[id]/decay/route.ts`
- `app/api/opportunities/[id]/score/route.ts`
- `app/api/opportunities/reviveable/route.ts`
- `app/api/predictions/[id]/route.ts`
- `app/api/snapshots/capture/route.ts`
- Components and hooks (if they use auth)

## Database Schema Mapping

### Prisma → Supabase Naming Convention
- **camelCase** → **snake_case**
- `User` → `users`
- `CandidateTweet` → `candidate_tweets`
- `createdAt` → `created_at`
- `tweetId` → `tweet_id`

### Key Differences

#### Authentication
**Before (NextAuth):**
```typescript
import { getServerSession } from "next-auth"
const session = await getServerSession(authOptions)
const userId = session?.user?.id
```

**After (Supabase):**
```typescript
import { createRouteClient } from "@/lib/supabase/server"
const supabase = await createRouteClient()
const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
```

#### Database Queries
**Before (Prisma):**
```typescript
const tweets = await prisma.candidateTweet.findMany({
  where: { id: tweetId },
  include: { scores: true }
})
```

**After (Supabase):**
```typescript
const { data: tweets } = await supabase
  .from('candidate_tweets')
  .select('*, scores(*)')
  .eq('id', tweetId)
```

## Environment Variables

### Before
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
TWITTER_CLIENT_ID="..."
TWITTER_CLIENT_SECRET="..."
```

### After
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Authentication Flow

### Before (NextAuth)
1. User clicks "Sign in with Twitter"
2. NextAuth handles OAuth flow
3. Session stored in JWT
4. User data in Prisma database

### After (Supabase)
1. User clicks "Sign in with Twitter"
2. Supabase Auth handles OAuth flow
3. Session stored in Supabase Auth
4. User data automatically synced to `users` table
5. Row Level Security enforces data access

## Benefits of Supabase

1. **No ORM needed** - Direct SQL queries with type safety
2. **Built-in auth** - No need for NextAuth
3. **Row Level Security** - Database-level security policies
4. **Real-time subscriptions** - Optional live data updates
5. **Auto-generated APIs** - REST and GraphQL endpoints
6. **Simpler deployment** - No separate database management
7. **Better DX** - Supabase Studio for database management

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase project** (see SUPABASE_DEPLOYMENT.md)

3. **Run database migration**

4. **Update remaining lib files** to use Supabase

5. **Test locally**

6. **Deploy to Vercel**

## Rollback Plan

If you need to rollback to Prisma:
1. Restore `package.json` from git
2. Run `npm install`
3. Restore `.env` file
4. Run `npx prisma generate`
5. Revert API route changes

## Testing Checklist

- [ ] User can sign in with Twitter
- [ ] User data is saved to Supabase
- [ ] Opportunities are fetched correctly
- [ ] Alerts are created and displayed
- [ ] RLS policies work correctly
- [ ] All API routes return expected data
- [ ] No Prisma imports remain in code
