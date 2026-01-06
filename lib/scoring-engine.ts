interface VelocityScore {
  engagementRate: number
  growthRate: number
  freshness: number
  score: number
}

interface SaturationScore {
  replyCount: number
  replyGrowthRate: number
  densityScore: number
  score: number
}

interface AuthorFatigueScore {
  recentActivity: number
  replyFrequency: number
  threadEngagement: number
  score: number
}

interface AudienceOverlapScore {
  topicSimilarity: number
  keywordMatch: number
  historicalConversion: number
  score: number
}

interface ReplyFitScore {
  historicalPerformance: number
  styleMatch: number
  topicSuccess: number
  score: number
}

export interface OpportunityScore {
  velocity: VelocityScore
  saturation: SaturationScore
  authorFatigue: AuthorFatigueScore
  audienceOverlap: AudienceOverlapScore
  replyFit: ReplyFitScore
  finalScore: number
  explanation: string
}

export class ScoringEngine {
  calculateVelocityScore(tweet: {
    likes: number
    retweets: number
    replies: number
    createdAt: Date
    authorFollowers: number
  }): VelocityScore {
    const now = new Date()
    const ageMinutes = (now.getTime() - tweet.createdAt.getTime()) / 1000 / 60

    const totalEngagement = tweet.likes + tweet.retweets + tweet.replies
    const engagementRate = (totalEngagement / tweet.authorFollowers) * 100

    const growthRate = totalEngagement / Math.max(ageMinutes, 1)

    const freshness = Math.max(0, 100 - (ageMinutes / 60) * 10)

    const score = Math.min(100,
      (engagementRate * 20) +
      (Math.min(growthRate * 10, 40)) +
      (freshness * 0.4)
    )

    return {
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(2)),
      freshness: parseFloat(freshness.toFixed(0)),
      score: parseFloat(score.toFixed(0)),
    }
  }

  calculateSaturationScore(tweet: {
    replies: number
    replyGrowthRate: number
  }): SaturationScore {
    const replyCount = tweet.replies

    const densityScore = Math.min(100, (replyCount / 50) * 100)

    const replyGrowthRate = tweet.replyGrowthRate

    const score = 100 - Math.min(100,
      (densityScore * 0.6) +
      (Math.min(replyGrowthRate * 20, 40))
    )

    return {
      replyCount,
      replyGrowthRate: parseFloat(replyGrowthRate.toFixed(2)),
      densityScore: parseFloat(densityScore.toFixed(0)),
      score: parseFloat(score.toFixed(0)),
    }
  }

  calculateAuthorFatigueScore(author: {
    tweetsLast24h: number
    repliesLast1h: number
    avgThreadEngagement: number
  }): AuthorFatigueScore {
    const recentActivity = Math.min(100, (author.tweetsLast24h / 50) * 100)

    const replyFrequency = Math.min(100, (author.repliesLast1h / 10) * 100)

    const threadEngagement = author.avgThreadEngagement

    const score = Math.max(0,
      100 -
      (recentActivity * 0.3) -
      (replyFrequency * 0.4) +
      (threadEngagement * 0.3)
    )

    return {
      recentActivity: parseFloat(recentActivity.toFixed(0)),
      replyFrequency: parseFloat(replyFrequency.toFixed(0)),
      threadEngagement: parseFloat(threadEngagement.toFixed(0)),
      score: parseFloat(score.toFixed(0)),
    }
  }

  calculateAudienceOverlapScore(context: {
    topicSimilarity: number
    keywordMatches: number
    historicalConversion: number
  }): AudienceOverlapScore {
    const topicSimilarity = context.topicSimilarity
    const keywordMatch = Math.min(100, (context.keywordMatches / 5) * 100)
    const historicalConversion = context.historicalConversion

    const score =
      (topicSimilarity * 0.4) +
      (keywordMatch * 0.3) +
      (historicalConversion * 0.3)

    return {
      topicSimilarity: parseFloat(topicSimilarity.toFixed(0)),
      keywordMatch: parseFloat(keywordMatch.toFixed(0)),
      historicalConversion: parseFloat(historicalConversion.toFixed(0)),
      score: parseFloat(score.toFixed(0)),
    }
  }

  calculateReplyFitScore(userHistory: {
    avgPerformance: number
    styleMatch: number
    topicSuccessRate: number
  }): ReplyFitScore {
    const historicalPerformance = userHistory.avgPerformance
    const styleMatch = userHistory.styleMatch
    const topicSuccess = userHistory.topicSuccessRate

    const score =
      (historicalPerformance * 0.4) +
      (styleMatch * 0.3) +
      (topicSuccess * 0.3)

    return {
      historicalPerformance: parseFloat(historicalPerformance.toFixed(0)),
      styleMatch: parseFloat(styleMatch.toFixed(0)),
      topicSuccess: parseFloat(topicSuccess.toFixed(0)),
      score: parseFloat(score.toFixed(0)),
    }
  }

  generateExplanation(scores: OpportunityScore): string {
    const reasons: string[] = []

    if (scores.velocity.score > 70) {
      reasons.push(`exceptional velocity with ${scores.velocity.engagementRate}% engagement rate`)
    }

    if (scores.saturation.score > 60) {
      reasons.push(`low reply saturation (${scores.saturation.replyCount} replies)`)
    }

    if (scores.authorFatigue.score > 60) {
      reasons.push(`author is actively engaging`)
    }

    if (scores.audienceOverlap.score > 70) {
      reasons.push(`strong topic alignment with your expertise`)
    }

    if (reasons.length === 0) {
      return "This opportunity shows moderate potential based on current signals."
    }

    return `This tweet is showing ${reasons.join(", ")}. ${
      scores.finalScore > 85
        ? "This is a high-value opportunity."
        : "This represents a good engagement opportunity."
    }`
  }

  calculateFinalScore(
    velocity: VelocityScore,
    saturation: SaturationScore,
    authorFatigue: AuthorFatigueScore,
    audienceOverlap: AudienceOverlapScore,
    replyFit: ReplyFitScore
  ): OpportunityScore {
    const finalScore = parseFloat((
      velocity.score * 0.30 +
      saturation.score * 0.25 +
      authorFatigue.score * 0.20 +
      audienceOverlap.score * 0.15 +
      replyFit.score * 0.10
    ).toFixed(0))

    const result: OpportunityScore = {
      velocity,
      saturation,
      authorFatigue,
      audienceOverlap,
      replyFit,
      finalScore,
      explanation: "",
    }

    result.explanation = this.generateExplanation(result)

    return result
  }
}

export const scoringEngine = new ScoringEngine()
