'use client'

import { cn } from '@/lib/utils'
import type { DecayPhase, EngagementDataPoint } from '@/types'

interface EngagementTimelineProps {
  data: EngagementDataPoint[]
  currentPhase: DecayPhase
  reviveWindow?: { start: Date; end: Date }
  width?: number
  height?: number
  className?: string
}

const phaseColors = {
  GROWTH: '#10b981',   // Green
  PEAK: '#0ea5e9',     // Blue
  DECAY: '#f59e0b',    // Orange
  FLATLINE: '#6b7280', // Gray
}

export function EngagementTimeline({
  data,
  currentPhase,
  reviveWindow,
  width = 200,
  height = 48,
  className,
}: EngagementTimelineProps) {
  if (data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-xs text-foreground-muted', className)}
        style={{ width, height }}
      >
        Insufficient data
      </div>
    )
  }

  // Calculate engagement values
  const engagements = data.map(d => d.likes + d.retweets * 2 + d.replies * 1.5)
  const maxEngagement = Math.max(...engagements)
  const minEngagement = Math.min(...engagements)
  const range = maxEngagement - minEngagement || 1

  // Create path points
  const padding = 4
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = engagements.map((value, index) => {
    const x = padding + (index / (engagements.length - 1)) * chartWidth
    const y = padding + chartHeight - ((value - minEngagement) / range) * chartHeight
    return { x, y }
  })

  // Create smooth path
  const pathD = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    const prev = points[index - 1]
    const cpX = (prev.x + point.x) / 2
    return `${path} Q ${cpX} ${prev.y} ${point.x} ${point.y}`
  }, '')

  // Create gradient area path
  const areaPath = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  // Determine phase color
  const color = phaseColors[currentPhase]

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id={`timeline-gradient-${currentPhase}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill={`url(#timeline-gradient-${currentPhase})`}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={color}
          className="animate-pulse"
        />
      </svg>

      {/* Phase indicator */}
      <div
        className={cn(
          'absolute bottom-0 right-0 text-xs font-medium px-1.5 py-0.5 rounded',
          currentPhase === 'GROWTH' && 'bg-success/20 text-success',
          currentPhase === 'PEAK' && 'bg-accent/20 text-accent',
          currentPhase === 'DECAY' && 'bg-warning/20 text-warning',
          currentPhase === 'FLATLINE' && 'bg-surface-3 text-foreground-muted'
        )}
      >
        {currentPhase.toLowerCase()}
      </div>
    </div>
  )
}

interface PhaseIndicatorProps {
  phase: DecayPhase
  className?: string
}

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = {
    GROWTH: { label: 'Growing', color: 'text-success', bg: 'bg-success/20' },
    PEAK: { label: 'Peak', color: 'text-accent', bg: 'bg-accent/20' },
    DECAY: { label: 'Decay', color: 'text-warning', bg: 'bg-warning/20' },
    FLATLINE: { label: 'Flatline', color: 'text-foreground-muted', bg: 'bg-surface-3' },
  }

  const c = config[phase]

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
      c.bg, c.color,
      className
    )}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          c.color.replace('text-', 'bg-')
        )}
      />
      {c.label}
    </span>
  )
}
