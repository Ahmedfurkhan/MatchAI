import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import { geminiService } from "@/lib/gemini-ai"

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Convert user data to the format expected by Gemini service
    const userProfile = {
      id: user.id,
      full_name: user.full_name,
      bio: user.bio,
      company: user.company,
      position: user.position,
      industry: user.industry,
      interests: user.interests || [],
      skills: user.skills || [],
      goals: user.goals || [],
      experience_level: user.experience_level,
    }

    let result

    switch (action) {
      case "generate_summary":
        result = await geminiService.generateProfileSummary(userProfile)
        break

      case "generate_enhanced_summary":
        result = await geminiService.generateEnhancedProfileSummary(userProfile)
        break

      case "generate_insights":
        result = await geminiService.generateNetworkingInsights(userProfile)
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update user profile with AI-generated content if it's a summary
    if (action === "generate_summary" && typeof result === "string") {
      const { error: updateError } = await supabase
        .from("users")
        .update({ ai_profile_summary: result })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
      }
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("AI profile generation error:", error)
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      
      // Return fallback data instead of error
      const fallbackSummary = "Professional with expertise in various skills."
      const fallbackEnhancedSummary = {
        summary: "Professional with expertise in various skills.",
        key_strengths: ["Professional expertise", "Adaptability", "Communication"],
        networking_value: "Brings professional experience and diverse skills to networking opportunities.",
        suggested_connections: [
          "Industry professionals",
          "People interested in professional development",
          "Mentors or mentees in their field"
        ]
      }
      const fallbackInsights = [
        "Attend industry-specific events to expand your professional network.",
        "Join professional groups and communities to build meaningful connections.",
        "Look for mentors or peers who can help you achieve your professional goals."
      ]

      return NextResponse.json({
        summary: fallbackSummary,
        enhancedSummary: fallbackEnhancedSummary,
        insights: fallbackInsights,
        aiConfigured: false,
        fallback: true
      })
    }

    // Convert user data to the format expected by Gemini service
    const userProfile = {
      id: user.id,
      full_name: user.full_name,
      bio: user.bio,
      company: user.company,
      position: user.position,
      industry: user.industry,
      interests: user.interests || [],
      skills: user.skills || [],
      goals: user.goals || [],
      experience_level: user.experience_level,
    }

    // Generate all AI content
    const [summary, enhancedSummary, insights] = await Promise.all([
      geminiService.generateProfileSummary(userProfile),
      geminiService.generateEnhancedProfileSummary(userProfile),
      geminiService.generateNetworkingInsights(userProfile),
    ])

    return NextResponse.json({
      summary,
      enhancedSummary,
      insights,
      aiConfigured: geminiService.isGoogleAIConfigured,
      fallback: false
    })
  } catch (error) {
    console.error("AI profile analysis error:", error)
    
    // Return fallback data on error
    const fallbackSummary = "Professional with expertise in various skills."
    const fallbackEnhancedSummary = {
      summary: "Professional with expertise in various skills.",
      key_strengths: ["Professional expertise", "Adaptability", "Communication"],
      networking_value: "Brings professional experience and diverse skills to networking opportunities.",
      suggested_connections: [
        "Industry professionals",
        "People interested in professional development",
        "Mentors or mentees in their field"
      ]
    }
    const fallbackInsights = [
      "Attend industry-specific events to expand your professional network.",
      "Join professional groups and communities to build meaningful connections.",
      "Look for mentors or peers who can help you achieve your professional goals."
    ]

    return NextResponse.json({
      summary: fallbackSummary,
      enhancedSummary: fallbackEnhancedSummary,
      insights: fallbackInsights,
      aiConfigured: false,
      fallback: true
    })
  }
} 