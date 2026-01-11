# EngageAlpha - Navigation & Architecture

## 🗺️ Complete Navigation Map

### Public Routes (Landing Page - Currently Deployed)

```
/ (root)
├── Landing Page
│   ├── Hero Section
│   ├── Problem Statement
│   ├── Product Preview
│   ├── How It Works
│   ├── Social Proof
│   └── CTA + Waitlist
│
└── /api/waitlist
    ├── POST - Join waitlist
    └── GET - Health check
```

### Protected Routes (Main App - Deploy Later)

```
/feed
├── Real-time opportunities feed
├── Smart alerts dashboard
├── Attention decay indicators
└── Reply recommendations

/learn
├── Performance analytics
├── Learning insights
├── Best practices
└── Historical data

/onboarding
├── Connect Twitter account
├── Set preferences
├── Choose targets
└── Configure alerts

/profile
├── User settings
├── Preferences
└── Account management
```

### API Routes (Main App)

```
/api/auth/*
├── /signin - Authentication
├── /signout - Logout
├── /callback - OAuth callback
└── /session - Session management

/api/alerts/*
├── GET /api/alerts - Fetch alerts
├── POST /api/alerts/dismiss - Dismiss alert
└── PATCH /api/alerts/[id] - Update alert

/api/learning/*
├── GET /api/learning/insights - Get insights
├── POST /api/learning/feedback - Submit feedback
└── GET /api/learning/patterns - Get patterns

/api/tweets/*
├── GET /api/tweets/candidates - Fetch candidates
├── POST /api/tweets/score - Score tweet
└── GET /api/tweets/[id]/decay - Get decay data
```

---

## 🏗️ Project Architecture

### Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Radix UI (components)
- Lucide React (icons)

**Backend**
- Next.js API Routes
- Supabase (PostgreSQL)
- Prisma ORM
- NextAuth.js (authentication)

**External APIs**
- Twitter API v2
- Supabase Auth
- Supabase Realtime

**Deployment**
- Vercel (hosting)
- Supabase (database + auth)
- GitHub (version control)

---

## 📁 File Structure

```
EngageAlpha/
├── app/
│   ├── page.tsx                    # Landing page (PUBLIC)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   │
│   ├── feed/
│   │   └── page.tsx                # Main feed (PROTECTED)
│   │
│   ├── learn/
│   │   └── page.tsx                # Learning dashboard (PROTECTED)
│   │
│   ├── onboarding/
│   │   └── page.tsx                # Onboarding flow (PROTECTED)
│   │
│   └── api/
│       ├── waitlist/
│       │   └── route.ts            # Waitlist API (PUBLIC)
│       │
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts        # NextAuth handler
│       │
│       ├── alerts/
│       │   ├── route.ts            # Alerts CRUD
│       │   └── [id]/route.ts       # Single alert
│       │
│       └── learning/
│           └── route.ts            # Learning endpoints
│
├── components/
│   ├── landing/
│   │   └── LandingPage.tsx         # Landing page component
│   │
│   ├── layout/
│   │   ├── app-layout.tsx          # Main app layout
│   │   └── navigation.tsx          # App navigation
│   │
│   ├── alerts/
│   │   └── smart-alert-card.tsx    # Alert card component
│   │
│   ├── charts/
│   │   ├── engagement-timeline.tsx # Timeline chart
│   │   └── velocity-graph.tsx      # Velocity visualization
│   │
│   └── ui/
│       ├── button.tsx              # Button component
│       ├── card.tsx                # Card component
│       └── ...                     # Other UI components
│
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── alert-engine.ts             # Alert generation logic
│   ├── attention-decay.ts          # Decay calculation
│   ├── learning-engine.ts          # Learning algorithms
│   └── prediction-engine.ts        # Prediction models
│
├── hooks/
│   ├── use-attention-decay.ts      # Decay hook
│   ├── use-smart-alerts.ts         # Alerts hook
│   └── use-realtime-opportunities.ts # Realtime hook
│
├── types/
│   ├── index.ts                    # Type definitions
│   └── next-auth.d.ts              # NextAuth types
│
├── prisma/
│   └── schema.prisma               # Database schema
│
├── middleware.ts                   # Route protection
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

---

## 🔐 Authentication Flow

### Current (Landing Page Only)
```
User visits / → Landing page → Join waitlist → Email saved to Supabase
```

### Future (Main App)
```
User visits /feed
  ↓
Middleware checks auth
  ↓
No session? → Redirect to /
  ↓
User clicks "Sign in with Twitter"
  ↓
OAuth flow via NextAuth
  ↓
Callback to /api/auth/callback
  ↓
Create/update user in Supabase
  ↓
Redirect to /onboarding (first time) or /feed
```

---

## 🗄️ Database Schema (Supabase)

### Current Tables (Landing Page)
- `waitlist` - Email signups

### Future Tables (Main App)
- `users` - User accounts
- `user_preferences` - User settings
- `targets` - Monitored accounts/keywords
- `candidate_tweets` - Potential reply opportunities
- `scores` - Tweet scoring data
- `attention_decay` - Decay tracking
- `smart_alerts` - Generated alerts
- `engagement_snapshots` - Historical engagement data
- `user_learning` - Personalized learning data
- `replies` - User's replies
- `predictions` - Reply predictions
- `outcomes` - Reply outcomes

See `prisma/schema.prisma` for complete schema.

---

## 🎨 Design System

### Colors
```css
--accent: #0ea5e9 (sky-500)
--success: #10b981 (emerald-500)
--warning: #f59e0b (amber-500)
--danger: #ef4444 (red-500)
--revive: #8b5cf6 (violet-500)

--background: #0a0a0a (dark)
--surface-1: #141414
--surface-2: #1a1a1a
--surface-3: #262626

--foreground: #fafafa
--foreground-muted: #a3a3a3
```

### Typography
- Headings: System font stack (optimized)
- Body: System font stack
- Monospace: Consolas, Monaco, 'Courier New'

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

---

## 🔄 Data Flow

### Landing Page (Current)
```
User Input (email)
  ↓
Client-side validation
  ↓
POST /api/waitlist
  ↓
Supabase insert
  ↓
Success response
  ↓
Show confirmation
```

### Main App (Future)
```
Twitter API
  ↓
Fetch candidate tweets
  ↓
Score with prediction engine
  ↓
Calculate attention decay
  ↓
Generate smart alerts
  ↓
Store in Supabase
  ↓
Realtime updates to client
  ↓
User sees opportunities in /feed
```

---

## 🚀 Deployment Strategy

### Phase 1: Landing Page (Current)
✅ Deploy to Vercel
✅ Connect Supabase
✅ Collect waitlist signups
✅ Monitor analytics

### Phase 2: Main App (Future)
1. Complete Twitter API integration
2. Test authentication locally
3. Set up all environment variables
4. Deploy to Vercel (same project)
5. Enable protected routes
6. Launch to waitlist users

### Phase 3: Scale
1. Add caching (Redis)
2. Optimize database queries
3. Add background jobs (Vercel Cron)
4. Implement rate limiting
5. Add monitoring (Sentry)

---

## 🔌 Supabase Integration

### Client-side (Public)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Server-side (Protected)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Realtime (Main App)
```typescript
const channel = supabase
  .channel('smart-alerts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'smart_alerts' },
    (payload) => {
      // Handle new alert
    }
  )
  .subscribe()
```

---

## 📊 Key Features

### Landing Page (Live Now)
- ✅ Animated hero section
- ✅ Problem/solution narrative
- ✅ Product preview
- ✅ Waitlist signup
- ✅ Responsive design
- ✅ Performance optimized

### Main App (Coming Soon)
- 🔄 Real-time opportunity feed
- 🔄 Smart alert system
- 🔄 Attention decay tracking
- 🔄 Learning engine
- 🔄 Performance analytics
- 🔄 Twitter integration

---

## 🛠️ Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name
```

### Deployment
```bash
# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub (auto-deploys to Vercel)
git push origin main
```

---

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use Vercel environment variables
- ✅ Separate keys for dev/prod
- ✅ Rotate keys regularly

### Authentication
- ✅ Row Level Security on all tables
- ✅ JWT-based sessions
- ✅ HTTPS only
- ✅ CSRF protection

### API Security
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

---

## 📈 Performance Optimization

### Current Optimizations
- ✅ Server Components (Next.js 15)
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Font optimization
- ✅ CSS minification
- ✅ Gzip compression (Vercel)

### Future Optimizations
- 🔄 Redis caching
- 🔄 Database indexing
- 🔄 Query optimization
- 🔄 CDN for assets
- 🔄 Service worker (PWA)

---

## 🧪 Testing Strategy

### Current
- Manual testing of landing page
- Waitlist form validation

### Future
- Unit tests (Jest)
- Integration tests (Playwright)
- E2E tests (Cypress)
- Load testing (k6)

---

## 📚 Documentation

- `README.md` - Project overview
- `SUPABASE_SETUP.md` - Database setup
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Quick start
- `NAVIGATION_AND_ARCHITECTURE.md` - This file
- `API_KEYS_SETUP.md` - API configuration
- `SETUP.md` - Development setup

---

## 🆘 Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

**Last Updated**: January 2026  
**Version**: 1.0.0 (Landing Page)  
**Status**: Landing page deployed, main app in development
