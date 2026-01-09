'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SmartAlertData } from '@/types'

interface UseSmartAlertsOptions {
  pollInterval?: number
  enabled?: boolean
  maxAlerts?: number
}

interface UseSmartAlertsReturn {
  alerts: SmartAlertData[]
  isLoading: boolean
  error: Error | null
  dismiss: (alertId: string, feedback?: string) => Promise<void>
  markActedOn: (alertId: string) => Promise<void>
  refetch: () => Promise<void>
  unreadCount: number
}

export function useSmartAlerts(
  options: UseSmartAlertsOptions = {}
): UseSmartAlertsReturn {
  const {
    pollInterval = 60000, // 1 minute default
    enabled = true,
    maxAlerts = 10,
  } = options

  const [alerts, setAlerts] = useState<SmartAlertData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlerts = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/alerts')

      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }

      const data = await response.json()
      setAlerts((data.alerts || []).slice(0, maxAlerts))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, maxAlerts])

  const dismiss = useCallback(async (alertId: string, feedback?: string) => {
    try {
      const response = await fetch('/api/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, feedback }),
      })

      if (!response.ok) {
        throw new Error('Failed to dismiss alert')
      }

      // Optimistic update
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (err) {
      console.error('Error dismissing alert:', err)
      // Refetch to sync state
      fetchAlerts()
    }
  }, [fetchAlerts])

  const markActedOn = useCallback(async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, actedOn: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark alert as acted on')
      }

      // Update local state
      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, actedOn: true } : a
        )
      )
    } catch (err) {
      console.error('Error marking alert:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Polling
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    const interval = setInterval(fetchAlerts, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchAlerts])

  const unreadCount = alerts.filter(a => !a.dismissed && !a.actedOn).length

  return {
    alerts,
    isLoading,
    error,
    dismiss,
    markActedOn,
    refetch: fetchAlerts,
    unreadCount,
  }
}
