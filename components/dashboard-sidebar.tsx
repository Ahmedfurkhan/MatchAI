"use client"
import { Calendar, Users, BarChart3, Eye, UserCheck, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Event Management",
    icon: Calendar,
    href: "#",
    isActive: false,
  },
  {
    title: "Real-Time Dashboard",
    icon: BarChart3,
    href: "#",
    isActive: true,
  },
  {
    title: "Matching Tracker",
    icon: UserCheck,
    href: "#",
    isActive: false,
  },
  {
    title: "Meeting Monitoring",
    icon: Eye,
    href: "#",
    isActive: false,
  },
  {
    title: "Participant Management",
    icon: Users,
    href: "#",
    isActive: false,
  },
  {
    title: "Reports",
    icon: FileText,
    href: "#",
    isActive: false,
  },
  {
    title: "AI Matching Settings",
    icon: Settings,
    href: "#",
    isActive: false,
  },
]

export function DashboardSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 p-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={cn(
                      "w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      item.isActive
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
