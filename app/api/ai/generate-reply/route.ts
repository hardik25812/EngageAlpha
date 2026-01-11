import { NextRequest, NextResponse } from "next/server"

export interface GenerateReplyRequest {
  tweetContent: string
  authorName: string
  authorUsername: string
  authorFollowers: number
  tweetTopic?: string
  tone: "professional" | "casual" | "witty"
  userContext?: {
    previousWins?: string[]
    preferredStyle?: string
    expertise?: string[]
  }
}

export interface GeneratedReply {
  id: string
  tone: "professional" | "casual" | "witty"
  content: string
  hook: string
  reasoning: string
  estimatedPerformance: {
    engagementLikelihood: number
    authorReplyChance: number
  }
}

// Analyze tweet to extract key elements
function analyzeTweet(content: string): {
  topic: string
  sentiment: string
  isQuestion: boolean
  isOpinion: boolean
  hasData: boolean
  keyPhrases: string[]
} {
  const lowerContent = content.toLowerCase()
  
  return {
    topic: extractTopic(content),
    sentiment: lowerContent.includes("love") || lowerContent.includes("great") || lowerContent.includes("amazing") 
      ? "positive" 
      : lowerContent.includes("hate") || lowerContent.includes("bad") || lowerContent.includes("wrong")
      ? "negative"
      : "neutral",
    isQuestion: content.includes("?"),
    isOpinion: lowerContent.includes("think") || lowerContent.includes("believe") || lowerContent.includes("opinion"),
    hasData: /\d+%|\d+x|\d+k|\d+m/i.test(content),
    keyPhrases: extractKeyPhrases(content),
  }
}

function extractTopic(content: string): string {
  const topics = [
    { keywords: ["ai", "artificial intelligence", "machine learning", "gpt", "llm"], topic: "AI/Tech" },
    { keywords: ["growth", "followers", "engagement", "viral"], topic: "Growth" },
    { keywords: ["startup", "founder", "raised", "funding", "series"], topic: "Startups" },
    { keywords: ["marketing", "content", "brand", "audience"], topic: "Marketing" },
    { keywords: ["product", "launch", "ship", "build"], topic: "Product" },
    { keywords: ["career", "job", "hire", "work"], topic: "Career" },
  ]
  
  const lowerContent = content.toLowerCase()
  for (const { keywords, topic } of topics) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      return topic
    }
  }
  return "General"
}

function extractKeyPhrases(content: string): string[] {
  // Simple extraction - in production, use NLP
  const words = content.split(/\s+/).filter(w => w.length > 4)
  return words.slice(0, 5)
}

// Generate replies based on analysis
function generateRepliesForTone(
  analysis: ReturnType<typeof analyzeTweet>,
  authorName: string,
  authorFollowers: number,
  tone: "professional" | "casual" | "witty"
): GeneratedReply[] {
  const isLargeAccount = authorFollowers > 50000
  
  const replyStrategies = {
    professional: [
      {
        hook: "Value Add",
        template: (topic: string) => 
          `This aligns with patterns I've observed in ${topic}. The key differentiator often overlooked is the compound effect of consistency. In my experience, the teams that win focus on systems over one-time tactics. Would be curious to hear how you're thinking about the long-term implementation.`,
        reasoning: "Adds credibility through experience while inviting continued dialogue",
      },
      {
        hook: "Data Point",
        template: (topic: string) =>
          `Interesting perspective on ${topic}. Research suggests that 80% of success in this area comes from execution consistency rather than strategy novelty. The remaining 20% is timing and distribution. Your point about psychology resonates - it's the foundation everything else builds on.`,
        reasoning: "Backs up agreement with data, positions you as informed",
      },
      {
        hook: "Expert Insight",
        template: (topic: string) =>
          `This is exactly right. Having worked in ${topic} for years, I've seen this pattern repeatedly. The counterintuitive part is that simplicity scales better than complexity. Most overcomplicate because it feels like more effort = more results. It doesn't.`,
        reasoning: "Establishes expertise while providing contrarian but agreeable insight",
      },
    ],
    casual: [
      {
        hook: "Relatable Take",
        template: (topic: string) =>
          `Oh man, this hits different. I was literally just thinking about this yesterday. The ${topic} space moves so fast but the fundamentals stay the same. Thanks for putting it into words better than I could 🙏`,
        reasoning: "Creates connection through shared experience and genuine appreciation",
      },
      {
        hook: "Personal Story",
        template: (topic: string) =>
          `Real talk - I tried ignoring this advice for months and it cost me. Finally started applying it to my ${topic} work and the difference was night and day. Sometimes the obvious answer is obvious for a reason lol`,
        reasoning: "Vulnerability + humor creates authenticity and relatability",
      },
      {
        hook: "Quick Thought",
        template: (topic: string) =>
          `This is the kind of ${topic} content I follow people for. Not the recycled tips, but actual insight from someone who's done it. Bookmarking this one 📌`,
        reasoning: "Direct compliment that feels genuine, not sycophantic",
      },
    ],
    witty: [
      {
        hook: "Pattern Break",
        template: (topic: string) =>
          `Plot twist: what if the real ${topic} strategy was the friends we made along the way? But seriously, this is the kind of insight that separates the "I read about it" crowd from the "I've done it" crowd. Taking notes.`,
        reasoning: "Humor hook followed by genuine value recognition - memorable",
      },
      {
        hook: "Clever Angle",
        template: (topic: string) =>
          `Me reading this: *pretends to be shocked* Also me: *has been doing the opposite for 6 months* The ${topic} gods have spoken and I have been humbled. Time to actually implement instead of just nodding along.`,
        reasoning: "Self-deprecating humor that's relatable, shows you're paying attention",
      },
      {
        hook: "Unexpected Take",
        template: (topic: string) =>
          `I'm convinced ${topic} Twitter is just the same 5 insights being rediscovered every 3 months. But THIS is actually a fresh take. Rare. Appreciated. Screenshot taken before it gets turned into a LinkedIn carousel.`,
        reasoning: "Meta-commentary that flatters while being genuinely funny",
      },
    ],
  }

  const strategies = replyStrategies[tone]
  const topic = analysis.topic

  return strategies.map((strategy, index) => ({
    id: `reply-${tone}-${index + 1}`,
    tone,
    content: strategy.template(topic),
    hook: strategy.hook,
    reasoning: strategy.reasoning,
    estimatedPerformance: {
      engagementLikelihood: calculateEngagementLikelihood(analysis, isLargeAccount, tone, index),
      authorReplyChance: calculateAuthorReplyChance(analysis, isLargeAccount, tone),
    },
  }))
}

function calculateEngagementLikelihood(
  analysis: ReturnType<typeof analyzeTweet>,
  isLargeAccount: boolean,
  tone: string,
  strategyIndex: number
): number {
  let base = 65
  
  if (isLargeAccount) base += 10
  if (analysis.isQuestion) base += 5
  if (analysis.hasData) base += 3
  if (tone === "witty") base += 5
  if (strategyIndex === 0) base += 5 // First strategy usually best
  
  // Add some variance
  return Math.min(95, base + Math.floor(Math.random() * 10))
}

function calculateAuthorReplyChance(
  analysis: ReturnType<typeof analyzeTweet>,
  isLargeAccount: boolean,
  tone: string
): number {
  let base = 20
  
  if (!isLargeAccount) base += 15 // Smaller accounts more likely to reply
  if (analysis.isQuestion) base += 10
  if (analysis.isOpinion) base += 5
  if (tone === "professional") base += 5
  
  return Math.min(60, base + Math.floor(Math.random() * 10))
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateReplyRequest = await request.json()
    const { tweetContent, authorName, authorUsername, authorFollowers, tone } = body

    if (!tweetContent || !authorName || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Analyze the tweet
    const analysis = analyzeTweet(tweetContent)

    // Generate replies
    const replies = generateRepliesForTone(analysis, authorName, authorFollowers, tone)

    // In production, you would:
    // 1. Call OpenAI/Claude API with proper prompts
    // 2. Include user's historical wins for style matching
    // 3. Use embeddings to find similar successful replies
    // 4. Apply user's voice profile

    return NextResponse.json({
      replies,
      analysis: {
        topic: analysis.topic,
        sentiment: analysis.sentiment,
        isQuestion: analysis.isQuestion,
      },
    })
  } catch (error) {
    console.error("Error generating replies:", error)
    return NextResponse.json(
      { error: "Failed to generate replies" },
      { status: 500 }
    )
  }
}
