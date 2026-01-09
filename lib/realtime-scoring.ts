/**
 * Real-Time Scoring System
 *
 * Provides velocity tracking, acceleration detection,
 * and saturation spike monitoring for live score updates.
 */

import { prisma } from './prisma'
import type {
  VelocitySnapshot,
  SaturationSnapshot,
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

// Real-time configuration
const REALTIME_CONFIG = {
  VELOCITY_WINDOW: 10,           // Minutes to consider for velocity
  ACCELERATION_THRESHOLD: 1.5,   // 1.5x change = acceleration
  DECELERATION_THRESHOLD: 0.7,   // 0.7x change = deceleration
  SATURATION_SPIKE_THRESHOLD: 3, // 3x normal reply rate = spike
  FLOOD_THRESHOLD: 10,           // 10 replies/min = flooding
  SNAPSHOT_INTERVAL: 5,          // Minutes between snapshots
}

/**
 * Calculate velocity delta from engagement snapshots
 */
export function calculateVelocityDelta(
  snapshots: EngagementDataPoint[]
): VelocitySnapshot | null {
  if (snapshots.length < 2) return null

  // Sort by timestamp
  const sorted = [...snapshots].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )

  // Get recent snapshots within velocity window
  const now = new Date()
  const windowStart = new Date(now.getTime() - REALTIME_CONFIG.VELOCITY_WINDOW * 60000)
  const recentSnapshots = sorted.filter(s => s.timestamp >= windowStart)

  if (recentSnapshots.length < 2) {
    // Fall back to last two available snapshots
    recentSnapshots.push(...sorted.slice(-2))
  }

  // Calculate velocities
  const velocities: number[] = []
  for (let i = 1; i < recentSnapshots.length; i++) {
    const prev = recentSnapshots[i - 1]
    const curr = recentSnapshots[i]

    const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 60000
    if (timeDiff <= 0) continue

    const engagementDiff =
      (curr.likes - prev.likes) +
      (curr.retweets - prev.retweets) * 2 +
      (curr.replies - prev.replies) * 1.5

    velocities.push(engagementDiff / timeDiff)
  }

  if (velocities.length === 0) return null

  // Current velocity (most recent)
  const currentVelocity = velocities[velocities.length - 1]

  // Calculate acceleration
  let acceleration = 0
  if (velocities.length >= 2) {
    const prevVelocity = velocities[velocities.length - 2]
    acceleration = prevVelocity > 0
      ? (currentVelocity - prevVelocity) / prevVelocity
      : currentVelocity > 0 ? 1 : 0
  }

  // Determine trend
  let trend: VelocitySnapshot['trend'] = 'stable'
  if (acceleration >= REALTIME_CONFIG.ACCELERATION_THRESHOLD - 1) {
    trend = 'accelerating'
  } else if (acceleration <= REALTIME_CONFIG.DECELERATION_THRESHOLD - 1) {
    trend = 'decelerating'
  }

  return {
    timestamp: now,
    velocity: Math.round(currentVelocity * 100) / 100,
    acceleration: Math.round(acceleration * 100) / 100,
    trend,
  }
}

/**
 * Detect acceleration in velocity history
 */
export function detectAcceleration(
  velocityHistory: VelocitySnapshot[]
): {
  isAccelerating: boolean
  accelerationRate: number
  projectedPeakMinutes: number | null
} {
  if (velocityHistory.length < 3) {
    return {
      isAccelerating: false,
      accelerationRate: 0,
      projectedPeakMinutes: null,
    }
  }

  // Calculate acceleration trend
  const accelerations = velocityHistory
    .slice(-5)
    .map(v => v.acceleration)

  const avgAcceleration =
    accelerations.reduce((a, b) => a + b, 0) / accelerations.length

  const isAccelerating = avgAcceleration >= REALTIME_CONFIG.ACCELERATION_THRESHOLD - 1

  // Project peak if accelerating
  let projectedPeakMinutes: number | null = null
  if (isAccelerating && avgAcceleration > 0) {
    // Simple projection: assume acceleration will taper off
    const currentVelocity = velocityHistory[velocityHistory.length - 1].velocity
    projectedPeakMinutes = Math.round(currentVelocity / avgAcceleration)
  }

  return {
    isAccelerating,
    accelerationRate: Math.round(avgAcceleration * 100) / 100,
    projectedPeakMinutes,
  }
}

/**
 * Detect saturation spike in reply history
 */
export function detectSaturationSpike(
  snapshots: EngagementDataPoint[]
): SaturationSnapshot {
  const now = new Date()

  if (snapshots.length < 2) {
    return {
      timestamp: now,
      replyCount: snapshots[0]?.replies ?? 0,
      replyVelocity: 0,
      trend: 'stable',
    }
  }

  // Sort by timestamp
  const sorted = [...snapshots].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )

  // Calculate reply velocities
  const velocities: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 60000
    if (timeDiff <= 0) continue

    const replyDiff = curr.replies - prev.replies
    velocities.push(replyDiff / timeDiff)
  }

  if (velocities.length === 0) {
    return {
      timestamp: now,
      replyCount: sorted[sorted.length - 1].replies,
      replyVelocity: 0,
      trend: 'stable',
    }
  }

  // Current reply velocity
  const currentVelocity = velocities[velocities.length - 1]

  // Average velocity
  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length

  // Determine trend
  let trend: SaturationSnapshot['trend'] = 'stable'
  if (currentVelocity >= REALTIME_CONFIG.FLOOD_THRESHOLD) {
    trend = 'flooding'
  } else if (avgVelocity > 0 && currentVelocity / avgVelocity >= REALTIME_CONFIG.SATURATION_SPIKE_THRESHOLD) {
    trend = 'spiking'
  }

  return {
    timestamp: now,
    replyCount: sorted[sorted.length - 1].replies,
    replyVelocity: Math.round(currentVelocity * 100) / 100,
    trend,
  }
}

/**
 * Get real-time score adjustment based on current velocity and saturation
 */
export function calculateRealtimeScoreAdjustment(
  velocity: VelocitySnapshot,
  saturation: SaturationSnapshot
): {
  adjustment: number
  reason: string
} {
  let adjustment = 0
  const reasons: string[] = []

  // Velocity adjustments
  if (velocity.trend === 'accelerating') {
    adjustment += 5
    reasons.push('Accelerating engagement (+5)')
  } else if (velocity.trend === 'decelerating') {
    adjustment -= 3
    reasons.push('Decelerating engagement (-3)')
  }

  // High velocity bonus
  if (velocity.velocity >= 10) {
    adjustment += 8
    reasons.push('High velocity (+8)')
  } else if (velocity.velocity >= 5) {
    adjustment += 4
    reasons.push('Good velocity (+4)')
  }

  // Saturation penalties
  if (saturation.trend === 'flooding') {
    adjustment -= 15
    reasons.push('Reply flood detected (-15)')
  } else if (saturation.trend === 'spiking') {
    adjustment -= 8
    reasons.push('Saturation spiking (-8)')
  }

  // Reply count penalties
  if (saturation.replyCount > 100) {
    adjustment -= 10
    reasons.push('High saturation (-10)')
  } else if (saturation.replyCount > 50) {
    adjustment -= 5
    reasons.push('Moderate saturation (-5)')
  } else if (saturation.replyCount < 10) {
    adjustment += 5
    reasons.push('Low saturation (+5)')
  }

  return {
    adjustment,
    reason: reasons.join(', ') || 'No significant changes',
  }
}

/**
 * Process snapshots for a candidate tweet and return real-time metrics
 */
export async function getRealtimeMetrics(candidateTweetId: string): Promise<{
  velocity: VelocitySnapshot | null
  saturation: SaturationSnapshot
  scoreAdjustment: { adjustment: number; reason: string }
  lastUpdated: Date
}> {
  // Fetch recent snapshots
  const snapshots = await prisma.engagementSnapshot.findMany({
    where: { candidateTweetId },
    orderBy: { capturedAt: 'asc' },
    take: 20, // Last 20 snapshots
  })

  const typedSnapshots = snapshots as EngagementSnapshotDB[]
  const engagementHistory: EngagementDataPoint[] = typedSnapshots.map((s) => ({
    timestamp: s.capturedAt,
    likes: s.likes,
    retweets: s.retweets,
    replies: s.replies,
    quotes: s.quotes,
    impressions: s.impressions ?? undefined,
  }))

  const velocity = calculateVelocityDelta(engagementHistory)
  const saturation = detectSaturationSpike(engagementHistory)

  const scoreAdjustment = velocity
    ? calculateRealtimeScoreAdjustment(velocity, saturation)
    : { adjustment: 0, reason: 'Insufficient data' }

  return {
    velocity,
    saturation,
    scoreAdjustment,
    lastUpdated: snapshots.length > 0
      ? snapshots[snapshots.length - 1].capturedAt
      : new Date(),
  }
}

/**
 * Check if a new snapshot should be captured
 */
export async function shouldCaptureSnapshot(
  candidateTweetId: string
): Promise<boolean> {
  const lastSnapshot = await prisma.engagementSnapshot.findFirst({
    where: { candidateTweetId },
    orderBy: { capturedAt: 'desc' },
  })

  if (!lastSnapshot) return true

  const minutesSinceLastSnapshot =
    (Date.now() - lastSnapshot.capturedAt.getTime()) / 60000

  return minutesSinceLastSnapshot >= REALTIME_CONFIG.SNAPSHOT_INTERVAL
}

/**
 * Get velocity trend over time for visualization
 */
export async function getVelocityTrend(
  candidateTweetId: string,
  limit: number = 12
): Promise<VelocitySnapshot[]> {
  const snapshots = await prisma.engagementSnapshot.findMany({
    where: { candidateTweetId },
    orderBy: { capturedAt: 'asc' },
  })

  if (snapshots.length < 2) return []

  const typedSnaps = snapshots as EngagementSnapshotDB[]
  const engagementHistory: EngagementDataPoint[] = typedSnaps.map((s) => ({
    timestamp: s.capturedAt,
    likes: s.likes,
    retweets: s.retweets,
    replies: s.replies,
    quotes: s.quotes,
    impressions: s.impressions ?? undefined,
  }))

  const velocityPoints: VelocitySnapshot[] = []

  for (let i = 2; i <= engagementHistory.length; i++) {
    const subset = engagementHistory.slice(0, i)
    const velocity = calculateVelocityDelta(subset)
    if (velocity) {
      velocityPoints.push(velocity)
    }
  }

  return velocityPoints.slice(-limit)
}

/**
 * Batch process multiple tweets for real-time updates
 */
export async function batchGetRealtimeScores(
  candidateTweetIds: string[]
): Promise<Map<string, {
  velocityTrend: VelocitySnapshot['trend']
  saturationTrend: SaturationSnapshot['trend']
  adjustment: number
}>> {
  const results = new Map()

  // Fetch all snapshots in one query
  const allSnapshots = await prisma.engagementSnapshot.findMany({
    where: { candidateTweetId: { in: candidateTweetIds } },
    orderBy: { capturedAt: 'asc' },
  })

  // Group by candidate tweet
  const snapshotsByTweet = new Map<string, EngagementDataPoint[]>()
  for (const snapshot of allSnapshots) {
    const existing = snapshotsByTweet.get(snapshot.candidateTweetId) || []
    existing.push({
      timestamp: snapshot.capturedAt,
      likes: snapshot.likes,
      retweets: snapshot.retweets,
      replies: snapshot.replies,
      quotes: snapshot.quotes,
      impressions: snapshot.impressions ?? undefined,
    })
    snapshotsByTweet.set(snapshot.candidateTweetId, existing)
  }

  // Process each tweet
  for (const tweetId of candidateTweetIds) {
    const snapshots = snapshotsByTweet.get(tweetId) || []

    if (snapshots.length < 2) {
      results.set(tweetId, {
        velocityTrend: 'stable',
        saturationTrend: 'stable',
        adjustment: 0,
      })
      continue
    }

    const velocity = calculateVelocityDelta(snapshots)
    const saturation = detectSaturationSpike(snapshots)
    const scoreAdjustment = velocity
      ? calculateRealtimeScoreAdjustment(velocity, saturation)
      : { adjustment: 0, reason: '' }

    results.set(tweetId, {
      velocityTrend: velocity?.trend || 'stable',
      saturationTrend: saturation.trend,
      adjustment: scoreAdjustment.adjustment,
    })
  }

  return results
}

/**
 * Calculate urgency based on real-time metrics
 */
export function calculateRealtimeUrgency(
  velocity: VelocitySnapshot | null,
  saturation: SaturationSnapshot
): 'critical' | 'high' | 'medium' | 'low' {
  // Critical if flooding imminent
  if (saturation.trend === 'flooding') {
    return 'critical'
  }

  // High if spiking or accelerating rapidly
  if (saturation.trend === 'spiking') {
    return 'high'
  }

  if (velocity?.trend === 'accelerating' && velocity.velocity >= 5) {
    return 'high'
  }

  // Medium if good velocity
  if (velocity && velocity.velocity >= 2) {
    return 'medium'
  }

  return 'low'
}
