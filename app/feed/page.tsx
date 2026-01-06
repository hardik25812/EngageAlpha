"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber, formatTimeAgo } from "@/lib/utils"
import { TrendingUp, Users } from "lucide-react"

export default function FeedPage() {
  const broadOpportunities = [
    {
      id: "1",
      authorName: "Tech Innovator",
      authorUsername: "techinnovator",
      authorFollowers: 156000,
      content: "The future of AI in product development is not what most people think...",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      score: 68,
      trending: true,
    },
    {
      id: "2",
      authorName: "Startup Founder",
      authorUsername: "startupfounder",
      authorFollowers: 43000,
      content: "Just raised our Series A. Here are the 5 things that made the difference...",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      score: 72,
      trending: true,
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed</h1>
          <p className="mt-2 text-foreground-muted">
            Broader opportunity monitoring across your topics
          </p>
        </div>

        <div className="space-y-4">
          {broadOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-background-card" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-foreground">{opportunity.authorName}</h3>
                        <span className="text-sm text-foreground-muted">
                          @{opportunity.authorUsername}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-3 text-sm text-foreground-muted">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{formatNumber(opportunity.authorFollowers)}</span>
                        </div>
                        <span>{formatTimeAgo(opportunity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-foreground">{opportunity.content}</p>
                  <div className="flex items-center space-x-2">
                    {opportunity.trending && (
                      <Badge variant="default">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Trending
                      </Badge>
                    )}
                    <Badge variant="secondary">Score: {opportunity.score}</Badge>
                  </div>
                </div>
                <div className="ml-4">
                  <Button size="sm">View</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
