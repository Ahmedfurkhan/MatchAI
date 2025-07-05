"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Camera, Save, Loader2, Upload, X, Check, Edit3, Globe, MapPin, Building, Briefcase, Sparkles } from "lucide-react"
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
import { useUserProfile } from "@/lib/user-context"
import { ImageUpload } from "@/components/image-upload"

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
  experience_level: string
  availability_status: string
  timezone: string
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
  avatar_url: "",
  interests: ["AI", "Machine Learning", "Web Development"],
  skills: ["React", "TypeScript", "Node.js", "Python"],
  experience_level: "Senior",
  availability_status: "Available",
  timezone: "America/Los_Angeles",
}

export function ProfileManagement() {
  const { user, loading: authLoading } = useUser()
  const { profile, loading: profileLoading, updateProfile: updateSharedProfile, refreshProfile } = useUserProfile()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  // Use profile from context if available, otherwise use mock data
  const currentProfile = profile || mockProfile

  const saveProfile = async () => {
    setSaving(true)
    try {
      // Validate required fields
      if (!currentProfile.full_name || !currentProfile.email) {
        toast({
          title: "Error",
          description: "Full name and email are required.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      if (isSupabaseConfigured && supabase && user) {
        // Check if email is already used by another user
        const { data: existingUser, error: emailCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("email", currentProfile.email)
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

        const { error } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            full_name: currentProfile.full_name,
            email: currentProfile.email,
            bio: currentProfile.bio,
            company: currentProfile.company,
            position: currentProfile.position,
            industry: currentProfile.industry,
            location: currentProfile.location,
            website_url: currentProfile.website_url,
            linkedin_url: currentProfile.linkedin_url,
            twitter_url: currentProfile.twitter_url,
            avatar_url: currentProfile.avatar_url,
            interests: currentProfile.interests,
            skills: currentProfile.skills,
            experience_level: currentProfile.experience_level,
            availability_status: currentProfile.availability_status,
            timezone: currentProfile.timezone,
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error("Error saving profile:", error)
          toast({
            title: "Warning",
            description: "Profile saved locally (database unavailable)",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Profile updated successfully!",
          })
          // Refresh the profile to ensure consistency
          await refreshProfile()
        }
      } else {
        toast({
          title: "Info",
          description: "Profile saved locally",
        })
      }
      
      // Always save to localStorage as fallback
      localStorage.setItem('userProfile', JSON.stringify(currentProfile))
      
    } catch (error) {
      console.error("Error saving profile:", error)
      localStorage.setItem('userProfile', JSON.stringify(currentProfile))
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file || !currentProfile) return

    setUploadingImage(true)
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      updateSharedProfile({
        ...currentProfile,
        avatar_url: previewUrl
      })

      // If Supabase is configured, upload to storage
      if (isSupabaseConfigured && supabase && user) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (error) {
          console.warn("Failed to upload image:", error)
          toast({
            title: "Warning",
            description: "Image saved locally (upload failed)",
          })
        } else {
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          
          updateSharedProfile({
            ...currentProfile,
            avatar_url: publicUrl
          })
          toast({
            title: "Success",
            description: "Profile picture updated!",
          })
        }
      } else {
        // Save to localStorage when Supabase is not available
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          updateSharedProfile({
            ...currentProfile,
            avatar_url: dataUrl
          })
        }
        reader.readAsDataURL(file)
        
        toast({
          title: "Success",
          description: "Profile picture updated!",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: any) => {
    if (currentProfile) {
      updateSharedProfile({
        ...currentProfile,
        [field]: value,
      })
    }
  }

  const addArrayItem = (field: "interests" | "skills", value: string) => {
    if (value.trim() && currentProfile) {
      updateSharedProfile({
        ...currentProfile,
        [field]: [...(currentProfile[field] || []), value.trim()]
      })
    }
  }

  const removeArrayItem = (field: "interests" | "skills", index: number) => {
    if (currentProfile) {
      updateSharedProfile({
        ...currentProfile,
        [field]: currentProfile[field]?.filter((_, i) => i !== index) || []
      })
    }
  }

  const startEditing = (field: string) => {
    setEditingField(field)
  }

  const finishEditing = () => {
    setEditingField(null)
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal and professional information</p>
        </div>

        {/* Profile Picture Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Profile Picture</CardTitle>
            <CardDescription>Upload a professional photo for your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <ImageUpload
              currentImage={currentProfile.avatar_url}
              onImageUpload={handleImageUpload}
              uploading={uploadingImage}
              className="w-full max-w-md"
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-purple-600" />
              Basic Information
            </CardTitle>
            <CardDescription>Your personal profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="full_name"
                  value={currentProfile.full_name || ""}
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
                  value={currentProfile.email || ""}
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
                value={currentProfile.bio || ""}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Tell us about yourself, your interests, and what you're looking for..."
                rows={4}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Professional Information
            </CardTitle>
            <CardDescription>Your work and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                <Input
                  id="company"
                  value={currentProfile.company || ""}
                  onChange={(e) => updateProfile("company", e.target.value)}
                  placeholder="Acme Corp"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                <Input
                  id="position"
                  value={currentProfile.position || ""}
                  onChange={(e) => updateProfile("position", e.target.value)}
                  placeholder="Senior Developer"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Select
                  value={currentProfile.industry || ""}
                  onValueChange={(value) => updateProfile("industry", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={currentProfile.location || ""}
                  onChange={(e) => updateProfile("location", e.target.value)}
                  placeholder="San Francisco, CA"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_level" className="text-sm font-medium">Experience Level</Label>
                <Select
                  value={currentProfile.experience_level || ""}
                  onValueChange={(value) => updateProfile("experience_level", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Entry Level">Entry Level</SelectItem>
                    <SelectItem value="Mid Level">Mid Level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability_status" className="text-sm font-medium">Availability</Label>
                <Select
                  value={currentProfile.availability_status || ""}
                  onValueChange={(value) => updateProfile("availability_status", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                    <SelectItem value="Do Not Disturb">Do Not Disturb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-green-600" />
              Skills & Interests
            </CardTitle>
            <CardDescription>Add your skills and interests to help with matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {currentProfile.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        onClick={() => removeArrayItem("skills", index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {editingField === "skills" ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addArrayItem("skills", e.currentTarget.value)
                          e.currentTarget.value = ""
                          finishEditing()
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={finishEditing}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing("skills")}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <Label className="text-sm font-medium">Interests</Label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests?.map((interest, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {interest}
                      <button
                        onClick={() => removeArrayItem("interests", index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {editingField === "interests" ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addArrayItem("interests", e.currentTarget.value)
                          e.currentTarget.value = ""
                          finishEditing()
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={finishEditing}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing("interests")}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Add Interest
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-orange-600" />
              Contact & Social
            </CardTitle>
            <CardDescription>Your contact information and social media links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website_url" className="text-sm font-medium">Website</Label>
              <Input
                id="website_url"
                value={currentProfile.website_url || ""}
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
                  value={currentProfile.linkedin_url || ""}
                  onChange={(e) => updateProfile("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter_url" className="text-sm font-medium">Twitter</Label>
                <Input
                  id="twitter_url"
                  value={currentProfile.twitter_url || ""}
                  onChange={(e) => updateProfile("twitter_url", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={saveProfile} 
            disabled={saving}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
