"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Heart, X, Sparkles, Users, Target, Lightbulb } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { geminiService } from "@/lib/gemini-ai"
import { useAuth } from "@/lib/auth"

interface Match {
  id: string
  user1_id: string
  user2_id: string
  match_score: number
  compatibility_factors: any
  ai_explanation: string
  status: string
  is_mock?: boolean // Add flag to identify mock data
  user: {
    id: string
    full_name: string
    avatar_url: string
    bio: string
    company: string
    position: string
    industry: string
    interests: string[]
    skills: string[]
    goals: string[]
    ai_profile_summary: string
  }
}

// Mock matches for demo
const mockMatches: Match[] = [
  {
    id: "match-1",
    user1_id: "550e8400-e29b-41d4-a716-446655440000",
    user2_id: "user-2",
    match_score: 94,
    compatibility_factors: {
      shared_interests: ["AI", "Technology", "Innovation"],
      complementary_skills: ["Research", "Product Development"],
      goal_alignment: 0.9,
    },
    ai_explanation:
      "Excellent compatibility based on shared passion for AI innovation and complementary technical/research skills.",
    status: "active",
    is_mock: true,
    user: {
      id: "user-2",
      full_name: "Sarah Chen",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Passionate software engineer with 5 years of experience in AI/ML. Love building products that make a difference.",
      company: "TechCorp",
      position: "Senior Software Engineer",
      industry: "Technology",
      interests: ["AI/ML", "Product Development", "Startups", "Mentoring"],
      skills: ["Python", "React", "Machine Learning", "System Design"],
      goals: ["Learn about AI ethics", "Find co-founder", "Expand network"],
      ai_profile_summary:
        "Experienced engineer passionate about AI applications with strong technical leadership skills.",
    },
  },
  {
    id: "match-2",
    user1_id: "550e8400-e29b-41d4-a716-446655440000",
    user2_id: "user-3",
    match_score: 87,
    compatibility_factors: {
      shared_interests: ["Entrepreneurship", "Leadership"],
      complementary_skills: ["Business Strategy", "Technical Implementation"],
      goal_alignment: 0.8,
    },
    ai_explanation: "Strong match based on entrepreneurial mindset and complementary business/technical skills.",
    status: "active",
    is_mock: true,
    user: {
      id: "user-3",
      full_name: "Marcus Johnson",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Fintech entrepreneur and investor. Previously founded two successful startups. Now focusing on sustainable finance.",
      company: "FinTech Innovations",
      position: "Co-Founder & CEO",
      industry: "Finance",
      interests: ["Fintech", "Sustainability", "Investing", "Leadership"],
      skills: ["Business Strategy", "Fundraising", "Team Building", "Financial Modeling"],
      goals: ["Scale current startup", "Find technical co-founder", "Impact investing"],
      ai_profile_summary: "Serial entrepreneur with deep fintech expertise and strong network in sustainable finance.",
    },
  },
]

export function AIMatching() {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationStarters, setConversationStarters] = useState<string[]>([])
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      loadMatches()
    }
  }, [authLoading])

  useEffect(() => {
    if (matches.length > 0 && currentMatchIndex < matches.length) {
      loadConversationStarters(matches[currentMatchIndex])
    }
  }, [matches, currentMatchIndex])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          user:users!matches_user2_id_fkey(*)
        `)
        .eq("status", "active")
        .eq("user1_id", user?.id)
        .order("match_score", { ascending: false })

      if (data && data.length > 0) {
        setMatches(data)
        setUsingMockData(false)
      } else {
        // Fallback to mock data for demo
        console.log("No database matches found, using mock data")
        setMatches(mockMatches)
        setUsingMockData(true)
      }
    } catch (error) {
      console.error("Error loading matches:", error)
      // Fallback to mock data
      setMatches(mockMatches)
      setUsingMockData(true)
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversationStarters = async (match: Match) => {
    try {
      if (user && match.user) {
        const sharedInterests = user.interests?.filter((interest) => match.user.interests?.includes(interest)) || []

        const starters = await geminiService.suggestConversationStarters(user, match.user, sharedInterests)
        setConversationStarters(starters)
      }
    } catch (error) {
      console.error("Error loading conversation starters:", error)
      // Always provide fallback conversation starters
      setConversationStarters([
        `Hi ${match.user.full_name}! I'd love to connect and learn more about your work at ${match.user.company || "your company"}.`,
        `Great to match with you! I think we have some interesting areas of overlap in ${match.user.industry || "our field"}.`,
        `Hi there! Our profiles seem to complement each other well. Would you be open to a brief chat about our shared interests?`,
      ])
    }
  }

  const handleMatchResponse = async (matchId: string, response: "accepted" | "declined") => {
    if (!user) return

    setIsProcessing(true)
    try {
      const currentMatch = matches[currentMatchIndex]
      
      // Handle mock data differently from real database data
      if (usingMockData || currentMatch.is_mock) {
        console.log(`Mock match ${response}: ${currentMatch.user.full_name}`)
        
        // For mock data, just simulate the response
        if (response === "accepted") {
          // Show success message for demo
          alert(`Great! You've connected with ${currentMatch.user.full_name}. In a real app, this would create a conversation and send your first message.`)
        } else {
          console.log(`Passed on ${currentMatch.user.full_name}`)
        }
        
        // Move to next match
        setCurrentMatchIndex((prev) => prev + 1)
        return
      }

      // Real database operations for actual matches
      const { error } = await supabase
        .from("matches")
        .update({
          user1_response: response,
          status: response === "accepted" ? "accepted" : "declined",
        })
        .eq("id", matchId)

      if (error) {
        console.error("Database update error:", error)
        throw error
      }

      if (response === "accepted") {
        // Create conversation
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            match_id: matchId,
            type: "match_chat",
            title: `Chat with ${matches[currentMatchIndex].user.full_name}`,
            is_active: true,
          })
          .select()
          .single()

        if (convError) {
          console.error("Conversation creation error:", convError)
          throw convError
        }

        // Send initial message with conversation starter
        if (conversation && conversationStarters.length > 0) {
          const { error: messageError } = await supabase.from("messages").insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: conversationStarters[0],
            message_type: "text",
          })

          if (messageError) {
            console.error("Message creation error:", messageError)
            // Don't throw here as the main match was successful
          }
        }

        alert(`Connected with ${currentMatch.user.full_name}! Check your conversations to start chatting.`)
      }

      // Move to next match
      setCurrentMatchIndex((prev) => prev + 1)
    } catch (error) {
      console.error("Error responding to match:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const scheduleIntroMeeting = async (matchId: string) => {
    if (!user) return

    // Handle mock data
    if (usingMockData) {
      alert("Meeting scheduling is not available in demo mode. This feature works with real database connections.")
      return
    }

    try {
      const { data: conversation } = await supabase.from("conversations").select("id").eq("match_id", matchId).single()

      if (conversation) {
        const { error } = await supabase.from("meetings").insert({
          conversation_id: conversation.id,
          organizer_id: user.id,
          title: `Introduction Meeting with ${matches[currentMatchIndex].user.full_name}`,
          description: "Getting to know each other and exploring potential collaboration",
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration_minutes: 30,
          meeting_type: "video",
          status: "scheduled",
        })

        if (error) throw error
        alert("Meeting scheduled successfully!")
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      alert("Failed to schedule meeting. Please try again.")
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <div className="py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600">Complete your profile to get AI-powered matches!</p>
        </div>
      </div>
    )
  }

  if (currentMatchIndex >= matches.length) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <div className="py-12">
          <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">Check back later for new matches.</p>
          <Button
            onClick={() => {
              setCurrentMatchIndex(0)
              loadMatches()
            }}
            className="mt-4"
          >
            Refresh Matches
          </Button>
        </div>
      </div>
    )
  }

  const currentMatch = matches[currentMatchIndex]

  return (
    <div className="max-w-md mx-auto p-4 pb-20 md:pb-4">
      {/* Demo Mode Indicator */}
      {usingMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            You're viewing sample matches. Connect your database to see real matches.
          </p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Match {currentMatchIndex + 1} of {matches.length}
          </span>
          <span>{Math.round(currentMatch.match_score)}% compatible</span>
        </div>
        <Progress value={(currentMatchIndex / matches.length) * 100} className="h-2" />
      </div>

      {/* Match Card */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={currentMatch.user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">
              {currentMatch.user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">{currentMatch.user.full_name}</CardTitle>
          <p className="text-gray-600">
            {currentMatch.user.position} at {currentMatch.user.company}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Match Score */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              <Target className="h-4 w-4" />
              <span className="font-medium">{Math.round(currentMatch.match_score)}% Match</span>
            </div>
          </div>

          {/* Bio */}
          {currentMatch.user.bio && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 text-sm">{currentMatch.user.bio}</p>
            </div>
          )}

          {/* AI Summary */}
          {currentMatch.user.ai_profile_summary && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">AI Insight</span>
              </div>
              <p className="text-purple-700 text-sm">{currentMatch.user.ai_profile_summary}</p>
            </div>
          )}

          {/* Interests */}
          {currentMatch.user.interests && currentMatch.user.interests.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-1">
                {currentMatch.user.interests.slice(0, 6).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {currentMatch.user.skills && currentMatch.user.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {currentMatch.user.skills.slice(0, 6).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {currentMatch.ai_explanation && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Why you match</span>
              </div>
              <p className="text-blue-700 text-sm">{currentMatch.ai_explanation}</p>
            </div>
          )}

          {/* Conversation Starters */}
          {conversationStarters.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Conversation Starters</h4>
              <div className="space-y-2">
                {conversationStarters.slice(0, 2).map((starter, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm text-gray-700">
                    "{starter}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleMatchResponse(currentMatch.id, "declined")}
          disabled={isProcessing}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-5 w-5 mr-2" />
          Pass
        </Button>
        <Button
          size="lg"
          onClick={() => handleMatchResponse(currentMatch.id, "accepted")}
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Heart className="h-5 w-5 mr-2" />
          Accept
        </Button>
      </div>
    </div>
  )
}