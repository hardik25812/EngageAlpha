'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { VelocitySnapshot } from '@/types'

interface VelocityGraphProps {
  data: VelocitySnapshot[]
  width?: number
  height?: number
  showTrend?: boolean
  className?: string
}

export function VelocityGraph({
  data,
  width = 120,
  height = 32,
  showTrend = true,
  className,
}: VelocityGraphProps) {
  if (data.length < 2) {
    return (
      <div
        className={cn('flex items-center gap-2 text-foreground-muted', className)}
        style={{ width }}
      >
        <Minus className="h-4 w-4" />
        <span className="text-xs">No data</span>
      </div>
    )
  }

  const velocities = data.map(d => d.velocity)
  const maxVelocity = Math.max(...velocities, 1)
  const minVelocity = Math.min(...velocities, 0)
  const range = maxVelocity - minVelocity || 1

  // Current trend
  const currentTrend = data[data.length - 1]?.trend || 'stable'
  const currentVelocity = data[data.length - 1]?.velocity || 0

  // Create sparkline points
  const padding = 2
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = velocities.map((value, index) => {
    const x = padding + (index / (velocities.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - minVelocity) / range) * chartHeight
    return `${x},${y}`
  }).join(' ')

  // Trend color and icon
  const trendConfig = {
    accelerating: {
      color: '#10b981',
      Icon: TrendingUp,
      label: 'Accelerating',
    },
    stable: {
      color: '#6b7280',
      Icon: Minus,
      label: 'Stable',
    },
    decelerating: {
      color: '#f59e0b',
      Icon: TrendingDown,
      label: 'Slowing',
    },
  }

  const trend = trendConfig[currentTrend]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Baseline */}
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2,2"
          className="text-surface-3"
        />

        {/* Sparkline */}
        <polyline
          points={points}
          fill="none"
          stroke={trend.color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point */}
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((currentVelocity - minVelocity) / range) * chartHeight}
          r={3}
          fill={trend.color}
        />
      </svg>

      {showTrend && (
        <div className="flex items-center gap-1" style={{ color: trend.color }}>
          <trend.Icon className="h-4 w-4" />
          <span className="text-xs font-medium tabular-nums">
            {currentVelocity.toFixed(1)}/m
          </span>
        </div>
      )}
    </div>
  )
}

interface VelocityBadgeProps {
  velocity: number
  trend: 'accelerating' | 'stable' | 'decelerating'
  className?: string
}

export function VelocityBadge({ velocity, trend, className }: VelocityBadgeProps) {
  const config = {
    accelerating: {
      bg: 'bg-success/20',
      text: 'text-success',
      Icon: TrendingUp,
    },
    stable: {
      bg: 'bg-surface-3',
      text: 'text-foreground-muted',
      Icon: Minus,
    },
    decelerating: {
      bg: 'bg-warning/20',
      text: 'text-warning',
      Icon: TrendingDown,
    },
  }

  const c = config[trend]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
        c.bg, c.text,
        className
      )}
    >
      <c.Icon className="h-3 w-3" />
      <span className="tabular-nums">{velocity.toFixed(1)}</span>
      <span className="opacity-70">/min</span>
    </div>
  )
}
