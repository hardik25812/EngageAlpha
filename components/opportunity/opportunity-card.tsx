"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber, formatTimeAgo, cn } from "@/lib/utils"
import { TrendingUp, Users, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

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
  authorActive: boolean
  finalScore: number
  onClick?: () => void
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
  authorActive,
  finalScore,
  onClick,
}: OpportunityCardProps) {
  const velocityLabel = velocityScore > 70 ? "High" : velocityScore > 40 ? "Medium" : "Low"
  const saturationLabel = saturationScore < 40 ? "Low" : saturationScore < 70 ? "Medium" : "Crowded"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-accent/50 hover:shadow-lg",
          "relative overflow-hidden"
        )}
        onClick={onClick}
      >
        <div className="absolute right-0 top-0 px-3 py-1">
          <div className="text-xs font-bold text-accent">{finalScore}</div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-start space-x-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-background-card">
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
                <span className="text-sm text-foreground-muted">@{authorUsername}</span>
              </div>
              <div className="mt-1 flex items-center space-x-3 text-sm text-foreground-muted">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(authorFollowers)}</span>
                </div>
                <span>{formatTimeAgo(timestamp)}</span>
              </div>
            </div>
          </div>

          <p className="mb-4 line-clamp-3 text-sm text-foreground">{content}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant={velocityScore > 70 ? "default" : "secondary"}>
              <TrendingUp className="mr-1 h-3 w-3" />
              Velocity: {velocityLabel}
            </Badge>
            <Badge variant={saturationScore < 40 ? "success" : saturationScore < 70 ? "warning" : "destructive"}>
              <MessageSquare className="mr-1 h-3 w-3" />
              Saturation: {saturationLabel}
            </Badge>
            {authorActive && (
              <Badge variant="default">
                Author Active
              </Badge>
            )}
          </div>

          <div className="mt-4 flex space-x-2">
            <Button size="sm" className="flex-1">
              Reply Now
            </Button>
            <Button size="sm" variant="outline">
              Why this?
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
