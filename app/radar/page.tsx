"use client"

import { useState, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { OpportunityCard } from "@/components/opportunity/opportunity-card"
import { OpportunitySidePanel } from "@/components/opportunity/opportunity-side-panel"
import { PostLifespanDrawer } from "@/components/opportunity/post-lifespan-drawer"
import { AlertStack } from "@/components/alerts/smart-alert-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  RefreshCw,
  Filter,
  ArrowUpDown,
  Sparkles,
  Zap,
  User,
  Clock,
} from "lucide-react"
import type { DecayPhase, AttentionDecayMetrics } from "@/types"

// Extended mock data with decay intelligence
const mockOpportunities = [
  {
    id: "1",
    authorName: "Sarah Chen",
    authorUsername: "sarahchen",
    authorFollowers: 45000,
    authorImage: undefined,
    content: "Just launched our new AI tool for content creators. The engagement spike in the first hour was insane. Here's what we learned about timing and audience psychology...",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    velocityScore: 85,
    saturationScore: 75,
    authorFatigueScore: 80,
    audienceOverlapScore: 70,
    replyFitScore: 65,
    authorActive: true,
    finalScore: 92,
    // New decay intelligence
    isReviveable: false,
    reviveProbability: undefined,
    decayPhase: "GROWTH" as DecayPhase,
    halfLife: undefined,
    optimalMinutes: 20,
    closingMinutes: 35,
    velocityTrend: "accelerating" as const,
    currentVelocity: 3.2,
    replyCount: 8,
    saturationTrend: "stable" as const,
    velocityRaw: { engagementRate: 12.5, growthRate: 3.2, freshness: 95 },
    saturationRaw: { replyCount: 8, replyGrowthRate: 0.5, densityScore: 15 },
    explanation: "This tweet is showing exceptional velocity with 12.5% engagement rate and very low reply saturation.",
  },
  {
    id: "2",
    authorName: "Marcus Johnson",
    authorUsername: "marcusj",
    authorFollowers: 120000,
    authorImage: undefined,
    content: "Unpopular opinion: Most growth hacks don't work because people focus on tactics instead of psychology. The best growth strategies I've seen all have one thing in common...",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    velocityScore: 78,
    saturationScore: 60,
    authorFatigueScore: 75,
    audienceOverlapScore: 80,
    replyFitScore: 70,
    authorActive: true,
    finalScore: 87,
    isReviveable: true,
    reviveProbability: 72,
    decayPhase: "DECAY" as DecayPhase,
    halfLife: 38,
    optimalMinutes: 10,
    closingMinutes: 18,
    velocityTrend: "decelerating" as const,
    currentVelocity: 1.8,
    replyCount: 15,
    saturationTrend: "stable" as const,
    velocityRaw: { engagementRate: 9.8, growthRate: 2.8, freshness: 82 },
    saturationRaw: { replyCount: 15, replyGrowthRate: 0.8, densityScore: 32 },
    explanation: "Revival opportunity detected. Quoting or replying can restart distribution.",
  },
  {
    id: "3",
    authorName: "Emily Rodriguez",
    authorUsername: "emilyrodriguez",
    authorFollowers: 28000,
    authorImage: undefined,
    content: "Three months ago I had 200 followers. Today I hit 28K. Here's the exact strategy that changed everything (and why most advice you read is wrong)...",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    velocityScore: 92,
    saturationScore: 82,
    authorFatigueScore: 85,
    audienceOverlapScore: 75,
    replyFitScore: 80,
    authorActive: true,
    finalScore: 95,
    isReviveable: false,
    reviveProbability: undefined,
    decayPhase: "PEAK" as DecayPhase,
    halfLife: 45,
    optimalMinutes: 15,
    closingMinutes: 25,
    velocityTrend: "stable" as const,
    currentVelocity: 4.1,
    replyCount: 5,
    saturationTrend: "stable" as const,
    velocityRaw: { engagementRate: 15.2, growthRate: 4.1, freshness: 90 },
    saturationRaw: { replyCount: 5, replyGrowthRate: 0.3, densityScore: 12 },
    explanation: "Exceptional opportunity at peak engagement with minimal saturation.",
  },
  {
    id: "4",
    authorName: "David Park",
    authorUsername: "davidpark",
    authorFollowers: 89000,
    authorImage: undefined,
    content: "After analyzing 1000+ viral tweets, I found that the secret isn't what you think. It's not about hooks, threads, or timing. It's something much simpler (and harder)...",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    velocityScore: 65,
    saturationScore: 45,
    authorFatigueScore: 50,
    audienceOverlapScore: 65,
    replyFitScore: 55,
    authorActive: false,
    finalScore: 71,
    isReviveable: true,
    reviveProbability: 58,
    decayPhase: "DECAY" as DecayPhase,
    halfLife: 52,
    optimalMinutes: 5,
    closingMinutes: 12,
    velocityTrend: "decelerating" as const,
    currentVelocity: 0.8,
    replyCount: 28,
    saturationTrend: "spiking" as const,
    velocityRaw: { engagementRate: 7.2, growthRate: 2.1, freshness: 65 },
    saturationRaw: { replyCount: 28, replyGrowthRate: 1.2, densityScore: 48 },
    explanation: "Window closing soon. Revival still possible but act quickly.",
  },
]

// Mock alerts
const mockAlerts = [
  {
    id: "alert-1",
    type: "REPLY_NOW" as const,
    urgency: "HIGH" as const,
    title: "High-leverage opportunity from Emily",
    message: "Score: 95. Low saturation (5 replies) with 4.1 engagements/min velocity.",
    optimalWindow: 15,
    closingWindow: 25,
    candidateTweetId: "3",
    dismissed: false,
    actedOn: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 25 * 60000),
    opportunity: {
      authorName: "Emily Rodriguez",
      authorUsername: "emilyrodriguez",
      content: "Three months ago I had 200 followers...",
      finalScore: 95,
    },
  },
  {
    id: "alert-2",
    type: "REVIVE_SIGNAL" as const,
    urgency: "MEDIUM" as const,
    title: "Revival opportunity on Marcus's tweet",
    message: "72% revival probability. Quoting now can restart distribution.",
    optimalWindow: 10,
    closingWindow: 18,
    candidateTweetId: "2",
    dismissed: false,
    actedOn: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 18 * 60000),
    opportunity: {
      authorName: "Marcus Johnson",
      authorUsername: "marcusj",
      content: "Unpopular opinion: Most growth hacks don't work...",
      finalScore: 87,
    },
  },
]

type FilterType = 'all' | 'high_score' | 'reviveable' | 'author_active'
type SortType = 'score' | 'velocity' | 'freshness' | 'revive_probability'

const filterConfig: { value: FilterType; label: string; icon: typeof Filter }[] = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'high_score', label: 'High Score (85+)', icon: Zap },
  { value: 'reviveable', label: 'Reviveable', icon: Sparkles },
  { value: 'author_active', label: 'Author Active', icon: User },
]

const sortConfig: { value: SortType; label: string }[] = [
  { value: 'score', label: 'Score' },
  { value: 'velocity', label: 'Velocity' },
  { value: 'freshness', label: 'Freshness' },
  { value: 'revive_probability', label: 'Revive %' },
]

export default function RadarPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof mockOpportunities[0] | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [decayDrawerOpen, setDecayDrawerOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('score')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [showAlerts, setShowAlerts] = useState(true)

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...mockOpportunities]

    // Apply filter
    switch (filter) {
      case 'high_score':
        filtered = filtered.filter(o => o.finalScore >= 85)
        break
      case 'reviveable':
        filtered = filtered.filter(o => o.isReviveable)
        break
      case 'author_active':
        filtered = filtered.filter(o => o.authorActive)
        break
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'velocity':
          return b.currentVelocity - a.currentVelocity
        case 'freshness':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'revive_probability':
          return (b.reviveProbability || 0) - (a.reviveProbability || 0)
        default:
          return b.finalScore - a.finalScore
      }
    })

    return filtered
  }, [filter, sortBy])

  const handleCardClick = (opportunity: typeof mockOpportunities[0]) => {
    setSelectedOpportunity(opportunity)
    setSidePanelOpen(true)
  }

  const handleViewDecay = (opportunity: typeof mockOpportunities[0]) => {
    setSelectedOpportunity(opportunity)
    setDecayDrawerOpen(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handleAlertAction = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (alert && alert.candidateTweetId) {
      const opp = mockOpportunities.find(o => o.id === alert.candidateTweetId)
      if (opp) {
        handleCardClick(opp)
        handleDismissAlert(alertId)
      }
    }
  }

  const reviveableCount = mockOpportunities.filter(o => o.isReviveable).length

  // Mock decay metrics for drawer
  const mockDecayMetrics: AttentionDecayMetrics = {
    halfLife: selectedOpportunity?.halfLife || 45,
    activeLifespan: 120,
    reviveProbability: selectedOpportunity?.reviveProbability || 60,
    decayVelocity: 0.8,
    currentPhase: selectedOpportunity?.decayPhase || "DECAY",
    reviveWindow: {
      start: new Date(Date.now() - 10 * 60000),
      end: new Date(Date.now() + 20 * 60000),
    },
    engagementHistory: [
      { timestamp: new Date(Date.now() - 60 * 60000), likes: 50, retweets: 10, replies: 5 },
      { timestamp: new Date(Date.now() - 45 * 60000), likes: 120, retweets: 25, replies: 12 },
      { timestamp: new Date(Date.now() - 30 * 60000), likes: 200, retweets: 45, replies: 20 },
      { timestamp: new Date(Date.now() - 15 * 60000), likes: 250, retweets: 52, replies: 25 },
      { timestamp: new Date(), likes: 280, retweets: 58, replies: 28 },
    ],
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Radar</h1>
            <p className="mt-1 text-foreground-muted">
              High-leverage reply opportunities, ranked by signal strength
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Alerts Section */}
        {showAlerts && alerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Smart Alerts</h2>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                Hide
              </button>
            </div>
            <AlertStack
              alerts={alerts}
              onDismiss={handleDismissAlert}
              onAction={handleAlertAction}
              maxVisible={2}
            />
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-1 rounded-lg border border-surface-3">
            {filterConfig.map((f) => {
              const Icon = f.icon
              const isActive = filter === f.value
              const count = f.value === 'reviveable' ? reviveableCount : undefined

              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-white"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                  {count !== undefined && count > 0 && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                      isActive ? "bg-white/20" : "bg-revive/20 text-revive"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-foreground-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-surface-1 border border-surface-3 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {sortConfig.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort by {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 text-sm text-foreground-muted">
          <span>{filteredOpportunities.length} opportunities</span>
          {reviveableCount > 0 && (
            <span className="flex items-center gap-1 text-revive">
              <Sparkles className="h-3.5 w-3.5" />
              {reviveableCount} reviveable
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Updated just now
          </span>
        </div>

        {/* Opportunities Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              {...opportunity}
              onClick={() => handleCardClick(opportunity)}
              onReply={() => handleCardClick(opportunity)}
              onViewDecay={() => handleViewDecay(opportunity)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-foreground-muted mb-2">
              No opportunities match your current filter
            </div>
            <Button variant="ghost" onClick={() => setFilter('all')}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Side Panel */}
        {selectedOpportunity && (
          <OpportunitySidePanel
            open={sidePanelOpen}
            onOpenChange={setSidePanelOpen}
            data={selectedOpportunity}
            onReply={() => {
              setSidePanelOpen(false)
            }}
          />
        )}

        {/* Decay Drawer */}
        {selectedOpportunity && selectedOpportunity.isReviveable && (
          <PostLifespanDrawer
            isOpen={decayDrawerOpen}
            onClose={() => setDecayDrawerOpen(false)}
            tweetId={selectedOpportunity.id}
            authorUsername={selectedOpportunity.authorUsername}
            metrics={mockDecayMetrics}
            historicalBoost={15}
            onReply={() => {
              setDecayDrawerOpen(false)
              setSidePanelOpen(true)
            }}
            onQuote={() => {
              setDecayDrawerOpen(false)
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}
