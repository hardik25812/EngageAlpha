'use client'

import { cn } from '@/lib/utils'
import { MessageCircle, AlertTriangle } from 'lucide-react'

interface SaturationMeterProps {
  replyCount: number
  replyVelocity: number  // replies per minute
  trend?: 'stable' | 'spiking' | 'flooding'
  densityScore?: number
  className?: string
  compact?: boolean
}

function getSaturationLevel(count: number): 'low' | 'medium' | 'high' | 'saturated' {
  if (count < 10) return 'low'
  if (count < 30) return 'medium'
  if (count < 50) return 'high'
  return 'saturated'
}

const saturationConfig = {
  low: {
    color: 'text-success',
    bg: 'bg-success/20',
    fill: 'bg-success',
    label: 'Low saturation',
  },
  medium: {
    color: 'text-warning',
    bg: 'bg-warning/20',
    fill: 'bg-warning',
    label: 'Moderate saturation',
  },
  high: {
    color: 'text-danger',
    bg: 'bg-danger/20',
    fill: 'bg-danger',
    label: 'High saturation',
  },
  saturated: {
    color: 'text-danger',
    bg: 'bg-danger/20',
    fill: 'bg-danger',
    label: 'Saturated',
  },
}

export function SaturationMeter({
  replyCount,
  replyVelocity,
  trend = 'stable',
  densityScore,
  className,
  compact = false,
}: SaturationMeterProps) {
  const level = getSaturationLevel(replyCount)
  const config = saturationConfig[level]
  const fillPercentage = densityScore !== undefined 
    ? Math.min(densityScore, 100) 
    : Math.min((replyCount / 50) * 100, 100)

  const isSpiking = trend === 'spiking' || trend === 'flooding'

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
          config.bg, config.color,
          isSpiking && 'animate-pulse',
          className
        )}
      >
        <MessageCircle className="h-3 w-3" />
        <span className="tabular-nums">{replyCount}</span>
        {isSpiking && <AlertTriangle className="h-3 w-3" />}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className={cn('h-4 w-4', config.color)} />
          <span className="text-sm text-foreground-muted">Saturation</span>
        </div>
        <div className={cn('flex items-center gap-1.5', config.color)}>
          {isSpiking && (
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
          )}
          <span className="text-sm font-semibold tabular-nums">
            {replyCount} replies
          </span>
        </div>
      </div>

      {/* Meter bar */}
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            config.fill,
            isSpiking && 'animate-pulse'
          )}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-foreground-muted">
        <span>{config.label}</span>
        {replyVelocity > 0 && (
          <span className={cn(isSpiking && config.color)}>
            {replyVelocity.toFixed(1)}/min
          </span>
        )}
      </div>
    </div>
  )
}

interface SaturationDotProps {
  level: 'low' | 'medium' | 'high'
  className?: string
}

export function SaturationDot({ level, className }: SaturationDotProps) {
  const colors = {
    low: 'bg-success',
    medium: 'bg-warning',
    high: 'bg-danger',
  }

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        colors[level],
        level === 'high' && 'animate-pulse',
        className
      )}
    />
  )
}
