"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database, Play } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DatabaseStatusProps {
  tablesExist: boolean
  onTablesCreated?: () => void
}

export function DatabaseStatus({ tablesExist, onTablesCreated }: DatabaseStatusProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createTablesAndData = async () => {
    setIsCreating(true)
    setError(null)

    try {
      // Create participants table first (no dependencies)
      const { error: participantsError } = await supabase.sql`
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

      if (participantsError) {
        console.log("Participants table might already exist:", participantsError)
      }

      // Create other tables
      const { error: kpiError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS kpi_metrics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          metric_name VARCHAR(100) NOT NULL,
          metric_value DECIMAL(10,2) NOT NULL,
          metric_unit VARCHAR(20),
          percentage_change DECIMAL(5,2),
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      if (kpiError) {
        console.log("KPI metrics table might already exist:", kpiError)
      }

      const { error: insightsError } = await supabase.sql`
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

      if (insightsError) {
        console.log("Insights table might already exist:", insightsError)
      }

      const { error: meetingsError } = await supabase.sql`
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

      if (meetingsError) {
        console.log("Meetings table might already exist:", meetingsError)
      }

      // Insert sample data
      await insertSampleData()

      setSuccess(true)
      onTablesCreated?.()
    } catch (err) {
      console.error("Database setup error:", err)
      setError(err instanceof Error ? err.message : "Failed to set up database")
    } finally {
      setIsCreating(false)
    }
  }

  const insertSampleData = async () => {
    // Insert participants
    const { error: participantsError } = await supabase.from("participants").upsert([
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
    ])

    if (participantsError) {
      console.log("Participants data might already exist:", participantsError)
    }

    // Insert KPI metrics
    const { error: kpiError } = await supabase.from("kpi_metrics").upsert([
      { metric_name: "total_participants", metric_value: 150, metric_unit: "count", percentage_change: 12.5 },
      { metric_name: "real_time_qualified", metric_value: 29, metric_unit: "count", percentage_change: -5.2 },
      { metric_name: "qualified_percentage", metric_value: 19, metric_unit: "percent", percentage_change: -5.2 },
      { metric_name: "total_matches", metric_value: 160, metric_unit: "count", percentage_change: 8.7 },
      { metric_name: "average_satisfaction", metric_value: 78, metric_unit: "percent", percentage_change: 3.2 },
      { metric_name: "total_meetings", metric_value: 18, metric_unit: "count", percentage_change: 15.8 },
      { metric_name: "peak_hours", metric_value: 4.3, metric_unit: "hours", percentage_change: 2.1 },
    ])

    if (kpiError) {
      console.log("KPI data might already exist:", kpiError)
    }

    // Insert insights
    const { error: insightsError } = await supabase.from("insights").upsert([
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
    ])

    if (insightsError) {
      console.log("Insights data might already exist:", insightsError)
    }
  }

  if (tablesExist) {
    return (
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>Database is set up and connected! Showing live data from Supabase.</AlertDescription>
      </Alert>
    )
  }

  if (success) {
    return (
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>Database setup complete! Refresh the page to see live data from Supabase.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The database tables don't exist yet. Click the button below to create them and populate with sample data.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={createTablesAndData} disabled={isCreating} className="w-full">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up database...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Create Tables & Add Sample Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
