import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { dismissAlert, markAlertActedOn } from '@/lib/alert-engine'

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
    const { alertId, feedback, actedOn } = body

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      )
    }

    // Verify alert belongs to user
    const alert = await prisma.smartAlert.findUnique({
      where: { id: alertId },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    if (alert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // If marking as acted on
    if (actedOn) {
      await markAlertActedOn(alertId)
      return NextResponse.json({
        success: true,
        action: 'acted_on',
      })
    }

    // Otherwise dismiss with optional feedback
    await dismissAlert(alertId, feedback)

    return NextResponse.json({
      success: true,
      action: 'dismissed',
      feedback: feedback || null,
    })
  } catch (error) {
    console.error('Error dismissing alert:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss alert' },
      { status: 500 }
    )
  }
}
