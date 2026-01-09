'use client'

import { useState, useEffect, useCallback } from 'react'
import type { OpportunityWithDecay } from '@/types'

interface UseRealtimeOpportunitiesOptions {
  initialData?: OpportunityWithDecay[]
  pollInterval?: number  // milliseconds
  enabled?: boolean
  filter?: 'all' | 'high_score' | 'reviveable' | 'author_active'
  sortBy?: 'score' | 'velocity' | 'freshness' | 'revive_probability'
}

interface UseRealtimeOpportunitiesReturn {
  opportunities: OpportunityWithDecay[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useRealtimeOpportunities(
  options: UseRealtimeOpportunitiesOptions = {}
): UseRealtimeOpportunitiesReturn {
  const {
    initialData = [],
    pollInterval = 30000, // 30 seconds default
    enabled = true,
    filter = 'all',
    sortBy = 'score',
  } = options

  const [opportunities, setOpportunities] = useState<OpportunityWithDecay[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchOpportunities = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        filter,
        sortBy,
      })

      const response = await fetch(`/api/opportunities?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }

      const data = await response.json()
      setOpportunities(data.opportunities || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, filter, sortBy])

  // Initial fetch
  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Polling
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return

    const interval = setInterval(fetchOpportunities, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchOpportunities])

  return {
    opportunities,
    isLoading,
    error,
    refetch: fetchOpportunities,
    lastUpdated,
  }
}

// Hook for single opportunity score updates
interface UseOpportunityScoreOptions {
  opportunityId: string
  pollInterval?: number
  enabled?: boolean
}

export function useOpportunityScore(options: UseOpportunityScoreOptions) {
  const { opportunityId, pollInterval = 30000, enabled = true } = options

  const [score, setScore] = useState<{
    finalScore: number
    adjustedScore?: number
    isReviveable: boolean
    lastUpdated: Date
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchScore = useCallback(async () => {
    if (!enabled || !opportunityId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/opportunities/${opportunityId}/score`)

      if (!response.ok) {
        throw new Error('Failed to fetch score')
      }

      const data = await response.json()
      setScore({
        finalScore: data.score.finalScore,
        adjustedScore: data.score.adjustedScore,
        isReviveable: data.score.isReviveable,
        lastUpdated: new Date(data.lastUpdated),
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [opportunityId, enabled])

  useEffect(() => {
    fetchScore()
  }, [fetchScore])

  useEffect(() => {
    if (!enabled || pollInterval <= 0) return
    const interval = setInterval(fetchScore, pollInterval)
    return () => clearInterval(interval)
  }, [enabled, pollInterval, fetchScore])

  return { score, isLoading, error, refetch: fetchScore }
}
