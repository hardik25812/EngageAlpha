/**
 * Smart Alert Engine
 *
 * Generates intelligent, context-aware alerts for reply opportunities
 * with urgency levels and time windows.
 */

import { prisma } from './prisma'
import { getDecayMetrics } from './attention-decay'
import type {
  AlertType,
  AlertUrgency,
  SmartAlertData,
  DecayPhase,
  OpportunityData
} from '@/types'

// Type for smart alert from database
interface SmartAlertDB {
  id: string
  userId: string
  type: string
  urgency: string
  title: string
  message: string
  optimalWindow: number | null
  closingWindow: number | null
  candidateTweetId: string | null
  dismissed: boolean
  actedOn: boolean
  createdAt: Date
  expiresAt: Date | null
}

// Alert configuration
const ALERT_CONFIG = {
  SCORE_THRESHOLDS: {
    CRITICAL: 90,
    HIGH: 80,
    MEDIUM: 70,
  },
  WINDOW_THRESHOLDS: {
    CRITICAL: 5,      // minutes - critical if < 5 min
    HIGH: 15,         // minutes - high if < 15 min
  },
  VELOCITY_SPIKE_THRESHOLD: 2.5,  // 2.5x average velocity
  MAX_ACTIVE_ALERTS: 10,          // per user
}

interface AlertContext {
  opportunity: OpportunityData
  userId: string
  decayPhase?: DecayPhase
  reviveProbability?: number
  windowRemaining?: number
}

/**
 * Generate a smart alert for an opportunity
 */
export async function generateSmartAlert(
  context: AlertContext
): Promise<SmartAlertData | null> {
  const { opportunity, userId } = context

  // Check if user already has max alerts
  const activeAlertCount = await prisma.smartAlert.count({
    where: {
      userId,
      dismissed: false,
      expiresAt: { gte: new Date() },
    },
  })

  if (activeAlertCount >= ALERT_CONFIG.MAX_ACTIVE_ALERTS) {
    return null
  }

  // Determine alert type
  const alertType = determineAlertType(context)
  if (!alertType) return null

  // Calculate urgency
  const urgency = calculateUrgency(
    context.decayPhase,
    context.windowRemaining,
    opportunity.finalScore
  )

  // Generate title and message
  const { title, message } = generateAlertContent(alertType, context)

  // Calculate windows
  const { optimalWindow, closingWindow } = calculateWindows(context)

  // Calculate expiry
  const expiresAt = closingWindow
    ? new Date(Date.now() + closingWindow * 60000)
    : new Date(Date.now() + 60 * 60000) // Default 1 hour

  // Create alert in database
  const alert = await prisma.smartAlert.create({
    data: {
      userId,
      candidateTweetId: opportunity.id,
      type: alertType,
      urgency,
      title,
      message,
      optimalWindow,
      closingWindow,
      expiresAt,
    },
  })

  return {
    id: alert.id,
    type: alert.type as AlertType,
    urgency: alert.urgency as AlertUrgency,
    title: alert.title,
    message: alert.message,
    optimalWindow: alert.optimalWindow,
    closingWindow: alert.closingWindow,
    candidateTweetId: alert.candidateTweetId,
    dismissed: alert.dismissed,
    actedOn: alert.actedOn,
    createdAt: alert.createdAt,
    expiresAt: alert.expiresAt,
  }
}

/**
 * Determine the type of alert to generate
 */
function determineAlertType(context: AlertContext): AlertType | null {
  const { opportunity, decayPhase, reviveProbability } = context

  // Check for revive signal
  if (
    (decayPhase === 'DECAY' || decayPhase === 'PEAK') &&
    reviveProbability &&
    reviveProbability >= 60
  ) {
    return 'REVIVE_SIGNAL'
  }

  // Check for high-score opportunity
  if (opportunity.finalScore >= ALERT_CONFIG.SCORE_THRESHOLDS.HIGH) {
    return 'REPLY_NOW'
  }

  // Check for velocity spike
  if (opportunity.velocityRaw.growthRate >= ALERT_CONFIG.VELOCITY_SPIKE_THRESHOLD) {
    return 'VELOCITY_SPIKE'
  }

  // Check if author is active
  if (opportunity.authorActive) {
    return 'AUTHOR_ACTIVE'
  }

  // Check for closing window
  if (
    context.windowRemaining &&
    context.windowRemaining <= ALERT_CONFIG.WINDOW_THRESHOLDS.HIGH
  ) {
    return 'WINDOW_CLOSING'
  }

  return null
}

/**
 * Calculate alert urgency based on multiple factors
 */
export function calculateUrgency(
  decayPhase: DecayPhase | undefined,
  windowRemaining: number | undefined,
  score: number
): AlertUrgency {
  // Critical if window is about to close
  if (windowRemaining && windowRemaining <= ALERT_CONFIG.WINDOW_THRESHOLDS.CRITICAL) {
    return 'CRITICAL'
  }

  // Critical if score is exceptional
  if (score >= ALERT_CONFIG.SCORE_THRESHOLDS.CRITICAL) {
    return 'CRITICAL'
  }

  // High if in decay phase or high score
  if (decayPhase === 'DECAY' || score >= ALERT_CONFIG.SCORE_THRESHOLDS.HIGH) {
    return 'HIGH'
  }

  // High if window closing soon
  if (windowRemaining && windowRemaining <= ALERT_CONFIG.WINDOW_THRESHOLDS.HIGH) {
    return 'HIGH'
  }

  return 'MEDIUM'
}

/**
 * Generate alert title and message
 */
function generateAlertContent(
  type: AlertType,
  context: AlertContext
): { title: string; message: string } {
  const { opportunity, reviveProbability, windowRemaining } = context
  const authorName = opportunity.authorName.split(' ')[0]

  const templates: Record<AlertType, { title: string; message: string }> = {
    REPLY_NOW: {
      title: `High-leverage opportunity from ${authorName}`,
      message: `Score: ${opportunity.finalScore}. Low saturation (${opportunity.saturationRaw.replyCount} replies) with ${opportunity.velocityRaw.growthRate.toFixed(1)} engagements/min velocity.`,
    },
    REVIVE_SIGNAL: {
      title: `Revival opportunity on ${authorName}'s tweet`,
      message: `${reviveProbability}% revival probability. Quoting or replying now can restart distribution and capture remaining attention.`,
    },
    WINDOW_CLOSING: {
      title: `Window closing on ${authorName}'s tweet`,
      message: `Only ${windowRemaining} minutes left in optimal reply window. Saturation increasing - act now for best visibility.`,
    },
    AUTHOR_ACTIVE: {
      title: `${authorName} is actively engaging`,
      message: `Author responding to replies now. High chance of direct engagement if you reply with a valuable take.`,
    },
    VELOCITY_SPIKE: {
      title: `Velocity spike on ${authorName}'s tweet`,
      message: `Engagement accelerating at ${opportunity.velocityRaw.growthRate.toFixed(1)}x normal rate. Early reply position available.`,
    },
  }

  return templates[type]
}

/**
 * Calculate optimal and closing windows
 */
function calculateWindows(context: AlertContext): {
  optimalWindow: number | null
  closingWindow: number | null
} {
  const { decayPhase, windowRemaining } = context

  if (!windowRemaining) {
    // Estimate based on decay phase
    const phaseWindows: Record<DecayPhase, { optimal: number; closing: number }> = {
      GROWTH: { optimal: 30, closing: 60 },
      PEAK: { optimal: 15, closing: 30 },
      DECAY: { optimal: 10, closing: 20 },
      FLATLINE: { optimal: 5, closing: 10 },
    }

    const windows = phaseWindows[decayPhase || 'GROWTH']
    return {
      optimalWindow: windows.optimal,
      closingWindow: windows.closing,
    }
  }

  return {
    optimalWindow: Math.round(windowRemaining * 0.5),
    closingWindow: windowRemaining,
  }
}

/**
 * Check if an alert should be triggered for an opportunity
 */
export async function shouldTriggerAlert(
  opportunity: OpportunityData,
  userId: string
): Promise<boolean> {
  // Check user preferences
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  })

  if (!preferences) return false

  // Check if within time window
  const now = new Date()
  const currentHour = now.getHours()
  if (
    currentHour < preferences.timeWindowStart ||
    currentHour >= preferences.timeWindowEnd
  ) {
    return false
  }

  // Check daily alert limit
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayAlertCount = await prisma.smartAlert.count({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
  })

  if (todayAlertCount >= preferences.maxAlertsPerDay) {
    return false
  }

  // Check score threshold
  if (opportunity.finalScore < ALERT_CONFIG.SCORE_THRESHOLDS.MEDIUM) {
    return false
  }

  // Check for duplicate alert on same tweet
  const existingAlert = await prisma.smartAlert.findFirst({
    where: {
      userId,
      candidateTweetId: opportunity.id,
      dismissed: false,
      expiresAt: { gte: now },
    },
  })

  if (existingAlert) {
    return false
  }

  return true
}

/**
 * Get active alerts for a user
 */
export async function getActiveAlerts(userId: string): Promise<SmartAlertData[]> {
  const now = new Date()

  const alerts = await prisma.smartAlert.findMany({
    where: {
      userId,
      dismissed: false,
      OR: [
        { expiresAt: { gte: now } },
        { expiresAt: null },
      ],
    },
    orderBy: [
      { urgency: 'asc' },  // CRITICAL first (alphabetically)
      { createdAt: 'desc' },
    ],
    take: 20,
  })

  const typedAlerts = alerts as SmartAlertDB[]
  return typedAlerts.map((alert) => ({
    id: alert.id,
    type: alert.type as AlertType,
    urgency: alert.urgency as AlertUrgency,
    title: alert.title,
    message: alert.message,
    optimalWindow: alert.optimalWindow,
    closingWindow: alert.closingWindow,
    candidateTweetId: alert.candidateTweetId,
    dismissed: alert.dismissed,
    actedOn: alert.actedOn,
    createdAt: alert.createdAt,
    expiresAt: alert.expiresAt,
  }))
}

/**
 * Dismiss an alert with optional feedback
 */
export async function dismissAlert(
  alertId: string,
  feedback?: 'not_relevant' | 'too_late' | 'already_replied' | 'other'
): Promise<void> {
  await prisma.smartAlert.update({
    where: { id: alertId },
    data: {
      dismissed: true,
      // Could log feedback for learning
    },
  })

  // If feedback provided, create learning signal
  if (feedback) {
    const alert = await prisma.smartAlert.findUnique({
      where: { id: alertId },
    })

    if (alert) {
      await prisma.learningSignal.create({
        data: {
          userId: alert.userId,
          signalType: 'alert_dismissed',
          signalData: {
            alertType: alert.type,
            feedback,
            urgency: alert.urgency,
          },
          confidence: 0.7,
        },
      })
    }
  }
}

/**
 * Mark alert as acted on
 */
export async function markAlertActedOn(alertId: string): Promise<void> {
  await prisma.smartAlert.update({
    where: { id: alertId },
    data: { actedOn: true },
  })
}

/**
 * Process new opportunities and generate alerts
 */
export async function processOpportunitiesForAlerts(
  opportunities: OpportunityData[],
  userId: string
): Promise<SmartAlertData[]> {
  const alerts: SmartAlertData[] = []

  for (const opportunity of opportunities) {
    const shouldAlert = await shouldTriggerAlert(opportunity, userId)
    if (!shouldAlert) continue

    // Get decay metrics if available
    const decayMetrics = await getDecayMetrics(opportunity.id)

    const context: AlertContext = {
      opportunity,
      userId,
      decayPhase: decayMetrics?.currentPhase,
      reviveProbability: decayMetrics?.reviveProbability,
      windowRemaining: decayMetrics?.reviveWindow
        ? Math.round((decayMetrics.reviveWindow.end.getTime() - Date.now()) / 60000)
        : undefined,
    }

    const alert = await generateSmartAlert(context)
    if (alert) {
      alerts.push(alert)
    }
  }

  return alerts
}
