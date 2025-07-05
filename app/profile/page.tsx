"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Breadcrumb } from "@/components/breadcrumb"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProfileManagement } from "@/components/profile-management"
import { AIInsights } from "@/components/ai-insights"
import { supabase } from "@/lib/supabase-client"

export default function ProfilePage() {
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ProfileManagement />
                </div>
                <div>
                  <AIInsights />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
