'use client'

import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  animated?: boolean
}

const sizeConfig = {
  sm: { radius: 20, stroke: 4, fontSize: 'text-sm' },
  md: { radius: 32, stroke: 5, fontSize: 'text-xl' },
  lg: { radius: 48, stroke: 6, fontSize: 'text-3xl' },
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#0ea5e9' // Electric blue
  if (score >= 70) return '#10b981' // Green
  if (score >= 50) return '#f59e0b' // Warning
  return '#6b7280' // Gray
}

function getScoreGlow(score: number): string {
  if (score >= 85) return 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))'
  if (score >= 70) return 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
  return 'none'
}

export function ScoreRing({
  score,
  size = 'md',
  showLabel = true,
  className,
  animated = true,
}: ScoreRingProps) {
  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)
  const glow = getScoreGlow(score)
  const svgSize = (config.radius + config.stroke) * 2

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={svgSize}
        height={svgSize}
        className={cn(animated && 'transition-all duration-500')}
        style={{ filter: glow }}
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-surface-3"
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={config.radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'origin-center -rotate-90',
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold tabular-nums',
            config.fontSize
          )}
          style={{ color }}
        >
          {score}
        </div>
      )}
    </div>
  )
}
