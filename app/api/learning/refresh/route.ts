import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import {
  getBestPerformingPatterns,
  initializeUserLearning,
  updateUserLearning,
} from '@/lib/learning-engine'

// Get user's learning data
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

    const patterns = await getBestPerformingPatterns(user.id)

    if (!patterns) {
      // Initialize learning for new users
      await initializeUserLearning(user.id)
      return NextResponse.json({
        initialized: true,
        patterns: null,
        message: 'Learning initialized. Data will be available after first replies.',
      })
    }

    return NextResponse.json({
      patterns,
      message: patterns.stats.totalReplies > 0
        ? `Based on ${patterns.stats.totalReplies} replies`
        : 'Start replying to build your performance profile',
    })
  } catch (error) {
    console.error('Error fetching learning data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning data' },
      { status: 500 }
    )
  }
}

// Trigger learning update from a specific reply outcome
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
    const { replyId } = body

    if (replyId) {
      // Update learning from specific reply
      const { data: reply, error } = await (supabase
        .from('replies')
        .select('*, outcomes(*)')
        .eq('id', replyId)
        .single() as any)

      if (error || !reply) {
        return NextResponse.json(
          { error: 'Reply not found' },
          { status: 404 }
        )
      }

      if (reply.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      if (!reply.outcomes) {
        return NextResponse.json(
          { error: 'Reply has no outcome data yet' },
          { status: 400 }
        )
      }

      await updateUserLearning(user.id, replyId)

      return NextResponse.json({
        updated: true,
        replyId,
        message: 'Learning updated from reply outcome',
      })
    }

    // Bulk update from all replies with outcomes
    const { data: repliesWithOutcomes } = await (supabase
      .from('replies')
      .select('id') as any)
      .eq('user_id', user.id)
      .order('posted_at', { ascending: true })
      .limit(100)

    if (!repliesWithOutcomes || repliesWithOutcomes.length === 0) {
      return NextResponse.json({
        updated: false,
        message: 'No replies with outcomes found',
      })
    }

    // Update learning for each reply
    for (const reply of repliesWithOutcomes) {
      await updateUserLearning(user.id, reply.id)
    }

    return NextResponse.json({
      updated: true,
      processedReplies: repliesWithOutcomes.length,
      message: `Learning refreshed from ${repliesWithOutcomes.length} replies`,
    })
  } catch (error) {
    console.error('Error refreshing learning:', error)
    return NextResponse.json(
      { error: 'Failed to refresh learning' },
      { status: 500 }
    )
  }
}
