"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
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

export function Breadcrumb() {
  const pathname = usePathname()
  
  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean)
  
  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`
    const title = pageTitles[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    return {
      path,
      title,
      isLast: index === segments.length - 1,
    }
  })

  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.isLast ? (
            <span className="font-medium text-gray-900">{item.title}</span>
          ) : (
            <Link
              href={item.path}
              className="hover:text-gray-700 transition-colors"
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
} 