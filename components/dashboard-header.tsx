"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, User, LogOut, Search, Settings, Home, MessageCircle, Calendar, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth"
import { useUserProfile } from "@/lib/user-context"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/profile": "Profile",
  "/matches": "AI Matching",
  "/meetings": "Meetings",
  "/participants": "Participants",
  "/reports": "Reports",
  "/settings": "Settings",
}

const pageIcons: Record<string, React.ComponentType<any>> = {
  "/dashboard": Home,
  "/chat": MessageCircle,
  "/profile": User,
  "/matches": Sparkles,
  "/meetings": Calendar,
  "/participants": Users,
  "/reports": Bell,
  "/settings": Settings,
}

export function DashboardHeader() {
  const { user, loading, signOut } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  const currentPage = pageTitles[pathname] || "Dashboard"
  const PageIcon = pageIcons[pathname] || Home

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  // Helper function to get user initials from profile
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("")
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "U"
  }

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "Unknown User"
  }

  const isLoading = loading || profileLoading

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-border lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        
        {/* Page Title and Icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <PageIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground lg:text-2xl">{currentPage}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {pathname === "/dashboard" ? "Real-time analytics and insights" : 
               pathname === "/chat" ? "Connect with your matches" :
               pathname === "/profile" ? "Manage your profile and preferences" :
               pathname === "/matches" ? "AI-powered matching system" :
               pathname === "/meetings" ? "Schedule and manage meetings" :
               "MatchAI Platform"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 border-border focus:border-purple-500 bg-background"
            />
          </div>
        </form>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white">3</Badge>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback>
                  {isLoading ? <User className="h-4 w-4" /> : getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {isLoading ? "Loading..." : getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground">{isLoading ? "" : user?.email || ""}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "No email"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
