import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { scoringEngine } from '@/lib/scoring-engine'
import { getDecayMetrics } from '@/lib/attention-decay'
import { getRealtimeMetrics } from '@/lib/realtime-scoring'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteClient()

    // Get the candidate tweet
    const { data: candidateTweet, error } = await (supabase
      .from('candidate_tweets')
      .select('*, scores(*)') as any)
      .eq('id', id)
      .single()

    if (error || !candidateTweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get latest score
    const scores = (candidateTweet.scores || []).sort((a: any, b: any) =>
      new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
    )
    const latestScore = scores[0]
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
        engagementRate: latestScore.velocity_raw?.engagementRate ?? 0,
        growthRate: latestScore.velocity_raw?.growthRate ?? 0,
        freshness: latestScore.velocity_raw?.freshness ?? 0,
        score: latestScore.velocity_score,
      },
      {
        replyCount: latestScore.saturation_raw?.replyCount ?? 0,
        replyGrowthRate: latestScore.saturation_raw?.replyGrowthRate ?? 0,
        densityScore: latestScore.saturation_raw?.densityScore ?? 0,
        score: latestScore.saturation_score,
      },
      {
        recentActivity: latestScore.author_fatigue_raw?.recentActivity ?? 0,
        replyFrequency: latestScore.author_fatigue_raw?.replyFrequency ?? 0,
        threadEngagement: latestScore.author_fatigue_raw?.threadEngagement ?? 0,
        score: latestScore.author_fatigue_score,
      },
      {
        topicSimilarity: latestScore.audience_overlap_raw?.topicSimilarity ?? 0,
        keywordMatch: latestScore.audience_overlap_raw?.keywordMatch ?? 0,
        historicalConversion: latestScore.audience_overlap_raw?.historicalConversion ?? 0,
        score: latestScore.audience_overlap_score,
      },
      {
        historicalPerformance: latestScore.reply_fit_raw?.historicalPerformance ?? 0,
        styleMatch: latestScore.reply_fit_raw?.styleMatch ?? 0,
        topicSuccess: latestScore.reply_fit_raw?.topicSuccess ?? 0,
        score: latestScore.reply_fit_score,
      },
      decayMetrics,
      {
        createdAt: candidateTweet.created_at,
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
    const supabase = await createRouteClient()

    const { data: candidateTweet, error } = await (supabase
      .from('candidate_tweets')
      .select('*') as any)
      .eq('id', id)
      .single()

    if (error || !candidateTweet) {
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
      createdAt: candidateTweet.created_at,
      authorFollowers: candidateTweet.author_followers,
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
    await (supabase
      .from('scores') as any)
      .insert({
        candidate_tweet_id: id,
        velocity_score: velocityScore.score,
        velocity_raw: velocityScore,
        saturation_score: saturationScore.score,
        saturation_raw: saturationScore,
        author_fatigue_score: authorFatigueScore.score,
        author_fatigue_raw: authorFatigueScore,
        audience_overlap_score: audienceOverlapScore.score,
        audience_overlap_raw: audienceOverlapScore,
        reply_fit_score: replyFitScore.score,
        reply_fit_raw: replyFitScore,
        final_score: finalScore.finalScore,
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
