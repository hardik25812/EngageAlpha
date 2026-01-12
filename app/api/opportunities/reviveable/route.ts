import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { getReviveableOpportunities } from '@/lib/attention-decay'

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get reviveable opportunities
    const reviveableOpportunities = await getReviveableOpportunities(user.id)

    // Enrich with tweet data
    const enrichedOpportunities = await Promise.all(
      reviveableOpportunities.map(async (opp) => {
        const { data: tweet } = await (supabase
          .from('candidate_tweets')
          .select('*, scores(*)') as any)
          .eq('id', opp.candidateTweetId)
          .single()

        if (!tweet) return null

        const latestScore = (tweet.scores || []).sort((a: any, b: any) =>
          new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
        )[0]

        return {
          id: opp.candidateTweetId,
          tweetId: tweet.tweet_id,
          authorName: tweet.author_name,
          authorUsername: tweet.author_username,
          authorFollowers: tweet.author_followers,
          authorImage: tweet.author_image,
          content: tweet.content,
          createdAt: tweet.created_at,
          finalScore: latestScore?.final_score ?? 0,
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
