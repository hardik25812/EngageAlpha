import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { predictOutcome } from '@/lib/prediction-engine'
import type { OpportunityData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Get the opportunity
    const tweet = await prisma.candidateTweet.findUnique({
      where: { id },
      include: {
        scores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!tweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    const score = tweet.scores[0]
    if (!score) {
      return NextResponse.json(
        { error: 'No score available for this opportunity' },
        { status: 404 }
      )
    }

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

    // Get prediction
    const prediction = await predictOutcome(opportunity, user.id)

    return NextResponse.json({
      id,
      prediction,
      generatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error generating prediction:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
