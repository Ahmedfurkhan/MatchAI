"use client"

import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

export function DashboardHeader() {
  const { user, loading } = useAuth()
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">REAL-TIME KPI DASHBOARD</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white">3</Badge>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg?height=32&width=32"} />
            <AvatarFallback>
              {user?.user_metadata?.full_name
                ? user.user_metadata.full_name.split(" ").map((n) => n[0]).join("")
                : user?.full_name
                  ? user.full_name.split(" ").map((n) => n[0]).join("")
                  : user?.email
                    ? user.email.split("@")[0]
                    : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{loading ? "Loading..." : user?.user_metadata?.full_name || user?.full_name || user?.email?.split("@")[0] || "Unknown User"}</p>
            <p className="text-xs text-gray-500">{loading ? "" : user?.email || ""}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
