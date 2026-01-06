"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { OpportunityCard } from "@/components/opportunity/opportunity-card"
import { OpportunitySidePanel } from "@/components/opportunity/opportunity-side-panel"

const mockOpportunities = [
  {
    id: "1",
    authorName: "Sarah Chen",
    authorUsername: "sarahchen",
    authorFollowers: 45000,
    content: "Just launched our new AI tool for content creators. The engagement spike in the first hour was insane. Here's what we learned about timing and audience psychology...",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    velocityScore: 85,
    saturationScore: 25,
    authorActive: true,
    finalScore: 92,
    velocityRaw: {
      engagementRate: 12.5,
      growthRate: 3.2,
      freshness: 95,
    },
    saturationRaw: {
      replyCount: 8,
      replyGrowthRate: 0.5,
      densityScore: 15,
    },
    explanation: "This tweet is showing exceptional velocity with 12.5% engagement rate and very low reply saturation. The author is currently active and responding to replies. The topic aligns with your expertise in content strategy, making this a high-value opportunity.",
  },
  {
    id: "2",
    authorName: "Marcus Johnson",
    authorUsername: "marcusj",
    authorFollowers: 120000,
    content: "Unpopular opinion: Most growth hacks don't work because people focus on tactics instead of psychology. The best growth strategies I've seen all have one thing in common...",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    velocityScore: 78,
    saturationScore: 40,
    authorActive: true,
    finalScore: 87,
    velocityRaw: {
      engagementRate: 9.8,
      growthRate: 2.8,
      freshness: 88,
    },
    saturationRaw: {
      replyCount: 15,
      replyGrowthRate: 0.8,
      densityScore: 32,
    },
    explanation: "Strong engagement from a highly influential account. The contrarian framing invites discussion. While reply count is moderate, there's still room for a high-quality contribution that adds unique perspective.",
  },
  {
    id: "3",
    authorName: "Emily Rodriguez",
    authorUsername: "emilyrodriguez",
    authorFollowers: 28000,
    content: "Three months ago I had 200 followers. Today I hit 28K. Here's the exact strategy that changed everything (and why most advice you read is wrong)...",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    velocityScore: 92,
    saturationScore: 18,
    authorActive: true,
    finalScore: 95,
    velocityRaw: {
      engagementRate: 15.2,
      growthRate: 4.1,
      freshness: 82,
    },
    saturationRaw: {
      replyCount: 5,
      replyGrowthRate: 0.3,
      densityScore: 12,
    },
    explanation: "Exceptional opportunity with very high velocity and minimal saturation. The author's growth story creates natural engagement hooks. Your experience in audience building makes this a perfect fit for adding credible value.",
  },
  {
    id: "4",
    authorName: "David Park",
    authorUsername: "davidpark",
    authorFollowers: 89000,
    content: "After analyzing 1000+ viral tweets, I found that the secret isn't what you think. It's not about hooks, threads, or timing. It's something much simpler (and harder)...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    velocityScore: 65,
    saturationScore: 55,
    authorActive: false,
    finalScore: 71,
    velocityRaw: {
      engagementRate: 7.2,
      growthRate: 2.1,
      freshness: 72,
    },
    saturationRaw: {
      replyCount: 28,
      replyGrowthRate: 1.2,
      densityScore: 48,
    },
    explanation: "Good engagement numbers but increasing reply saturation. The analytical angle matches your expertise. While the author isn't currently active, the audience quality remains high.",
  },
]

export default function RadarPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof mockOpportunities[0] | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)

  const handleCardClick = (opportunity: typeof mockOpportunities[0]) => {
    setSelectedOpportunity(opportunity)
    setSidePanelOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Radar</h1>
          <p className="mt-2 text-foreground-muted">
            High-leverage reply opportunities, ranked by signal strength
          </p>
        </div>

        <div className="space-y-4">
          {mockOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              {...opportunity}
              onClick={() => handleCardClick(opportunity)}
            />
          ))}
        </div>

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
      </div>
    </AppLayout>
  )
}
