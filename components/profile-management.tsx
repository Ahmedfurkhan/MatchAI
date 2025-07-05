"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Briefcase, Globe, Save, Loader2, Sparkles, Settings, Shield, Bell, Palette, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
  const [activeTab, setActiveTab] = useState("profile")

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
        }

        const { error } = await supabase.from("users").upsert(upsertPayload)

        if (error) {
          console.error("Error saving profile:", error)
          toast({
            title: "Error",
            description: "Failed to save profile. Please try again.",
            variant: "destructive",
          })
        } else {
          localStorage.setItem('userProfile', JSON.stringify(profile))
          toast({
            title: "Success",
            description: "Profile saved successfully!",
          })
        }
      } else {
        // Mock save for demo
        localStorage.setItem('userProfile', JSON.stringify(profile))
        toast({
          title: "Success",
          description: "Profile saved successfully!",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const generateAISummary = async () => {
    setGeneratingAI(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const summary = `Based on your profile as a ${profile.position} at ${profile.company} in the ${profile.industry} industry, with expertise in ${profile.skills.slice(0, 3).join(", ")}, you are a ${profile.experience_level.toLowerCase()} professional passionate about ${profile.interests.slice(0, 2).join(" and ")}. Your goals of ${profile.goals.slice(0, 2).join(" and ")} demonstrate your commitment to continuous growth and innovation.`
      
      updateProfile("ai_profile_summary", summary)
      toast({
        title: "AI Summary Generated",
        description: "Your professional summary has been updated!",
      })
    } catch (error) {
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
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: "interests" | "skills" | "goals" | "preferred_meeting_types", value: string) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: "interests" | "skills" | "goals" | "preferred_meeting_types", index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }))
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
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Settings & Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your account settings and professional profile</p>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-purple-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>Your personal profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-purple-100">
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="avatar_url" className="text-sm font-medium">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={profile.avatar_url || ""}
                      onChange={(e) => updateProfile("avatar_url", e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ""}
                      onChange={(e) => updateProfile("full_name", e.target.value)}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      onChange={(e) => updateProfile("email", e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Contact & Social
                </CardTitle>
                <CardDescription>Your contact information and social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website_url" className="text-sm font-medium">Website</Label>
                  <Input
                    id="website_url"
                    value={profile.website_url || ""}
                    onChange={(e) => updateProfile("website_url", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn</Label>
                    <Input
                      id="linkedin_url"
                      value={profile.linkedin_url || ""}
                      onChange={(e) => updateProfile("linkedin_url", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter_url" className="text-sm font-medium">Twitter</Label>
                    <Input
                      id="twitter_url"
                      value={profile.twitter_url || ""}
                      onChange={(e) => updateProfile("twitter_url", e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            {/* Professional Information */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your work and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                    <Input
                      id="company"
                      value={profile.company || ""}
                      onChange={(e) => updateProfile("company", e.target.value)}
                      placeholder="Acme Corp"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                    <Input
                      id="position"
                      value={profile.position || ""}
                      onChange={(e) => updateProfile("position", e.target.value)}
                      placeholder="Software Engineer"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                    <Select value={profile.industry || ""} onValueChange={(value) => updateProfile("industry", value)}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="experience_level" className="text-sm font-medium">Experience Level</Label>
                    <Select
                      value={profile.experience_level || ""}
                      onValueChange={(value) => updateProfile("experience_level", value)}
                    >
                      <SelectTrigger className="mt-1">
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
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    placeholder="San Francisco, CA"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills and Interests */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
              <CardHeader>
                <CardTitle className="text-xl">Skills & Interests</CardTitle>
                <CardDescription>Add your skills, interests, and professional goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills */}
                <div>
                  <Label className="text-sm font-medium">Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {profile.skills?.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 transition-colors"
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
                  <Label className="text-sm font-medium">Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {profile.interests?.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-red-100 transition-colors"
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
                  <Label className="text-sm font-medium">Professional Goals</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {profile.goals?.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="cursor-pointer hover:bg-red-100 transition-colors"
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-purple-600" />
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
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
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
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Meeting Preferences */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Meeting Preferences
                </CardTitle>
                <CardDescription>Set your availability and meeting preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability_status" className="text-sm font-medium">Availability Status</Label>
                    <Select
                      value={profile.availability_status || ""}
                      onValueChange={(value) => updateProfile("availability_status", value)}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profile.timezone || ""}
                      onChange={(e) => updateProfile("timezone", e.target.value)}
                      placeholder="America/Los_Angeles"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Preferred Meeting Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {profile.preferred_meeting_types?.map((type, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 transition-colors"
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

            {/* Notification Settings */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="h-5 w-5 text-green-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-gray-500">Receive push notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Meeting Reminders</Label>
                    <p className="text-xs text-gray-500">Get reminded about upcoming meetings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Match Suggestions</Label>
                    <p className="text-xs text-gray-500">Receive new match suggestions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Account Security */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-red-600" />
                  Account Security
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Login Notifications</Label>
                    <p className="text-xs text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Session Management</Label>
                    <p className="text-xs text-gray-500">Manage active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Key className="h-5 w-5 text-purple-600" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control your privacy and data settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Profile Visibility</Label>
                    <p className="text-xs text-gray-500">Control who can see your profile</p>
                  </div>
                  <Select defaultValue="public">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Data Sharing</Label>
                    <p className="text-xs text-gray-500">Allow data to improve matching</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Analytics</Label>
                    <p className="text-xs text-gray-500">Help improve our services</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
