import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI with proper error handling
const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Flag to check if Google AI is configured
export const isGoogleAIConfigured = Boolean(apiKey && apiKey !== "demo-key" && apiKey !== "your_google_ai_api_key")

// Enhanced logging for debugging
if (!isGoogleAIConfigured) {
  console.warn("⚠️ Google AI API not configured. Using fallback algorithms.")
  console.info("To enable AI features, set GOOGLE_AI_API_KEY or NEXT_PUBLIC_GOOGLE_AI_API_KEY")
}

export interface UserProfile {
  id: string
  full_name: string
  bio: string | null
  company: string | null
  position: string | null
  industry: string | null
  interests: string[]
  skills: string[]
  goals: string[]
  experience_level: string
}

export interface MatchAnalysis {
  compatibility_score: number
  shared_interests: string[]
  complementary_skills: string[]
  goal_alignment: number
  explanation: string
  conversation_starters: string[]
}

export interface AIProfileSummary {
  summary: string
  key_strengths: string[]
  networking_value: string
  suggested_connections: string[]
}

export class GeminiMatchingService {
  private model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

  async analyzeProfileCompatibility(user1: UserProfile, user2: UserProfile): Promise<MatchAnalysis> {
    // If Google AI is not configured, use fallback analysis
    if (!this.model || !isGoogleAIConfigured) {
      console.warn("Google AI not configured, using fallback compatibility analysis")
      return this.generateFallbackAnalysis(user1, user2)
    }

    try {
      const prompt = `
        Analyze the compatibility between these two professional profiles for networking/mentorship matching:

        Profile 1:
        Name: ${user1.full_name}
        Bio: ${user1.bio || "No bio provided"}
        Company: ${user1.company || "Not specified"}
        Position: ${user1.position || "Not specified"}
        Industry: ${user1.industry || "Not specified"}
        Interests: ${user1.interests.join(", ")}
        Skills: ${user1.skills.join(", ")}
        Goals: ${user1.goals.join(", ")}
        Experience: ${user1.experience_level}

        Profile 2:
        Name: ${user2.full_name}
        Bio: ${user2.bio || "No bio provided"}
        Company: ${user2.company || "Not specified"}
        Position: ${user2.position || "Not specified"}
        Industry: ${user2.industry || "Not specified"}
        Interests: ${user2.interests.join(", ")}
        Skills: ${user2.skills.join(", ")}
        Goals: ${user2.goals.join(", ")}
        Experience: ${user2.experience_level}

        Please provide a JSON response with:
        1. compatibility_score (0-100)
        2. shared_interests (array of common interests)
        3. complementary_skills (array of skills that complement each other)
        4. goal_alignment (0-1 score of how well their goals align)
        5. explanation (2-3 sentence explanation of why they're compatible)
        6. conversation_starters (array of 3 conversation starter suggestions)

        Focus on professional networking value, mentorship opportunities, and mutual benefit.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response with better error handling
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0])
          return {
            compatibility_score: analysis.compatibility_score || 0,
            shared_interests: analysis.shared_interests || [],
            complementary_skills: analysis.complementary_skills || [],
            goal_alignment: analysis.goal_alignment || 0,
            explanation: analysis.explanation || "Compatibility analysis unavailable",
            conversation_starters: analysis.conversation_starters || [],
          }
        } catch (parseError) {
          console.error("JSON parsing failed for compatibility analysis:", parseError)
          return this.generateFallbackAnalysis(user1, user2)
        }
      }

      // Fallback if JSON parsing fails
      return this.generateFallbackAnalysis(user1, user2)
    } catch (error) {
      console.error("Gemini AI analysis failed:", error)
      return this.generateFallbackAnalysis(user1, user2)
    }
  }

  async generateProfileSummary(user: UserProfile): Promise<string> {
    // If Google AI is not configured, use fallback summary
    if (!this.model || !isGoogleAIConfigured) {
      console.warn("Google AI not configured, using fallback profile summary")
      return this.generateFallbackSummary(user)
    }

    try {
      const prompt = `
        Create a concise, professional AI-generated summary for this user profile:

        Name: ${user.full_name}
        Bio: ${user.bio || "No bio provided"}
        Company: ${user.company || "Not specified"}
        Position: ${user.position || "Not specified"}
        Industry: ${user.industry || "Not specified"}
        Interests: ${user.interests.join(", ")}
        Skills: ${user.skills.join(", ")}
        Goals: ${user.goals.join(", ")}
        Experience: ${user.experience_level}

        Generate a 1-2 sentence professional summary that highlights their key strengths, expertise, and what they bring to networking opportunities. Make it engaging and suitable for matching recommendations.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error("Profile summary generation failed:", error)
      return this.generateFallbackSummary(user)
    }
  }

  async generateEnhancedProfileSummary(user: UserProfile): Promise<AIProfileSummary> {
    // If Google AI is not configured, use fallback summary
    if (!this.model || !isGoogleAIConfigured) {
      console.warn("Google AI not configured, using fallback enhanced profile summary")
      return this.generateFallbackEnhancedSummary(user)
    }

    try {
      const prompt = `
        Create an enhanced professional profile analysis for this user:

        Name: ${user.full_name}
        Bio: ${user.bio || "No bio provided"}
        Company: ${user.company || "Not specified"}
        Position: ${user.position || "Not specified"}
        Industry: ${user.industry || "Not specified"}
        Interests: ${user.interests.join(", ")}
        Skills: ${user.skills.join(", ")}
        Goals: ${user.goals.join(", ")}
        Experience: ${user.experience_level}

        Please provide a JSON response with:
        1. summary (1-2 sentence professional summary)
        2. key_strengths (array of 3-4 key strengths)
        3. networking_value (1 sentence about what they bring to networking)
        4. suggested_connections (array of 3 types of people they should connect with)

        Focus on professional value and networking opportunities.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0])
          return {
            summary: analysis.summary || this.generateFallbackSummary(user),
            key_strengths: analysis.key_strengths || [],
            networking_value: analysis.networking_value || "Professional networking value",
            suggested_connections: analysis.suggested_connections || [],
          }
        } catch (parseError) {
          console.error("JSON parsing failed for enhanced summary:", parseError)
          return this.generateFallbackEnhancedSummary(user)
        }
      }

      return this.generateFallbackEnhancedSummary(user)
    } catch (error) {
      console.error("Enhanced profile summary generation failed:", error)
      return this.generateFallbackEnhancedSummary(user)
    }
  }

  async suggestConversationStarters(
    user1: UserProfile,
    user2: UserProfile,
    sharedInterests: string[],
  ): Promise<string[]> {
    // If Google AI is not configured, use fallback starters
    if (!this.model || !isGoogleAIConfigured) {
      console.warn("Google AI not configured, using fallback conversation starters")
      return this.generateFallbackConversationStarters(user1, user2, sharedInterests)
    }

    try {
      const prompt = `
        Generate exactly 3 conversation starters for two professionals who just matched. Return ONLY a valid JSON array with no additional text or formatting.

        Person 1: ${user1.full_name} - ${user1.position || "Professional"} at ${user1.company || "their company"}
        Person 2: ${user2.full_name} - ${user2.position || "Professional"} at ${user2.company || "their company"}
        
        Shared interests: ${sharedInterests.length > 0 ? sharedInterests.join(", ") : "Professional networking"}
        
        Requirements:
        - Professional but friendly tone
        - Reference shared interests or complementary expertise
        - Open-ended to encourage dialogue
        - Suitable for networking context
        - Each starter should be 15-25 words
        - No quotes within quotes - use single quotes if needed

        Return format: ["starter 1", "starter 2", "starter 3"]
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()

      // Clean the response text to remove any markdown formatting
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()

      // Try to parse as JSON array with better error handling
      try {
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3).map(starter => 
              typeof starter === 'string' ? starter.trim() : String(starter).trim()
            )
          }
        }
      } catch (parseError) {
        console.error("JSON parsing failed for conversation starters:", parseError)
        console.error("Raw response:", text)
        
        // Try to extract lines as fallback
        const lines = cleanText.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^["\-*\d.\s\[\]]+/, '').replace(/["]+$/, '').trim())
          .filter(line => line.length > 10) // Filter out short/empty lines
        
        if (lines.length >= 3) {
          return lines.slice(0, 3)
        }
      }

      // If all parsing fails, use fallback
      return this.generateFallbackConversationStarters(user1, user2, sharedInterests)
    } catch (error) {
      console.error("Conversation starter generation failed:", error)
      return this.generateFallbackConversationStarters(user1, user2, sharedInterests)
    }
  }

  async generateNetworkingInsights(user: UserProfile): Promise<string[]> {
    // If Google AI is not configured, use fallback insights
    if (!this.model || !isGoogleAIConfigured) {
      console.warn("Google AI not configured, using fallback networking insights")
      return this.generateFallbackNetworkingInsights(user)
    }

    try {
      const prompt = `
        Generate 3 networking insights for this professional:

        Name: ${user.full_name}
        Position: ${user.position || "Professional"}
        Company: ${user.company || "Not specified"}
        Industry: ${user.industry || "Not specified"}
        Skills: ${user.skills.join(", ")}
        Interests: ${user.interests.join(", ")}
        Goals: ${user.goals.join(", ")}

        Return exactly 3 insights as a JSON array. Each insight should be:
        - Actionable networking advice
        - Based on their profile
        - Professional and helpful
        - 1-2 sentences each

        Format: ["insight 1", "insight 2", "insight 3"]
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()

      // Parse JSON response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const insights = JSON.parse(jsonMatch[0])
          if (Array.isArray(insights) && insights.length > 0) {
            return insights.slice(0, 3).map(insight => 
              typeof insight === 'string' ? insight.trim() : String(insight).trim()
            )
          }
        } catch (parseError) {
          console.error("JSON parsing failed for networking insights:", parseError)
        }
      }

      return this.generateFallbackNetworkingInsights(user)
    } catch (error) {
      console.error("Networking insights generation failed:", error)
      return this.generateFallbackNetworkingInsights(user)
    }
  }

  private generateFallbackAnalysis(user1: UserProfile, user2: UserProfile): MatchAnalysis {
    const sharedInterests = user1.interests.filter((interest) => user2.interests.includes(interest))

    const complementarySkills = user1.skills.filter(
      (skill) =>
        !user2.skills.includes(skill) && user2.goals.some((goal) => goal.toLowerCase().includes(skill.toLowerCase())),
    )

    const compatibilityScore = Math.min(70 + sharedInterests.length * 5 + complementarySkills.length * 3, 95)

    return {
      compatibility_score: compatibilityScore,
      shared_interests: sharedInterests,
      complementary_skills: complementarySkills,
      goal_alignment: sharedInterests.length > 0 ? 0.8 : 0.6,
      explanation: `Good compatibility based on ${sharedInterests.length} shared interests and complementary professional backgrounds.`,
      conversation_starters: this.generateFallbackConversationStarters(user1, user2, sharedInterests),
    }
  }

  private generateFallbackSummary(user: UserProfile): string {
    const experience = user.experience_level || "professional"
    const industry = user.industry || "their field"
    const skills = user.skills.slice(0, 2).join(" and ") || "various skills"

    return `${experience.charAt(0).toUpperCase() + experience.slice(1)} professional in ${industry} with expertise in ${skills}.`
  }

  private generateFallbackEnhancedSummary(user: UserProfile): AIProfileSummary {
    const experience = user.experience_level || "professional"
    const industry = user.industry || "their field"
    const skills = user.skills.slice(0, 3) || ["various skills"]
    const interests = user.interests.slice(0, 2) || ["professional development"]

    return {
      summary: `${experience.charAt(0).toUpperCase() + experience.slice(1)} professional in ${industry} with expertise in ${skills.join(", ")}.`,
      key_strengths: skills.slice(0, 3),
      networking_value: `Brings ${experience} experience in ${industry} with strong ${skills[0] || "professional"} skills.`,
      suggested_connections: [
        `Other ${industry} professionals`,
        `People interested in ${interests[0] || "professional development"}`,
        `Mentors or mentees in ${skills[0] || "their field"}`
      ]
    }
  }

  private generateFallbackConversationStarters(
    user1: UserProfile,
    user2: UserProfile,
    sharedInterests: string[],
  ): string[] {
    const starters = []

    if (sharedInterests.length > 0) {
      starters.push(
        `Hi ${user2.full_name}! I noticed we both have an interest in ${sharedInterests[0]}. I'd love to learn more about your work at ${user2.company || "your company"}.`,
      )
    }

    if (user2.industry) {
      starters.push(
        `Great to connect! I see you're working in ${user2.industry}. I'd be interested to hear your perspective on current trends.`,
      )
    }

    if (user1.industry && user2.industry && user1.industry !== user2.industry) {
      starters.push(
        `Hi there! I work in ${user1.industry} and I'm curious about your experience in ${user2.industry}. Would love to exchange insights!`,
      )
    } else {
      starters.push(
        `Hi there! Our profiles seem to complement each other well. Would you be open to a brief chat about our shared interests?`,
      )
    }

    // Ensure we always return at least 3 starters
    while (starters.length < 3) {
      starters.push(
        `Hi ${user2.full_name}! I'd love to connect and learn more about your experience in ${user2.industry || "your field"}.`,
      )
    }

    return starters.slice(0, 3)
  }

  private generateFallbackNetworkingInsights(user: UserProfile): string[] {
    const insights = []

    if (user.skills.length > 0) {
      insights.push(
        `Focus on connecting with professionals who can help you develop your ${user.skills[0]} skills further.`
      )
    }

    if (user.interests.length > 0) {
      insights.push(
        `Seek out networking events and groups focused on ${user.interests[0]} to meet like-minded professionals.`
      )
    }

    if (user.goals.length > 0) {
      insights.push(
        `Look for mentors or peers who have achieved similar goals to ${user.goals[0].toLowerCase()}.`
      )
    }

    // Ensure we always return 3 insights
    while (insights.length < 3) {
      insights.push(
        `Attend industry-specific events to expand your professional network and discover new opportunities.`
      )
    }

    return insights.slice(0, 3)
  }
}

export const geminiService = new GeminiMatchingService()