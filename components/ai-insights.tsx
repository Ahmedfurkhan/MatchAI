"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Brain, Users, Target, Lightbulb, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { useUserProfile } from "@/lib/user-context"
import { isGoogleAIConfigured } from "@/lib/gemini-ai"

interface AIProfileSummary {
  summary: string
  key_strengths: string[]
  networking_value: string
  suggested_connections: string[]
}

interface AIInsightsProps {
  className?: string
}

export function AIInsights({ className }: AIInsightsProps) {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const [enhancedSummary, setEnhancedSummary] = useState<AIProfileSummary | null>(null)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && profile) {
      loadAIInsights()
    }
  }, [user, profile])

  const loadAIInsights = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/ai-profile?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setInsights(data.insights || [])
        setEnhancedSummary(data.enhancedSummary || null)
        setAiConfigured(data.aiConfigured || false)
        
        // Show fallback message if using fallback data
        if (data.fallback) {
          setError("Profile not found in database. Using fallback AI insights.")
          toast({
            title: "Info",
            description: "Using fallback AI insights",
          })
        }
      } else {
        console.error("Failed to load AI insights:", data.error)
        
        // Handle specific error cases
        if (data.error === "User not found") {
          setError("Profile not found in database. Please complete your profile first.")
          // Generate fallback insights using profile data
          generateFallbackInsights()
        } else {
          setError("Failed to load AI insights. Using fallback data.")
          generateFallbackInsights()
        }
        
        toast({
          title: "Warning",
          description: "Using fallback AI insights",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading AI insights:", error)
      setError("Network error. Using fallback data.")
      generateFallbackInsights()
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackInsights = () => {
    if (!profile) return

    // Create fallback enhanced summary
    const fallbackSummary: AIProfileSummary = {
      summary: `${profile.experience_level || "Professional"} in ${profile.industry || "their field"} with expertise in ${profile.skills?.slice(0, 2).join(", ") || "various skills"}.`,
      key_strengths: profile.skills?.slice(0, 3) || ["Professional expertise"],
      networking_value: `Brings ${profile.experience_level || "professional"} experience in ${profile.industry || "their field"}.`,
      suggested_connections: [
        `Other ${profile.industry || "industry"} professionals`,
        `People interested in ${profile.interests?.[0] || "professional development"}`,
        `Mentors or mentees in ${profile.skills?.[0] || "their field"}`
      ]
    }

    // Create fallback insights
    const fallbackInsights = [
      profile.skills?.length > 0 
        ? `Focus on connecting with professionals who can help you develop your ${profile.skills[0]} skills further.`
        : "Attend industry-specific events to expand your professional network.",
      profile.interests?.length > 0
        ? `Seek out networking events and groups focused on ${profile.interests[0]} to meet like-minded professionals.`
        : "Join professional groups and communities to build meaningful connections.",
      "Look for mentors or peers who can help you achieve your professional goals."
    ]

    setEnhancedSummary(fallbackSummary)
    setInsights(fallbackInsights)
    setAiConfigured(false) // Force fallback mode
  }

  const generateNewInsights = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "generate_insights",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setInsights(data.result || [])
        setError(null)
        toast({
          title: "Success",
          description: "New AI insights generated!",
        })
      } else {
        // Generate fallback insights if API fails
        generateFallbackInsights()
        toast({
          title: "Warning",
          description: "Generated fallback insights",
        })
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      generateFallbackInsights()
      toast({
        title: "Error",
        description: "Generated fallback insights",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Message */}
      {error && (
        <Card className="border-0 shadow-lg border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Using fallback algorithms for AI features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Assistant Status
          </CardTitle>
          <CardDescription>Current AI configuration and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {aiConfigured ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">Google Gemini AI Active</span>
                <Badge variant="secondary" className="ml-auto">Enhanced AI</Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-600 font-medium">Using Fallback Algorithms</span>
                <Badge variant="outline" className="ml-auto">Basic AI</Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {aiConfigured
              ? "Advanced AI features are available for profile analysis and matching."
              : "Set up Google AI API key to enable advanced AI features."}
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Profile Summary */}
      {enhancedSummary && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Profile Analysis
            </CardTitle>
            <CardDescription>AI-generated insights about your professional profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Professional Summary</h4>
              <p className="text-sm text-muted-foreground">{enhancedSummary.summary}</p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Key Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {enhancedSummary.key_strengths.map((strength, index) => (
                  <Badge key={index} variant="secondary">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Networking Value</h4>
              <p className="text-sm text-muted-foreground">{enhancedSummary.networking_value}</p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Suggested Connections</h4>
              <div className="space-y-2">
                {enhancedSummary.suggested_connections.map((connection, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{connection}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Networking Insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Networking Insights
              </CardTitle>
              <CardDescription>AI-powered recommendations for your networking strategy</CardDescription>
            </div>
            <Button
              onClick={generateNewInsights}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
                >
                  <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{insight}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No insights available</p>
              <Button
                onClick={generateNewInsights}
                disabled={loading}
                className="mt-4"
                size="sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Configuration Help */}
      {!aiConfigured && (
        <Card className="border-0 shadow-lg border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5" />
              Enable Advanced AI Features
            </CardTitle>
            <CardDescription className="text-yellow-600 dark:text-yellow-400">
              Get enhanced AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                To enable advanced AI features:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Get a Google AI API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                <li>Add it to your environment variables as <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">GOOGLE_AI_API_KEY</code></li>
                <li>Restart your development server</li>
              </ol>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3">
                Current features work with fallback algorithms, but advanced AI will provide better insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 