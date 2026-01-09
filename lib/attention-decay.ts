/**
 * Attention Decay Intelligence System
 *
 * Tracks and predicts the engagement lifespan of tweets to identify
 * optimal reply windows and revival opportunities.
 */

import { prisma } from './prisma'
import type {
  AttentionDecayMetrics,
  DecayPhase,
  EngagementDataPoint
} from '@/types'

// Type for engagement snapshot from database
interface EngagementSnapshotDB {
  id: string
  candidateTweetId: string
  capturedAt: Date
  likes: number
  retweets: number
  replies: number
  quotes: number
  impressions: number | null
}

// Type for attention decay record from database
interface AttentionDecayDB {
  candidateTweetId: string
  reviveProbability: number
  currentPhase: string
  reviveWindowStart: Date | null
  reviveWindowEnd: Date | null
}

// Constants for decay calculations
const DECAY_CONSTANTS = {
  HALF_LIFE_BASE: 45,           // Base half-life in minutes for average tweet
  VIRAL_MULTIPLIER: 2.5,        // Multiplier for viral content
  NICHE_MULTIPLIER: 0.7,        // Multiplier for niche content
  GROWTH_THRESHOLD: 1.2,        // Velocity ratio for growth phase
  DECAY_THRESHOLD: 0.5,         // Velocity ratio for decay phase
  FLATLINE_THRESHOLD: 0.1,      // Velocity ratio for flatline
  REVIVE_WINDOW_START: 0.3,     // Start of revive window (% of lifespan)
  REVIVE_WINDOW_END: 0.7,       // End of revive window (% of lifespan)
  MIN_SNAPSHOTS_FOR_DECAY: 3,   // Minimum snapshots needed for decay calculation
}

/**
 * Calculate decay metrics for a tweet based on engagement history
 */
export async function calculateDecayMetrics(
  candidateTweetId: string
): Promise<AttentionDecayMetrics | null> {
  // Fetch engagement snapshots
  const snapshots = await prisma.engagementSnapshot.findMany({
    where: { candidateTweetId },
    orderBy: { capturedAt: 'asc' },
  })

  if (snapshots.length < DECAY_CONSTANTS.MIN_SNAPSHOTS_FOR_DECAY) {
    return null
  }

  const engagementHistory: EngagementDataPoint[] = (snapshots as EngagementSnapshotDB[]).map((s: EngagementSnapshotDB) => ({
    timestamp: s.capturedAt,
    likes: s.likes,
    retweets: s.retweets,
    replies: s.replies,
    quotes: s.quotes,
    impressions: s.impressions ?? undefined,
  }))

  // Calculate velocities between snapshots
  const velocities = calculateVelocities(engagementHistory)

  // Determine current phase
  const currentPhase = determineDecayPhase(velocities)

  // Calculate half-life based on decay pattern
  const halfLife = calculateHalfLife(engagementHistory, velocities)

  // Calculate active lifespan (time until flatline)
  const activeLifespan = calculateActiveLifespan(halfLife, currentPhase)

  // Calculate decay velocity (rate of engagement drop)
  const decayVelocity = calculateDecayVelocity(velocities)

  // Calculate revival probability
  const reviveProbability = calculateReviveProbability(
    currentPhase,
    decayVelocity,
    engagementHistory
  )

  // Calculate revive window
  const reviveWindow = calculateReviveWindow(
    engagementHistory[0].timestamp,
    activeLifespan,
    currentPhase
  )

  const metrics: AttentionDecayMetrics = {
    halfLife,
    activeLifespan,
    reviveProbability,
    decayVelocity,
    currentPhase,
    reviveWindow,
    engagementHistory,
  }

  // Store in database
  await prisma.attentionDecay.upsert({
    where: { candidateTweetId },
    create: {
      candidateTweetId,
      halfLife: metrics.halfLife,
      activeLifespan: metrics.activeLifespan,
      reviveProbability: metrics.reviveProbability,
      decayVelocity: metrics.decayVelocity,
      currentPhase: metrics.currentPhase,
      reviveWindowStart: metrics.reviveWindow?.start,
      reviveWindowEnd: metrics.reviveWindow?.end,
      engagementHistory: metrics.engagementHistory as unknown as object,
    },
    update: {
      halfLife: metrics.halfLife,
      activeLifespan: metrics.activeLifespan,
      reviveProbability: metrics.reviveProbability,
      decayVelocity: metrics.decayVelocity,
      currentPhase: metrics.currentPhase,
      reviveWindowStart: metrics.reviveWindow?.start,
      reviveWindowEnd: metrics.reviveWindow?.end,
      engagementHistory: metrics.engagementHistory as unknown as object,
      updatedAt: new Date(),
    },
  })

  return metrics
}

/**
 * Calculate engagement velocities between consecutive snapshots
 */
function calculateVelocities(history: EngagementDataPoint[]): number[] {
  const velocities: number[] = []

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]
    const curr = history[i]

    const timeDiffMinutes = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 60000
    if (timeDiffMinutes <= 0) continue

    const engagementDiff =
      (curr.likes - prev.likes) +
      (curr.retweets - prev.retweets) * 2 +
      (curr.replies - prev.replies) * 1.5

    velocities.push(engagementDiff / timeDiffMinutes)
  }

  return velocities
}

/**
 * Determine the current decay phase based on velocity trends
 */
export function determineDecayPhase(velocities: number[]): DecayPhase {
  if (velocities.length < 2) return 'GROWTH'

  const recentVelocities = velocities.slice(-3)
  const avgRecent = recentVelocities.reduce((a, b) => a + b, 0) / recentVelocities.length
  const maxVelocity = Math.max(...velocities)

  if (maxVelocity === 0) return 'FLATLINE'

  const velocityRatio = avgRecent / maxVelocity

  if (velocityRatio >= DECAY_CONSTANTS.GROWTH_THRESHOLD) {
    return 'GROWTH'
  } else if (velocityRatio >= DECAY_CONSTANTS.DECAY_THRESHOLD) {
    return 'PEAK'
  } else if (velocityRatio >= DECAY_CONSTANTS.FLATLINE_THRESHOLD) {
    return 'DECAY'
  } else {
    return 'FLATLINE'
  }
}

/**
 * Calculate the half-life of engagement
 */
function calculateHalfLife(
  history: EngagementDataPoint[],
  velocities: number[]
): number {
  if (velocities.length < 2) {
    return DECAY_CONSTANTS.HALF_LIFE_BASE
  }

  // Find peak velocity
  const peakIndex = velocities.indexOf(Math.max(...velocities))
  const peakVelocity = velocities[peakIndex]

  if (peakVelocity === 0) {
    return DECAY_CONSTANTS.HALF_LIFE_BASE
  }

  // Find when velocity dropped to half of peak
  for (let i = peakIndex + 1; i < velocities.length; i++) {
    if (velocities[i] <= peakVelocity / 2) {
      const startTime = history[peakIndex].timestamp.getTime()
      const halfTime = history[i].timestamp.getTime()
      return Math.round((halfTime - startTime) / 60000)
    }
  }

  // If not yet at half, extrapolate based on decay rate
  const decayRate = velocities.length > 1
    ? (velocities[velocities.length - 1] - peakVelocity) / (velocities.length - peakIndex)
    : 0

  if (decayRate >= 0) {
    // Still growing or stable, use multiplied base
    return DECAY_CONSTANTS.HALF_LIFE_BASE * DECAY_CONSTANTS.VIRAL_MULTIPLIER
  }

  // Extrapolate half-life
  const timeToHalf = -peakVelocity / (2 * decayRate)
  return Math.round(Math.min(timeToHalf * 5, DECAY_CONSTANTS.HALF_LIFE_BASE * 3))
}

/**
 * Calculate active lifespan until flatline
 */
function calculateActiveLifespan(halfLife: number, phase: DecayPhase): number {
  const phaseMultipliers: Record<DecayPhase, number> = {
    GROWTH: 4,
    PEAK: 3,
    DECAY: 2,
    FLATLINE: 1,
  }

  return Math.round(halfLife * phaseMultipliers[phase])
}

/**
 * Calculate the rate of engagement decay per minute
 */
function calculateDecayVelocity(velocities: number[]): number {
  if (velocities.length < 2) return 0

  const recentVelocities = velocities.slice(-5)
  const firstRecent = recentVelocities[0]
  const lastRecent = recentVelocities[recentVelocities.length - 1]

  return (firstRecent - lastRecent) / recentVelocities.length
}

/**
 * Calculate probability of successful revival
 */
function calculateReviveProbability(
  phase: DecayPhase,
  decayVelocity: number,
  history: EngagementDataPoint[]
): number {
  // Base probability by phase
  const baseProbability: Record<DecayPhase, number> = {
    GROWTH: 20,    // Low - doesn't need revival
    PEAK: 40,      // Medium - good timing
    DECAY: 70,     // High - optimal revival window
    FLATLINE: 30,  // Lower - may be too late
  }

  let probability = baseProbability[phase]

  // Adjust based on engagement size
  const totalEngagement = history.length > 0
    ? history[history.length - 1].likes +
      history[history.length - 1].retweets * 2 +
      history[history.length - 1].replies * 1.5
    : 0

  if (totalEngagement > 1000) probability += 15
  else if (totalEngagement > 100) probability += 5
  else if (totalEngagement < 10) probability -= 20

  // Adjust based on decay velocity
  if (decayVelocity > 5) probability -= 10  // Fast decay = harder to revive
  if (decayVelocity < 1) probability += 10  // Slow decay = easier to revive

  return Math.max(0, Math.min(100, probability))
}

/**
 * Calculate the optimal revive window
 */
function calculateReviveWindow(
  tweetCreatedAt: Date,
  activeLifespan: number,
  phase: DecayPhase
): { start: Date; end: Date } | null {
  if (phase === 'FLATLINE') return null
  if (phase === 'GROWTH') return null  // No need to revive yet

  const lifespanMs = activeLifespan * 60000
  const startOffset = lifespanMs * DECAY_CONSTANTS.REVIVE_WINDOW_START
  const endOffset = lifespanMs * DECAY_CONSTANTS.REVIVE_WINDOW_END

  return {
    start: new Date(tweetCreatedAt.getTime() + startOffset),
    end: new Date(tweetCreatedAt.getTime() + endOffset),
  }
}

/**
 * Predict revival success for different revival types
 */
export async function predictRevivalSuccess(
  candidateTweetId: string,
  revivalType: 'reply' | 'quote' | 'retweet'
): Promise<{ probability: number; reasoning: string }> {
  const decay = await prisma.attentionDecay.findUnique({
    where: { candidateTweetId },
    include: { candidateTweet: true },
  })

  if (!decay) {
    return { probability: 50, reasoning: 'Insufficient data for prediction' }
  }

  let baseProbability = decay.reviveProbability

  // Adjust by revival type
  const typeMultipliers: Record<string, number> = {
    quote: 1.3,    // Quotes are most effective for revival
    reply: 1.0,    // Standard reply
    retweet: 0.7,  // Retweets less effective for revival
  }

  baseProbability *= typeMultipliers[revivalType] || 1

  // Adjust by current phase
  if (decay.currentPhase === 'DECAY') {
    baseProbability *= 1.2  // Optimal phase for revival
  }

  const probability = Math.min(100, Math.round(baseProbability))

  const reasoning = generateRevivalReasoning(
    decay.currentPhase as DecayPhase,
    probability,
    revivalType,
    decay.halfLife
  )

  return { probability, reasoning }
}

function generateRevivalReasoning(
  phase: DecayPhase,
  probability: number,
  type: string,
  halfLife: number
): string {
  const phaseDescriptions: Record<DecayPhase, string> = {
    GROWTH: 'still gaining momentum',
    PEAK: 'at peak engagement',
    DECAY: 'in the optimal revival window',
    FLATLINE: 'past prime engagement window',
  }

  return `This tweet is ${phaseDescriptions[phase]} with a ${halfLife}min half-life. ` +
    `A ${type} has a ${probability}% chance of restarting distribution.`
}

/**
 * Get all reviveable opportunities for a user
 */
export async function getReviveableOpportunities(userId: string): Promise<{
  candidateTweetId: string
  reviveProbability: number
  currentPhase: DecayPhase
  reviveWindow: { start: Date; end: Date } | null
}[]> {
  const now = new Date()

  const opportunities = await prisma.attentionDecay.findMany({
    where: {
      currentPhase: { in: ['PEAK', 'DECAY'] },
      reviveProbability: { gte: 50 },
      reviveWindowEnd: { gte: now },
      candidateTweet: {
        alerts: {
          some: { userId },
        },
      },
    },
    orderBy: { reviveProbability: 'desc' },
    take: 20,
  })

  return (opportunities as AttentionDecayDB[]).map((o: AttentionDecayDB) => ({
    candidateTweetId: o.candidateTweetId,
    reviveProbability: o.reviveProbability,
    currentPhase: o.currentPhase as DecayPhase,
    reviveWindow: o.reviveWindowStart && o.reviveWindowEnd
      ? { start: o.reviveWindowStart, end: o.reviveWindowEnd }
      : null,
  }))
}

/**
 * Capture an engagement snapshot for a tweet
 */
export async function captureEngagementSnapshot(
  candidateTweetId: string,
  engagement: {
    likes: number
    retweets: number
    replies: number
    quotes?: number
    impressions?: number
  }
): Promise<void> {
  await prisma.engagementSnapshot.create({
    data: {
      candidateTweetId,
      likes: engagement.likes,
      retweets: engagement.retweets,
      replies: engagement.replies,
      quotes: engagement.quotes ?? 0,
      impressions: engagement.impressions,
    },
  })

  // Recalculate decay metrics after new snapshot
  await calculateDecayMetrics(candidateTweetId)
}

/**
 * Get decay metrics from database (cached)
 */
export async function getDecayMetrics(
  candidateTweetId: string
): Promise<AttentionDecayMetrics | null> {
  const decay = await prisma.attentionDecay.findUnique({
    where: { candidateTweetId },
  })

  if (!decay) return null

  return {
    halfLife: decay.halfLife,
    activeLifespan: decay.activeLifespan,
    reviveProbability: decay.reviveProbability,
    decayVelocity: decay.decayVelocity,
    currentPhase: decay.currentPhase as DecayPhase,
    reviveWindow: decay.reviveWindowStart && decay.reviveWindowEnd
      ? { start: decay.reviveWindowStart, end: decay.reviveWindowEnd }
      : null,
    engagementHistory: decay.engagementHistory as unknown as EngagementDataPoint[],
  }
}
