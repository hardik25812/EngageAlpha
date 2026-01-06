# EngageAlpha

**Decision Intelligence for X (Twitter)**

EngageAlpha helps creators and operators identify which tweets to reply to, when, and why to maximize growth on X (Twitter).

## Features

- **Radar Dashboard**: Real-time high-leverage reply opportunities ranked by AI-powered scoring
- **Opportunity Scoring Engine**: Multi-factor analysis including velocity, saturation, author fatigue, and audience overlap
- **Reply Composer**: Strategic reply suggestions with outcome predictions
- **Wins Tracking**: Learn from successful replies with detailed insights
- **Personalization Engine**: Adapts to your style and improves recommendations over time
- **Clean, Professional UI**: Dark-mode first, inspired by TweetHunter

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion
- React 19

### Backend
- Node.js
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- X (Twitter) Developer Account (for OAuth)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/engagealpha"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   TWITTER_CLIENT_ID="your-twitter-client-id"
   TWITTER_CLIENT_SECRET="your-twitter-client-secret"
   ```

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
EngageAlpha/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth configuration
│   │   └── opportunities/   # Opportunity endpoints
│   ├── radar/               # Main dashboard
│   ├── wins/                # Successful replies
│   ├── feed/                # Broader monitoring
│   ├── learn/               # Education center
│   ├── upgrade/             # Pricing page
│   └── onboarding/          # User setup flow
├── components/              # React components
│   ├── ui/                  # Base UI components (ShadCN)
│   ├── layout/              # Layout components
│   ├── opportunity/         # Opportunity-specific components
│   └── reply/               # Reply composer
├── lib/                     # Utility libraries
│   ├── prisma.ts            # Prisma client
│   ├── scoring-engine.ts    # Opportunity scoring logic
│   ├── tweet-discovery.ts   # Tweet fetching service
│   └── utils.ts             # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma
└── hooks/                   # Custom React hooks
    └── use-toast.ts
```

## Core Concepts

### Opportunity Scoring

Each tweet is scored (0-100) based on five factors:

1. **Velocity (30%)**: Engagement growth rate and freshness
2. **Saturation (25%)**: Reply count and density
3. **Author Fatigue (20%)**: Author activity and responsiveness
4. **Audience Overlap (15%)**: Topic alignment with your expertise
5. **Reply Fit (10%)**: Historical performance in similar contexts

### User Flow

1. **Onboarding**: Connect X account, add target accounts/keywords, set preferences
2. **Discovery**: Background service continuously fetches candidate tweets
3. **Scoring**: Each tweet is analyzed and scored in real-time
4. **Alerts**: High-scoring opportunities trigger notifications
5. **Reply**: Strategic reply composer with outcome predictions
6. **Tracking**: Results are measured and fed back into the learning engine
7. **Personalization**: System adapts to your patterns and preferences

## Database Schema

Key entities:
- `User`: User accounts and authentication
- `Target`: Monitored accounts, keywords, and lists
- `CandidateTweet`: Discovered tweets awaiting scoring
- `Score`: Multi-factor opportunity scores
- `Alert`: Triggered notifications
- `Reply`: User replies and their metadata
- `Outcome`: Measured results from replies
- `LearningSignal`: Personalization data

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - OAuth and email authentication

### Opportunities
- `GET /api/opportunities` - Fetch scored opportunities
- `POST /api/opportunities` - Add new candidate tweets

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-postgres-url"
NEXTAUTH_URL="https://engagealpha.pro"
NEXTAUTH_SECRET="secure-production-secret"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

## Development

### Run Prisma Studio
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
```

### Build for Production
```bash
npm run build
npm start
```

## Design Philosophy

- **Calm and professional**: No clutter, no gamification spam
- **Intelligence-driven**: Signals over raw numbers
- **List-based scanning**: Easy to review opportunities quickly
- **Side panels over page reloads**: Smooth, efficient UX
- **One primary action per screen**: Clear decision-making

## Contributing

This is a production application. For feature requests or bug reports, please contact the development team.

## License

Proprietary - All rights reserved

## Support

For support, email support@engagealpha.pro or visit our Help Center.
