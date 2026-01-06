import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    const opportunities = await prisma.candidateTweet.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        scores: {
          orderBy: {
            computedAt: "desc",
          },
          take: 1,
        },
      },
    })

    const formattedOpportunities = opportunities
      .filter((opp) => opp.scores.length > 0)
      .map((opp) => ({
        id: opp.id,
        tweetId: opp.tweetId,
        authorName: opp.authorName,
        authorUsername: opp.authorUsername,
        authorFollowers: opp.authorFollowers,
        authorImage: opp.authorImage,
        content: opp.content,
        timestamp: opp.createdAt,
        score: opp.scores[0].finalScore,
        velocityScore: opp.scores[0].velocityScore,
        saturationScore: opp.scores[0].saturationScore,
        velocityRaw: opp.scores[0].velocityRaw,
        saturationRaw: opp.scores[0].saturationRaw,
      }))
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ opportunities: formattedOpportunities })
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tweetId } = body

    const existingTweet = await prisma.candidateTweet.findUnique({
      where: { tweetId },
    })

    if (existingTweet) {
      return NextResponse.json(
        { error: "Tweet already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
