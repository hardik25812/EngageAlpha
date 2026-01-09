import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { getReviveableOpportunities } from '@/lib/attention-decay'

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get reviveable opportunities
    const reviveableOpportunities = await getReviveableOpportunities(user.id)

    // Enrich with tweet data
    const enrichedOpportunities = await Promise.all(
      reviveableOpportunities.map(async (opp) => {
        const tweet = await prisma.candidateTweet.findUnique({
          where: { id: opp.candidateTweetId },
          include: {
            scores: {
              orderBy: { computedAt: 'desc' },
              take: 1,
            },
          },
        })

        if (!tweet) return null

        return {
          id: opp.candidateTweetId,
          tweetId: tweet.tweetId,
          authorName: tweet.authorName,
          authorUsername: tweet.authorUsername,
          authorFollowers: tweet.authorFollowers,
          authorImage: tweet.authorImage,
          content: tweet.content,
          createdAt: tweet.createdAt,
          finalScore: tweet.scores[0]?.finalScore ?? 0,
          reviveProbability: opp.reviveProbability,
          currentPhase: opp.currentPhase,
          reviveWindow: opp.reviveWindow,
        }
      })
    )

    // Filter out nulls and sort by revival probability
    const validOpportunities = enrichedOpportunities
      .filter((opp): opp is NonNullable<typeof opp> => opp !== null)
      .sort((a, b) => b.reviveProbability - a.reviveProbability)

    return NextResponse.json({
      opportunities: validOpportunities,
      total: validOpportunities.length,
    })
  } catch (error) {
    console.error('Error fetching reviveable opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviveable opportunities' },
      { status: 500 }
    )
  }
}
