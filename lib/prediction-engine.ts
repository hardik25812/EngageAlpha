/**
 * Outcome Prediction Engine
 *
 * Predicts expected outcomes for reply opportunities with
 * confidence ranges and reasoning explanations.
 */

import { prisma } from './prisma'
import { getDecayMetrics } from './attention-decay'
import type {
  OutcomePrediction,
  OpportunityData,
  DecayPhase,
  UserLearningData
} from '@/types'

// Prediction model constants
const PREDICTION_CONSTANTS = {
  // Base multipliers for impression calculation
  FOLLOWER_IMPRESSION_RATIO: 0.15,    // Avg impressions = 15% of author followers
  VIRAL_MULTIPLIER: 3.0,              // For high-velocity tweets
  DECAY_PENALTY: 0.5,                 // Penalty for tweets in decay

  // Engagement probabilities baseline
  AUTHOR_ENGAGE_BASE: 0.15,           // 15% base probability
  AUTHOR_ACTIVE_BOOST: 0.25,          // +25% if author active

  // Click and follow ratios
  CLICK_RATE: 0.02,                   // 2% of impressions click profile
  FOLLOW_RATE: 0.005,                 // 0.5% of profile clicks follow

  // Confidence thresholds
  HIGH_CONFIDENCE_SAMPLES: 50,
  MEDIUM_CONFIDENCE_SAMPLES: 20,

  // Score impact
  SCORE_MULTIPLIER_HIGH: 1.5,         // For scores > 85
  SCORE_MULTIPLIER_MED: 1.2,          // For scores > 70
}

/**
 * Predict outcome for a reply opportunity
 */
export async function predictOutcome(
  opportunity: OpportunityData,
  userId: string
): Promise<OutcomePrediction> {
  // Get user's historical performance
  const userLearning = await getUserLearning(userId)

  // Get decay metrics if available
  const decayMetrics = await getDecayMetrics(opportunity.id)

  // Calculate impression prediction
  const impressions = predictImpressions(
    opportunity,
    decayMetrics?.currentPhase,
    userLearning
  )

  // Calculate author engagement probability
  const authorEngagement = predictAuthorEngagement(
    opportunity,
    userLearning
  )

  // Calculate profile clicks
  const profileClicks = predictProfileClicks(impressions)

  // Calculate follows
  const follows = predictFollows(profileClicks, opportunity.finalScore)

  // Generate reasoning
  const reasoning = generateReasoning(
    opportunity,
    impressions,
    authorEngagement,
    decayMetrics?.currentPhase
  )

  return {
    impressions,
    authorEngagement,
    profileClicks,
    follows,
    reasoning,
  }
}

/**
 * Predict impression range
 */
function predictImpressions(
  opportunity: OpportunityData,
  decayPhase: DecayPhase | undefined,
  userLearning: UserLearningData | null
): { min: number; max: number; confidence: number } {
  // Base calculation from author followers
  const baseImpressions = opportunity.authorFollowers *
    PREDICTION_CONSTANTS.FOLLOWER_IMPRESSION_RATIO

  // Apply velocity multiplier
  let velocityMultiplier = 1.0
  const growthRate = opportunity.velocityRaw.growthRate
  if (growthRate > 10) {
    velocityMultiplier = PREDICTION_CONSTANTS.VIRAL_MULTIPLIER
  } else if (growthRate > 5) {
    velocityMultiplier = 2.0
  } else if (growthRate > 2) {
    velocityMultiplier = 1.5
  }

  // Apply decay penalty
  let decayMultiplier = 1.0
  if (decayPhase === 'DECAY') {
    decayMultiplier = 0.7
  } else if (decayPhase === 'FLATLINE') {
    decayMultiplier = PREDICTION_CONSTANTS.DECAY_PENALTY
  }

  // Apply score multiplier
  let scoreMultiplier = 1.0
  if (opportunity.finalScore >= 85) {
    scoreMultiplier = PREDICTION_CONSTANTS.SCORE_MULTIPLIER_HIGH
  } else if (opportunity.finalScore >= 70) {
    scoreMultiplier = PREDICTION_CONSTANTS.SCORE_MULTIPLIER_MED
  }

  // Apply saturation impact
  const saturationPenalty = opportunity.saturationRaw.replyCount > 50
    ? 0.7
    : opportunity.saturationRaw.replyCount > 20
      ? 0.85
      : 1.0

  // Calculate predicted impressions
  const predicted = baseImpressions * velocityMultiplier * decayMultiplier *
    scoreMultiplier * saturationPenalty

  // Apply user historical adjustment
  let userMultiplier = 1.0
  if (userLearning && userLearning.totalReplies > 10) {
    const avgRatio = userLearning.avgImpressionsGained / 1000 // normalize
    userMultiplier = Math.max(0.5, Math.min(2.0, avgRatio))
  }

  const adjustedPrediction = predicted * userMultiplier

  // Calculate range
  const variance = 0.3 // 30% variance
  const min = Math.round(adjustedPrediction * (1 - variance))
  const max = Math.round(adjustedPrediction * (1 + variance))

  // Calculate confidence
  const confidence = calculateConfidence(
    userLearning?.totalReplies ?? 0,
    !!decayPhase
  )

  return { min, max, confidence }
}

/**
 * Predict author engagement probability
 */
function predictAuthorEngagement(
  opportunity: OpportunityData,
  userLearning: UserLearningData | null
): { probability: number; confidence: number } {
  let probability = PREDICTION_CONSTANTS.AUTHOR_ENGAGE_BASE * 100

  // Boost if author is currently active
  if (opportunity.authorActive) {
    probability += PREDICTION_CONSTANTS.AUTHOR_ACTIVE_BOOST * 100
  }

  // Adjust based on follower count (smaller accounts more likely to engage)
  if (opportunity.authorFollowers < 10000) {
    probability *= 1.5
  } else if (opportunity.authorFollowers < 50000) {
    probability *= 1.2
  } else if (opportunity.authorFollowers > 500000) {
    probability *= 0.5
  }

  // Adjust based on saturation (less competition = higher chance)
  if (opportunity.saturationRaw.replyCount < 5) {
    probability *= 1.5
  } else if (opportunity.saturationRaw.replyCount > 30) {
    probability *= 0.6
  }

  // Apply user's historical author conversion rate
  if (userLearning && userLearning.bestAuthors.length > 0) {
    const authorMatch = userLearning.bestAuthors.find(
      a => a.authorUsername === opportunity.authorUsername
    )
    if (authorMatch) {
      probability = authorMatch.conversionRate * 100
    }
  }

  // Cap at reasonable limits
  probability = Math.max(5, Math.min(80, probability))

  const confidence = calculateConfidence(
    userLearning?.totalReplies ?? 0,
    true
  )

  return { probability: Math.round(probability), confidence }
}

/**
 * Predict profile clicks
 */
function predictProfileClicks(
  impressions: { min: number; max: number }
): { min: number; max: number } {
  return {
    min: Math.round(impressions.min * PREDICTION_CONSTANTS.CLICK_RATE),
    max: Math.round(impressions.max * PREDICTION_CONSTANTS.CLICK_RATE * 1.5),
  }
}

/**
 * Predict follows
 */
function predictFollows(
  profileClicks: { min: number; max: number },
  score: number
): { min: number; max: number } {
  // Higher scores lead to higher follow rates
  let followRate = PREDICTION_CONSTANTS.FOLLOW_RATE
  if (score >= 85) {
    followRate *= 2
  } else if (score >= 70) {
    followRate *= 1.5
  }

  return {
    min: Math.max(0, Math.round(profileClicks.min * followRate)),
    max: Math.round(profileClicks.max * followRate * 1.5),
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  sampleSize: number,
  hasDecayData: boolean
): number {
  let confidence = 0.5 // Base 50%

  if (sampleSize >= PREDICTION_CONSTANTS.HIGH_CONFIDENCE_SAMPLES) {
    confidence = 0.85
  } else if (sampleSize >= PREDICTION_CONSTANTS.MEDIUM_CONFIDENCE_SAMPLES) {
    confidence = 0.7
  } else if (sampleSize > 0) {
    confidence = 0.5 + (sampleSize / PREDICTION_CONSTANTS.MEDIUM_CONFIDENCE_SAMPLES) * 0.2
  }

  // Boost if we have decay data
  if (hasDecayData) {
    confidence = Math.min(0.95, confidence + 0.1)
  }

  return Math.round(confidence * 100) / 100
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  opportunity: OpportunityData,
  impressions: { min: number; max: number; confidence: number },
  authorEngagement: { probability: number; confidence: number },
  decayPhase: DecayPhase | undefined
): string[] {
  const reasons: string[] = []

  // Impression reasoning
  if (impressions.max > 5000) {
    reasons.push(
      `High impression potential (${formatNumber(impressions.min)}-${formatNumber(impressions.max)}) due to author's ${formatNumber(opportunity.authorFollowers)} followers and ${opportunity.velocityRaw.growthRate.toFixed(1)} engagement/min velocity.`
    )
  } else {
    reasons.push(
      `Expected ${formatNumber(impressions.min)}-${formatNumber(impressions.max)} impressions based on current tweet velocity and author reach.`
    )
  }

  // Saturation reasoning
  if (opportunity.saturationRaw.replyCount < 10) {
    reasons.push(
      `Low saturation (${opportunity.saturationRaw.replyCount} replies) - your reply will be prominently visible.`
    )
  } else if (opportunity.saturationRaw.replyCount > 30) {
    reasons.push(
      `Higher saturation (${opportunity.saturationRaw.replyCount} replies) may reduce visibility.`
    )
  }

  // Author engagement reasoning
  if (opportunity.authorActive) {
    reasons.push(
      `Author is actively engaging with replies (${authorEngagement.probability}% engagement probability).`
    )
  } else if (authorEngagement.probability > 30) {
    reasons.push(
      `Good author engagement probability (${authorEngagement.probability}%) based on typical patterns.`
    )
  }

  // Decay phase reasoning
  if (decayPhase) {
    const phaseMessages: Record<DecayPhase, string> = {
      GROWTH: 'Tweet is still gaining momentum - optimal timing.',
      PEAK: 'Tweet at peak engagement - act quickly.',
      DECAY: 'Tweet entering decay phase - consider a quote to revive.',
      FLATLINE: 'Tweet past prime engagement - lower expected returns.',
    }
    reasons.push(phaseMessages[decayPhase])
  }

  // Score reasoning
  if (opportunity.finalScore >= 85) {
    reasons.push(
      `Exceptional opportunity score (${opportunity.finalScore}) - all signals align.`
    )
  }

  return reasons
}

/**
 * Get user learning data
 */
async function getUserLearning(userId: string): Promise<UserLearningData | null> {
  const learning = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!learning) return null

  return {
    bestAuthors: learning.bestAuthors as UserLearningData['bestAuthors'],
    bestTopics: learning.bestTopics as UserLearningData['bestTopics'],
    bestReplyStyles: learning.bestReplyStyles as UserLearningData['bestReplyStyles'],
    bestPostingHours: learning.bestPostingHours as UserLearningData['bestPostingHours'],
    avgHalfLife: learning.avgHalfLife,
    avgRevivalSuccess: learning.avgRevivalSuccess,
    totalReplies: learning.totalReplies,
    successfulReplies: learning.successfulReplies,
    avgImpressionsGained: learning.avgImpressionsGained,
  }
}

/**
 * Format number for display
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Store prediction for a reply
 */
export async function storePrediction(
  replyId: string,
  prediction: OutcomePrediction
): Promise<void> {
  await prisma.prediction.create({
    data: {
      replyId,
      expectedImpressionsMin: prediction.impressions.min,
      expectedImpressionsMax: prediction.impressions.max,
      probAuthorEngagement: prediction.authorEngagement.probability / 100,
      probProfileClicks: (prediction.profileClicks.max / prediction.impressions.max) || 0,
      probFollows: (prediction.follows.max / prediction.profileClicks.max) || 0,
      explanation: prediction.reasoning.join('\n'),
    },
  })
}

/**
 * Compare prediction to actual outcome
 */
export async function evaluatePrediction(
  replyId: string
): Promise<{
  accuracy: number
  impressionAccuracy: number
  engagementAccuracy: number
} | null> {
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    include: {
      prediction: true,
      outcome: true,
    },
  })

  if (!reply?.prediction || !reply?.outcome) {
    return null
  }

  const pred = reply.prediction
  const out = reply.outcome

  // Calculate impression accuracy (how close to predicted range)
  let impressionAccuracy = 1.0
  if (out.actualImpressions < pred.expectedImpressionsMin) {
    impressionAccuracy = out.actualImpressions / pred.expectedImpressionsMin
  } else if (out.actualImpressions > pred.expectedImpressionsMax) {
    impressionAccuracy = pred.expectedImpressionsMax / out.actualImpressions
  }

  // Calculate engagement accuracy (did we predict correctly?)
  const predictedEngage = pred.probAuthorEngagement > 0.5
  const engagementAccuracy = (predictedEngage === out.authorEngaged) ? 1.0 : 0.0

  // Overall accuracy
  const accuracy = (impressionAccuracy * 0.6) + (engagementAccuracy * 0.4)

  return {
    accuracy: Math.round(accuracy * 100),
    impressionAccuracy: Math.round(impressionAccuracy * 100),
    engagementAccuracy: Math.round(engagementAccuracy * 100),
  }
}
