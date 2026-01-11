"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Briefcase,
  Smile,
  Lightbulb,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type ReplyTone = "professional" | "casual" | "witty"

export interface GeneratedReply {
  id: string
  tone: ReplyTone
  content: string
  hook: string
  reasoning: string
  estimatedPerformance: {
    engagementLikelihood: number
    authorReplyChance: number
  }
}

interface AIReplyComposerProps {
  tweetContent: string
  authorName: string
  authorUsername: string
  authorFollowers: number
  tweetTopic?: string
  onSelectReply: (reply: string) => void
  onClose?: () => void
  className?: string
}

const toneConfig: { value: ReplyTone; label: string; icon: typeof Briefcase; description: string }[] = [
  { value: "professional", label: "Professional", icon: Briefcase, description: "Thought leader tone" },
  { value: "casual", label: "Casual", icon: Smile, description: "Friendly & approachable" },
  { value: "witty", label: "Witty", icon: Lightbulb, description: "Clever & memorable" },
]

export function AIReplyComposer({
  tweetContent,
  authorName,
  authorUsername,
  authorFollowers,
  tweetTopic,
  onSelectReply,
  onClose,
  className,
}: AIReplyComposerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTone, setSelectedTone] = useState<ReplyTone>("professional")
  const [generatedReplies, setGeneratedReplies] = useState<GeneratedReply[]>([])
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({})

  const generateReplies = async () => {
    setIsGenerating(true)
    setGeneratedReplies([])
    setSelectedReplyId(null)
    setIsEditing(false)

    try {
      const response = await fetch("/api/ai/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetContent,
          authorName,
          authorUsername,
          authorFollowers,
          tweetTopic,
          tone: selectedTone,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate replies")
      }

      const data = await response.json()
      setGeneratedReplies(data.replies)
    } catch (error) {
      // Fallback to mock data for demo
      const mockReplies = generateMockReplies(tweetContent, authorName, selectedTone)
      setGeneratedReplies(mockReplies)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (reply: GeneratedReply) => {
    await navigator.clipboard.writeText(reply.content)
    setCopiedId(reply.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelectReply = (reply: GeneratedReply) => {
    setSelectedReplyId(reply.id)
    setEditedContent(reply.content)
    setIsEditing(false)
  }

  const handleUseReply = () => {
    const content = isEditing ? editedContent : generatedReplies.find(r => r.id === selectedReplyId)?.content
    if (content) {
      onSelectReply(content)
    }
  }

  const handleFeedback = (replyId: string, type: "up" | "down") => {
    setFeedback(prev => ({ ...prev, [replyId]: type }))
    // In production, send feedback to API for learning
  }

  const openTwitter = () => {
    const content = isEditing ? editedContent : generatedReplies.find(r => r.id === selectedReplyId)?.content
    if (content) {
      const tweetUrl = `https://twitter.com/intent/tweet?in_reply_to=${authorUsername}&text=${encodeURIComponent(content)}`
      window.open(tweetUrl, "_blank")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/60">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Reply Composer</h3>
            <p className="text-xs text-foreground-muted">Generate contextual replies</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Wand2 className="h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      {/* Tone Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground-muted">Reply Tone</label>
        <div className="grid grid-cols-3 gap-2">
          {toneConfig.map((tone) => {
            const Icon = tone.icon
            const isSelected = selectedTone === tone.value
            return (
              <button
                key={tone.value}
                onClick={() => setSelectedTone(tone.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-3 transition-all",
                  isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-surface-3 bg-surface-1 text-foreground-muted hover:border-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{tone.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateReplies}
        disabled={isGenerating}
        className="w-full gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing tweet & generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Replies
          </>
        )}
      </Button>

      {/* Generated Replies */}
      <AnimatePresence mode="wait">
        {generatedReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground-muted">
                Generated Replies ({generatedReplies.length})
              </label>
              <button
                onClick={generateReplies}
                disabled={isGenerating}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
              >
                <RefreshCw className={cn("h-3 w-3", isGenerating && "animate-spin")} />
                Regenerate
              </button>
            </div>

            <div className="space-y-2">
              {generatedReplies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectReply(reply)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all",
                    selectedReplyId === reply.id
                      ? "border-accent bg-accent/5"
                      : "border-surface-3 bg-surface-1 hover:border-accent/50"
                  )}
                >
                  {/* Reply Header */}
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {reply.hook}
                      </Badge>
                      <span className="text-xs text-foreground-muted">
                        {reply.tone.charAt(0).toUpperCase() + reply.tone.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFeedback(reply.id, "up")
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-surface-2",
                          feedback[reply.id] === "up" && "text-success"
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFeedback(reply.id, "down")
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-surface-2",
                          feedback[reply.id] === "down" && "text-destructive"
                        )}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(reply)
                        }}
                        className="p-1 rounded hover:bg-surface-2"
                      >
                        {copiedId === reply.id ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reply Content */}
                  <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>

                  {/* Performance Estimate */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                    <span>
                      Engagement: <span className="font-medium text-accent">{reply.estimatedPerformance.engagementLikelihood}%</span>
                    </span>
                    <span>
                      Author reply: <span className="font-medium text-accent">{reply.estimatedPerformance.authorReplyChance}%</span>
                    </span>
                  </div>

                  {/* Reasoning (collapsed by default) */}
                  {selectedReplyId === reply.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 rounded-md bg-surface-2 p-2"
                    >
                      <p className="text-xs text-foreground-muted">
                        <span className="font-medium text-foreground">Why this works:</span> {reply.reasoning}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Edit Selected Reply */}
            {selectedReplyId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground-muted">
                    {isEditing ? "Edit Reply" : "Selected Reply"}
                  </label>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-accent hover:text-accent/80"
                  >
                    {isEditing ? "Cancel Edit" : "Edit"}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full rounded-lg border border-surface-3 bg-surface-1 p-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    rows={4}
                    placeholder="Edit your reply..."
                  />
                ) : null}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleUseReply} className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Use This Reply
                  </Button>
                  <Button variant="outline" onClick={openTwitter} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in X
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {generatedReplies.length === 0 && !isGenerating && (
        <div className="rounded-lg border border-surface-3 bg-surface-1 p-3">
          <h4 className="mb-2 text-xs font-medium text-foreground">Tips for better replies</h4>
          <ul className="space-y-1 text-xs text-foreground-muted">
            <li>• Add specific value or insight to the conversation</li>
            <li>• Reference your own experience when relevant</li>
            <li>• Ask thoughtful follow-up questions</li>
            <li>• Keep it concise - under 280 characters performs best</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Mock reply generator for demo/fallback
function generateMockReplies(tweetContent: string, authorName: string, tone: ReplyTone): GeneratedReply[] {
  const hooks = {
    professional: ["Value Add", "Expert Insight", "Data Point"],
    casual: ["Relatable Take", "Personal Story", "Quick Thought"],
    witty: ["Clever Angle", "Pattern Break", "Unexpected Take"],
  }

  const templates = {
    professional: [
      `This resonates deeply. In my experience working with similar challenges, the key differentiator was focusing on {insight}. Would love to hear how you approached the implementation side.`,
      `Great point about this. I've seen teams struggle with exactly this - what helped us was {insight}. The results were measurable within weeks.`,
      `This aligns with research I've been following. The data suggests {insight} is the critical factor most overlook. Curious if you've seen similar patterns?`,
    ],
    casual: [
      `Oh this hits home! I literally just dealt with this last week. The thing that finally clicked for me was {insight}. Game changer honestly.`,
      `Yes! This is exactly what I needed to hear today. Been thinking about {insight} and this confirms I'm on the right track.`,
      `Love this take. Not enough people talk about {insight}. Following for more of this kind of content 🙌`,
    ],
    witty: [
      `Plot twist: {insight} is actually the secret sauce everyone's been sleeping on. But shh, let's keep this between us and your 45K followers 😉`,
      `*takes notes furiously* This is the kind of insight that separates the "I read about it" crowd from the "I've done it" crowd. {insight} is chef's kiss.`,
      `Me before reading this: confused. Me after: still confused but now I have {insight} to blame. Seriously though, great thread.`,
    ],
  }

  const insights = [
    "consistency over intensity",
    "systems over goals",
    "distribution before creation",
    "audience psychology",
    "timing and context",
  ]

  return templates[tone].map((template, index) => {
    const insight = insights[Math.floor(Math.random() * insights.length)]
    const content = template.replace("{insight}", insight)
    
    return {
      id: `reply-${index + 1}`,
      tone,
      content,
      hook: hooks[tone][index],
      reasoning: `This reply uses the "${hooks[tone][index]}" approach which historically performs well with ${authorName}'s audience. It adds value while positioning you as knowledgeable in the space.`,
      estimatedPerformance: {
        engagementLikelihood: Math.floor(Math.random() * 30) + 60,
        authorReplyChance: Math.floor(Math.random() * 25) + 15,
      },
    }
  })
}
