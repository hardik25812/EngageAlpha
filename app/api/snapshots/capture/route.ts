import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { captureEngagementSnapshot } from '@/lib/attention-decay'
import { shouldCaptureSnapshot } from '@/lib/realtime-scoring'

// Capture engagement snapshot for a tweet
// This would typically be called by a cron job or webhook
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for scheduled jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Allow if cron secret matches or if in development
    const isAuthorized =
      process.env.NODE_ENV === 'development' ||
      authHeader === `Bearer ${cronSecret}`

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Single tweet snapshot
    if (body.candidateTweetId && body.engagement) {
      const { candidateTweetId, engagement } = body

      // Verify tweet exists
      const tweet = await prisma.candidateTweet.findUnique({
        where: { id: candidateTweetId },
      })

      if (!tweet) {
        return NextResponse.json(
          { error: 'Tweet not found' },
          { status: 404 }
        )
      }

      // Check if we should capture (rate limiting)
      const shouldCapture = await shouldCaptureSnapshot(candidateTweetId)
      if (!shouldCapture) {
        return NextResponse.json({
          captured: false,
          reason: 'Too soon since last snapshot',
        })
      }

      await captureEngagementSnapshot(candidateTweetId, engagement)

      return NextResponse.json({
        captured: true,
        candidateTweetId,
        timestamp: new Date(),
      })
    }

    // Batch snapshot for all active tweets
    if (body.batch) {
      // Get tweets that have been fetched in the last 24 hours
      const recentTweets = await prisma.candidateTweet.findMany({
        where: {
          fetchedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        take: 100,
      })

      const results = {
        processed: 0,
        captured: 0,
        skipped: 0,
      }

      for (const tweet of recentTweets) {
        results.processed++

        const shouldCapture = await shouldCaptureSnapshot(tweet.id)
        if (!shouldCapture) {
          results.skipped++
          continue
        }

        // In a real implementation, you would fetch from Twitter API here
        // For now, we'll use mock data or skip if no engagement data
        const mockEngagement = body.engagements?.[tweet.tweetId]
        if (!mockEngagement) {
          results.skipped++
          continue
        }

        await captureEngagementSnapshot(tweet.id, mockEngagement)
        results.captured++
      }

      return NextResponse.json({
        batch: true,
        results,
        timestamp: new Date(),
      })
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide candidateTweetId + engagement or batch: true' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error capturing snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to capture snapshot' },
      { status: 500 }
    )
  }
}

// Get latest snapshots for a tweet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const candidateTweetId = searchParams.get('candidateTweetId')

    if (!candidateTweetId) {
      return NextResponse.json(
        { error: 'candidateTweetId is required' },
        { status: 400 }
      )
    }

    const snapshots = await prisma.engagementSnapshot.findMany({
      where: { candidateTweetId },
      orderBy: { capturedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      candidateTweetId,
      snapshots,
      total: snapshots.length,
    })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
}
