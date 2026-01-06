# EngageAlpha Setup Guide

## Quick Start

Follow these steps to get EngageAlpha running on your local machine.

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Prisma
- NextAuth
- Tailwind CSS
- ShadCN UI components
- Framer Motion

### 2. Set Up PostgreSQL Database

You need a PostgreSQL database. You have several options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu/Debian

# Create database
createdb engagealpha
```

#### Option B: Docker
```bash
docker run --name engagealpha-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=engagealpha -p 5432:5432 -d postgres:15
```

#### Option C: Hosted Database
Use services like:
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/engagealpha?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Twitter OAuth (Optional for development)
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting Twitter API Credentials

To enable Twitter OAuth:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App
3. Enable OAuth 2.0
4. Add `http://localhost:3000/api/auth/callback/twitter` as a redirect URL
5. Copy your Client ID and Client Secret
6. Add them to your `.env` file

## Common Issues

### Database Connection Issues

**Problem**: "Can't connect to database"

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Ensure the database exists: `psql -l`

### Prisma Client Issues

**Problem**: "Cannot find module '@prisma/client'"

**Solution**:
```bash
npx prisma generate
```

### Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:
```bash
# Find and kill the process
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Development Workflow

### Making Database Changes

1. Update `prisma/schema.prisma`
2. Generate migration:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. Prisma Client will auto-regenerate

### Adding New Pages

1. Create file in `app/your-page/page.tsx`
2. Add route to navigation in `components/layout/navigation.tsx`

### Adding New Components

1. Create component in appropriate folder:
   - `components/ui/` for base UI components
   - `components/opportunity/` for opportunity-related
   - `components/reply/` for reply-related
2. Export from component file

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add database: `railway add`
5. Deploy: `railway up`

### Docker

```bash
# Build
docker build -t engagealpha .

# Run
docker run -p 3000:3000 engagealpha
```

## Testing

Currently using mock data for development. To test:

1. Navigate to `/radar` - See opportunity cards
2. Click any card - Opens side panel with details
3. Click "Reply Now" - Opens reply composer
4. Navigate to `/wins` - See example outcomes
5. Navigate to `/onboarding` - Test user setup flow

## Next Steps

1. Integrate with Twitter API v2 for real tweet discovery
2. Implement background jobs for continuous monitoring
3. Add user authentication flow
4. Set up webhook for real-time alerts
5. Implement outcome tracking with Twitter API

## Support

For issues or questions:
- Check GitHub Issues
- Review documentation
- Contact development team
