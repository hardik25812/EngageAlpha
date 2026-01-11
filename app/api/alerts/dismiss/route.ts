import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { dismissAlert, markAlertActedOn } from '@/lib/alert-engine'

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
    const { alertId, feedback, actedOn } = body

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      )
    }

    // Verify alert belongs to user
    const { data: alert } = await supabase
      .from('smart_alerts')
      .select('*')
      .eq('id', alertId)
      .single()

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    if (alert.user_id !== user.id) {
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
