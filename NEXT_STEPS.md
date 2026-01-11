# Next Steps - Complete the Migration

## ✅ What's Done

The core migration from Prisma to Supabase is complete:

- ✅ Supabase dependencies installed
- ✅ Supabase client configuration created
- ✅ Database schema converted to SQL migration
- ✅ Auth system migrated to Supabase Auth
- ✅ Core API routes updated (opportunities, alerts)
- ✅ Environment variables configured
- ✅ Comprehensive documentation created

## ⚠️ What Needs to Be Done

The following files still reference Prisma and need to be updated to use Supabase:

### Library Files (High Priority)
1. **`lib/alert-engine.ts`** - Alert generation logic
2. **`lib/attention-decay.ts`** - Decay metrics calculation
3. **`lib/learning-engine.ts`** - Learning algorithm
4. **`lib/prediction-engine.ts`** - Prediction logic
5. **`lib/realtime-scoring.ts`** - Real-time scoring
6. **`lib/scoring-engine.ts`** - Opportunity scoring
7. **`lib/tweet-discovery.ts`** - Tweet fetching

### Remaining API Routes
8. **`app/api/alerts/dismiss/route.ts`**
9. **`app/api/learning/refresh/route.ts`**
10. **`app/api/opportunities/[id]/decay/route.ts`**
11. **`app/api/opportunities/[id]/score/route.ts`**
12. **`app/api/opportunities/reviveable/route.ts`**
13. **`app/api/predictions/[id]/route.ts`**
14. **`app/api/snapshots/capture/route.ts`**

### Components & Pages
15. Any components using `useSession` from next-auth
16. Any components using auth state
17. Layout components with auth checks

## 🔧 How to Update Remaining Files

### Pattern for Library Files

**Before (Prisma):**
```typescript
import { prisma } from '@/lib/prisma'

export async function someFunction() {
  const data = await prisma.candidateTweet.findMany({
    where: { id: tweetId }
  })
}
```

**After (Supabase):**
```typescript
import { createRouteClient } from '@/lib/supabase/server'

export async function someFunction() {
  const supabase = await createRouteClient()
  const { data } = await supabase
    .from('candidate_tweets')
    .select('*')
    .eq('id', tweetId)
}
```

### Pattern for Client Components

**Before (NextAuth):**
```typescript
import { useSession } from 'next-auth/react'

export function Component() {
  const { data: session } = useSession()
  const user = session?.user
}
```

**After (Supabase):**
```typescript
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export function Component() {
  const supabase = useSupabaseClient()
  const user = useUser()
}
```

## 🚀 Deployment Checklist

### Before First Deploy

- [ ] Run `npm install` to install Supabase packages
- [ ] Create Supabase project
- [ ] Run database migration SQL
- [ ] Configure Twitter OAuth in Supabase
- [ ] Set up environment variables locally
- [ ] Test authentication locally
- [ ] Test API routes locally

### Vercel Deployment

- [ ] Push code to GitHub
- [ ] Import repository to Vercel
- [ ] Add environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy
- [ ] Update Twitter OAuth callback URL with Vercel domain
- [ ] Test production deployment

### Post-Deployment

- [ ] Verify authentication works
- [ ] Test all API endpoints
- [ ] Check Supabase logs for errors
- [ ] Monitor Vercel logs
- [ ] Set up error tracking (optional)

## 📝 Files to Delete (After Testing)

Once everything is working, you can safely delete:

- `lib/prisma.ts`
- `prisma/schema.prisma`
- `app/api/auth/[...nextauth]/route.ts`
- `prisma/` directory (entire folder)

## 🔍 Testing Strategy

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Test Twitter login
   - Test fetching opportunities
   - Test creating alerts
   - Check browser console for errors

2. **Database Verification:**
   - Open Supabase Studio
   - Check that data is being inserted
   - Verify RLS policies work

3. **Production Testing:**
   - Deploy to Vercel
   - Test all features in production
   - Monitor logs for issues

## 🆘 Common Issues & Solutions

### "Cannot find module '@supabase/...'"
**Solution:** Run `npm install`

### "Invalid API key"
**Solution:** Check environment variables are set correctly

### "Row Level Security policy violation"
**Solution:** Check RLS policies in Supabase Dashboard → Authentication → Policies

### "Twitter OAuth not working"
**Solution:** 
- Verify callback URLs match exactly
- Check Twitter credentials in Supabase
- Ensure Twitter app is approved

### TypeScript errors about database types
**Solution:** The types in `types/supabase.ts` may need adjustment based on your actual schema

## 📚 Documentation Reference

- **Quick Start:** `QUICKSTART.md` - Get running in 10 minutes
- **Full Deployment:** `SUPABASE_DEPLOYMENT.md` - Complete deployment guide
- **Migration Details:** `MIGRATION_SUMMARY.md` - What changed and why
- **This File:** `NEXT_STEPS.md` - What to do next

## 💡 Optional Enhancements

Once the basic migration is complete, consider:

1. **Enable Realtime:**
   - Supabase Dashboard → Database → Replication
   - Enable for tables you want live updates

2. **Add Database Indexes:**
   - Optimize frequently queried fields
   - Improve query performance

3. **Set up Monitoring:**
   - Supabase email alerts
   - Vercel monitoring
   - Error tracking (Sentry, etc.)

4. **Implement Caching:**
   - Use Vercel Edge caching
   - Implement client-side caching

## 🎯 Priority Order

1. **First:** Update library files (they're used by API routes)
2. **Second:** Update remaining API routes
3. **Third:** Update components and hooks
4. **Fourth:** Test everything thoroughly
5. **Fifth:** Deploy to production

## ✨ You're Almost There!

The hardest part is done. The core infrastructure is migrated. Now it's just updating the remaining files to use Supabase instead of Prisma.

Each file follows the same pattern - just replace Prisma queries with Supabase queries and update field names from camelCase to snake_case.

Good luck! 🚀
