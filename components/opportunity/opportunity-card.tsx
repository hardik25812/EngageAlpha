"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/ui/score-ring"
import { ReviveableBadge } from "@/components/ui/reviveable-badge"
import { UrgencyTimer } from "@/components/ui/urgency-timer"
import { SignalStrength } from "@/components/ui/signal-strength"
import { VelocityBadge } from "@/components/charts/velocity-graph"
import { SaturationDot } from "@/components/ui/saturation-meter"
import { formatNumber, formatTimeAgo, cn } from "@/lib/utils"
import { Users, MessageCircle, Clock, Zap } from "lucide-react"
import { motion } from "framer-motion"
import type { DecayPhase, VelocitySnapshot } from "@/types"

interface OpportunityCardProps {
  id: string
  authorName: string
  authorUsername: string
  authorFollowers: number
  authorImage?: string
  content: string
  timestamp: Date
  velocityScore: number
  saturationScore: number
  authorFatigueScore: number
  audienceOverlapScore: number
  replyFitScore: number
  authorActive: boolean
  finalScore: number
  // New attention decay props
  isReviveable?: boolean
  reviveProbability?: number
  decayPhase?: DecayPhase
  halfLife?: number
  // Urgency props
  optimalMinutes?: number
  closingMinutes?: number
  // Velocity trend
  velocityTrend?: VelocitySnapshot['trend']
  currentVelocity?: number
  // Saturation
  replyCount?: number
  saturationTrend?: 'stable' | 'spiking' | 'flooding'
  // Callbacks
  onClick?: () => void
  onReply?: () => void
  onViewDecay?: () => void
}

export function OpportunityCard({
  authorName,
  authorUsername,
  authorFollowers,
  authorImage,
  content,
  timestamp,
  velocityScore,
  saturationScore,
  authorFatigueScore,
  audienceOverlapScore,
  replyFitScore,
  authorActive,
  finalScore,
  isReviveable = false,
  reviveProbability,
  decayPhase,
  halfLife,
  optimalMinutes,
  closingMinutes,
  velocityTrend = 'stable',
  currentVelocity = 0,
  replyCount = 0,
  saturationTrend = 'stable',
  onClick,
  onReply,
  onViewDecay,
}: OpportunityCardProps) {
  const getSaturationLevel = (count: number): 'low' | 'medium' | 'high' => {
    if (count < 10) return 'low'
    if (count < 30) return 'medium'
    return 'high'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          "relative overflow-hidden",
          isReviveable
            ? "border-revive/30 hover:border-revive/60 hover:shadow-glow-revive"
            : "hover:border-accent/50 hover:shadow-glow-primary"
        )}
        onClick={onClick}
      >
        {/* Score Ring - Top Right */}
        <div className="absolute right-4 top-4">
          <ScoreRing score={finalScore} size="sm" />
        </div>

        <div className="p-6">
          {/* Author Info */}
          <div className="mb-4 flex items-start space-x-3 pr-16">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-surface-2 ring-2 ring-surface-3">
              {authorImage ? (
                <img src={authorImage} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground-muted">
                  {authorName[0]}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-2">
                <h3 className="truncate font-semibold text-foreground">{authorName}</h3>
                {authorActive && (
                  <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" title="Author is active" />
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-foreground-muted">
                <span>@{authorUsername}</span>
              </div>
              <div className="mt-1 flex items-center space-x-3 text-xs text-foreground-muted">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(authorFollowers)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="mb-4 line-clamp-2 text-sm text-foreground">{content}</p>

          {/* Signal Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Velocity */}
            <VelocityBadge
              velocity={currentVelocity}
              trend={velocityTrend}
            />

            {/* Saturation */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-surface-3">
              <SaturationDot level={getSaturationLevel(replyCount)} />
              <MessageCircle className="h-3 w-3 text-foreground-muted" />
              <span className="tabular-nums text-foreground-muted">{replyCount}</span>
            </div>

            {/* Author Active Badge */}
            {authorActive && (
              <Badge variant="default" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}

            {/* Reviveable Badge */}
            {isReviveable && reviveProbability && (
              <ReviveableBadge
                reviveProbability={reviveProbability}
                halfLife={halfLife}
                onClick={() => {
                  onViewDecay?.()
                }}
                size="sm"
              />
            )}
          </div>

          {/* Signal Strength Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-muted">Signals</span>
              <SignalStrength
                velocity={velocityScore}
                saturation={saturationScore}
                authorFatigue={authorFatigueScore}
                audienceOverlap={audienceOverlapScore}
                replyFit={replyFitScore}
              />
            </div>

            {/* Urgency Timer (if available) */}
            {optimalMinutes && closingMinutes && (
              <UrgencyTimer
                optimalMinutes={optimalMinutes}
                closingMinutes={closingMinutes}
                compact
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              className={cn(
                "flex-1 gap-1.5",
                isReviveable && "bg-gradient-revive hover:opacity-90"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onReply?.()
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {isReviveable ? 'Revive' : 'Reply Now'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              Details
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Compact variant for list views
interface OpportunityCardCompactProps {
  authorUsername: string
  content: string
  finalScore: number
  isReviveable?: boolean
  reviveProbability?: number
  onClick?: () => void
}

export function OpportunityCardCompact({
  authorUsername,
  content,
  finalScore,
  isReviveable,
  reviveProbability,
  onClick,
}: OpportunityCardCompactProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all",
        "bg-surface-1 hover:bg-surface-2 border border-surface-3",
        isReviveable && "border-revive/30"
      )}
      onClick={onClick}
    >
      <ScoreRing score={finalScore} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">@{authorUsername}</span>
          {isReviveable && reviveProbability && (
            <ReviveableBadge reviveProbability={reviveProbability} size="sm" />
          )}
        </div>
        <p className="text-xs text-foreground-muted truncate">{content}</p>
      </div>
    </div>
  )
}
