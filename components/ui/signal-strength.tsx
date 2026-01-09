'use client'

import { cn } from '@/lib/utils'

interface SignalStrengthProps {
  velocity: number
  saturation: number
  authorFatigue: number
  audienceOverlap: number
  replyFit: number
  className?: string
  showTooltip?: boolean
}

interface BarData {
  name: string
  score: number
  weight: string
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-success'
  if (score >= 50) return 'bg-warning'
  return 'bg-surface-3'
}

export function SignalStrength({
  velocity,
  saturation,
  authorFatigue,
  audienceOverlap,
  replyFit,
  className,
  showTooltip = true,
}: SignalStrengthProps) {
  const bars: BarData[] = [
    { name: 'Velocity', score: velocity, weight: '30%' },
    { name: 'Saturation', score: saturation, weight: '25%' },
    { name: 'Author', score: authorFatigue, weight: '20%' },
    { name: 'Audience', score: audienceOverlap, weight: '15%' },
    { name: 'Fit', score: replyFit, weight: '10%' },
  ]

  return (
    <div className={cn('group relative', className)}>
      <div className="flex items-end gap-0.5 h-5">
        {bars.map((bar, index) => (
          <div
            key={bar.name}
            className={cn(
              'w-1.5 rounded-sm transition-all duration-300',
              getBarColor(bar.score)
            )}
            style={{
              height: `${Math.max(20, (bar.score / 100) * 100)}%`,
            }}
          />
        ))}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'pointer-events-none z-50',
          'w-48 p-3 rounded-lg',
          'bg-surface-2 border border-surface-3 shadow-lg'
        )}>
          <div className="text-xs font-medium text-foreground mb-2">
            Signal Breakdown
          </div>
          <div className="space-y-1.5">
            {bars.map((bar) => (
              <div key={bar.name} className="flex items-center justify-between text-xs">
                <span className="text-foreground-muted">{bar.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', getBarColor(bar.score))}
                      style={{ width: `${bar.score}%` }}
                    />
                  </div>
                  <span className="text-foreground tabular-nums w-8 text-right">
                    {bar.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-surface-2" />
          </div>
        </div>
      )}
    </div>
  )
}

interface SignalBarProps {
  label: string
  value: number
  maxValue?: number
  color?: 'primary' | 'success' | 'warning' | 'danger'
  showValue?: boolean
  className?: string
}

export function SignalBar({
  label,
  value,
  maxValue = 100,
  color = 'primary',
  showValue = true,
  className,
}: SignalBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  const colorClasses = {
    primary: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs">
        <span className="text-foreground-muted">{label}</span>
        {showValue && (
          <span className="text-foreground tabular-nums">{value}</span>
        )}
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
