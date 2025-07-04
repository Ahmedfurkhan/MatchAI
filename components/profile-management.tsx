"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Briefcase, Globe, Save, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useUser } from "@/lib/auth"

interface UserProfile {
  id: string
  full_name: string
  email: string
  bio: string
  company: string
  position: string
  industry: string
  location: string
  website_url: string
  linkedin_url: string
  twitter_url: string
  avatar_url: string
  interests: string[]
  skills: string[]
  goals: string[]
  experience_level: string
  availability_status: string
  timezone: string
  preferred_meeting_types: string[]
  ai_profile_summary: string
}

// Helper function to safely get initials from a name
const getInitials = (name?: string): string => {
  if (!name || typeof name !== "string") return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Mock profile data for when database is not available
const mockProfile: UserProfile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  full_name: "Demo User",
  email: "demo@example.com",
  bio: "Passionate about technology and innovation. Always looking to connect with like-minded professionals.",
  company: "Tech Innovations Inc.",
  position: "Senior Developer",
  industry: "Technology",
  location: "San Francisco, CA",
  website_url: "https://example.com",
  linkedin_url: "https://linkedin.com/in/demo",
  twitter_url: "https://twitter.com/demo",
  avatar_url: "/placeholder.svg?height=100&width=100",
  interests: ["AI", "Machine Learning", "Web Development"],
  skills: ["React", "TypeScript", "Node.js", "Python"],
  goals: ["Learn new technologies", "Build innovative products", "Mentor others"],
  experience_level: "Senior",
  availability_status: "Available",
  timezone: "America/Los_Angeles",
  preferred_meeting_types: ["Video Call", "Coffee Chat"],
  ai_profile_summary:
    "An experienced developer with a passion for cutting-edge technology and collaborative innovation.",
}

export function ProfileManagement() {
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  useEffect(() => {
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
      setLoading(false);
    }
    if (!authLoading) {
      loadProfile()
    }
  }, [authLoading, user])

  const loadProfile = async () => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (!error && data) {
          const loadedProfile = {
            id: data.id,
            full_name: data.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            email: data.email || user.email || "",
            bio: data.bio || "",
            company: data.company || "",
            position: data.position || "",
            industry: data.industry || "",
            location: data.location || "",
            website_url: data.website_url || "",
            linkedin_url: data.linkedin_url || "",
            twitter_url: data.twitter_url || "",
            avatar_url: data.avatar_url || user.user_metadata?.avatar_url || "",
            interests: data.interests || [],
            skills: data.skills || [],
            goals: data.goals || [],
            experience_level: data.experience_level || "",
            availability_status: data.availability_status || "Available",
            timezone: data.timezone || "",
            preferred_meeting_types: data.preferred_meeting_types || [],
            ai_profile_summary: data.ai_profile_summary || "",
          }
          setProfile(loadedProfile)
          localStorage.setItem('userProfile', JSON.stringify(loadedProfile))
        } else {
          // Use user data from auth if profile doesn't exist
          setProfile({
            ...mockProfile,
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Demo User",
            email: user.email || "demo@example.com",
            avatar_url: user.user_metadata?.avatar_url || mockProfile.avatar_url,
          })
        }
      } else {
        // Use mock data when Supabase is not configured
        setProfile(mockProfile)
      }
    } catch (error) {
      console.warn("Failed to load profile, using mock data:", error)
      setProfile(mockProfile)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      // Validate required fields
      if (!profile.full_name || !profile.email) {
        toast({
          title: "Error",
          description: "Full name and email are required.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }
      if (isSupabaseConfigured && supabase && user) {
        // Before upsert, check if the email is already used by another user
        const { data: existingUser, error: emailCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("email", profile.email)
          .neq("id", user.id)
          .single();

        if (existingUser) {
          toast({
            title: "Error",
            description: "This email is already used by another account.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        // Debug logging
        const upsertPayload = {
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          bio: profile.bio,
          company: profile.company,
          position: profile.position,
          industry: profile.industry,
          location: profile.location,
          website_url: profile.website_url,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url,
          avatar_url: profile.avatar_url,
          interests: profile.interests,
          skills: profile.skills,
          goals: profile.goals,
          experience_level: profile.experience_level,
          availability_status: profile.availability_status,
          timezone: profile.timezone,
          preferred_meeting_types: profile.preferred_meeting_types,
          ai_profile_summary: profile.ai_profile_summary,
          updated_at: new Date().toISOString(),
        }
        console.log("[DEBUG] user.id:", user.id)
        console.log("[DEBUG] upsert payload:", upsertPayload)

        const { data, error } = await supabase.from("users").upsert(upsertPayload)
        console.log("[DEBUG] Supabase upsert response:", { data, error })

        if (error) {
          // Log more details if available
          console.error("Supabase error:", error, error.message, error.details)
          throw error
        }

        // After successful save, reload profile to update UI everywhere
        await loadProfile();
        localStorage.setItem('userProfile', JSON.stringify(profile));

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        // Simulate saving for demo
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated (demo mode).",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const generateAISummary = async () => {
    setGeneratingAI(true)
    try {
      // Simulate AI generation for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const aiSummary = `${profile.full_name || "This professional"} is a ${profile.experience_level || "experienced"} ${profile.position || "professional"} at ${profile.company || "their current company"}, specializing in ${profile.industry || "their field"}. With expertise in ${profile.skills?.slice(0, 3).join(", ") || "various technologies"}, they are passionate about ${profile.interests?.slice(0, 2).join(" and ") || "innovation and growth"}. Currently ${profile.availability_status?.toLowerCase() || "available"} for ${profile.preferred_meeting_types?.join(" and ") || "professional connections"}.`

      setProfile((prev) => ({
        ...prev,
        ai_profile_summary: aiSummary,
      }))

      toast({
        title: "AI Summary Generated",
        description: "Your AI profile summary has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating AI summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingAI(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addArrayItem = (field: "interests" | "skills" | "goals" | "preferred_meeting_types", value: string) => {
    if (value.trim() && !profile[field].includes(value.trim())) {
      updateProfile(field, [...profile[field], value.trim()])
    }
  }

  const removeArrayItem = (field: "interests" | "skills" | "goals" | "preferred_meeting_types", index: number) => {
    updateProfile(
      field,
      profile[field].filter((_, i) => i !== index),
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
            <p className="text-gray-600 mt-2">Manage your professional profile and preferences</p>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={profile.avatar_url || ""}
                  onChange={(e) => updateProfile("avatar_url", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => updateProfile("full_name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>Your work and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company || ""}
                  onChange={(e) => updateProfile("company", e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profile.position || ""}
                  onChange={(e) => updateProfile("position", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={profile.industry || ""} onValueChange={(value) => updateProfile("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={profile.experience_level || ""}
                  onValueChange={(value) => updateProfile("experience_level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry">Entry Level</SelectItem>
                    <SelectItem value="Mid">Mid Level</SelectItem>
                    <SelectItem value="Senior">Senior Level</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location || ""}
                onChange={(e) => updateProfile("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills and Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
            <CardDescription>Add your skills, interests, and professional goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profile.skills?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeArrayItem("skills", index)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a skill and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("skills", e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>

            {/* Interests */}
            <div>
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profile.interests?.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeArrayItem("interests", index)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add an interest and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("interests", e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>

            {/* Goals */}
            <div>
              <Label>Professional Goals</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profile.goals?.map((goal, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => removeArrayItem("goals", index)}
                  >
                    {goal} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a goal and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("goals", e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Profile Summary
            </CardTitle>
            <CardDescription>Let AI generate a professional summary based on your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={generateAISummary}
                disabled={generatingAI}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={profile.ai_profile_summary || ""}
              onChange={(e) => updateProfile("ai_profile_summary", e.target.value)}
              placeholder="Your AI-generated profile summary will appear here..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Contact & Social
            </CardTitle>
            <CardDescription>Your contact information and social media links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                value={profile.website_url || ""}
                onChange={(e) => updateProfile("website_url", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={(e) => updateProfile("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter</Label>
              <Input
                id="twitter_url"
                value={profile.twitter_url || ""}
                onChange={(e) => updateProfile("twitter_url", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Preferences</CardTitle>
            <CardDescription>Set your availability and meeting preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availability_status">Availability Status</Label>
                <Select
                  value={profile.availability_status || ""}
                  onValueChange={(value) => updateProfile("availability_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={profile.timezone || ""}
                  onChange={(e) => updateProfile("timezone", e.target.value)}
                  placeholder="America/Los_Angeles"
                />
              </div>
            </div>

            <div>
              <Label>Preferred Meeting Types</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profile.preferred_meeting_types?.map((type, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeArrayItem("preferred_meeting_types", index)}
                  >
                    {type} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a meeting type and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addArrayItem("preferred_meeting_types", e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
