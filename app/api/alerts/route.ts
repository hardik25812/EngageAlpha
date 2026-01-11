import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
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
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const alerts = await getActiveAlerts(user.id)

    // Enrich with opportunity data
    const supabase2 = await createRouteClient()
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        if (!alert.candidateTweetId) return alert

        const { data: tweet } = await supabase2
          .from('candidate_tweets')
          .select(`
            *,
            scores (
              *
            )
          `)
          .eq('id', alert.candidateTweetId)
          .single()

        const latestScore = tweet?.scores?.sort((a: any, b: any) => 
          new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
        )[0]

        return {
          ...alert,
          opportunity: tweet
            ? {
                authorName: tweet.author_name,
                authorUsername: tweet.author_username,
                content: tweet.content.slice(0, 100) + '...',
                finalScore: latestScore?.final_score ?? 0,
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
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const { data: tweet } = await supabase
      .from('candidate_tweets')
      .select(`
        *,
        scores (
          *
        )
      `)
      .eq('id', candidateTweetId)
      .single()

    const latestScore = tweet?.scores?.sort((a: any, b: any) => 
      new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
    )[0]

    if (!tweet || !latestScore) {
      return NextResponse.json(
        { error: 'Opportunity not found or not scored' },
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
      timestamp: new Date(tweet.created_at),
      velocityScore: latestScore.velocity_score,
      saturationScore: latestScore.saturation_score,
      authorActive: (latestScore.author_fatigue_raw as any)?.replyFrequency > 50,
      finalScore: latestScore.final_score,
      velocityRaw: latestScore.velocity_raw as any,
      saturationRaw: latestScore.saturation_raw as any,
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
