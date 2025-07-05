"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Breadcrumb } from "@/components/breadcrumb"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ModernChat } from "@/components/modern-chat"
import { supabase } from "@/lib/supabase-client"

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/signin")
      }
    }

    checkAuth()
  }, [router])

  return (
    // Page Layout (app/chat/page.tsx)
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              <ModernChat /> {/* Chat component fits here */}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
