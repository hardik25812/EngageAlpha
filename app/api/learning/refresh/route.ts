import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import {
  getBestPerformingPatterns,
  initializeUserLearning,
  updateUserLearning,
} from '@/lib/learning-engine'

// Get user's learning data
export async function GET(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { replyId } = body

    if (replyId) {
      // Update learning from specific reply
      const reply = await prisma.reply.findUnique({
        where: { id: replyId },
        include: { outcome: true },
      })

      if (!reply) {
        return NextResponse.json(
          { error: 'Reply not found' },
          { status: 404 }
        )
      }

      if (reply.userId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      if (!reply.outcome) {
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
    const repliesWithOutcomes = await prisma.reply.findMany({
      where: {
        userId: user.id,
        outcome: { isNot: null },
      },
      orderBy: { postedAt: 'asc' },
      take: 100, // Process last 100 for performance
    })

    if (repliesWithOutcomes.length === 0) {
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
