# EngageAlpha - Complete Use Cases & Detailed Specifications

---

## 📋 TABLE OF CONTENTS
1. [Core Use Cases](#core-use-cases)
2. [User Workflows](#user-workflows)
3. [Data Models & Examples](#data-models--examples)
4. [API Endpoints](#api-endpoints)
5. [UI Components Specifications](#ui-components-specifications)
6. [Scoring Algorithms](#scoring-algorithms)
7. [Attention Decay Intelligence](#attention-decay-intelligence)
8. [Real-Time Features](#real-time-features)
9. [Integration Points](#integration-points)

---

## 🎯 CORE USE CASES

### USE CASE 1: User Setup & Onboarding

**Actor:** New Creator/Operator
**Goal:** Configure EngageAlpha to start receiving reply opportunities

**Flow:**
```
1. User visits engagealpha.pro
2. Clicks "Get Started"
3. Redirected to /onboarding

STEP 1: Connect Account
├─ User clicks "Connect X Account"
├─ OAuth flow to Twitter
├─ User grants permission
└─ Redirected back with session

STEP 2: Add Targets
├─ User enters target accounts (@username format)
├─ System validates accounts exist
├─ Stores in Target table (type: ACCOUNT)
├─ User can add multiple targets
└─ Example: @elonmusk, @paulg, @naval

STEP 3: Set Keywords
├─ User enters keywords/topics
├─ Examples: "AI agents", "SaaS", "growth marketing"
├─ Stores in Target table (type: KEYWORD)
├─ System will monitor tweets mentioning these
└─ Can add X lists (type: LIST)

STEP 4: Set Preferences
├─ Max alerts per day: 3-50 (default 10)
├─ Min predicted impressions: 500-10000
├─ Active hours: 9am-9pm (customizable)
├─ Preferred reply styles: [value_add, credibility, contrarian]
└─ Stores in UserPreferences table

COMPLETION:
├─ User redirected to /radar
├─ System starts background discovery
└─ First opportunities appear within 5 minutes
```

**Data Created:**
```typescript
// User record
{
  id: "user_123",
  email: "creator@example.com",
  name: "Sarah Chen",
  image: "https://...",
  createdAt: "2024-01-07T03:30:00Z"
}

// Targets
[
  { userId: "user_123", type: "ACCOUNT", value: "elonmusk", isActive: true },
  { userId: "user_123", type: "ACCOUNT", value: "paulg", isActive: true },
  { userId: "user_123", type: "KEYWORD", value: "AI agents", isActive: true },
  { userId: "user_123", type: "KEYWORD", value: "SaaS", isActive: true },
]

// Preferences
{
  userId: "user_123",
  maxAlertsPerDay: 10,
  minPredictedImpressions: 1000,
  timeWindowStart: 9,
  timeWindowEnd: 21,
  preferredReplyStyles: ["value_add", "credibility"]
}
```

---

### USE CASE 2: Real-Time Opportunity Discovery & Scoring

**Actor:** Background Service + User
**Goal:** Continuously find high-leverage reply opportunities

**Flow:**
```
DISCOVERY PHASE (Every 5 minutes):
├─ System queries Twitter API for:
│  ├─ Recent tweets from target accounts
│  ├─ Tweets mentioning keywords
│  └─ Tweets from user's lists
├─ Fetches engagement metrics:
│  ├─ likes, retweets, replies, impressions
│  ├─ Author follower count
│  └─ Tweet age
└─ Stores in CandidateTweet table

SCORING PHASE (Real-time):
├─ For each candidate tweet, calculate:
│  ├─ Velocity Score (30%)
│  │  ├─ Engagement rate = (likes + retweets + replies) / author_followers
│  │  ├─ Growth rate = total_engagement / minutes_old
│  │  ├─ Freshness = 100 - (minutes_old / 60 * 10)
│  │  └─ Score = (engagement_rate * 20) + (growth_rate * 10) + (freshness * 0.4)
│  │
│  ├─ Saturation Score (25%)
│  │  ├─ Reply count (current)
│  │  ├─ Reply growth rate (replies per minute)
│  │  ├─ Density = (reply_count / 50) * 100
│  │  └─ Score = 100 - (density * 0.6 + growth_rate * 20)
│  │
│  ├─ Author Fatigue Score (20%)
│  │  ├─ Tweets in last 24h
│  │  ├─ Replies in last 1h
│  │  ├─ Avg thread engagement
│  │  └─ Score = 100 - (recent_activity * 0.3) - (reply_freq * 0.4) + (engagement * 0.3)
│  │
│  ├─ Audience Overlap Score (15%)
│  │  ├─ Topic similarity (0-100)
│  │  ├─ Keyword matches (count)
│  │  ├─ Historical conversion rate
│  │  └─ Score = (similarity * 0.4) + (keywords * 0.3) + (conversion * 0.3)
│  │
│  └─ Reply Fit Score (10%)
│     ├─ User's historical performance on similar topics
│     ├─ Style match (does user's style match this opportunity?)
│     ├─ Topic success rate
│     └─ Score = (performance * 0.4) + (style * 0.3) + (topic * 0.3)
│
├─ Calculate Final Score
│  └─ Final = (velocity * 0.30) + (saturation * 0.25) + (fatigue * 0.20) + (audience * 0.15) + (fit * 0.10)
│
├─ Generate Explanation
│  └─ "This tweet is showing exceptional velocity with 12.5% engagement rate and very low reply saturation..."
│
└─ Store in Score table with all breakdown data

ALERT TRIGGERING:
├─ IF finalScore >= 75 AND todayAlerts < maxAlertsPerDay
│  ├─ Create SmartAlert record
│  ├─ Determine urgency level
│  │  ├─ CRITICAL: score >= 90 + velocity spiking
│  │  ├─ HIGH: score 80-89 or window closing soon
│  │  └─ MEDIUM: score 75-79
│  ├─ Calculate optimal reply window
│  │  └─ "Reply in next 8-14 minutes for best results"
│  └─ Send notification to user
└─ IF finalScore < 75
   └─ Store as candidate but don't alert (user can browse in Radar)
```

**Example Opportunity:**
```typescript
{
  id: "opp_456",
  tweetId: "1234567890",
  authorId: "user_sarah",
  authorUsername: "sarahchen",
  authorName: "Sarah Chen",
  authorFollowers: 45000,
  content: "Just launched our new AI tool for content creators. The engagement spike in the first hour was insane...",
  createdAt: "2024-01-07T03:15:00Z",
  
  score: {
    velocity: {
      engagementRate: 12.5,
      growthRate: 3.2,
      freshness: 95,
      score: 85
    },
    saturation: {
      replyCount: 8,
      replyGrowthRate: 0.5,
      densityScore: 15,
      score: 25
    },
    authorFatigue: {
      recentActivity: 30,
      replyFrequency: 20,
      threadEngagement: 65,
      score: 75
    },
    audienceOverlap: {
      topicSimilarity: 85,
      keywordMatch: 60,
      historicalConversion: 70,
      score: 72
    },
    replyFit: {
      historicalPerformance: 75,
      styleMatch: 80,
      topicSuccess: 65,
      score: 73
    },
    finalScore: 92,
    explanation: "This tweet is showing exceptional velocity with 12.5% engagement rate and very low reply saturation. The author is currently active and responding to replies. The topic aligns with your expertise in content strategy, making this a high-value opportunity."
  }
}
```

---

### USE CASE 3: Viewing Opportunities in Radar Dashboard

**Actor:** User
**Goal:** Browse high-leverage opportunities and decide which to reply to

**Flow:**
```
USER VISITS /radar:

DISPLAY:
├─ Header
│  ├─ Title: "Radar"
│  ├─ Subtitle: "High-leverage reply opportunities, ranked by signal strength"
│  ├─ Filter tabs: [All] [High Score 85+] [Reviveable] [Author Active]
│  └─ Sort dropdown: [Score] [Velocity] [Freshness] [Revive Probability]
│
├─ Smart Alerts Banner (if any critical)
│  ├─ Shows critical/high urgency alerts
│  ├─ "⚠️ 3 critical opportunities - reply window closing soon"
│  └─ Dismissible
│
└─ Opportunity Cards (sorted by score)
   ├─ Card Layout:
   │  ├─ Left: Score Ring (92)
   │  ├─ Middle:
   │  │  ├─ Author info + timestamp
   │  │  ├─ Tweet content (truncated, 3 lines)
   │  │  ├─ Signal badges:
   │  │  │  ├─ Velocity: HIGH (blue)
   │  │  │  ├─ Saturation: LOW (green)
   │  │  │  ├─ Author Active (blue)
   │  │  │  └─ 🟣 REVIVEABLE (purple) [if applicable]
   │  │  └─ Urgency indicator: "Reply in 8 min"
   │  └─ Actions: [Reply Now] [Why This?] [Dismiss]
   │
   └─ Cards animate in with fade + slide-up

USER INTERACTIONS:

1. Click "Reply Now"
   ├─ Opens ReplyComposer modal
   ├─ Shows tweet context
   ├─ Shows 3 reply strategies
   ├─ User drafts reply
   ├─ Shows prediction (expected impressions, author engagement %)
   └─ User posts

2. Click "Why This?"
   ├─ Opens OpportunitySidePanel
   ├─ Shows detailed scoring breakdown
   ├─ Shows all 5 factors with raw metrics
   ├─ Shows explanation text
   ├─ Shows suggested reply angles
   └─ User can then reply or dismiss

3. Click "Dismiss"
   ├─ Removes from Radar
   ├─ Records as dismissed
   ├─ Doesn't count against daily alert limit
   └─ Card slides out

4. Real-time updates
   ├─ Every 30 seconds, scores refresh
   ├─ Cards update without full page reload
   ├─ New opportunities appear at top
   ├─ Urgency timers count down
   └─ Saturation meters update if spiking
```

**UI State Example:**
```typescript
interface RadarPageState {
  opportunities: OpportunityWithScore[]
  filter: 'all' | 'high_score' | 'reviveable' | 'author_active'
  sortBy: 'score' | 'velocity' | 'freshness' | 'revive_probability'
  selectedOpportunity: OpportunityWithScore | null
  sidePanelOpen: boolean
  smartAlerts: SmartAlert[]
  isLoading: boolean
  lastUpdated: Date
}
```

---

### USE CASE 4: Composing & Predicting Reply Outcome

**Actor:** User
**Goal:** Write a strategic reply with confidence in expected results

**Flow:**
```
USER CLICKS "REPLY NOW":

REPLY COMPOSER OPENS:
├─ Left Panel: Context
│  ├─ Tweet context card
│  │  ├─ Author avatar + name
│  │  ├─ Tweet content
│  │  └─ Engagement metrics
│  │
│  ├─ Author Insights
│  │  ├─ Typical response time: 15-30 min
│  │  ├─ Engagement rate: 8.5%
│  │  ├─ Best reply topics: Strategy, Data
│  │  └─ Recent activity: Active now
│  │
│  └─ Predicted Outcomes
│     ├─ Expected impressions: 2,500 - 5,000
│     ├─ Author engagement: 72%
│     ├─ Profile clicks: 8-15
│     └─ Potential follows: 8-15
│
└─ Right Panel: Compose
   ├─ Reply Strategy Tabs
   │  ├─ Value Add
   │  │  ├─ Description: "Share actionable insights or additional context"
   │  │  ├─ Template: "Great point! I'd add that..."
   │  │  └─ Best for: Adding unique perspective
   │  │
   │  ├─ Credibility
   │  │  ├─ Description: "Share relevant experience or case study"
   │  │  ├─ Template: "I saw similar results when..."
   │  │  └─ Best for: Establishing authority
   │  │
   │  └─ Contrarian
   │     ├─ Description: "Respectfully challenge with alternative view"
   │     ├─ Template: "Interesting perspective. I wonder if..."
   │     └─ Best for: High engagement if done well
   │
   ├─ Text Area
   │  ├─ Placeholder based on selected strategy
   │  ├─ Character counter: X/280
   │  ├─ Real-time prediction updates as user types
   │  └─ Min 10 chars to enable post button
   │
   └─ Actions
      ├─ [Post Reply] (primary)
      ├─ [Save Draft] (secondary)
      └─ [Cancel]

PREDICTION ENGINE:
├─ Analyzes reply text
├─ Compares to user's historical wins
├─ Calculates:
│  ├─ Expected impressions range
│  ├─ Probability author engages
│  ├─ Probability profile clicks
│  ├─ Probability new follows
│  └─ Confidence level (0-100%)
│
└─ Updates in real-time as user types

EXAMPLE PREDICTION:
{
  impressions: { min: 2500, max: 5000, confidence: 78 },
  authorEngagement: { probability: 72, confidence: 85 },
  profileClicks: { min: 8, max: 15, confidence: 72 },
  follows: { min: 8, max: 15, confidence: 68 },
  reasoning: [
    "Your credibility signal (specific case study with numbers) combined with actionable addition creates trust",
    "Similar replies to this author historically get 72% engagement",
    "Topic (content strategy) matches your best-performing niche"
  ]
}

USER POSTS:
├─ Reply created in database
├─ Posted to Twitter via API
├─ Tracked with prediction data
├─ Outcome tracking begins
└─ User redirected to /wins to see result
```

---

### USE CASE 5: Tracking Wins & Learning

**Actor:** User
**Goal:** See which replies worked and understand why

**Flow:**
```
USER VISITS /wins:

DISPLAY:
├─ Header: "Wins - Your successful replies and what made them work"
│
└─ Win Cards (reverse chronological)
   ├─ Card Layout (3-column grid on desktop)
   │  ├─ Column 1: Original Tweet
   │  │  ├─ Author info
   │  │  ├─ Tweet content
   │  │  └─ Timestamp
   │  │
   │  ├─ Column 2: Your Reply
   │  │  ├─ Reply content
   │  │  ├─ Strategy used (badge)
   │  │  └─ Posted timestamp
   │  │
   │  └─ Column 3: Outcome
   │     ├─ Impressions: 12,500
   │     ├─ Author Engaged: ✓ Yes
   │     ├─ Profile Clicks: 187
   │     └─ New Follows: +23
   │
   └─ Insight Section (bottom of card)
      ├─ Icon: 💡
      ├─ Title: "Why this worked"
      └─ Text: "Your credibility signal (specific case study with numbers) combined with actionable addition created trust. Segmentation tip was novel to the thread, positioning you as an expert."

LEARNING SIGNALS EXTRACTED:
├─ Author: emily_rodriguez
│  ├─ Engagement: YES
│  ├─ Impressions: 12,500
│  ├─ Follows: 23
│  └─ Success: HIGH
│
├─ Topic: growth_marketing
│  ├─ Impressions: 12,500
│  ├─ Engagement_rate: 18.5%
│  └─ Follow_rate: 0.18%
│
├─ Reply_style: credibility
│  ├─ Avg_impressions: 8,900
│  ├─ Avg_engagement: 72%
│  └─ Avg_follows: 18
│
└─ Time_of_day: 3:30pm
   ├─ Impressions: 12,500
   ├─ Success_rate: 85%
   └─ Sample_size: 5

PERSONALIZATION ENGINE UPDATES:
├─ Increases weight for emily_rodriguez in future scoring
├─ Boosts credibility strategy recommendations
├─ Notes growth_marketing as high-performing topic
├─ Learns 3:30pm is optimal posting time
└─ Next similar opportunity will be scored higher
```

**Win Record Example:**
```typescript
{
  id: "win_789",
  userId: "user_123",
  originalTweet: {
    tweetId: "1234567890",
    authorId: "emily_rodriguez",
    authorUsername: "emilyrodriguez",
    authorName: "Emily Rodriguez",
    content: "Three months ago I had 200 followers. Today I hit 28K. Here's the exact strategy...",
    timestamp: "2024-01-05T10:00:00Z"
  },
  reply: {
    content: "This aligns with what I found when growing @acmecorp from 0 to 15K in 90 days. The key was consistency + specific value props. One addition: segment your content by audience stage (awareness vs. decision). We saw 3x better conversion rates.",
    strategy: "credibility",
    postedAt: "2024-01-05T10:15:00Z"
  },
  prediction: {
    expectedImpressions: { min: 2500, max: 5000 },
    authorEngagementProb: 72,
    profileClicksMin: 8,
    followsMin: 8
  },
  outcome: {
    actualImpressions: 12500,
    authorEngaged: true,
    profileClicks: 187,
    follows: 23,
    label: "RIGHT",
    measuredAt: "2024-01-05T11:00:00Z"
  },
  insight: "Your credibility signal (specific case study with numbers) combined with actionable addition created trust. Segmentation tip was novel to the thread, positioning you as an expert."
}
```

---

### USE CASE 6: Attention Decay Intelligence - Reviving Old Posts

**Actor:** User
**Goal:** Know when to quote/reply to older posts to restart their distribution

**Flow:**
```
ATTENTION DECAY TRACKING:

BACKGROUND SERVICE (Every 5 minutes):
├─ For each user's posted tweets
├─ Fetch current engagement metrics
├─ Compare to previous snapshot
├─ Calculate decay metrics:
│  ├─ Half-life: Time until engagement halves
│  │  └─ Example: 120 minutes (2 hours)
│  │
│  ├─ Active lifespan: Time until flatline
│  │  └─ Example: 480 minutes (8 hours)
│  │
│  ├─ Decay velocity: Rate of drop
│  │  └─ Example: -2.5 likes/min (accelerating)
│  │
│  ├─ Current phase: growth | peak | decay | flatline
│  │  └─ Example: DECAY (engagement dropping 15% per hour)
│  │
│  └─ Revive probability: % chance revival works
│     └─ Example: 68% (good candidate for quote tweet)
│
├─ Detect revive window
│  ├─ When: engagement entering rapid decay
│  ├─ Duration: 30-60 minutes
│  └─ Probability: 65%+ chance of success
│
└─ Create SmartAlert if reviveable

ALERT EXAMPLE:
{
  type: "REVIVE_SIGNAL",
  urgency: "HIGH",
  title: "Your tweet is entering rapid decay",
  message: "Your tweet from 2h ago is losing momentum. A quote reply now has 68% probability of restarting distribution.",
  tweetId: "user_tweet_123",
  reviveMetrics: {
    halfLife: 120,
    activeLifespan: 480,
    reviveProbability: 68,
    currentPhase: "DECAY",
    decayVelocity: -2.5
  },
  actionUrl: "/radar?revive=user_tweet_123"
}

USER SEES ALERT:
├─ In /radar as banner or card
├─ Shows: "Your tweet from 2h ago is entering rapid decay. Quote reply now has 68% chance of restarting distribution."
├─ Shows metrics:
│  ├─ Half-life: 2 hours
│  ├─ Active lifespan: 8 hours
│  ├─ Revive probability: 68%
│  └─ Historically adds +42% reach
│
└─ User clicks "Revive Now"
   ├─ Opens reply composer
   ├─ Pre-fills with quote tweet option
   ├─ Shows prediction for revival
   └─ User posts quote reply

LEARNING:
├─ System tracks if revival succeeded
├─ Updates user's decay patterns
├─ Learns best revival formats
│  ├─ Question vs insight vs quote
│  ├─ Optimal timing
│  └─ Best topics for revival
└─ Personalizes future alerts
```

**Attention Decay Record:**
```typescript
{
  id: "decay_101",
  candidateTweetId: "user_tweet_123",
  halfLife: 120,           // minutes
  activeLifespan: 480,     // minutes
  reviveProbability: 68,   // 0-100
  decayVelocity: -2.5,     // likes/min
  currentPhase: "DECAY",
  
  reviveWindowStart: "2024-01-07T05:30:00Z",
  reviveWindowEnd: "2024-01-07T06:30:00Z",
  
  engagementHistory: [
    { timestamp: "2024-01-07T03:00:00Z", likes: 450, retweets: 120, replies: 45 },
    { timestamp: "2024-01-07T03:30:00Z", likes: 520, retweets: 145, replies: 52 },
    { timestamp: "2024-01-07T04:00:00Z", likes: 580, retweets: 165, replies: 58 },
    { timestamp: "2024-01-07T04:30:00Z", likes: 610, retweets: 180, replies: 62 },
    { timestamp: "2024-01-07T05:00:00Z", likes: 625, retweets: 188, replies: 65 },
    { timestamp: "2024-01-07T05:30:00Z", likes: 630, retweets: 190, replies: 66 }
  ],
  
  computedAt: "2024-01-07T05:35:00Z"
}
```

---

### USE CASE 7: Analytics & Personalization Dashboard

**Actor:** User
**Goal:** Understand patterns and improve reply strategy

**Flow:**
```
USER VISITS /analytics:

DISPLAY:

1. Performance Overview
   ├─ Total replies: 47
   ├─ Success rate: 68%
   ├─ Avg impressions: 8,900
   ├─ Avg follows gained: 12
   └─ Trend: ↑ +15% vs last week

2. Best Performing Authors
   ├─ Table: Author | Replies | Success % | Avg Impressions
   ├─ Row 1: @elonmusk | 8 | 75% | 45,000
   ├─ Row 2: @paulg | 6 | 83% | 28,000
   ├─ Row 3: @naval | 5 | 80% | 15,000
   └─ Insight: "Focus on these 3 authors - highest conversion"

3. Best Performing Topics
   ├─ Topic | Replies | Success % | Avg Follows
   ├─ AI agents | 12 | 75% | 18
   ├─ SaaS | 10 | 70% | 14
   ├─ Growth marketing | 8 | 62% | 10
   └─ Insight: "AI agents is your strongest niche"

4. Reply Strategy Performance
   ├─ Strategy | Replies | Avg Impressions | Engagement %
   ├─ Credibility | 18 | 12,500 | 72%
   ├─ Value Add | 15 | 9,200 | 65%
   ├─ Contrarian | 14 | 7,800 | 58%
   └─ Insight: "Credibility strategy performs best for you"

5. Optimal Posting Times
   ├─ Heatmap: Hour of day vs Success rate
   ├─ 9am-12pm: 65% success
   ├─ 12pm-3pm: 72% success (PEAK)
   ├─ 3pm-6pm: 68% success
   ├─ 6pm-9pm: 55% success
   └─ Insight: "Post between 12-3pm for best results"

6. Attention Decay Patterns
   ├─ Avg half-life: 145 minutes
   ├─ Avg active lifespan: 520 minutes
   ├─ Revival success rate: 64%
   ├─ Best revival format: Quote tweet (72% success)
   └─ Insight: "Your tweets have longer lifespans than average"

7. Personalization Status
   ├─ Learning confidence: 78%
   ├─ Patterns identified: 12
   ├─ Recommendations: 5
   └─ Next update: in 2 days
```

---

## 🔌 API ENDPOINTS

### Opportunities API

#### GET `/api/opportunities`
**Purpose:** Fetch scored opportunities for user

**Query Parameters:**
```
filter: 'all' | 'high_score' | 'reviveable' | 'author_active'
sortBy: 'score' | 'velocity' | 'freshness' | 'revive_probability'
limit: number (default 20)
offset: number (default 0)
```

**Response:**
```json
{
  "opportunities": [
    {
      "id": "opp_456",
      "tweetId": "1234567890",
      "authorName": "Sarah Chen",
      "authorUsername": "sarahchen",
      "authorFollowers": 45000,
      "content": "Just launched our new AI tool...",
      "timestamp": "2024-01-07T03:15:00Z",
      "finalScore": 92,
      "velocityScore": 85,
      "saturationScore": 25,
      "authorFatigueScore": 75,
      "audienceOverlapScore": 72,
      "replyFitScore": 73,
      "explanation": "This tweet is showing exceptional velocity...",
      "reviveable": false,
      "reviveProbability": null
    }
  ],
  "total": 47,
  "hasMore": true
}
```

#### GET `/api/opportunities/[id]`
**Purpose:** Get detailed opportunity data

**Response:**
```json
{
  "opportunity": { /* full opportunity object */ },
  "scores": {
    "velocity": { /* detailed breakdown */ },
    "saturation": { /* detailed breakdown */ },
    "authorFatigue": { /* detailed breakdown */ },
    "audienceOverlap": { /* detailed breakdown */ },
    "replyFit": { /* detailed breakdown */ }
  },
  "similarWins": [ /* past successful replies to similar tweets */ ],
  "threadContext": [ /* full tweet thread if applicable */ ]
}
```

#### GET `/api/opportunities/[id]/decay`
**Purpose:** Get attention decay metrics

**Response:**
```json
{
  "decay": {
    "halfLife": 120,
    "activeLifespan": 480,
    "reviveProbability": 68,
    "decayVelocity": -2.5,
    "currentPhase": "DECAY",
    "reviveWindowStart": "2024-01-07T05:30:00Z",
    "reviveWindowEnd": "2024-01-07T06:30:00Z"
  },
  "engagementHistory": [ /* array of snapshots */ ],
  "prediction": {
    "expectedImpressions": { "min": 3000, "max": 6000 },
    "revivalSuccessProbability": 68
  }
}
```

#### GET `/api/opportunities/reviveable`
**Purpose:** Get all reviveable opportunities

**Response:**
```json
{
  "reviveableOpportunities": [
    {
      "id": "opp_789",
      "tweetId": "user_tweet_123",
      "content": "User's own tweet from 2h ago",
      "reviveProbability": 68,
      "halfLife": 120,
      "currentPhase": "DECAY",
      "reviveWindowEnd": "2024-01-07T06:30:00Z"
    }
  ],
  "total": 3
}
```

### Predictions API

#### GET `/api/predictions/[opportunityId]`
**Purpose:** Get outcome prediction for opportunity

**Response:**
```json
{
  "prediction": {
    "impressions": {
      "min": 2500,
      "max": 5000,
      "confidence": 78
    },
    "authorEngagement": {
      "probability": 72,
      "confidence": 85
    },
    "profileClicks": {
      "min": 8,
      "max": 15,
      "confidence": 72
    },
    "follows": {
      "min": 8,
      "max": 15,
      "confidence": 68
    },
    "reasoning": [
      "Your credibility signal creates trust",
      "Similar replies get 72% engagement",
      "Topic matches your best niche"
    ]
  }
}
```

### Replies API

#### POST `/api/replies`
**Purpose:** Post a reply

**Body:**
```json
{
  "opportunityId": "opp_456",
  "content": "Great point! I'd add that...",
  "strategy": "value_add",
  "predictionId": "pred_123"
}
```

**Response:**
```json
{
  "reply": {
    "id": "reply_999",
    "tweetId": "1234567890",
    "replyTweetId": "9876543210",
    "content": "Great point! I'd add that...",
    "strategy": "value_add",
    "postedAt": "2024-01-07T03:30:00Z",
    "prediction": { /* prediction data */ }
  }
}
```

### Alerts API

#### GET `/api/alerts`
**Purpose:** Get smart alerts for user

**Query Parameters:**
```
dismissed: boolean (default false)
type: AlertType (optional)
limit: number (default 20)
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "type": "REPLY_NOW",
      "urgency": "CRITICAL",
      "title": "High-velocity opportunity",
      "message": "This tweet is gaining momentum fast...",
      "opportunityId": "opp_456",
      "optimalWindow": 14,
      "closingWindow": 6,
      "dismissed": false,
      "createdAt": "2024-01-07T03:25:00Z",
      "expiresAt": "2024-01-07T03:45:00Z"
    }
  ],
  "total": 5
}
```

#### POST `/api/alerts/[id]/dismiss`
**Purpose:** Dismiss an alert

**Body:**
```json
{
  "feedback": "Not interested in this author"
}
```

### Learning API

#### GET `/api/learning/profile`
**Purpose:** Get user's learning profile

**Response:**
```json
{
  "learning": {
    "bestAuthors": [
      { "authorId": "emily_rodriguez", "conversionRate": 85, "sampleSize": 8 }
    ],
    "bestTopics": [
      { "topic": "AI agents", "successRate": 75, "sampleSize": 12 }
    ],
    "bestReplyStyles": [
      { "style": "credibility", "avgImpressions": 12500, "avgFollows": 18 }
    ],
    "bestPostingHours": [
      { "hour": 14, "successRate": 72, "sampleSize": 15 }
    ],
    "avgHalfLife": 145,
    "avgRevivalSuccess": 64,
    "confidence": 78
  }
}
```

#### POST `/api/learning/refresh`
**Purpose:** Manually trigger learning engine update

**Response:**
```json
{
  "status": "success",
  "message": "Learning profile updated",
  "newPatterns": 3,
  "confidence": 79
}
```

### Snapshots API

#### POST `/api/snapshots/capture`
**Purpose:** Capture engagement snapshot (called by cron)

**Body:**
```json
{
  "tweetId": "1234567890",
  "likes": 625,
  "retweets": 190,
  "replies": 66,
  "impressions": 15000
}
```

---

## 📊 DATABASE SCHEMA EXAMPLES

### User with All Relations
```typescript
{
  id: "user_123",
  email: "creator@example.com",
  emailVerified: null,
  name: "Sarah Chen",
  image: "https://...",
  createdAt: "2024-01-07T03:30:00Z",
  updatedAt: "2024-01-07T03:30:00Z",
  
  // Relations
  accounts: [ /* OAuth accounts */ ],
  preferences: {
    userId: "user_123",
    maxAlertsPerDay: 10,
    minPredictedImpressions: 1000,
    timeWindowStart: 9,
    timeWindowEnd: 21,
    preferredReplyStyles: ["value_add", "credibility"]
  },
  targets: [
    { type: "ACCOUNT", value: "elonmusk" },
    { type: "KEYWORD", value: "AI agents" }
  ],
  alerts: [ /* smart alerts */ ],
  replies: [ /* user's replies */ ],
  learning: {
    bestAuthors: [ /* top performing authors */ ],
    bestTopics: [ /* top performing topics */ ],
    bestReplyStyles: [ /* top performing styles */ ],
    bestPostingHours: [ /* optimal times */ ]
  }
}
```

### Complete Opportunity Flow
```typescript
// 1. CandidateTweet discovered
{
  id: "tweet_456",
  tweetId: "1234567890",
  authorId: "sarah_chen",
  authorUsername: "sarahchen",
  authorName: "Sarah Chen",
  authorFollowers: 45000,
  content: "Just launched our new AI tool...",
  createdAt: "2024-01-07T03:15:00Z",
  fetchedAt: "2024-01-07T03:20:00Z"
}

// 2. Score calculated
{
  id: "score_789",
  candidateTweetId: "tweet_456",
  velocityScore: 85,
  velocityRaw: { engagementRate: 12.5, growthRate: 3.2, freshness: 95 },
  saturationScore: 25,
  saturationRaw: { replyCount: 8, replyGrowthRate: 0.5, densityScore: 15 },
  authorFatigueScore: 75,
  authorFatigueRaw: { recentActivity: 30, replyFrequency: 20, threadEngagement: 65 },
  audienceOverlapScore: 72,
  audienceOverlapRaw: { topicSimilarity: 85, keywordMatch: 60, historicalConversion: 70 },
  replyFitScore: 73,
  replyFitRaw: { historicalPerformance: 75, styleMatch: 80, topicSuccess: 65 },
  finalScore: 92,
  computedAt: "2024-01-07T03:21:00Z"
}

// 3. Alert triggered
{
  id: "alert_123",
  userId: "user_123",
  candidateTweetId: "tweet_456",
  type: "REPLY_NOW",
  urgency: "HIGH",
  title: "High-leverage opportunity",
  message: "This tweet is gaining momentum...",
  optimalWindow: 14,
  closingWindow: 6,
  dismissed: false,
  createdAt: "2024-01-07T03:22:00Z",
  expiresAt: "2024-01-07T03:42:00Z"
}

// 4. User posts reply
{
  id: "reply_999",
  userId: "user_123",
  alertId: "alert_123",
  tweetId: "1234567890",
  replyTweetId: "9876543210",
  content: "This aligns with what I found when...",
  strategy: "credibility",
  postedAt: "2024-01-07T03:30:00Z",
  
  prediction: {
    expectedImpressionsMin: 2500,
    expectedImpressionsMax: 5000,
    probAuthorEngagement: 72,
    probProfileClicks: 0.15,
    probFollows: 0.12,
    explanation: "Based on similar replies..."
  },
  
  outcome: {
    actualImpressions: 12500,
    authorEngaged: true,
    profileClicks: 187,
    follows: 23,
    label: "RIGHT",
    measuredAt: "2024-01-07T04:00:00Z"
  }
}

// 5. Learning signal recorded
{
  id: "signal_456",
  userId: "user_123",
  signalType: "author_success",
  signalData: {
    authorId: "sarah_chen",
    authorUsername: "sarahchen",
    impressions: 12500,
    follows: 23,
    engagement: true
  },
  confidence: 0.85,
  createdAt: "2024-01-07T04:05:00Z"
}
```

---

## 🎨 UI COMPONENTS DETAILED SPECS

### 1. Score Ring Component
**File:** `components/ui/score-ring.tsx`

**Props:**
```typescript
interface ScoreRingProps {
  score: number                    // 0-100
  size?: 'sm' | 'md' | 'lg'       // default: md
  animated?: boolean               // default: true
  showLabel?: boolean              // default: true
  onClick?: () => void
}
```

**Visual:**
- Circular progress ring (SVG)
- Animated fill from 0 to score value
- Color gradient based on score:
  - 90-100: Electric Blue (#0ea5e9) + glow
  - 75-89: Green (#10b981)
  - 60-74: Yellow (#f59e0b)
  - 40-59: Gray (#6b7280)
  - 0-39: Dim Gray (#374151)
- Center shows score number
- Sizes: sm (40px), md (60px), lg (100px)

### 2. Reviveable Badge Component
**File:** `components/ui/reviveable-badge.tsx`

**Props:**
```typescript
interface ReviveableBadgeProps {
  reviveProbability: number        // 0-100
  halfLife: number                 // minutes
  onClick?: () => void
  showTooltip?: boolean            // default: true
}
```

**Visual:**
- Purple badge (#8b5cf6) with glow
- Icon: 🟣
- Text: "REVIVEABLE"
- Tooltip: "Attention decay detected. Quoting or replying now can restart distribution."
- Animated pulse when probability > 70%

### 3. Urgency Timer Component
**File:** `components/ui/urgency-timer.tsx`

**Props:**
```typescript
interface UrgencyTimerProps {
  optimalWindow: number            // minutes
  closingWindow: number            // minutes
  expiresAt: Date
  onExpire?: () => void
}
```

**Visual:**
- Shows: "⏱️ Reply in X min"
- Color changes based on time:
  - Green: > 10 min remaining
  - Yellow: 5-10 min
  - Red: < 5 min (pulse animation)
- Countdown updates every second
- Callback when expired

### 4. Engagement Timeline Component
**File:** `components/charts/engagement-timeline.tsx`

**Props:**
```typescript
interface EngagementTimelineProps {
  snapshots: EngagementSnapshot[]
  phases: DecayPhase[]
  reviveWindow?: { start: Date, end: Date }
  height?: number                  // default: 120
}
```

**Visual:**
- Sparkline chart (lightweight)
- X-axis: Time
- Y-axis: Total engagement
- Color-coded phases:
  - 🟢 Green: Growth phase
  - 🟠 Orange: Peak phase
  - 🔴 Red: Decay phase
  - ⚫ Gray: Flatline phase
- Revive window highlighted in purple
- Predicted decay curve (dotted line)

### 5. Signal Strength Bar Component
**File:** `components/ui/signal-strength.tsx`

**Props:**
```typescript
interface SignalStrengthProps {
  velocity: number                 // 0-100
  saturation: number               // 0-100
  authorFatigue: number            // 0-100
  audienceOverlap: number          // 0-100
  replyFit: number                 // 0-100
  size?: 'sm' | 'md'              // default: md
}
```

**Visual:**
- 5 bars like WiFi signal indicator
- Each bar represents one factor
- Bar height = score (0-100)
- Colors:
  - Bar 1 (Velocity): Blue
  - Bar 2 (Saturation): Green
  - Bar 3 (Author): Purple
  - Bar 4 (Audience): Orange
  - Bar 5 (Fit): Cyan
- Hover shows factor name and score

### 6. Saturation Meter Component
**File:** `components/ui/saturation-meter.tsx`

**Props:**
```typescript
interface SaturationMeterProps {
  replyCount: number
  replyGrowthRate: number
  densityScore: number             // 0-100
  spiking?: boolean                // default: false
}
```

**Visual:**
- Horizontal meter bar
- Color gradient:
  - Green (0-40): Low saturation
  - Yellow (40-70): Medium saturation
  - Red (70-100): Crowded
- Shows: "X replies in Y minutes"
- Flash animation if spiking
- Tooltip with detailed metrics

### 7. Smart Alert Card Component
**File:** `components/alerts/smart-alert-card.tsx`

**Props:**
```typescript
interface SmartAlertCardProps {
  alert: SmartAlert
  onDismiss?: (feedback?: string) => void
  onAction?: () => void
}
```

**Visual:**
- Card with colored left border (based on urgency)
- Icon (based on alert type)
- Title + message
- Urgency badge (CRITICAL/HIGH/MEDIUM)
- Time remaining
- Action button
- Dismiss button with optional feedback

### 8. Prediction Card Component
**File:** `components/prediction/prediction-card.tsx`

**Props:**
```typescript
interface PredictionCardProps {
  prediction: OutcomePrediction
  compact?: boolean                // default: false
}
```

**Visual:**
- Shows expected ROI
- Impression range with confidence
- Probability bars for:
  - Author engagement
  - Profile clicks
  - Follows
- Reasoning bullets
- Confidence score

---

## 🧮 SCORING ALGORITHMS DETAILED

### Velocity Score (30% weight)

**Formula:**
```
engagement_rate = (likes + retweets + replies) / author_followers * 100
growth_rate = total_engagement / minutes_old
freshness = max(0, 100 - (minutes_old / 60 * 10))

velocity_score = min(100,
  (engagement_rate * 20) +
  (min(growth_rate * 10, 40)) +
  (freshness * 0.4)
)
```

**Example:**
```
Tweet: 450 likes + 120 retweets + 45 replies = 615 total
Author followers: 45,000
Age: 15 minutes

engagement_rate = (615 / 45000) * 100 = 1.37%
growth_rate = 615 / 15 = 41 engagements/min
freshness = 100 - (15 / 60 * 10) = 97.5

velocity_score = min(100,
  (1.37 * 20) +
  (min(41 * 10, 40)) +
  (97.5 * 0.4)
) = min(100, 27.4 + 40 + 39) = 85
```

### Saturation Score (25% weight)

**Formula:**
```
reply_count = current replies
density_score = min(100, (reply_count / 50) * 100)
reply_growth_rate = replies_per_minute

saturation_score = 100 - min(100,
  (density_score * 0.6) +
  (min(reply_growth_rate * 20, 40))
)
```

**Example:**
```
Reply count: 8
Reply growth rate: 0.5 replies/min

density_score = min(100, (8 / 50) * 100) = 16
saturation_score = 100 - min(100,
  (16 * 0.6) +
  (min(0.5 * 20, 40))
) = 100 - 19.6 = 80.4 ≈ 80
```

### Author Fatigue Score (20% weight)

**Formula:**
```
recent_activity = min(100, (tweets_last_24h / 50) * 100)
reply_frequency = min(100, (replies_last_1h / 10) * 100)
thread_engagement = avg_engagement_in_thread (0-100)

author_fatigue_score = max(0,
  100 -
  (recent_activity * 0.3) -
  (reply_frequency * 0.4) +
  (thread_engagement * 0.3)
)
```

**Example:**
```
Tweets last 24h: 10
Replies last 1h: 2
Avg thread engagement: 65%

recent_activity = min(100, (10 / 50) * 100) = 20
reply_frequency = min(100, (2 / 10) * 100) = 20
thread_engagement = 65

author_fatigue_score = max(0,
  100 - (20 * 0.3) - (20 * 0.4) + (65 * 0.3)
) = max(0, 100 - 6 - 8 + 19.5) = 105.5 → capped at 100
```

### Audience Overlap Score (15% weight)

**Formula:**
```
topic_similarity = semantic_similarity(user_expertise, tweet_topic) (0-100)
keyword_match = min(100, (matching_keywords / 5) * 100)
historical_conversion = user's_past_success_on_similar_topics (0-100)

audience_overlap_score =
  (topic_similarity * 0.4) +
  (keyword_match * 0.3) +
  (historical_conversion * 0.3)
```

**Example:**
```
Topic similarity: 85% (user is expert in content strategy)
Keyword matches: 3 out of 5 (AI, content, strategy)
Historical conversion: 70% (user's past replies on similar topics)

audience_overlap_score =
  (85 * 0.4) +
  (min(100, (3 / 5) * 100) * 0.3) +
  (70 * 0.3)
= 34 + 18 + 21 = 73
```

### Reply Fit Score (10% weight)

**Formula:**
```
historical_performance = user's_avg_impressions_on_similar_topics (0-100)
style_match = how_well_user's_style_fits_this_opportunity (0-100)
topic_success = user's_success_rate_on_this_topic (0-100)

reply_fit_score =
  (historical_performance * 0.4) +
  (style_match * 0.3) +
  (topic_success * 0.3)
```

**Example:**
```
Historical performance: 75 (user's avg on content topics)
Style match: 80 (user's credibility style fits this opportunity)
Topic success: 65 (user's success rate on growth topics)

reply_fit_score =
  (75 * 0.4) +
  (80 * 0.3) +
  (65 * 0.3)
= 30 + 24 + 19.5 = 73.5 ≈ 74
```

### Final Score Calculation

**Formula:**
```
final_score = round(
  (velocity * 0.30) +
  (saturation * 0.25) +
  (author_fatigue * 0.20) +
  (audience_overlap * 0.15) +
  (reply_fit * 0.10)
)
```

**Example:**
```
velocity: 85
saturation: 80
author_fatigue: 75
audience_overlap: 73
reply_fit: 74

final_score = round(
  (85 * 0.30) +
  (80 * 0.25) +
  (75 * 0.20) +
  (73 * 0.15) +
  (74 * 0.10)
) = round(25.5 + 20 + 15 + 10.95 + 7.4) = round(78.85) = 79
```

---

## ⚡ REAL-TIME FEATURES

### Polling Strategy

**Interval:** Every 30 seconds

**What Updates:**
1. Score refresh for visible opportunities
2. New opportunities added to top
3. Engagement snapshots captured
4. Alert triggers checked
5. Saturation spike detection

**Implementation:**
```typescript
// hooks/use-realtime-opportunities.ts
export function useRealtimeOpportunities(userId: string) {
  const [opportunities, setOpportunities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/opportunities?userId=${userId}`)
      const data = await response.json()
      
      // Merge with existing, update scores, animate changes
      setOpportunities(prev => mergeAndSort(prev, data.opportunities))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [userId])
  
  return { opportunities, isLoading }
}
```

### Optimistic Updates

```typescript
// When user dismisses card
setOpportunities(prev => 
  prev.filter(opp => opp.id !== opportunityId)
)

// When user replies
setOpportunities(prev =>
  prev.map(opp =>
    opp.id === opportunityId
      ? { ...opp, replied: true, replyId: newReplyId }
      : opp
  )
)
```

---

## 🔗 INTEGRATION POINTS

### Twitter API v2 Integration

**Endpoints Used:**
- `GET /2/tweets/search/recent` - Find tweets by keyword
- `GET /2/users/:id/tweets` - Get user's tweets
- `GET /2/tweets/:id` - Get tweet details
- `GET /2/tweets/:id/liking_users` - Get who liked tweet
- `POST /2/tweets` - Post reply (when ready)

**Rate Limits:**
- 300 requests per 15 minutes (free tier)
- Batch requests to stay within limits
- Implement exponential backoff

### Cron Jobs

**Every 5 minutes:**
```bash
*/5 * * * * curl -X POST https://engagealpha.pro/api/snapshots/capture \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Every 1 minute:**
```bash
* * * * * curl -X POST https://engagealpha.pro/api/alerts/check \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Every hour:**
```bash
0 * * * * curl -X POST https://engagealpha.pro/api/learning/refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Daily at midnight:**
```bash
0 0 * * * curl -X POST https://engagealpha.pro/api/analytics/rollup \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 📝 SUMMARY

This document covers:
- ✅ 7 complete use cases with detailed flows
- ✅ 8 API endpoints with request/response examples
- ✅ 8 UI components with specifications
- ✅ 5 scoring algorithms with formulas and examples
- ✅ Attention Decay Intelligence system
- ✅ Real-time polling strategy
- ✅ Integration points and cron jobs

**Ready to implement!**
