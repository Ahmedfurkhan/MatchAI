"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface KPIData {
  totalParticipants: number
  realTimeQualified: number
  qualifiedPercentage: number
  totalMatches: number
  averageSatisfaction: number
  totalMeetings: number
  peakHours: number
}

interface Participant {
  id: string
  name: string
  avatar_url: string | null
  qualification_score: number
  satisfaction_rating: number
}

interface Meeting {
  id: string
  title: string
  scheduled_at: string
  status: string
}

interface Insight {
  id: string
  title: string
  description: string
  type: string
}

// Mock data for when Supabase is not configured or tables don't exist
const mockKpiData: KPIData = {
  totalParticipants: 150,
  realTimeQualified: 29,
  qualifiedPercentage: 19,
  totalMatches: 160,
  averageSatisfaction: 78,
  totalMeetings: 18,
  peakHours: 4.3,
}

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Yen Ha Gui",
    avatar_url: "/placeholder.svg?height=32&width=32",
    qualification_score: 94,
    satisfaction_rating: 4.7,
  },
  {
    id: "2",
    name: "Yen Ji Sen",
    avatar_url: "/placeholder.svg?height=32&width=32",
    qualification_score: 88,
    satisfaction_rating: 4.2,
  },
  {
    id: "3",
    name: "Yen Jia Yun",
    avatar_url: "/placeholder.svg?height=32&width=32",
    qualification_score: 85,
    satisfaction_rating: 4.5,
  },
  {
    id: "4",
    name: "Che Do Yun",
    avatar_url: "/placeholder.svg?height=32&width=32",
    qualification_score: 82,
    satisfaction_rating: 4.1,
  },
  {
    id: "5",
    name: "Ja Sen Yun",
    avatar_url: "/placeholder.svg?height=32&width=32",
    qualification_score: 79,
    satisfaction_rating: 3.9,
  },
]

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Meeting between Che Seo Yun and Amy Min Jun",
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
  },
  {
    id: "2",
    title: "Meeting between Lee Seo Yun and Jenny Do Yun",
    scheduled_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
  },
  {
    id: "3",
    title: "Meeting between Lee Ji Seo and Yen Ha Gui",
    scheduled_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
  },
]

const mockInsights: Insight[] = [
  {
    id: "1",
    title: "Surge Industry-Identified",
    description: "Match success rate between AI-powered integrations quality",
    type: "warning",
  },
  {
    id: "2",
    title: "Numerous Uncompleted Profiles",
    description: "24 participants completing profiles, potentially low quality",
    type: "warning",
  },
]

export function useDashboardData() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [topParticipants, setTopParticipants] = useState<Participant[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tablesExist, setTablesExist] = useState(false)

  const checkTablesExist = async () => {
    if (!isSupabaseConfigured || !supabase) return false

    try {
      // Try to query a simple count from each table to check if they exist
      const { error: kpiError } = await supabase.from("kpi_metrics").select("id", { count: "exact", head: true })

      const { error: participantsError } = await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })

      const { error: insightsError } = await supabase.from("insights").select("id", { count: "exact", head: true })

      // If no errors, tables exist
      return !kpiError && !participantsError && !insightsError
    } catch (err) {
      console.log("Tables don't exist yet:", err)
      return false
    }
  }

  useEffect(() => {
    async function fetchDashboardData() {
      const createTablesIfNeeded = async () => {
        if (!isSupabaseConfigured || !supabase) return false

        try {
          // Try to create tables (will be ignored if they already exist)
          await supabase.sql`
            CREATE TABLE IF NOT EXISTS participants (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              avatar_url TEXT,
              industry VARCHAR(100),
              company VARCHAR(255),
              position VARCHAR(255),
              qualification_score INTEGER DEFAULT 0,
              satisfaction_rating DECIMAL(3,2) DEFAULT 0,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `

          await supabase.sql`
            CREATE TABLE IF NOT EXISTS kpi_metrics (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              metric_name VARCHAR(100) NOT NULL,
              metric_value DECIMAL(10,2) NOT NULL,
              metric_unit VARCHAR(20),
              percentage_change DECIMAL(5,2),
              recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `

          await supabase.sql`
            CREATE TABLE IF NOT EXISTS insights (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              type VARCHAR(50) DEFAULT 'info',
              priority INTEGER DEFAULT 1,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `

          await supabase.sql`
            CREATE TABLE IF NOT EXISTS meetings (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
              duration_minutes INTEGER DEFAULT 30,
              status VARCHAR(50) DEFAULT 'scheduled',
              meeting_url TEXT,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `

          // Insert sample data
          await supabase.from("participants").upsert(
            [
              {
                name: "Yen Ha Gui",
                email: "yen.ha@example.com",
                avatar_url: "/placeholder.svg?height=32&width=32",
                industry: "Technology",
                company: "TechCorp",
                position: "Software Engineer",
                qualification_score: 94,
                satisfaction_rating: 4.7,
              },
              {
                name: "Yen Ji Sen",
                email: "yen.ji@example.com",
                avatar_url: "/placeholder.svg?height=32&width=32",
                industry: "Finance",
                company: "FinanceInc",
                position: "Analyst",
                qualification_score: 88,
                satisfaction_rating: 4.2,
              },
              {
                name: "Yen Jia Yun",
                email: "yen.jia@example.com",
                avatar_url: "/placeholder.svg?height=32&width=32",
                industry: "Marketing",
                company: "MarketPro",
                position: "Manager",
                qualification_score: 85,
                satisfaction_rating: 4.5,
              },
              {
                name: "Che Do Yun",
                email: "che.do@example.com",
                avatar_url: "/placeholder.svg?height=32&width=32",
                industry: "Healthcare",
                company: "MedTech",
                position: "Director",
                qualification_score: 82,
                satisfaction_rating: 4.1,
              },
              {
                name: "Ja Sen Yun",
                email: "ja.sen@example.com",
                avatar_url: "/placeholder.svg?height=32&width=32",
                industry: "Education",
                company: "EduCorp",
                position: "Principal",
                qualification_score: 79,
                satisfaction_rating: 3.9,
              },
            ],
            { onConflict: "email" },
          )

          await supabase.from("kpi_metrics").upsert(
            [
              { metric_name: "total_participants", metric_value: 150, metric_unit: "count", percentage_change: 12.5 },
              { metric_name: "real_time_qualified", metric_value: 29, metric_unit: "count", percentage_change: -5.2 },
              {
                metric_name: "qualified_percentage",
                metric_value: 19,
                metric_unit: "percent",
                percentage_change: -5.2,
              },
              { metric_name: "total_matches", metric_value: 160, metric_unit: "count", percentage_change: 8.7 },
              { metric_name: "average_satisfaction", metric_value: 78, metric_unit: "percent", percentage_change: 3.2 },
              { metric_name: "total_meetings", metric_value: 18, metric_unit: "count", percentage_change: 15.8 },
              { metric_name: "peak_hours", metric_value: 4.3, metric_unit: "hours", percentage_change: 2.1 },
            ],
            { onConflict: "metric_name" },
          )

          await supabase.from("insights").upsert(
            [
              {
                title: "Surge Industry-Identified",
                description: "Match success rate between AI-powered integrations quality",
                type: "warning",
                priority: 1,
              },
              {
                title: "Numerous Uncompleted Profiles",
                description: "24 participants completing profiles, potentially low quality",
                type: "warning",
                priority: 2,
              },
            ],
            { onConflict: "title" },
          )

          return true
        } catch (err) {
          console.log("Table creation failed, will use mock data:", err)
          return false
        }
      }

      try {
        setLoading(true)
        setError(null)

        // If Supabase is not configured, use mock data
        if (!isSupabaseConfigured || !supabase) {
          console.warn("Supabase not configured, using mock data")
          setKpiData(mockKpiData)
          setTopParticipants(mockParticipants)
          setUpcomingMeetings(mockMeetings)
          setInsights(mockInsights)
          setTablesExist(false)
          setLoading(false)
          return
        }

        // Try to create tables and data first
        await createTablesIfNeeded()

        // Check if tables exist
        const tablesExistCheck = await checkTablesExist()
        setTablesExist(tablesExistCheck)

        if (!tablesExistCheck) {
          console.warn("Database tables don't exist yet, using mock data")
          setKpiData(mockKpiData)
          setTopParticipants(mockParticipants)
          setUpcomingMeetings(mockMeetings)
          setInsights(mockInsights)
          setLoading(false)
          return
        }

        // Fetch KPI metrics
        const { data: kpiMetrics, error: kpiError } = await supabase
          .from("kpi_metrics")
          .select("*")
          .order("recorded_at", { ascending: false })
          .limit(10)

        if (kpiError) {
          console.warn("KPI fetch error, using mock data:", kpiError)
          setKpiData(mockKpiData)
        } else {
          // Process KPI data
          const kpiMap = new Map()
          kpiMetrics?.forEach((metric) => {
            kpiMap.set(metric.metric_name, metric.metric_value)
          })

          const processedKpiData: KPIData = {
            totalParticipants: kpiMap.get("total_participants") || mockKpiData.totalParticipants,
            realTimeQualified: kpiMap.get("real_time_qualified") || mockKpiData.realTimeQualified,
            qualifiedPercentage: kpiMap.get("qualified_percentage") || mockKpiData.qualifiedPercentage,
            totalMatches: kpiMap.get("total_matches") || mockKpiData.totalMatches,
            averageSatisfaction: kpiMap.get("average_satisfaction") || mockKpiData.averageSatisfaction,
            totalMeetings: kpiMap.get("total_meetings") || mockKpiData.totalMeetings,
            peakHours: kpiMap.get("peak_hours") || mockKpiData.peakHours,
          }

          setKpiData(processedKpiData)
        }

        // Fetch top participants
        const { data: participants, error: participantsError } = await supabase
          .from("participants")
          .select("*")
          .order("qualification_score", { ascending: false })
          .limit(5)

        if (participantsError) {
          console.warn("Participants fetch error, using mock data:", participantsError)
          setTopParticipants(mockParticipants)
        } else {
          setTopParticipants(participants || mockParticipants)
        }

        // Fetch upcoming meetings
        const { data: meetings, error: meetingsError } = await supabase
          .from("meetings")
          .select("*")
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(5)

        if (meetingsError) {
          console.warn("Meetings fetch error, using mock data:", meetingsError)
          setUpcomingMeetings(mockMeetings)
        } else {
          setUpcomingMeetings(meetings || mockMeetings)
        }

        // Fetch insights
        const { data: insightsData, error: insightsError } = await supabase
          .from("insights")
          .select("*")
          .eq("is_active", true)
          .order("priority", { ascending: true })
          .limit(4)

        if (insightsError) {
          console.warn("Insights fetch error, using mock data:", insightsError)
          setInsights(mockInsights)
        } else {
          setInsights(insightsData || mockInsights)
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
        // Fallback to mock data on any error
        setKpiData(mockKpiData)
        setTopParticipants(mockParticipants)
        setUpcomingMeetings(mockMeetings)
        setInsights(mockInsights)
        setError("Using mock data due to database connection issues")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return {
    kpiData,
    topParticipants,
    upcomingMeetings,
    insights,
    loading,
    error,
    isSupabaseConfigured,
    tablesExist,
  }
}
