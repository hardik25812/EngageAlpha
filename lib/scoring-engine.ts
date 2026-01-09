import type { DecayPhase, AttentionDecayMetrics } from '@/types'

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

interface DecayScore {
  halfLife: number
  reviveProbability: number
  decayPhase: DecayPhase
  score: number
}

interface UrgencyFactors {
  timeRemaining: number        // minutes until window closes
  velocityTrend: 'accelerating' | 'stable' | 'decelerating'
  saturationTrend: 'stable' | 'spiking' | 'flooding'
  multiplier: number           // 0.8 - 1.5
}

export interface OpportunityScore {
  velocity: VelocityScore
  saturation: SaturationScore
  authorFatigue: AuthorFatigueScore
  audienceOverlap: AudienceOverlapScore
  replyFit: ReplyFitScore
  decay?: DecayScore
  urgency?: UrgencyFactors
  finalScore: number
  adjustedScore?: number       // Score after decay and urgency adjustments
  explanation: string
  isReviveable: boolean
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
      isReviveable: false,
    }

    result.explanation = this.generateExplanation(result)

    return result
  }

  /**
   * Calculate decay score from attention decay metrics
   */
  calculateDecayScore(decay: AttentionDecayMetrics | null): DecayScore | null {
    if (!decay) return null

    // Score based on revival potential and phase
    let score = 50 // Base score

    // Adjust by phase
    const phaseScores: Record<DecayPhase, number> = {
      GROWTH: 30,    // Don't need revival
      PEAK: 50,      // Good timing
      DECAY: 80,     // Optimal for revival
      FLATLINE: 40,  // May be too late
    }
    score = phaseScores[decay.currentPhase]

    // Boost by revival probability
    score = (score + decay.reviveProbability) / 2

    // Adjust by half-life (shorter = more urgent but also faster decay)
    if (decay.halfLife < 30) {
      score += 10  // Short half-life = act fast
    } else if (decay.halfLife > 120) {
      score -= 10  // Long half-life = less urgent
    }

    return {
      halfLife: decay.halfLife,
      reviveProbability: decay.reviveProbability,
      decayPhase: decay.currentPhase,
      score: Math.max(0, Math.min(100, Math.round(score))),
    }
  }

  /**
   * Calculate urgency multiplier based on time sensitivity
   */
  calculateUrgencyMultiplier(factors: {
    createdAt: Date
    velocityTrend: 'accelerating' | 'stable' | 'decelerating'
    saturationTrend: 'stable' | 'spiking' | 'flooding'
    decayPhase?: DecayPhase
    reviveWindowEnd?: Date
  }): UrgencyFactors {
    const now = new Date()
    let timeRemaining = 60 // Default 60 minutes

    // Calculate time remaining from revive window or tweet age
    if (factors.reviveWindowEnd) {
      timeRemaining = Math.max(0, (factors.reviveWindowEnd.getTime() - now.getTime()) / 60000)
    } else {
      // Estimate based on tweet age
      const ageMinutes = (now.getTime() - factors.createdAt.getTime()) / 60000
      timeRemaining = Math.max(0, 60 - ageMinutes)
    }

    let multiplier = 1.0

    // Time-based urgency
    if (timeRemaining <= 5) {
      multiplier = 1.5  // Critical
    } else if (timeRemaining <= 15) {
      multiplier = 1.3  // High
    } else if (timeRemaining <= 30) {
      multiplier = 1.1  // Medium
    }

    // Velocity trend adjustment
    if (factors.velocityTrend === 'accelerating') {
      multiplier *= 1.1
    } else if (factors.velocityTrend === 'decelerating') {
      multiplier *= 0.9
    }

    // Saturation trend adjustment
    if (factors.saturationTrend === 'flooding') {
      multiplier *= 0.7  // Reduce urgency if flooded
    } else if (factors.saturationTrend === 'spiking') {
      multiplier *= 0.85
    }

    // Decay phase adjustment
    if (factors.decayPhase === 'DECAY') {
      multiplier *= 1.15  // Boost for optimal revival window
    }

    return {
      timeRemaining: Math.round(timeRemaining),
      velocityTrend: factors.velocityTrend,
      saturationTrend: factors.saturationTrend,
      multiplier: Math.max(0.8, Math.min(1.5, Math.round(multiplier * 100) / 100)),
    }
  }

  /**
   * Calculate revival score for a tweet
   */
  calculateRevivalScore(decay: AttentionDecayMetrics | null): number {
    if (!decay) return 0
    if (decay.currentPhase === 'GROWTH') return 0  // Doesn't need revival
    if (decay.currentPhase === 'FLATLINE') return decay.reviveProbability * 0.5  // Reduced chance

    // Score based on revival probability and phase
    let score = decay.reviveProbability

    // Boost if in optimal decay phase
    if (decay.currentPhase === 'DECAY') {
      score *= 1.3
    } else if (decay.currentPhase === 'PEAK') {
      score *= 1.1
    }

    // Check if within revive window
    if (decay.reviveWindow) {
      const now = new Date()
      if (now >= decay.reviveWindow.start && now <= decay.reviveWindow.end) {
        score *= 1.2  // Bonus for being in window
      }
    }

    return Math.min(100, Math.round(score))
  }

  /**
   * Enhanced final score calculation with decay and urgency
   */
  calculateEnhancedFinalScore(
    velocity: VelocityScore,
    saturation: SaturationScore,
    authorFatigue: AuthorFatigueScore,
    audienceOverlap: AudienceOverlapScore,
    replyFit: ReplyFitScore,
    decay?: AttentionDecayMetrics | null,
    urgencyFactors?: {
      createdAt: Date
      velocityTrend: 'accelerating' | 'stable' | 'decelerating'
      saturationTrend: 'stable' | 'spiking' | 'flooding'
    }
  ): OpportunityScore {
    // Base score calculation (original weights)
    const baseScore = parseFloat((
      velocity.score * 0.30 +
      saturation.score * 0.25 +
      authorFatigue.score * 0.20 +
      audienceOverlap.score * 0.15 +
      replyFit.score * 0.10
    ).toFixed(0))

    // Calculate decay score if available
    const decayScore = this.calculateDecayScore(decay ?? null)

    // Calculate urgency if factors provided
    let urgency: UrgencyFactors | undefined
    if (urgencyFactors) {
      urgency = this.calculateUrgencyMultiplier({
        ...urgencyFactors,
        decayPhase: decay?.currentPhase,
        reviveWindowEnd: decay?.reviveWindow?.end,
      })
    }

    // Apply adjustments
    let adjustedScore = baseScore

    // Add decay bonus for reviveable opportunities
    if (decayScore && decayScore.decayPhase !== 'GROWTH') {
      adjustedScore += (decayScore.score - 50) * 0.1  // Small adjustment
    }

    // Apply urgency multiplier
    if (urgency) {
      adjustedScore = adjustedScore * urgency.multiplier
    }

    adjustedScore = Math.max(0, Math.min(100, Math.round(adjustedScore)))

    // Determine if reviveable
    const isReviveable = decay
      ? (decay.currentPhase === 'DECAY' || decay.currentPhase === 'PEAK') &&
        decay.reviveProbability >= 50
      : false

    const result: OpportunityScore = {
      velocity,
      saturation,
      authorFatigue,
      audienceOverlap,
      replyFit,
      decay: decayScore ?? undefined,
      urgency,
      finalScore: baseScore,
      adjustedScore: adjustedScore !== baseScore ? adjustedScore : undefined,
      explanation: "",
      isReviveable,
    }

    result.explanation = this.generateEnhancedExplanation(result)

    return result
  }

  /**
   * Enhanced explanation generation including decay insights
   */
  generateEnhancedExplanation(scores: OpportunityScore): string {
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

    // Add decay-specific insights
    if (scores.isReviveable && scores.decay) {
      reasons.push(`revival opportunity detected (${scores.decay.reviveProbability}% success probability)`)
    }

    if (scores.decay?.decayPhase === 'DECAY') {
      reasons.push(`optimal timing for quote-tweet revival`)
    }

    // Add urgency insights
    if (scores.urgency) {
      if (scores.urgency.timeRemaining <= 10) {
        reasons.push(`window closing in ${scores.urgency.timeRemaining} minutes`)
      }
      if (scores.urgency.velocityTrend === 'accelerating') {
        reasons.push(`engagement is accelerating`)
      }
      if (scores.urgency.saturationTrend === 'spiking') {
        reasons.push(`replies are spiking - act quickly`)
      }
    }

    if (reasons.length === 0) {
      return "This opportunity shows moderate potential based on current signals."
    }

    const effectiveScore = scores.adjustedScore ?? scores.finalScore

    return `This tweet is showing ${reasons.join(", ")}. ${
      effectiveScore > 85
        ? "This is a high-value opportunity."
        : effectiveScore > 70
          ? "This represents a good engagement opportunity."
          : "Consider the timing and your reply angle carefully."
    }`
  }
}

export const scoringEngine = new ScoringEngine()
export type { DecayScore, UrgencyFactors }
