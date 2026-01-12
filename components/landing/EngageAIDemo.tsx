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
  Briefcase,
  Smile,
  Lightbulb,
  Loader2,
  ThumbsUp,
  ArrowRight,
  Twitter,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ReplyTone = "professional" | "casual" | "witty"

interface GeneratedReply {
  id: string
  tone: ReplyTone
  content: string
  hook: string
  estimatedPerformance: {
    engagementLikelihood: number
    authorReplyChance: number
  }
}

const toneConfig: { value: ReplyTone; label: string; icon: typeof Briefcase }[] = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "casual", label: "Casual", icon: Smile },
  { value: "witty", label: "Witty", icon: Lightbulb },
]

// Sample tweets for demo
const sampleTweets = [
  {
    author: "Naval",
    username: "naval",
    avatar: "https://pbs.twimg.com/profile_images/1735704764166418432/eZLBcyPF_400x400.jpg",
    content: "The most important skill for getting rich is becoming a perpetual learner. You have to know how to learn anything you want to learn.",
    followers: "2.1M",
  },
  {
    author: "Paul Graham",
    username: "paulg",
    avatar: "https://pbs.twimg.com/profile_images/1883073388819890176/8bIUUHqR_400x400.jpg",
    content: "The best founders are relentlessly resourceful. They keep trying new things until something works.",
    followers: "1.8M",
  },
  {
    author: "Sahil Bloom",
    username: "SahilBloom",
    avatar: "https://pbs.twimg.com/profile_images/1858543849391878144/xKz8pUHu_400x400.jpg",
    content: "The most successful people I know have one thing in common: They're obsessed with learning from their failures.",
    followers: "1.5M",
  },
]

// Mock reply generator
function generateMockReplies(tone: ReplyTone): GeneratedReply[] {
  const templates = {
    professional: [
      {
        content: "This resonates deeply. In my experience, the compound effect of daily learning creates an unfair advantage over time. The key is building systems that make learning inevitable, not optional.",
        hook: "Value Add",
      },
      {
        content: "Exactly right. I'd add that the meta-skill is learning HOW to learn efficiently. Speed of skill acquisition becomes the ultimate competitive moat in a rapidly changing world.",
        hook: "Expert Insight",
      },
      {
        content: "This aligns with research showing that curiosity-driven learning has 3x better retention than goal-driven learning. The perpetual learner mindset removes the friction of 'having to' learn.",
        hook: "Data Point",
      },
    ],
    casual: [
      {
        content: "This hit different. I used to think I needed to specialize in one thing forever. Now I realize the ability to pick up new skills quickly is THE skill. Game changer mindset 🙌",
        hook: "Relatable Take",
      },
      {
        content: "Real talk - started applying this 6 months ago and it's wild how much faster I'm growing. Learning to learn is underrated. Thanks for the reminder 🔥",
        hook: "Personal Story",
      },
      {
        content: "This is the kind of content that actually moves the needle. Not tactics, but mindset shifts. Bookmarking this one 📌",
        hook: "Quick Thought",
      },
    ],
    witty: [
      {
        content: "Plot twist: the real wealth was the neurons we grew along the way. But seriously, this explains why the most interesting rich people never seem to stop being curious.",
        hook: "Pattern Break",
      },
      {
        content: "Me at 20: 'I'll learn what I need for my job.' Me now: 'I'll learn whatever looks interesting and figure out how to monetize it later.' The second approach is winning.",
        hook: "Clever Angle",
      },
      {
        content: "This is why I'm suspicious of anyone who says 'I already know enough.' That's not confidence, that's a ceiling. Perpetual learning = perpetual optionality.",
        hook: "Unexpected Take",
      },
    ],
  }

  return templates[tone].map((t, i) => ({
    id: `demo-${tone}-${i}`,
    tone,
    content: t.content,
    hook: t.hook,
    estimatedPerformance: {
      engagementLikelihood: Math.floor(Math.random() * 20) + 70,
      authorReplyChance: Math.floor(Math.random() * 20) + 20,
    },
  }))
}

export function EngageAIDemo({ onGetAccess }: { onGetAccess: () => void }) {
  const [selectedTweet, setSelectedTweet] = useState(sampleTweets[0])
  const [selectedTone, setSelectedTone] = useState<ReplyTone>("professional")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReplies, setGeneratedReplies] = useState<GeneratedReply[]>([])
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGeneratedReplies([])
    setSelectedReplyId(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const replies = generateMockReplies(selectedTone)
    setGeneratedReplies(replies)
    setIsGenerating(false)
  }

  const handleCopy = async (reply: GeneratedReply) => {
    await navigator.clipboard.writeText(reply.content)
    setCopiedId(reply.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section className="py-24 px-6 bg-surface-1">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-accent/10 border border-accent/30">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Engage AI</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            AI-powered replies that <span className="gradient-text">actually work</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Don't just find opportunities—know exactly what to say. Our AI analyzes the tweet, 
            the author's style, and generates replies optimized for engagement.
          </p>
        </motion.div>

        {/* Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Left: Tweet Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Twitter className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Select a tweet to reply to</span>
            </div>

            <div className="space-y-3">
              {sampleTweets.map((tweet, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTweet(tweet)
                    setGeneratedReplies([])
                    setSelectedReplyId(null)
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all",
                    selectedTweet.username === tweet.username
                      ? "border-accent bg-accent/5"
                      : "border-surface-3 bg-surface-2 hover:border-accent/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={tweet.avatar} 
                      alt={`${tweet.author} avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{tweet.author}</span>
                        <span className="text-sm text-foreground-muted">@{tweet.username}</span>
                        <Badge variant="secondary" className="text-xs">{tweet.followers}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-foreground leading-relaxed">{tweet.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: AI Composer */}
          <div className="rounded-xl border border-surface-3 bg-surface-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <Wand2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Engage AI</h3>
                  <p className="text-xs text-foreground-muted">Generate smart replies</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </Badge>
            </div>

            {/* Tone Selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-foreground-muted mb-2 block">Reply Tone</label>
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
                          : "border-surface-3 bg-surface-1 text-foreground-muted hover:border-accent/50"
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
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 mb-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing & generating...
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
                    <span className="text-xs font-medium text-foreground-muted">
                      Generated Replies
                    </span>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
                    >
                      <RefreshCw className={cn("h-3 w-3", isGenerating && "animate-spin")} />
                      Regenerate
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {generatedReplies.map((reply, index) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedReplyId(reply.id)}
                        className={cn(
                          "cursor-pointer rounded-lg border p-3 transition-all",
                          selectedReplyId === reply.id
                            ? "border-accent bg-accent/5"
                            : "border-surface-3 bg-surface-1 hover:border-accent/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {reply.hook}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(reply)
                              }}
                              className="p-1 rounded hover:bg-surface-2"
                            >
                              {copiedId === reply.id ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3 text-foreground-muted" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {reply.estimatedPerformance.engagementLikelihood}% engagement
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {generatedReplies.length === 0 && !isGenerating && (
              <div className="text-center py-8 text-foreground-muted">
                <Wand2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a tone and click generate to see AI-powered replies</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-foreground-muted mb-4">
            This is just a preview. The full version learns your voice and optimizes for your audience.
          </p>
          <Button onClick={onGetAccess} size="lg" className="gap-2 shadow-glow-primary">
            Get Early Access to Engage AI
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
