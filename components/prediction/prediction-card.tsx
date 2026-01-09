'use client'

import { cn } from '@/lib/utils'
import { Eye, Heart, UserPlus, MousePointer, Info } from 'lucide-react'
import type { OutcomePrediction } from '@/types'

interface PredictionCardProps {
  prediction: OutcomePrediction
  className?: string
  compact?: boolean
}

function formatRange(min: number, max: number): string {
  if (min >= 1000000) {
    return `${(min / 1000000).toFixed(1)}M - ${(max / 1000000).toFixed(1)}M`
  }
  if (min >= 1000) {
    return `${(min / 1000).toFixed(1)}K - ${(max / 1000).toFixed(1)}K`
  }
  return `${min} - ${max}`
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High'
  if (confidence >= 0.6) return 'Medium'
  return 'Low'
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-success'
  if (confidence >= 0.6) return 'text-warning'
  return 'text-foreground-muted'
}

export function PredictionCard({
  prediction,
  className,
  compact = false,
}: PredictionCardProps) {
  const { impressions, authorEngagement, profileClicks, follows, reasoning } = prediction

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Eye className="h-4 w-4" />
            <span>Expected</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {formatRange(impressions.min, impressions.max)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Heart className="h-4 w-4" />
            <span>Author engage</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {authorEngagement.probability}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Expected Outcome
        </h4>
        <span className={cn(
          'text-xs',
          getConfidenceColor(impressions.confidence)
        )}>
          {getConfidenceLabel(impressions.confidence)} confidence
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Impressions */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Eye className="h-4 w-4" />
            <span className="text-xs">Impressions</span>
          </div>
          <div className="text-lg font-bold text-foreground tabular-nums">
            {formatRange(impressions.min, impressions.max)}
          </div>
          <ConfidenceBar value={impressions.confidence} />
        </div>

        {/* Author Engagement */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Author Engage</span>
          </div>
          <div className="text-lg font-bold text-foreground tabular-nums">
            {authorEngagement.probability}%
          </div>
          <ConfidenceBar value={authorEngagement.confidence} />
        </div>

        {/* Profile Clicks */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <MousePointer className="h-4 w-4" />
            <span className="text-xs">Profile Clicks</span>
          </div>
          <div className="text-lg font-bold text-foreground tabular-nums">
            {formatRange(profileClicks.min, profileClicks.max)}
          </div>
        </div>

        {/* Follows */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-foreground-muted">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs">New Follows</span>
          </div>
          <div className="text-lg font-bold text-foreground tabular-nums">
            {formatRange(follows.min, follows.max)}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {reasoning.length > 0 && (
        <div className="pt-3 border-t border-surface-3">
          <div className="flex items-center gap-1.5 text-foreground-muted mb-2">
            <Info className="h-4 w-4" />
            <span className="text-xs font-medium">Why this prediction</span>
          </div>
          <ul className="space-y-1">
            {reasoning.slice(0, 3).map((reason, index) => (
              <li
                key={index}
                className="text-xs text-foreground-muted pl-4 relative before:absolute before:left-1.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-foreground-muted"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface ConfidenceBarProps {
  value: number
  className?: string
}

function ConfidenceBar({ value, className }: ConfidenceBarProps) {
  return (
    <div className={cn('h-1 bg-surface-3 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          value >= 0.8 ? 'bg-success' : value >= 0.6 ? 'bg-warning' : 'bg-foreground-muted'
        )}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  )
}

interface PredictionBadgeProps {
  impressions: { min: number; max: number }
  authorProbability: number
  className?: string
}

export function PredictionBadge({
  impressions,
  authorProbability,
  className,
}: PredictionBadgeProps) {
  return (
    <div className={cn('flex items-center gap-3 text-xs', className)}>
      <div className="flex items-center gap-1 text-foreground-muted">
        <Eye className="h-3.5 w-3.5" />
        <span className="tabular-nums">{formatRange(impressions.min, impressions.max)}</span>
      </div>
      <div className="flex items-center gap-1 text-foreground-muted">
        <Heart className="h-3.5 w-3.5" />
        <span className="tabular-nums">{authorProbability}%</span>
      </div>
    </div>
  )
}
