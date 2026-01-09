/**
 * Learning Engine
 *
 * Tracks user performance patterns and personalizes scoring
 * based on historical outcomes.
 */

import { prisma } from './prisma'
import type {
  UserLearningData,
  AuthorPerformance,
  TopicPerformance,
  StylePerformance,
  HourPerformance,
  OutcomeLabel
} from '@/types'

// Learning configuration
const LEARNING_CONFIG = {
  MIN_SAMPLE_SIZE: 5,           // Minimum samples for pattern detection
  RECENCY_WEIGHT: 0.7,          // Weight for recent performance
  HISTORICAL_WEIGHT: 0.3,       // Weight for historical performance
  MAX_BEST_AUTHORS: 20,         // Max authors to track
  MAX_BEST_TOPICS: 15,          // Max topics to track
  SUCCESS_IMPRESSION_THRESHOLD: 500,  // Min impressions for "success"
}

/**
 * Update user learning from a new outcome
 */
export async function updateUserLearning(
  userId: string,
  replyId: string
): Promise<void> {
  // Get the reply with its outcome and related data
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    include: {
      outcome: true,
      alert: {
        include: {
          candidateTweet: {
            include: {
              attentionDecay: true,
            },
          },
        },
      },
    },
  })

  if (!reply?.outcome || !reply.alert?.candidateTweet) {
    return
  }

  const outcome = reply.outcome
  const tweet = reply.alert.candidateTweet
  const isSuccess = outcome.label === 'RIGHT'

  // Get or create user learning record
  let learning = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!learning) {
    learning = await prisma.userLearning.create({
      data: { userId },
    })
  }

  // Parse existing patterns
  const bestAuthors = (learning.bestAuthors as AuthorPerformance[]) || []
  const bestTopics = (learning.bestTopics as TopicPerformance[]) || []
  const bestReplyStyles = (learning.bestReplyStyles as StylePerformance[]) || []
  const bestPostingHours = (learning.bestPostingHours as HourPerformance[]) || []

  // Update author performance
  const updatedAuthors = updateAuthorPerformance(
    bestAuthors,
    tweet.authorId,
    tweet.authorUsername,
    isSuccess
  )

  // Update topic performance (extract from content)
  const topics = extractTopics(tweet.content)
  const updatedTopics = updateTopicPerformance(
    bestTopics,
    topics,
    isSuccess,
    outcome.actualImpressions
  )

  // Update reply style performance
  const updatedStyles = updateStylePerformance(
    bestReplyStyles,
    reply.strategy,
    outcome.actualImpressions,
    outcome.follows
  )

  // Update posting hour performance
  const postingHour = reply.postedAt.getHours()
  const updatedHours = updateHourPerformance(
    bestPostingHours,
    postingHour,
    isSuccess
  )

  // Calculate updated stats
  const newTotalReplies = learning.totalReplies + 1
  const newSuccessfulReplies = learning.successfulReplies + (isSuccess ? 1 : 0)
  const newAvgImpressions = calculateNewAverage(
    learning.avgImpressionsGained,
    learning.totalReplies,
    outcome.actualImpressions
  )

  // Update decay patterns if available
  let avgHalfLife = learning.avgHalfLife
  let avgRevivalSuccess = learning.avgRevivalSuccess

  if (tweet.attentionDecay) {
    avgHalfLife = calculateNewAverage(
      learning.avgHalfLife ?? 0,
      learning.totalReplies,
      tweet.attentionDecay.halfLife
    )
  }

  // Update learning record
  await prisma.userLearning.update({
    where: { userId },
    data: {
      bestAuthors: updatedAuthors as unknown as object,
      bestTopics: updatedTopics as unknown as object,
      bestReplyStyles: updatedStyles as unknown as object,
      bestPostingHours: updatedHours as unknown as object,
      totalReplies: newTotalReplies,
      successfulReplies: newSuccessfulReplies,
      avgImpressionsGained: Math.round(newAvgImpressions),
      avgHalfLife,
      avgRevivalSuccess,
    },
  })

  // Create learning signal for ML pipeline
  await prisma.learningSignal.create({
    data: {
      userId,
      signalType: 'outcome_recorded',
      signalData: {
        authorId: tweet.authorId,
        authorUsername: tweet.authorUsername,
        strategy: reply.strategy,
        outcomeLabel: outcome.label,
        impressions: outcome.actualImpressions,
        follows: outcome.follows,
        postingHour,
        topics,
      },
      confidence: isSuccess ? 0.9 : 0.7,
    },
  })
}

/**
 * Update author performance tracking
 */
function updateAuthorPerformance(
  current: AuthorPerformance[],
  authorId: string,
  authorUsername: string,
  isSuccess: boolean
): AuthorPerformance[] {
  const existing = current.find(a => a.authorId === authorId)

  if (existing) {
    const newSampleSize = existing.sampleSize + 1
    const newConversionRate = (
      (existing.conversionRate * existing.sampleSize) + (isSuccess ? 1 : 0)
    ) / newSampleSize

    return current.map(a =>
      a.authorId === authorId
        ? { ...a, conversionRate: newConversionRate, sampleSize: newSampleSize }
        : a
    ).sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, LEARNING_CONFIG.MAX_BEST_AUTHORS)
  }

  // Add new author
  const newAuthors = [
    ...current,
    {
      authorId,
      authorUsername,
      conversionRate: isSuccess ? 1 : 0,
      sampleSize: 1,
    },
  ]

  return newAuthors
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, LEARNING_CONFIG.MAX_BEST_AUTHORS)
}

/**
 * Update topic performance tracking
 */
function updateTopicPerformance(
  current: TopicPerformance[],
  topics: string[],
  isSuccess: boolean,
  impressions: number
): TopicPerformance[] {
  let updated = [...current]

  for (const topic of topics) {
    const existing = updated.find(t => t.topic === topic)

    if (existing) {
      const newSampleSize = existing.sampleSize + 1
      const newSuccessRate = (
        (existing.successRate * existing.sampleSize) + (isSuccess ? 1 : 0)
      ) / newSampleSize
      const newAvgImpressions = (
        (existing.avgImpressions * existing.sampleSize) + impressions
      ) / newSampleSize

      updated = updated.map(t =>
        t.topic === topic
          ? {
              ...t,
              successRate: newSuccessRate,
              avgImpressions: Math.round(newAvgImpressions),
              sampleSize: newSampleSize,
            }
          : t
      )
    } else {
      updated.push({
        topic,
        successRate: isSuccess ? 1 : 0,
        avgImpressions: impressions,
        sampleSize: 1,
      })
    }
  }

  return updated
    .sort((a, b) => (b.successRate * b.sampleSize) - (a.successRate * a.sampleSize))
    .slice(0, LEARNING_CONFIG.MAX_BEST_TOPICS)
}

/**
 * Update reply style performance
 */
function updateStylePerformance(
  current: StylePerformance[],
  style: string,
  impressions: number,
  follows: number
): StylePerformance[] {
  const existing = current.find(s => s.style === style)

  if (existing) {
    const newSampleSize = existing.sampleSize + 1
    const newAvgImpressions = (
      (existing.avgImpressions * existing.sampleSize) + impressions
    ) / newSampleSize
    const newAvgFollows = (
      (existing.avgFollows * existing.sampleSize) + follows
    ) / newSampleSize

    return current.map(s =>
      s.style === style
        ? {
            ...s,
            avgImpressions: Math.round(newAvgImpressions),
            avgFollows: Math.round(newAvgFollows * 10) / 10,
            sampleSize: newSampleSize,
          }
        : s
    ).sort((a, b) => b.avgImpressions - a.avgImpressions)
  }

  return [
    ...current,
    {
      style,
      avgImpressions: impressions,
      avgFollows: follows,
      sampleSize: 1,
    },
  ].sort((a, b) => b.avgImpressions - a.avgImpressions)
}

/**
 * Update posting hour performance
 */
function updateHourPerformance(
  current: HourPerformance[],
  hour: number,
  isSuccess: boolean
): HourPerformance[] {
  const existing = current.find(h => h.hour === hour)

  if (existing) {
    const newSampleSize = existing.sampleSize + 1
    const newSuccessRate = (
      (existing.successRate * existing.sampleSize) + (isSuccess ? 1 : 0)
    ) / newSampleSize

    return current.map(h =>
      h.hour === hour
        ? { ...h, successRate: newSuccessRate, sampleSize: newSampleSize }
        : h
    ).sort((a, b) => b.successRate - a.successRate)
  }

  return [
    ...current,
    {
      hour,
      successRate: isSuccess ? 1 : 0,
      sampleSize: 1,
    },
  ].sort((a, b) => b.successRate - a.successRate)
}

/**
 * Extract topics from tweet content
 */
function extractTopics(content: string): string[] {
  const topics: string[] = []

  // Extract hashtags
  const hashtags = content.match(/#\w+/g)
  if (hashtags) {
    topics.push(...hashtags.map(h => h.toLowerCase()))
  }

  // Extract common tech/business keywords
  const keywords = [
    'ai', 'startup', 'saas', 'crypto', 'web3', 'frontend', 'backend',
    'design', 'product', 'growth', 'marketing', 'sales', 'coding',
    'javascript', 'python', 'react', 'nodejs', 'founder', 'vc',
  ]

  const lowerContent = content.toLowerCase()
  for (const keyword of keywords) {
    if (lowerContent.includes(keyword)) {
      topics.push(keyword)
    }
  }

  return [...new Set(topics)].slice(0, 5) // Unique, max 5
}

/**
 * Calculate new running average
 */
function calculateNewAverage(
  currentAvg: number,
  currentCount: number,
  newValue: number
): number {
  return ((currentAvg * currentCount) + newValue) / (currentCount + 1)
}

/**
 * Get best performing patterns for a user
 */
export async function getBestPerformingPatterns(userId: string): Promise<{
  topAuthors: AuthorPerformance[]
  topTopics: TopicPerformance[]
  bestStyles: StylePerformance[]
  bestHours: HourPerformance[]
  stats: {
    totalReplies: number
    successRate: number
    avgImpressions: number
  }
} | null> {
  const learning = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!learning) return null

  const bestAuthors = (learning.bestAuthors as AuthorPerformance[]) || []
  const bestTopics = (learning.bestTopics as TopicPerformance[]) || []
  const bestReplyStyles = (learning.bestReplyStyles as StylePerformance[]) || []
  const bestPostingHours = (learning.bestPostingHours as HourPerformance[]) || []

  return {
    topAuthors: bestAuthors
      .filter(a => a.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE)
      .slice(0, 10),
    topTopics: bestTopics
      .filter(t => t.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE)
      .slice(0, 10),
    bestStyles: bestReplyStyles
      .filter(s => s.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE)
      .slice(0, 5),
    bestHours: bestPostingHours
      .filter(h => h.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE)
      .slice(0, 5),
    stats: {
      totalReplies: learning.totalReplies,
      successRate: learning.totalReplies > 0
        ? Math.round((learning.successfulReplies / learning.totalReplies) * 100)
        : 0,
      avgImpressions: learning.avgImpressionsGained,
    },
  }
}

/**
 * Personalize a base score using user's learning data
 */
export async function personalizeScoring(
  userId: string,
  baseScore: number,
  authorUsername: string,
  tweetContent: string
): Promise<{
  adjustedScore: number
  adjustments: { factor: string; adjustment: number }[]
}> {
  const adjustments: { factor: string; adjustment: number }[] = []
  let adjustedScore = baseScore

  const learning = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!learning || learning.totalReplies < LEARNING_CONFIG.MIN_SAMPLE_SIZE) {
    return { adjustedScore: baseScore, adjustments: [] }
  }

  // Check author performance
  const bestAuthors = (learning.bestAuthors as AuthorPerformance[]) || []
  const authorMatch = bestAuthors.find(a => a.authorUsername === authorUsername)

  if (authorMatch && authorMatch.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE) {
    const authorBonus = Math.round((authorMatch.conversionRate - 0.5) * 20)
    if (authorBonus !== 0) {
      adjustedScore += authorBonus
      adjustments.push({
        factor: `Author (${authorMatch.conversionRate * 100}% success rate)`,
        adjustment: authorBonus,
      })
    }
  }

  // Check topic performance
  const topics = extractTopics(tweetContent)
  const bestTopics = (learning.bestTopics as TopicPerformance[]) || []

  for (const topic of topics) {
    const topicMatch = bestTopics.find(t => t.topic === topic)
    if (topicMatch && topicMatch.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE) {
      const topicBonus = Math.round((topicMatch.successRate - 0.5) * 10)
      if (topicBonus > 0) {
        adjustedScore += topicBonus
        adjustments.push({
          factor: `Topic: ${topic}`,
          adjustment: topicBonus,
        })
        break // Only apply one topic bonus
      }
    }
  }

  // Check if current hour is optimal
  const currentHour = new Date().getHours()
  const bestPostingHours = (learning.bestPostingHours as HourPerformance[]) || []
  const hourMatch = bestPostingHours.find(h => h.hour === currentHour)

  if (hourMatch && hourMatch.sampleSize >= LEARNING_CONFIG.MIN_SAMPLE_SIZE) {
    const hourBonus = Math.round((hourMatch.successRate - 0.5) * 10)
    if (hourBonus > 0) {
      adjustedScore += hourBonus
      adjustments.push({
        factor: `Optimal hour (${hourMatch.successRate * 100}% success)`,
        adjustment: hourBonus,
      })
    }
  }

  // Clamp to valid range
  adjustedScore = Math.max(0, Math.min(100, adjustedScore))

  return { adjustedScore, adjustments }
}

/**
 * Initialize learning record for new user
 */
export async function initializeUserLearning(userId: string): Promise<void> {
  const existing = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!existing) {
    await prisma.userLearning.create({
      data: { userId },
    })
  }
}

/**
 * Get learning data for a user
 */
export async function getUserLearning(userId: string): Promise<UserLearningData | null> {
  const learning = await prisma.userLearning.findUnique({
    where: { userId },
  })

  if (!learning) return null

  return {
    bestAuthors: (learning.bestAuthors as AuthorPerformance[]) || [],
    bestTopics: (learning.bestTopics as TopicPerformance[]) || [],
    bestReplyStyles: (learning.bestReplyStyles as StylePerformance[]) || [],
    bestPostingHours: (learning.bestPostingHours as HourPerformance[]) || [],
    avgHalfLife: learning.avgHalfLife,
    avgRevivalSuccess: learning.avgRevivalSuccess,
    totalReplies: learning.totalReplies,
    successfulReplies: learning.successfulReplies,
    avgImpressionsGained: learning.avgImpressionsGained,
  }
}
