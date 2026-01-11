import { NextResponse } from "next/server"
import { createRouteClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createRouteClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    const { data: opportunities, error } = await supabase
      .from('candidate_tweets')
      .select(`
        *,
        scores (
          *
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error

    const formattedOpportunities = (opportunities || [])
      .filter((opp: any) => opp.scores && opp.scores.length > 0)
      .map((opp: any) => {
        const latestScore = opp.scores.sort((a: any, b: any) => 
          new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
        )[0]
        
        return {
          id: opp.id,
          tweetId: opp.tweet_id,
          authorName: opp.author_name,
          authorUsername: opp.author_username,
          authorFollowers: opp.author_followers,
          authorImage: opp.author_image,
          content: opp.content,
          timestamp: opp.created_at,
          score: latestScore.final_score,
          velocityScore: latestScore.velocity_score,
          saturationScore: latestScore.saturation_score,
          velocityRaw: latestScore.velocity_raw,
          saturationRaw: latestScore.saturation_raw,
        }
      })
      .sort((a: any, b: any) => b.score - a.score)

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
    const supabase = await createRouteClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tweetId } = body

    const { data: existingTweet } = await supabase
      .from('candidate_tweets')
      .select('id')
      .eq('tweet_id', tweetId)
      .single()

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
