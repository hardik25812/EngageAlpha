'use client'

import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface ReviveableBadgeProps {
  reviveProbability: number
  halfLife?: number
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}

export function ReviveableBadge({
  reviveProbability,
  halfLife,
  onClick,
  size = 'md',
  className,
}: ReviveableBadgeProps) {
  const isHighProbability = reviveProbability >= 70

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        'bg-revive/20 text-revive border border-revive/30',
        'transition-all duration-200',
        isHighProbability && 'animate-glow-revive shadow-glow-revive',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        onClick && 'cursor-pointer hover:bg-revive/30 hover:border-revive/50',
        className
      )}
      onClick={onClick}
      title={`Attention decay detected. ${reviveProbability}% chance of successful revival.${
        halfLife ? ` Half-life: ${halfLife}min` : ''
      }`}
    >
      <Sparkles className={cn(
        size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
        isHighProbability && 'animate-pulse'
      )} />
      <span className="font-semibold tabular-nums">{reviveProbability}%</span>
      <span className="text-revive-light/70">revive</span>
    </div>
  )
}

interface ReviveTooltipProps {
  reviveProbability: number
  halfLife: number
  historicalBoost?: number
  children: React.ReactNode
}

export function ReviveableTooltip({
  reviveProbability,
  halfLife,
  historicalBoost,
  children,
}: ReviveTooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'pointer-events-none z-50',
        'w-64 p-3 rounded-lg',
        'bg-surface-2 border border-surface-3 shadow-lg'
      )}>
        <div className="text-sm font-medium text-foreground mb-2">
          Revival Opportunity
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-foreground-muted">
            <span>Revival probability</span>
            <span className="text-revive font-semibold">{reviveProbability}%</span>
          </div>
          <div className="flex justify-between text-foreground-muted">
            <span>Half-life</span>
            <span className="text-foreground">{halfLife} min</span>
          </div>
          {historicalBoost && (
            <div className="flex justify-between text-foreground-muted">
              <span>Historical boost</span>
              <span className="text-success">+{historicalBoost}% reach</span>
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-surface-3 text-xs text-foreground-muted">
          Quoting or replying now can restart distribution.
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-8 border-transparent border-t-surface-2" />
        </div>
      </div>
    </div>
  )
}
