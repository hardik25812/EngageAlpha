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
