import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { predictOutcome } from '@/lib/prediction-engine'
import type { OpportunityData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the opportunity
    const { data: tweet, error } = await (supabase
      .from('candidate_tweets')
      .select('*, scores(*)') as any)
      .eq('id', id)
      .single()

    if (error || !tweet) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    const scores = (tweet.scores || []).sort((a: any, b: any) =>
      new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
    )
    const score = scores[0]
    if (!score) {
      return NextResponse.json(
        { error: 'No score available for this opportunity' },
        { status: 404 }
      )
    }

    // Build opportunity data
    const opportunity: OpportunityData = {
      id: tweet.id,
      tweetId: tweet.tweet_id,
      authorName: tweet.author_name,
      authorUsername: tweet.author_username,
      authorFollowers: tweet.author_followers,
      authorImage: tweet.author_image ?? undefined,
      content: tweet.content,
      timestamp: tweet.created_at,
      velocityScore: score.velocity_score,
      saturationScore: score.saturation_score,
      authorActive: score.author_fatigue_raw?.replyFrequency > 50,
      finalScore: score.final_score,
      velocityRaw: score.velocity_raw,
      saturationRaw: score.saturation_raw,
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
