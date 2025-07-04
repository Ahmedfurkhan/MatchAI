import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { geminiService } from "@/lib/gemini-ai"

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId } = await request.json()

    // Get user profile
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    // Get potential matches from the same event
    const { data: potentialMatches, error: matchError } = await supabase
      .from("event_participants")
      .select(`
        user_id,
        users (*)
      `)
      .eq("event_id", eventId)
      .neq("user_id", userId)

    if (matchError) throw matchError

    // Generate AI-powered matches
    const matches = []
    for (const participant of potentialMatches) {
      try {
        const analysis = await geminiService.analyzeProfileCompatibility(user, participant.users)

        if (analysis.compatibility_score > 60) {
          matches.push({
            user1_id: userId,
            user2_id: participant.user_id,
            event_id: eventId,
            match_score: analysis.compatibility_score,
            compatibility_factors: {
              shared_interests: analysis.shared_interests,
              complementary_skills: analysis.complementary_skills,
              goal_alignment: analysis.goal_alignment,
            },
            ai_explanation: analysis.explanation,
            status: "active",
          })
        }
      } catch (error) {
        console.error(`Error analyzing compatibility for user ${participant.user_id}:`, error)
        // Continue with next participant
      }
    }

    // Insert matches into database
    const { data: insertedMatches, error: insertError } = await supabase
      .from("matches")
      .upsert(matches, { onConflict: "user1_id,user2_id,event_id" })
      .select()

    if (insertError) throw insertError

    return NextResponse.json({ matches: insertedMatches })
  } catch (error) {
    console.error("AI matching error:", error)
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 })
  }
}
