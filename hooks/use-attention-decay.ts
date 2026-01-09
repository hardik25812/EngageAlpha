'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AttentionDecayMetrics, DecayPhase } from '@/types'

interface UseAttentionDecayOptions {
  opportunityId: string
  pollInterval?: number
  enabled?: boolean
}

interface UseAttentionDecayReturn {
  metrics: AttentionDecayMetrics | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  revivalPredictions: {
    reply: { probability: number; reasoning: string } | null
    quote: { probability: number; reasoning: string } | null
  }
}

export function useAttentionDecay(
  options: UseAttentionDecayOptions
): UseAttentionDecayReturn {
  const { opportunityId, pollInterval = 60000, enabled = true } = options

  const [metrics, setMetrics] = useState<AttentionDecayMetrics | null>(null)
  const [revivalPredictions, setRevivalPredictions] = useState<{
    reply: { probability: number; reasoning: string } | null
    quote: { probability: number; reasoning: string } | null
  }>({ reply: null, quote: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDecay = useCallback(async () => {
    if (!enabled || !opportunityId) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/opportunities/${opportunityId}/decay`)

      if (!response.ok) {
        throw new Error('Failed to fetch decay metrics')
      }

      const data = await response.json()

      if (data.hasDecayData) {
        setMetrics({
          halfLife: data.metrics.halfLife,
          activeLifespan: data.metrics.activeLifespan,
          reviveProbability: data.metrics.reviveProbability,
          decayVelocity: data.metrics.decayVelocity,
          currentPhase: data.metrics.currentPhase as DecayPhase,
          reviveWindow: data.metrics.reviveWindow
            ? {
                start: new Date(data.metrics.reviveWindow.start),
                end: new Date(data.metrics.reviveWindow.end),
              }
            : null,
          engagementHistory: data.engagementHistory.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
          })),
        })
        setRevivalPredictions(data.revivalPredictions)
      } else {
        setMetrics(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [opportunityId, enabled])

  useEffect(() => {
    fetchDecay()
  }, [fetchDecay])

  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    const interval = setInterval(fetchDecay, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchDecay])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchDecay,
    revivalPredictions,
  }
}

// Hook for checking reviveable opportunities
export function useReviveableOpportunities(options: {
  pollInterval?: number
  enabled?: boolean
} = {}) {
  const { pollInterval = 120000, enabled = true } = options

  const [opportunities, setOpportunities] = useState<{
    id: string
    tweetId: string
    authorUsername: string
    content: string
    reviveProbability: number
    currentPhase: DecayPhase
  }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchReviveable = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/opportunities/reviveable')

      if (!response.ok) {
        throw new Error('Failed to fetch reviveable opportunities')
      }

      const data = await response.json()
      setOpportunities(data.opportunities || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    fetchReviveable()
  }, [fetchReviveable])

  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    const interval = setInterval(fetchReviveable, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchReviveable])

  return {
    opportunities,
    isLoading,
    error,
    refetch: fetchReviveable,
    count: opportunities.length,
  }
}
