"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/ui/score-ring"
import { ReviveableBadge } from "@/components/ui/reviveable-badge"
import { UrgencyTimer } from "@/components/ui/urgency-timer"
import { SaturationMeter } from "@/components/ui/saturation-meter"
import { formatNumber, formatTimeAgo, cn } from "@/lib/utils"
import { TrendingUp, Users, MessageSquare, Eye, Clock, Zap, Sparkles, Target, Brain, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { motion } from "framer-motion"
import type { DecayPhase } from "@/types"

interface OpportunitySidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    authorName: string
    authorUsername: string
    authorFollowers: number
    authorImage?: string
    content: string
    timestamp: Date
    velocityScore: number
    saturationScore: number
    authorFatigueScore?: number
    audienceOverlapScore?: number
    replyFitScore?: number
    authorActive: boolean
    finalScore: number
    velocityRaw: {
      engagementRate: number
      growthRate: number
      freshness: number
    }
    saturationRaw: {
      replyCount: number
      replyGrowthRate: number
      densityScore: number
    }
    explanation: string
    // Decay intelligence
    isReviveable?: boolean
    reviveProbability?: number
    decayPhase?: DecayPhase
    halfLife?: number
    optimalMinutes?: number
    closingMinutes?: number
    velocityTrend?: 'accelerating' | 'stable' | 'decelerating'
    currentVelocity?: number
  }
  onReply?: () => void
  onViewDecay?: () => void
}

export function OpportunitySidePanel({
  open,
  onOpenChange,
  data,
  onReply,
  onViewDecay,
}: OpportunitySidePanelProps) {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'accelerating': return <ArrowUp className="h-3 w-3 text-success" />
      case 'decelerating': return <ArrowDown className="h-3 w-3 text-warning" />
      default: return <Minus className="h-3 w-3 text-foreground-muted" />
    }
  }

  const getPhaseColor = (phase?: DecayPhase) => {
    switch (phase) {
      case 'GROWTH': return 'text-success'
      case 'PEAK': return 'text-accent'
      case 'DECAY': return 'text-warning'
      case 'FLATLINE': return 'text-foreground-muted'
      default: return 'text-foreground-muted'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Opportunity Details</DialogTitle>
            {data.isReviveable && (
              <Badge variant="revive" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Reviveable
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Author & Score Header */}
          <div className="flex items-start space-x-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-surface-2 ring-2 ring-surface-3">
              {data.authorImage ? (
                <img src={data.authorImage} alt={data.authorName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground-muted">
                  {data.authorName[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{data.authorName}</h3>
                <span className="text-sm text-foreground-muted">@{data.authorUsername}</span>
                {data.authorActive && (
                  <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" title="Author is active" />
                )}
              </div>
              <div className="mt-1 flex items-center space-x-3 text-sm text-foreground-muted">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(data.authorFollowers)} followers</span>
                </div>
                <span>{formatTimeAgo(data.timestamp)}</span>
              </div>
            </div>
            <ScoreRing score={data.finalScore} size="md" showLabel />
          </div>

          {/* Tweet Content */}
          <div className="rounded-lg border border-surface-3 bg-surface-1 p-4">
            <p className="text-sm text-foreground leading-relaxed">{data.content}</p>
          </div>

          {/* Urgency Timer (if available) */}
          {data.optimalMinutes && data.closingMinutes && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Time Window</span>
                </div>
                <UrgencyTimer
                  optimalMinutes={data.optimalMinutes}
                  closingMinutes={data.closingMinutes}
                />
              </div>
            </div>
          )}

          {/* Signal Scores Grid */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Signal Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Velocity */}
              <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Velocity</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(data.velocityTrend)}
                    <span className="text-lg font-bold text-accent">{data.velocityScore}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-foreground-muted">
                  <div>
                    <div>Rate</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.engagementRate}%</div>
                  </div>
                  <div>
                    <div>Growth</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.growthRate}x</div>
                  </div>
                  <div>
                    <div>Fresh</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.freshness}%</div>
                  </div>
                </div>
              </div>

              {/* Saturation */}
              <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Saturation</span>
                  </div>
                  <span className="text-lg font-bold text-accent">{data.saturationScore}</span>
                </div>
                <SaturationMeter
                  replyCount={data.saturationRaw.replyCount}
                  replyVelocity={data.saturationRaw.replyGrowthRate}
                  densityScore={data.saturationRaw.densityScore}
                  compact
                />
              </div>

              {/* Author Fatigue */}
              {data.authorFatigueScore !== undefined && (
                <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Author Energy</span>
                    </div>
                    <span className="text-lg font-bold text-accent">{data.authorFatigueScore}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {data.authorFatigueScore > 70 ? 'Author is actively engaging' : 'Author may be less responsive'}
                  </p>
                </div>
              )}

              {/* Audience Overlap */}
              {data.audienceOverlapScore !== undefined && (
                <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Audience Fit</span>
                    </div>
                    <span className="text-lg font-bold text-accent">{data.audienceOverlapScore}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {data.audienceOverlapScore > 70 ? 'High overlap with your target' : 'Moderate audience match'}
                  </p>
                </div>
              )}

              {/* Reply Fit */}
              {data.replyFitScore !== undefined && (
                <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Reply Fit</span>
                    </div>
                    <span className="text-lg font-bold text-accent">{data.replyFitScore}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {data.replyFitScore > 70 ? 'Great match for your expertise' : 'Decent topic alignment'}
                  </p>
                </div>
              )}

              {/* Decay Phase (if reviveable) */}
              {data.isReviveable && data.decayPhase && (
                <div className="rounded-lg border border-revive/30 bg-revive/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-revive" />
                      <span className="text-sm font-medium text-foreground">Decay Phase</span>
                    </div>
                    <span className={cn("text-sm font-bold", getPhaseColor(data.decayPhase))}>
                      {data.decayPhase}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">Revival probability</span>
                    <span className="font-semibold text-revive">{data.reviveProbability}%</span>
                  </div>
                  {data.halfLife && (
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-foreground-muted">Half-life</span>
                      <span className="font-semibold text-foreground">{data.halfLife}m</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Why This Opportunity */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <h4 className="mb-2 flex items-center space-x-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-accent" />
              <span>Why this is a good opportunity</span>
            </h4>
            <p className="text-sm text-foreground-muted leading-relaxed">{data.explanation}</p>
          </div>

          {/* Suggested Reply Angles */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Suggested Reply Angles</h4>
            <div className="grid grid-cols-3 gap-2">
              {["Value add", "Share credibility", "Contrarian take"].map((angle) => (
                <motion.div
                  key={angle}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg border border-surface-3 bg-surface-1 p-3 text-center text-sm text-foreground-muted cursor-pointer hover:border-accent/50 hover:text-foreground transition-colors"
                >
                  {angle}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              className={cn(
                "flex-1 gap-2",
                data.isReviveable && "bg-gradient-revive hover:opacity-90"
              )}
              onClick={onReply}
            >
              <MessageSquare className="h-4 w-4" />
              {data.isReviveable ? 'Revive Now' : 'Reply Now'}
            </Button>
            {data.isReviveable && onViewDecay && (
              <Button variant="outline" onClick={onViewDecay} className="gap-2">
                <Sparkles className="h-4 w-4" />
                View Decay
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
