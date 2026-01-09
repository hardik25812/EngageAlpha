export interface OpportunityData {
  id: string
  tweetId: string
  authorName: string
  authorUsername: string
  authorFollowers: number
  authorImage?: string
  content: string
  timestamp: Date
  velocityScore: number
  saturationScore: number
  authorActive: boolean
  finalScore: number
  velocityRaw: {
    engagementRate: number
    growthRate: number
    freshness: number
  }
  saturationRaw: {
    replyCount: number
    replyGrowthRate: number
    densityScore: number
  }
  explanation: string
}

export interface WinData {
  id: string
  originalTweet: {
    authorName: string
    authorUsername: string
    content: string
    timestamp: Date
  }
  yourReply: {
    content: string
    timestamp: Date
  }
  outcome: {
    impressions: number
    authorEngaged: boolean
    profileClicks: number
    follows: number
    label: "RIGHT" | "SATURATED" | "BAD_FIT"
  }
  insight: string
}

export interface TargetConfig {
  type: "ACCOUNT" | "KEYWORD" | "LIST"
  value: string
  isActive: boolean
}

export interface UserPreferencesData {
  maxAlertsPerDay: number
  minPredictedImpressions: number
  timeWindowStart: number
  timeWindowEnd: number
  preferredReplyStyles: string[]
}

export interface AlertData {
  id: string
  candidateTweetId: string
  score: number
  reason: string
  dismissed: boolean
  viewed: boolean
  createdAt: Date
}

export interface ReplyStrategy {
  id: string
  name: string
  description: string
  template: string
}

export interface PredictionData {
  expectedImpressionsMin: number
  expectedImpressionsMax: number
  probAuthorEngagement: number
  probProfileClicks: number
  probFollows: number
  explanation: string
}

export type OutcomeLabel = "RIGHT" | "SATURATED" | "BAD_FIT"

// ============================================
// ATTENTION DECAY INTELLIGENCE TYPES
// ============================================

export type DecayPhase = "GROWTH" | "PEAK" | "DECAY" | "FLATLINE"
export type AlertType = "REPLY_NOW" | "REVIVE_SIGNAL" | "WINDOW_CLOSING" | "AUTHOR_ACTIVE" | "VELOCITY_SPIKE"
export type AlertUrgency = "CRITICAL" | "HIGH" | "MEDIUM"

export interface AttentionDecayMetrics {
  halfLife: number              // Time until engagement halves (minutes)
  activeLifespan: number        // Time until flatline (minutes)
  reviveProbability: number     // % chance revival works (0-100)
  decayVelocity: number         // Rate of engagement drop per minute
  currentPhase: DecayPhase
  reviveWindow: { start: Date; end: Date } | null
  engagementHistory: EngagementDataPoint[]
}

export interface EngagementDataPoint {
  timestamp: Date
  likes: number
  retweets: number
  replies: number
  quotes?: number
  impressions?: number
}

export interface SmartAlertData {
  id: string
  type: AlertType
  urgency: AlertUrgency
  title: string
  message: string
  optimalWindow: number | null   // minutes
  closingWindow: number | null   // minutes
  candidateTweetId: string | null
  dismissed: boolean
  actedOn: boolean
  createdAt: Date
  expiresAt: Date | null
}

export interface OutcomePrediction {
  impressions: { min: number; max: number; confidence: number }
  authorEngagement: { probability: number; confidence: number }
  profileClicks: { min: number; max: number }
  follows: { min: number; max: number }
  reasoning: string[]
}

export interface UserLearningData {
  bestAuthors: AuthorPerformance[]
  bestTopics: TopicPerformance[]
  bestReplyStyles: StylePerformance[]
  bestPostingHours: HourPerformance[]
  avgHalfLife: number | null
  avgRevivalSuccess: number | null
  totalReplies: number
  successfulReplies: number
  avgImpressionsGained: number
}

export interface AuthorPerformance {
  authorId: string
  authorUsername: string
  conversionRate: number
  sampleSize: number
}

export interface TopicPerformance {
  topic: string
  successRate: number
  avgImpressions: number
  sampleSize: number
}

export interface StylePerformance {
  style: string
  avgImpressions: number
  avgFollows: number
  sampleSize: number
}

export interface HourPerformance {
  hour: number  // 0-23
  successRate: number
  sampleSize: number
}

// Extended OpportunityData with decay info
export interface OpportunityWithDecay extends OpportunityData {
  attentionDecay?: AttentionDecayMetrics
  isReviveable: boolean
  urgencyTimer?: {
    optimalMinutes: number
    closingMinutes: number
  }
}

// Velocity tracking
export interface VelocitySnapshot {
  timestamp: Date
  velocity: number          // engagements per minute
  acceleration: number      // change in velocity
  trend: "accelerating" | "stable" | "decelerating"
}

// Saturation tracking
export interface SaturationSnapshot {
  timestamp: Date
  replyCount: number
  replyVelocity: number     // replies per minute
  trend: "stable" | "spiking" | "flooding"
}
