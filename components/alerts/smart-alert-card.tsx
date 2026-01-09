'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UrgencyTimer, UrgencyIndicator } from '@/components/ui/urgency-timer'
import {
  Zap,
  Sparkles,
  Clock,
  User,
  TrendingUp,
  X,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import type { AlertType, AlertUrgency } from '@/types'

interface SmartAlertCardProps {
  id: string
  type: AlertType
  urgency: AlertUrgency
  title: string
  message: string
  optimalWindow: number | null
  closingWindow: number | null
  opportunity?: {
    authorName: string
    authorUsername: string
    content: string
    finalScore: number
  }
  onDismiss?: (id: string, feedback?: string) => void
  onAction?: (id: string) => void
  className?: string
}

const alertTypeConfig: Record<AlertType, {
  icon: typeof Zap
  label: string
  gradient: string
}> = {
  REPLY_NOW: {
    icon: Zap,
    label: 'High-Value Opportunity',
    gradient: 'from-accent to-accent-hover',
  },
  REVIVE_SIGNAL: {
    icon: Sparkles,
    label: 'Revival Opportunity',
    gradient: 'from-revive to-revive-light',
  },
  WINDOW_CLOSING: {
    icon: Clock,
    label: 'Window Closing',
    gradient: 'from-warning to-warning-light',
  },
  AUTHOR_ACTIVE: {
    icon: User,
    label: 'Author Active',
    gradient: 'from-success to-success-light',
  },
  VELOCITY_SPIKE: {
    icon: TrendingUp,
    label: 'Velocity Spike',
    gradient: 'from-accent to-revive',
  },
}

const urgencyConfig: Record<AlertUrgency, {
  borderColor: string
  glow: string
  pulse: boolean
}> = {
  CRITICAL: {
    borderColor: 'border-danger/50',
    glow: 'shadow-glow-danger',
    pulse: true,
  },
  HIGH: {
    borderColor: 'border-warning/50',
    glow: 'shadow-glow-warning',
    pulse: true,
  },
  MEDIUM: {
    borderColor: 'border-accent/30',
    glow: '',
    pulse: false,
  },
}

export function SmartAlertCard({
  id,
  type,
  urgency,
  title,
  message,
  optimalWindow,
  closingWindow,
  opportunity,
  onDismiss,
  onAction,
  className,
}: SmartAlertCardProps) {
  const typeConfig = alertTypeConfig[type]
  const urgencyStyle = urgencyConfig[urgency]
  const Icon = typeConfig.icon

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-surface-1',
        urgencyStyle.borderColor,
        urgencyStyle.glow,
        urgencyStyle.pulse && 'animate-pulse-slow',
        className
      )}
    >
      {/* Gradient accent bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          typeConfig.gradient
        )}
      />

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-1.5 rounded-lg bg-gradient-to-br',
                typeConfig.gradient
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-foreground-muted">
                {typeConfig.label}
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <UrgencyIndicator urgency={urgency.toLowerCase() as any} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onDismiss?.(id)}
            className="p-1 rounded hover:bg-surface-3 text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-foreground-muted mb-3">
          {message}
        </p>

        {/* Opportunity preview */}
        {opportunity && (
          <div className="p-3 rounded-lg bg-surface-2 border border-surface-3 mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-foreground">
                @{opportunity.authorUsername}
              </span>
              <span className="text-xs text-foreground-muted">
                Score: {opportunity.finalScore}
              </span>
            </div>
            <p className="text-xs text-foreground-muted line-clamp-2">
              {opportunity.content}
            </p>
          </div>
        )}

        {/* Timer and actions */}
        <div className="flex items-center justify-between">
          {closingWindow && optimalWindow && (
            <UrgencyTimer
              optimalMinutes={optimalWindow}
              closingMinutes={closingWindow}
              compact
            />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss?.(id, 'not_relevant')}
              className="text-foreground-muted hover:text-foreground"
            >
              Not relevant
            </Button>
            <Button
              size="sm"
              onClick={() => onAction?.(id)}
              className="gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Reply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AlertStackProps {
  alerts: SmartAlertCardProps[]
  onDismiss?: (id: string, feedback?: string) => void
  onAction?: (id: string) => void
  maxVisible?: number
  className?: string
}

export function AlertStack({
  alerts,
  onDismiss,
  onAction,
  maxVisible = 3,
  className,
}: AlertStackProps) {
  const visibleAlerts = alerts.slice(0, maxVisible)
  const hiddenCount = alerts.length - maxVisible

  return (
    <div className={cn('space-y-3', className)}>
      {visibleAlerts.map((alert, index) => (
        <SmartAlertCard
          key={alert.id}
          {...alert}
          onDismiss={onDismiss}
          onAction={onAction}
          className={cn(
            'animate-slide-up',
            index > 0 && 'opacity-90'
          )}
        />
      ))}

      {hiddenCount > 0 && (
        <div className="text-center text-xs text-foreground-muted py-2">
          +{hiddenCount} more alerts
        </div>
      )}
    </div>
  )
}
