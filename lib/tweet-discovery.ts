import { prisma } from "./prisma"
import { scoringEngine } from "./scoring-engine"

export interface TweetData {
  tweetId: string
  authorId: string
  authorUsername: string
  authorName: string
  authorFollowers: number
  authorImage?: string
  content: string
  likes: number
  retweets: number
  replies: number
  createdAt: Date
}

export class TweetDiscoveryService {
  async discoverFromTargetAccounts(userId: string): Promise<TweetData[]> {
    const targets = await prisma.target.findMany({
      where: {
        userId,
        type: "ACCOUNT",
        isActive: true,
      },
    })

    return []
  }

  async discoverFromKeywords(userId: string): Promise<TweetData[]> {
    const targets = await prisma.target.findMany({
      where: {
        userId,
        type: "KEYWORD",
        isActive: true,
      },
    })

    return []
  }

  async discoverFromLists(userId: string): Promise<TweetData[]> {
    const targets = await prisma.target.findMany({
      where: {
        userId,
        type: "LIST",
        isActive: true,
      },
    })

    return []
  }

  async scoreAndStoreTweet(tweetData: TweetData, userId: string): Promise<void> {
    const candidateTweet = await prisma.candidateTweet.upsert({
      where: { tweetId: tweetData.tweetId },
      update: {
        fetchedAt: new Date(),
      },
      create: {
        tweetId: tweetData.tweetId,
        authorId: tweetData.authorId,
        authorUsername: tweetData.authorUsername,
        authorName: tweetData.authorName,
        authorFollowers: tweetData.authorFollowers,
        authorImage: tweetData.authorImage,
        content: tweetData.content,
        createdAt: tweetData.createdAt,
      },
    })

    const velocityScore = scoringEngine.calculateVelocityScore({
      likes: tweetData.likes,
      retweets: tweetData.retweets,
      replies: tweetData.replies,
      createdAt: tweetData.createdAt,
      authorFollowers: tweetData.authorFollowers,
    })

    const saturationScore = scoringEngine.calculateSaturationScore({
      replies: tweetData.replies,
      replyGrowthRate: 0.5,
    })

    const authorFatigueScore = scoringEngine.calculateAuthorFatigueScore({
      tweetsLast24h: 10,
      repliesLast1h: 2,
      avgThreadEngagement: 65,
    })

    const audienceOverlapScore = scoringEngine.calculateAudienceOverlapScore({
      topicSimilarity: 75,
      keywordMatches: 3,
      historicalConversion: 60,
    })

    const replyFitScore = scoringEngine.calculateReplyFitScore({
      avgPerformance: 70,
      styleMatch: 80,
      topicSuccessRate: 65,
    })

    const opportunityScore = scoringEngine.calculateFinalScore(
      velocityScore,
      saturationScore,
      authorFatigueScore,
      audienceOverlapScore,
      replyFitScore
    )

    await prisma.score.create({
      data: {
        candidateTweetId: candidateTweet.id,
        velocityScore: velocityScore.score,
        velocityRaw: velocityScore,
        saturationScore: saturationScore.score,
        saturationRaw: saturationScore,
        authorFatigueScore: authorFatigueScore.score,
        authorFatigueRaw: authorFatigueScore,
        audienceOverlapScore: audienceOverlapScore.score,
        audienceOverlapRaw: audienceOverlapScore,
        replyFitScore: replyFitScore.score,
        replyFitRaw: replyFitScore,
        finalScore: opportunityScore.finalScore,
      },
    })

    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    })

    if (!userPreferences) return

    const todayAlerts = await prisma.alert.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })

    if (
      todayAlerts < userPreferences.maxAlertsPerDay &&
      opportunityScore.finalScore >= 75
    ) {
      await prisma.alert.create({
        data: {
          userId,
          candidateTweetId: candidateTweet.id,
          score: opportunityScore.finalScore,
          reason: opportunityScore.explanation,
        },
      })
    }
  }

  async runDiscovery(userId: string): Promise<void> {
    const [targetAccountTweets, keywordTweets, listTweets] = await Promise.all([
      this.discoverFromTargetAccounts(userId),
      this.discoverFromKeywords(userId),
      this.discoverFromLists(userId),
    ])

    const allTweets = [
      ...targetAccountTweets,
      ...keywordTweets,
      ...listTweets,
    ]

    for (const tweet of allTweets) {
      await this.scoreAndStoreTweet(tweet, userId)
    }
  }
}

export const tweetDiscoveryService = new TweetDiscoveryService()
