"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useUser } from "@/lib/auth"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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

interface UserContextType {
  profile: UserProfile | null
  loading: boolean
  updateProfile: (updates: Partial<UserProfile>) => void
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!error && data) {
          const loadedProfile: UserProfile = {
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
            experience_level: data.experience_level || "",
            availability_status: data.availability_status || "Available",
            timezone: data.timezone || "",
          }
          setProfile(loadedProfile)
        } else {
          // Create default profile from user data
          const defaultProfile: UserProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Demo User",
            email: user.email || "demo@example.com",
            bio: "",
            company: "",
            position: "",
            industry: "",
            location: "",
            website_url: "",
            linkedin_url: "",
            twitter_url: "",
            avatar_url: user.user_metadata?.avatar_url || "",
            interests: [],
            skills: [],
            experience_level: "",
            availability_status: "Available",
            timezone: "",
          }
          setProfile(defaultProfile)
        }
      } else {
        // Use user data when Supabase is not configured
        const defaultProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Demo User",
          email: user.email || "demo@example.com",
          bio: "",
          company: "",
          position: "",
          industry: "",
          location: "",
          website_url: "",
          linkedin_url: "",
          twitter_url: "",
          avatar_url: user.user_metadata?.avatar_url || "",
          interests: [],
          skills: [],
          experience_level: "",
          availability_status: "Available",
          timezone: "",
        }
        setProfile(defaultProfile)
      }
    } catch (error) {
      console.warn("Failed to load profile:", error)
      // Set default profile on error
      const defaultProfile: UserProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Demo User",
        email: user.email || "demo@example.com",
        bio: "",
        company: "",
        position: "",
        industry: "",
        location: "",
        website_url: "",
        linkedin_url: "",
        twitter_url: "",
        avatar_url: user.user_metadata?.avatar_url || "",
        interests: [],
        skills: [],
        experience_level: "",
        availability_status: "Available",
        timezone: "",
      }
      setProfile(defaultProfile)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates })
    }
  }

  const refreshProfile = async () => {
    setLoading(true)
    await loadProfile()
  }

  useEffect(() => {
    if (!authLoading) {
      loadProfile()
    }
  }, [authLoading, user])

  return (
    <UserContext.Provider value={{ profile, loading, updateProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProvider")
  }
  return context
} 