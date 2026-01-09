'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface UrgencyTimerProps {
  optimalMinutes: number
  closingMinutes: number
  className?: string
  compact?: boolean
  onExpire?: () => void
}

function getUrgencyLevel(minutesRemaining: number): 'critical' | 'high' | 'medium' | 'low' {
  if (minutesRemaining <= 5) return 'critical'
  if (minutesRemaining <= 15) return 'high'
  if (minutesRemaining <= 30) return 'medium'
  return 'low'
}

const urgencyConfig = {
  critical: {
    bg: 'bg-danger/20',
    text: 'text-danger',
    border: 'border-danger/30',
    icon: AlertTriangle,
    pulse: true,
  },
  high: {
    bg: 'bg-warning/20',
    text: 'text-warning',
    border: 'border-warning/30',
    icon: Clock,
    pulse: true,
  },
  medium: {
    bg: 'bg-accent/20',
    text: 'text-accent',
    border: 'border-accent/30',
    icon: Clock,
    pulse: false,
  },
  low: {
    bg: 'bg-surface-3',
    text: 'text-foreground-muted',
    border: 'border-surface-3',
    icon: Clock,
    pulse: false,
  },
}

export function UrgencyTimer({
  optimalMinutes,
  closingMinutes,
  className,
  compact = false,
  onExpire,
}: UrgencyTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(closingMinutes)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1/60 // Update every second
        if (next <= 0) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [closingMinutes, onExpire])

  const urgency = getUrgencyLevel(timeRemaining)
  const config = urgencyConfig[urgency]
  const Icon = config.icon

  const displayMinutes = Math.max(0, Math.ceil(timeRemaining))
  const isInOptimalWindow = timeRemaining <= optimalMinutes

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
          config.bg, config.text,
          config.pulse && 'animate-pulse',
          className
        )}
      >
        <Icon className="h-3 w-3" />
        <span className="tabular-nums">{displayMinutes}m</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        config.bg, config.text, config.border,
        config.pulse && 'animate-pulse',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold tabular-nums">
            {displayMinutes} min
          </span>
          {isInOptimalWindow && (
            <span className="text-xs opacity-70">optimal</span>
          )}
        </div>
        {urgency === 'critical' && (
          <span className="text-xs opacity-80">Window closing!</span>
        )}
      </div>
    </div>
  )
}

interface UrgencyIndicatorProps {
  urgency: 'critical' | 'high' | 'medium'
  label?: string
  className?: string
}

export function UrgencyIndicator({
  urgency,
  label,
  className,
}: UrgencyIndicatorProps) {
  const colors = {
    critical: 'bg-danger',
    high: 'bg-warning',
    medium: 'bg-accent',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          colors[urgency],
          urgency === 'critical' && 'animate-pulse'
        )}
      />
      {label && (
        <span className="text-xs text-foreground-muted capitalize">
          {label || urgency}
        </span>
      )}
    </div>
  )
}
