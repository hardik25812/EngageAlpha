"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatNumber, formatTimeAgo } from "@/lib/utils"
import { TrendingUp, Eye, UserPlus, MessageCircle, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"

const mockWins = [
  {
    id: "1",
    originalTweet: {
      authorName: "Emily Rodriguez",
      authorUsername: "emilyrodriguez",
      content: "Three months ago I had 200 followers. Today I hit 28K. Here's the exact strategy...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    yourReply: {
      content: "This aligns with what I found when growing @acmecorp from 0 to 15K in 90 days. The key was consistency + specific value props. One addition: segment your content by audience stage (awareness vs. decision). We saw 3x better conversion rates.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
    },
    outcome: {
      impressions: 12500,
      authorEngaged: true,
      profileClicks: 187,
      follows: 23,
      label: "RIGHT" as const,
    },
    insight: "Your credibility signal (specific case study with numbers) combined with actionable addition created trust. Segmentation tip was novel to the thread, positioning you as an expert.",
  },
  {
    id: "2",
    originalTweet: {
      authorName: "Marcus Johnson",
      authorUsername: "marcusj",
      content: "Unpopular opinion: Most growth hacks don't work because people focus on tactics instead of psychology...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
    yourReply: {
      content: "100% agree. I'd add that the best 'growth hacks' are just good product psychology at scale. Example: Dropbox's referral wasn't a hack—it solved a core user problem (storage) with built-in distribution. The tactic was secondary to understanding user motivation.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 71),
    },
    outcome: {
      impressions: 8900,
      authorEngaged: true,
      profileClicks: 134,
      follows: 18,
      label: "RIGHT" as const,
    },
    insight: "Agreeing first, then adding depth with a concrete example (Dropbox) showed thought leadership. Author engagement amplified your visibility to their 120K audience.",
  },
  {
    id: "3",
    originalTweet: {
      authorName: "Sarah Chen",
      authorUsername: "sarahchen",
      content: "Just launched our new AI tool for content creators. The engagement spike in the first hour was insane...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    },
    yourReply: {
      content: "Congrats on the launch! Quick question: did you see engagement concentrated in your existing audience, or did it spread to new networks? I'm researching launch dynamics and would love to know if the initial spike came from seeding or organic discovery.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 95),
    },
    outcome: {
      impressions: 5200,
      authorEngaged: true,
      profileClicks: 89,
      follows: 12,
      label: "RIGHT" as const,
    },
    insight: "Genuine question with context (researching launch dynamics) positioned you as someone doing serious work. Author's detailed response to your question further increased your reply visibility.",
  },
]

export default function WinsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wins</h1>
          <p className="mt-2 text-foreground-muted">
            Your successful replies and what made them work
          </p>
        </div>

        <div className="space-y-6">
          {mockWins.map((win, index) => (
            <motion.div
              key={win.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Original Tweet</h3>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="mb-2 flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-accent" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {win.originalTweet.authorName}
                          </div>
                          <div className="text-xs text-foreground-muted">
                            @{win.originalTweet.authorUsername}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground-muted">{win.originalTweet.content}</p>
                      <p className="mt-2 text-xs text-foreground-muted">
                        {formatTimeAgo(win.originalTweet.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Your Reply</h3>
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                      <p className="text-sm text-foreground">{win.yourReply.content}</p>
                      <p className="mt-2 text-xs text-foreground-muted">
                        {formatTimeAgo(win.yourReply.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Outcome</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                        <div className="flex items-center space-x-2 text-foreground-muted">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Impressions</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatNumber(win.outcome.impressions)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                        <div className="flex items-center space-x-2 text-foreground-muted">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">Author Engaged</span>
                        </div>
                        <Badge variant="success">Yes</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                        <div className="flex items-center space-x-2 text-foreground-muted">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Profile Clicks</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {win.outcome.profileClicks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                        <div className="flex items-center space-x-2 text-foreground-muted">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-xs">New Follows</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          +{win.outcome.follows}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border bg-accent/5 p-4">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Why this worked</h4>
                      <p className="mt-1 text-sm text-foreground-muted">{win.insight}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
