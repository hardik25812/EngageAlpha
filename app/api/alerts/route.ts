import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import {
  getActiveAlerts,
  generateSmartAlert,
  shouldTriggerAlert,
} from '@/lib/alert-engine'
import { getDecayMetrics } from '@/lib/attention-decay'
import type { OpportunityData } from '@/types'

// Get active alerts for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const alerts = await getActiveAlerts(user.id)

    // Enrich with opportunity data
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        if (!alert.candidateTweetId) return alert

        const tweet = await prisma.candidateTweet.findUnique({
          where: { id: alert.candidateTweetId },
          include: {
            scores: {
              orderBy: { computedAt: 'desc' },
              take: 1,
            },
          },
        })

        return {
          ...alert,
          opportunity: tweet
            ? {
                authorName: tweet.authorName,
                authorUsername: tweet.authorUsername,
                content: tweet.content.slice(0, 100) + '...',
                finalScore: tweet.scores[0]?.finalScore ?? 0,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      alerts: enrichedAlerts,
      total: enrichedAlerts.length,
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// Create a new alert manually (for testing or admin purposes)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { candidateTweetId } = body

    if (!candidateTweetId) {
      return NextResponse.json(
        { error: 'candidateTweetId is required' },
        { status: 400 }
      )
    }

    // Get the opportunity
    const tweet = await prisma.candidateTweet.findUnique({
      where: { id: candidateTweetId },
      include: {
        scores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!tweet || !tweet.scores[0]) {
      return NextResponse.json(
        { error: 'Opportunity not found or not scored' },
        { status: 404 }
      )
    }

    const score = tweet.scores[0]

    // Build opportunity data
    const opportunity: OpportunityData = {
      id: tweet.id,
      tweetId: tweet.tweetId,
      authorName: tweet.authorName,
      authorUsername: tweet.authorUsername,
      authorFollowers: tweet.authorFollowers,
      authorImage: tweet.authorImage ?? undefined,
      content: tweet.content,
      timestamp: tweet.createdAt,
      velocityScore: score.velocityScore,
      saturationScore: score.saturationScore,
      authorActive: (score.authorFatigueRaw as any)?.replyFrequency > 50,
      finalScore: score.finalScore,
      velocityRaw: score.velocityRaw as any,
      saturationRaw: score.saturationRaw as any,
      explanation: '',
    }

    // Check if should trigger
    const shouldAlert = await shouldTriggerAlert(opportunity, user.id)
    if (!shouldAlert) {
      return NextResponse.json({
        created: false,
        reason: 'Alert conditions not met or limit reached',
      })
    }

    // Get decay metrics
    const decayMetrics = await getDecayMetrics(candidateTweetId)

    // Generate alert
    const alert = await generateSmartAlert({
      opportunity,
      userId: user.id,
      decayPhase: decayMetrics?.currentPhase,
      reviveProbability: decayMetrics?.reviveProbability,
      windowRemaining: decayMetrics?.reviveWindow
        ? Math.round((decayMetrics.reviveWindow.end.getTime() - Date.now()) / 60000)
        : undefined,
    })

    if (!alert) {
      return NextResponse.json({
        created: false,
        reason: 'Alert could not be generated',
      })
    }

    return NextResponse.json({
      created: true,
      alert,
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
