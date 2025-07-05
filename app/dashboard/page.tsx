"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Target, Heart, Star, Calendar, TrendingUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { KPICard } from "@/components/kpi-card"
import { ActivityChart } from "@/components/activity-chart"
import { InsightsSection } from "@/components/insights-section"
import { MatchingTopList } from "@/components/matching-top-list"
import { MeetingAnticipationList } from "@/components/meeting-anticipation-list"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { ModernDashboard } from "@/components/modern-dashboard"
import { ModernNavigation } from "@/components/modern-navigation"
import { supabase } from "@/lib/supabase-client"

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[400px] lg:col-span-2" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { kpiData, topParticipants, upcomingMeetings, insights, loading, error, isSupabaseConfigured, tablesExist } =
    useDashboardData()

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
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50 md:pl-56">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <DashboardHeader />

            <main className="flex-1 p-2 sm:p-4 lg:p-6">
              {isSupabaseConfigured ? (
                isSupabaseConfigured &&
                !tablesExist &&
                !loading && (
                  <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Setting up database tables automatically... This may take a moment.
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Supabase is not configured. The dashboard is showing mock data. Configure your Supabase environment
                    variables to see live data.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-6" variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <DashboardSkeleton />
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* KPI Cards */}
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <KPICard
                      title="Total Participants"
                      value={kpiData?.totalParticipants || 150}
                      icon={<Users className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                    <KPICard
                      title="Real-Time Qualified"
                      value={kpiData?.realTimeQualified || 29}
                      subtitle={`(${kpiData?.qualifiedPercentage || 19}%)`}
                      icon={<Target className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                    <KPICard
                      title="Total Matches"
                      value={kpiData?.totalMatches || 160}
                      icon={<Heart className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                    <KPICard
                      title="Average Satisfaction"
                      value={`${kpiData?.averageSatisfaction || 78}%`}
                      icon={<Star className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                    <KPICard
                      title="Total Meetings"
                      value={kpiData?.totalMeetings || 18}
                      icon={<Calendar className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                    <KPICard
                      title="Peak Hours"
                      value={kpiData?.peakHours || 4.3}
                      icon={<TrendingUp className="h-5 w-5" />}
                      className="xl:col-span-1"
                    />
                  </div>

                  {/* Charts and Lists */}
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
                    <ActivityChart />
                    <div className="space-y-6">
                      <MatchingTopList participants={topParticipants} />
                      <MeetingAnticipationList meetings={upcomingMeetings} />
                    </div>
                  </div>

                  {/* Insights */}
                  <InsightsSection insights={insights} />
                </div>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <ModernDashboard />
    </>
  )
}
