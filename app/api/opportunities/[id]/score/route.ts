import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scoringEngine } from '@/lib/scoring-engine'
import { getDecayMetrics } from '@/lib/attention-decay'
import { getRealtimeMetrics } from '@/lib/realtime-scoring'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the candidate tweet
    const candidateTweet = await prisma.candidateTweet.findUnique({
      where: { id },
      include: {
        scores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!candidateTweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get latest score
    const latestScore = candidateTweet.scores[0]
    if (!latestScore) {
      return NextResponse.json(
        { error: 'No score available for this opportunity' },
        { status: 404 }
      )
    }

    // Get decay metrics
    const decayMetrics = await getDecayMetrics(id)

    // Get real-time metrics
    const realtimeMetrics = await getRealtimeMetrics(id)

    // Calculate enhanced score with decay and urgency
    const enhancedScore = scoringEngine.calculateEnhancedFinalScore(
      {
        engagementRate: (latestScore.velocityRaw as any).engagementRate ?? 0,
        growthRate: (latestScore.velocityRaw as any).growthRate ?? 0,
        freshness: (latestScore.velocityRaw as any).freshness ?? 0,
        score: latestScore.velocityScore,
      },
      {
        replyCount: (latestScore.saturationRaw as any).replyCount ?? 0,
        replyGrowthRate: (latestScore.saturationRaw as any).replyGrowthRate ?? 0,
        densityScore: (latestScore.saturationRaw as any).densityScore ?? 0,
        score: latestScore.saturationScore,
      },
      {
        recentActivity: (latestScore.authorFatigueRaw as any).recentActivity ?? 0,
        replyFrequency: (latestScore.authorFatigueRaw as any).replyFrequency ?? 0,
        threadEngagement: (latestScore.authorFatigueRaw as any).threadEngagement ?? 0,
        score: latestScore.authorFatigueScore,
      },
      {
        topicSimilarity: (latestScore.audienceOverlapRaw as any).topicSimilarity ?? 0,
        keywordMatch: (latestScore.audienceOverlapRaw as any).keywordMatch ?? 0,
        historicalConversion: (latestScore.audienceOverlapRaw as any).historicalConversion ?? 0,
        score: latestScore.audienceOverlapScore,
      },
      {
        historicalPerformance: (latestScore.replyFitRaw as any).historicalPerformance ?? 0,
        styleMatch: (latestScore.replyFitRaw as any).styleMatch ?? 0,
        topicSuccess: (latestScore.replyFitRaw as any).topicSuccess ?? 0,
        score: latestScore.replyFitScore,
      },
      decayMetrics,
      {
        createdAt: candidateTweet.createdAt,
        velocityTrend: realtimeMetrics.velocity?.trend ?? 'stable',
        saturationTrend: realtimeMetrics.saturation.trend,
      }
    )

    return NextResponse.json({
      id,
      score: enhancedScore,
      realtimeAdjustment: realtimeMetrics.scoreAdjustment,
      lastUpdated: realtimeMetrics.lastUpdated,
      computedAt: new Date(),
    })
  } catch (error) {
    console.error('Error fetching score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    )
  }
}

// Force recompute score
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const candidateTweet = await prisma.candidateTweet.findUnique({
      where: { id },
    })

    if (!candidateTweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Recalculate velocity score
    const velocityScore = scoringEngine.calculateVelocityScore({
      likes: 0, // Would come from Twitter API
      retweets: 0,
      replies: 0,
      createdAt: candidateTweet.createdAt,
      authorFollowers: candidateTweet.authorFollowers,
    })

    // Recalculate saturation score
    const saturationScore = scoringEngine.calculateSaturationScore({
      replies: 0,
      replyGrowthRate: 0,
    })

    // Use default values for other scores
    const authorFatigueScore = scoringEngine.calculateAuthorFatigueScore({
      tweetsLast24h: 10,
      repliesLast1h: 2,
      avgThreadEngagement: 50,
    })

    const audienceOverlapScore = scoringEngine.calculateAudienceOverlapScore({
      topicSimilarity: 50,
      keywordMatches: 2,
      historicalConversion: 50,
    })

    const replyFitScore = scoringEngine.calculateReplyFitScore({
      avgPerformance: 50,
      styleMatch: 50,
      topicSuccessRate: 50,
    })

    const finalScore = scoringEngine.calculateFinalScore(
      velocityScore,
      saturationScore,
      authorFatigueScore,
      audienceOverlapScore,
      replyFitScore
    )

    // Store new score
    await prisma.score.create({
      data: {
        candidateTweetId: id,
        velocityScore: velocityScore.score,
        velocityRaw: velocityScore as unknown as object,
        saturationScore: saturationScore.score,
        saturationRaw: saturationScore as unknown as object,
        authorFatigueScore: authorFatigueScore.score,
        authorFatigueRaw: authorFatigueScore as unknown as object,
        audienceOverlapScore: audienceOverlapScore.score,
        audienceOverlapRaw: audienceOverlapScore as unknown as object,
        replyFitScore: replyFitScore.score,
        replyFitRaw: replyFitScore as unknown as object,
        finalScore: finalScore.finalScore,
      },
    })

    return NextResponse.json({
      id,
      score: finalScore,
      recomputed: true,
      computedAt: new Date(),
    })
  } catch (error) {
    console.error('Error recomputing score:', error)
    return NextResponse.json(
      { error: 'Failed to recompute score' },
      { status: 500 }
    )
  }
}
