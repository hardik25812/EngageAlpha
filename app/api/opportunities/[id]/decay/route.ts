import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateDecayMetrics,
  getDecayMetrics,
  predictRevivalSuccess,
  getReviveableOpportunities,
} from '@/lib/attention-decay'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if opportunity exists
    const candidateTweet = await prisma.candidateTweet.findUnique({
      where: { id },
    })

    if (!candidateTweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get decay metrics (from cache if available)
    let decayMetrics = await getDecayMetrics(id)

    // If no cached metrics, calculate fresh
    if (!decayMetrics) {
      decayMetrics = await calculateDecayMetrics(id)
    }

    if (!decayMetrics) {
      return NextResponse.json({
        id,
        hasDecayData: false,
        message: 'Insufficient engagement data for decay calculation',
      })
    }

    // Get revival predictions for different types
    const [replyRevival, quoteRevival] = await Promise.all([
      predictRevivalSuccess(id, 'reply'),
      predictRevivalSuccess(id, 'quote'),
    ])

    return NextResponse.json({
      id,
      hasDecayData: true,
      metrics: {
        halfLife: decayMetrics.halfLife,
        activeLifespan: decayMetrics.activeLifespan,
        reviveProbability: decayMetrics.reviveProbability,
        decayVelocity: decayMetrics.decayVelocity,
        currentPhase: decayMetrics.currentPhase,
        reviveWindow: decayMetrics.reviveWindow,
      },
      revivalPredictions: {
        reply: replyRevival,
        quote: quoteRevival,
      },
      engagementHistory: decayMetrics.engagementHistory.slice(-10), // Last 10 snapshots
    })
  } catch (error) {
    console.error('Error fetching decay metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decay metrics' },
      { status: 500 }
    )
  }
}

// Force recalculate decay metrics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if opportunity exists
    const candidateTweet = await prisma.candidateTweet.findUnique({
      where: { id },
    })

    if (!candidateTweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Force recalculate
    const decayMetrics = await calculateDecayMetrics(id)

    if (!decayMetrics) {
      return NextResponse.json({
        id,
        recalculated: false,
        message: 'Insufficient engagement data for decay calculation',
      })
    }

    return NextResponse.json({
      id,
      recalculated: true,
      metrics: decayMetrics,
      computedAt: new Date(),
    })
  } catch (error) {
    console.error('Error recalculating decay metrics:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate decay metrics' },
      { status: 500 }
    )
  }
}
