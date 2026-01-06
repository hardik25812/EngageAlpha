"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber, formatTimeAgo } from "@/lib/utils"
import { TrendingUp, Users, MessageSquare, Eye, Clock } from "lucide-react"
import { motion } from "framer-motion"

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
  }
  onReply?: () => void
}

export function OpportunitySidePanel({
  open,
  onOpenChange,
  data,
  onReply,
}: OpportunitySidePanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Opportunity Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-background-card">
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
              </div>
              <div className="mt-1 flex items-center space-x-3 text-sm text-foreground-muted">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(data.authorFollowers)} followers</span>
                </div>
                <span>{formatTimeAgo(data.timestamp)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">{data.finalScore}</div>
              <div className="text-xs text-foreground-muted">Score</div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-foreground">{data.content}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Signals</h4>
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Velocity</span>
                  </div>
                  <Badge variant={data.velocityScore > 70 ? "default" : "secondary"}>
                    {data.velocityScore > 70 ? "High" : data.velocityScore > 40 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-foreground-muted">
                  <div>
                    <div>Engagement</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.engagementRate}%</div>
                  </div>
                  <div>
                    <div>Growth</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.growthRate}x</div>
                  </div>
                  <div>
                    <div>Freshness</div>
                    <div className="font-semibold text-foreground">{data.velocityRaw.freshness}%</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">Reply Saturation</span>
                  </div>
                  <Badge variant={data.saturationScore < 40 ? "success" : data.saturationScore < 70 ? "warning" : "destructive"}>
                    {data.saturationScore < 40 ? "Low" : data.saturationScore < 70 ? "Medium" : "Crowded"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-foreground-muted">
                  <div>
                    <div>Replies</div>
                    <div className="font-semibold text-foreground">{data.saturationRaw.replyCount}</div>
                  </div>
                  <div>
                    <div>Growth</div>
                    <div className="font-semibold text-foreground">{data.saturationRaw.replyGrowthRate}/min</div>
                  </div>
                  <div>
                    <div>Density</div>
                    <div className="font-semibold text-foreground">{data.saturationRaw.densityScore}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <h4 className="mb-2 flex items-center space-x-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-accent" />
              <span>Why this is a good opportunity</span>
            </h4>
            <p className="text-sm text-foreground-muted">{data.explanation}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Suggested Reply Angles</h4>
            <div className="space-y-2">
              {["Value add", "Share credibility", "Contrarian take"].map((angle) => (
                <div key={angle} className="rounded-lg border border-border p-3 text-sm text-foreground-muted">
                  {angle}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1" onClick={onReply}>
              Reply Now
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
