"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { TrendingUp, Eye, UserPlus, Sparkles } from "lucide-react"

interface ReplyComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tweetContext: {
    authorName: string
    authorUsername: string
    content: string
  }
}

const replyStrategies = [
  {
    id: "value-add",
    name: "Value Add",
    description: "Share actionable insights or additional context",
    template: "Great point! I'd add that...",
  },
  {
    id: "credibility",
    name: "Credibility",
    description: "Share relevant experience or case study",
    template: "I saw similar results when...",
  },
  {
    id: "contrarian",
    name: "Contrarian",
    description: "Respectfully challenge with alternative view",
    template: "Interesting perspective. I wonder if...",
  },
]

export function ReplyComposer({ open, onOpenChange, tweetContext }: ReplyComposerProps) {
  const [replyText, setReplyText] = useState("")
  const [selectedStrategy, setSelectedStrategy] = useState("value-add")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Reply</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Tweet Context</h3>
              <Card className="p-4">
                <div className="mb-2 flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-accent" />
                  <div>
                    <div className="font-semibold text-foreground">{tweetContext.authorName}</div>
                    <div className="text-sm text-foreground-muted">@{tweetContext.authorUsername}</div>
                  </div>
                </div>
                <p className="text-sm text-foreground-muted">{tweetContext.content}</p>
              </Card>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Author Insights</h3>
              <Card className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Typical response time</span>
                    <span className="font-medium text-foreground">15-30 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Engagement rate</span>
                    <span className="font-medium text-foreground">8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Best reply topics</span>
                    <span className="font-medium text-foreground">Strategy, Data</span>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Predicted Outcomes</h3>
              <div className="space-y-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground-muted">Expected impressions</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {formatNumber(2500)} - {formatNumber(5000)}
                    </span>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground-muted">Author engagement</span>
                    </div>
                    <span className="font-semibold text-foreground">72%</span>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground-muted">Potential follows</span>
                    </div>
                    <span className="font-semibold text-foreground">8-15</span>
                  </div>
                </Card>
              </div>
              <p className="mt-3 text-xs text-foreground-muted">
                Based on similar opportunities, replies with strategic value-add typically achieve
                author engagement and generate profile visits.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Reply Strategy</h3>
              <Tabs value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <TabsList className="grid w-full grid-cols-3">
                  {replyStrategies.map((strategy) => (
                    <TabsTrigger key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {replyStrategies.map((strategy) => (
                  <TabsContent key={strategy.id} value={strategy.id}>
                    <Card className="p-3">
                      <p className="text-sm text-foreground-muted">{strategy.description}</p>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Your Reply</h3>
                <Badge variant="secondary">{replyText.length}/280</Badge>
              </div>
              <textarea
                className="h-40 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none"
                placeholder={
                  replyStrategies.find((s) => s.id === selectedStrategy)?.template ||
                  "Write your reply..."
                }
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={280}
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={replyText.length < 10}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Post Reply
            </Button>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
              <p className="text-xs text-foreground-muted">
                Your reply will be posted immediately. Make sure to maintain a professional and
                value-driven tone for best results.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
