"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, MessageCircle, Calendar, User, Bell, Search, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, color: "from-blue-500 to-cyan-500" },
  { name: "Discover", href: "/matches", icon: Sparkles, color: "from-purple-500 to-pink-500" },
  { name: "Chat", href: "/chat", icon: MessageCircle, color: "from-green-500 to-emerald-500" },
  { name: "Meetings", href: "/meetings", icon: Calendar, color: "from-orange-500 to-red-500" },
  { name: "Profile", href: "/profile", icon: User, color: "from-indigo-500 to-purple-500" },
]

export function ModernNavigation() {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3)
  const { signOut } = useAuth()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-2 py-2">
          <div className="flex justify-around items-center">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300"
                  >
                    <div
                      className={cn(
                        "relative p-2 rounded-xl transition-all duration-300",
                        isActive ? `bg-gradient-to-r ${item.color} shadow-lg` : "hover:bg-gray-100",
                      )}
                    >
                      <item.icon
                        className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-gray-600")}
                      />
                      {item.name === "Chat" && notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                          {notifications}
                        </Badge>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium mt-1 transition-colors",
                        isActive ? "text-gray-900" : "text-gray-500",
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 md:hidden"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MatchAI
              </h1>
              <p className="text-xs text-gray-500">Find your perfect match</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">{notifications}</Badge>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col z-40"
      >
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MatchAI
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Matching</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 relative",
                      isActive
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-300",
                        isActive ? `bg-gradient-to-r ${item.color}` : "bg-gray-100",
                      )}
                    >
                      <item.icon
                        className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-gray-600")}
                      />
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.name === "Chat" && notifications > 0 && (
                      <Badge className="ml-auto h-4 w-4 p-0 text-xs bg-red-500">{notifications}</Badge>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveTab"
                        className="absolute left-0 w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-3">
          <Button variant="ghost" className="w-full justify-start text-sm" onClick={signOut}>
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
