'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EngagementTimeline, PhaseIndicator } from '@/components/charts/engagement-timeline'
import { ReviveableBadge } from '@/components/ui/reviveable-badge'
import { X, Clock, Zap, BarChart3, Quote, MessageCircle } from 'lucide-react'
import type { AttentionDecayMetrics, DecayPhase } from '@/types'

interface PostLifespanDrawerProps {
  isOpen: boolean
  onClose: () => void
  tweetId: string
  authorUsername: string
  metrics: AttentionDecayMetrics
  historicalBoost?: number
  onReply?: () => void
  onQuote?: () => void
  className?: string
}

export function PostLifespanDrawer({
  isOpen,
  onClose,
  tweetId,
  authorUsername,
  metrics,
  historicalBoost,
  onReply,
  onQuote,
  className,
}: PostLifespanDrawerProps) {
  if (!isOpen) return null

  const {
    halfLife,
    activeLifespan,
    reviveProbability,
    decayVelocity,
    currentPhase,
    reviveWindow,
    engagementHistory,
  } = metrics

  const isInReviveWindow = reviveWindow &&
    new Date() >= reviveWindow.start &&
    new Date() <= reviveWindow.end

  const minutesUntilWindowCloses = reviveWindow
    ? Math.max(0, Math.round((reviveWindow.end.getTime() - Date.now()) / 60000))
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-96 bg-surface-1 border-l border-surface-3 z-50',
          'transform transition-transform duration-300 ease-out',
          'animate-slide-in-right overflow-y-auto scrollbar-thin',
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-1 border-b border-surface-3 p-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">
              Post Lifespan Analysis
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-3 text-foreground-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-foreground-muted">
            @{authorUsername}
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Phase */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Current Phase</span>
            <PhaseIndicator phase={currentPhase} />
          </div>

          {/* Engagement Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Engagement Over Time
            </h3>
            <div className="p-4 rounded-lg bg-surface-2 border border-surface-3">
              <EngagementTimeline
                data={engagementHistory}
                currentPhase={currentPhase}
                reviveWindow={reviveWindow ?? undefined}
                width={320}
                height={80}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricBox
              icon={Clock}
              label="Half-life"
              value={`${halfLife} min`}
              description="Time until engagement halves"
            />
            <MetricBox
              icon={BarChart3}
              label="Active Lifespan"
              value={`${activeLifespan} min`}
              description="Time until flatline"
            />
            <MetricBox
              icon={Zap}
              label="Decay Velocity"
              value={`${decayVelocity.toFixed(1)}/min`}
              description="Rate of engagement drop"
            />
            <div className="p-3 rounded-lg bg-surface-2 border border-surface-3">
              <div className="text-xs text-foreground-muted mb-1">
                Revival Probability
              </div>
              <ReviveableBadge
                reviveProbability={reviveProbability}
                halfLife={halfLife}
                size="sm"
              />
            </div>
          </div>

          {/* Revive Window */}
          {reviveWindow && (
            <div className={cn(
              'p-4 rounded-lg border',
              isInReviveWindow
                ? 'bg-revive/10 border-revive/30'
                : 'bg-surface-2 border-surface-3'
            )}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-foreground">
                  Revival Window
                </h3>
                {isInReviveWindow && (
                  <span className="text-xs text-revive animate-pulse">
                    Active Now
                  </span>
                )}
              </div>
              <div className="text-sm text-foreground-muted">
                {isInReviveWindow ? (
                  <>
                    <span className="text-revive font-semibold">
                      {minutesUntilWindowCloses} minutes
                    </span>{' '}
                    remaining in optimal window
                  </>
                ) : (
                  'Window has passed or not yet open'
                )}
              </div>
            </div>
          )}

          {/* Historical Boost */}
          {historicalBoost && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2 text-success mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Historical Data</span>
              </div>
              <p className="text-sm text-foreground-muted">
                Reviving here historically adds{' '}
                <span className="text-success font-semibold">+{historicalBoost}%</span>{' '}
                reach based on similar tweets
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-surface-3">
            <h3 className="text-sm font-medium text-foreground">
              Take Action
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onReply}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </Button>
              <Button
                onClick={onQuote}
                className={cn(
                  'gap-2',
                  isInReviveWindow && 'bg-gradient-revive hover:opacity-90'
                )}
              >
                <Quote className="h-4 w-4" />
                Quote Tweet
              </Button>
            </div>
            {isInReviveWindow && (
              <p className="text-xs text-center text-revive">
                Quoting is most effective for revival
              </p>
            )}
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-lg bg-surface-2 border border-surface-3">
            <p className="text-xs text-foreground-muted">
              <strong className="text-foreground">How this works:</strong>{' '}
              We track engagement velocity over time to identify when attention is decaying.
              Replying or quoting during the optimal window can restart the tweet's distribution
              and capture remaining attention.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

interface MetricBoxProps {
  icon: typeof Clock
  label: string
  value: string
  description: string
}

function MetricBox({ icon: Icon, label, value, description }: MetricBoxProps) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 border border-surface-3">
      <div className="flex items-center gap-1.5 text-foreground-muted mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-xs text-foreground-muted mt-1">
        {description}
      </div>
    </div>
  )
}
