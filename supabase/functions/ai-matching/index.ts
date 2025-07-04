import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    const { userId, eventId } = await req.json()

    // Get user profile
    const { data: user, error: userError } = await supabaseClient.from("users").select("*").eq("id", userId).single()

    if (userError) throw userError

    // Get potential matches from the same event
    const { data: potentialMatches, error: matchError } = await supabaseClient
      .from("event_participants")
      .select(`
        user_id,
        users (*)
      `)
      .eq("event_id", eventId)
      .neq("user_id", userId)

    if (matchError) throw matchError

    // Calculate compatibility scores using AI
    const matches = []
    for (const participant of potentialMatches) {
      const compatibilityScore = calculateCompatibility(user, participant.users)

      if (compatibilityScore > 60) {
        matches.push({
          user1_id: userId,
          user2_id: participant.user_id,
          event_id: eventId,
          match_score: compatibilityScore,
          compatibility_factors: {
            shared_interests: findSharedInterests(user.interests, participant.users.interests),
            complementary_skills: findComplementarySkills(user.skills, participant.users.skills),
            goal_alignment: calculateGoalAlignment(user.goals, participant.users.goals),
          },
          ai_explanation: generateMatchExplanation(user, participant.users, compatibilityScore),
          status: "active",
        })
      }
    }

    // Insert matches into database
    const { data: insertedMatches, error: insertError } = await supabaseClient
      .from("matches")
      .upsert(matches, { onConflict: "user1_id,user2_id,event_id" })
      .select()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ matches: insertedMatches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})

function calculateCompatibility(user1: any, user2: any): number {
  let score = 0

  // Shared interests (30% weight)
  const sharedInterests = findSharedInterests(user1.interests || [], user2.interests || [])
  score += (sharedInterests.length / Math.max(user1.interests?.length || 1, 1)) * 30

  // Complementary skills (25% weight)
  const complementarySkills = findComplementarySkills(user1.skills || [], user2.skills || [])
  score += (complementarySkills.length / Math.max(user1.skills?.length || 1, 1)) * 25

  // Goal alignment (25% weight)
  score += calculateGoalAlignment(user1.goals || [], user2.goals || []) * 25

  // Industry/experience compatibility (20% weight)
  if (user1.industry === user2.industry) score += 10
  if (Math.abs(getExperienceLevel(user1.experience_level) - getExperienceLevel(user2.experience_level)) <= 1) {
    score += 10
  }

  return Math.min(Math.round(score), 100)
}

function findSharedInterests(interests1: string[], interests2: string[]): string[] {
  return interests1.filter((interest) => interests2.includes(interest))
}

function findComplementarySkills(skills1: string[], skills2: string[]): string[] {
  return skills1.filter((skill) => !skills2.includes(skill))
}

function calculateGoalAlignment(goals1: string[], goals2: string[]): number {
  const sharedGoals = goals1.filter((goal) => goals2.includes(goal))
  return sharedGoals.length / Math.max(goals1.length, goals2.length, 1)
}

function getExperienceLevel(level: string): number {
  const levels = { entry: 1, intermediate: 2, senior: 3, expert: 4 }
  return levels[level as keyof typeof levels] || 2
}

function generateMatchExplanation(user1: any, user2: any, score: number): string {
  const sharedInterests = findSharedInterests(user1.interests || [], user2.interests || [])
  const complementarySkills = findComplementarySkills(user1.skills || [], user2.skills || [])

  let explanation = `${score}% compatibility based on `

  if (sharedInterests.length > 0) {
    explanation += `shared interests in ${sharedInterests.slice(0, 2).join(" and ")}`
  }

  if (complementarySkills.length > 0) {
    explanation += sharedInterests.length > 0 ? " and " : ""
    explanation += `complementary skills in ${complementarySkills.slice(0, 2).join(" and ")}`
  }

  explanation += ". Great potential for mutual learning and collaboration."

  return explanation
}
