"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DatabaseSetup() {
  const [setupStatus, setSetupStatus] = useState<{
    tables: "pending" | "success" | "error"
    data: "pending" | "success" | "error"
  }>({
    tables: "pending",
    data: "pending",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTables = async () => {
    try {
      // Create participants table
      const { error: participantsError } = await supabase.rpc("exec_sql", {
        sql: `
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
        `,
      })

      if (participantsError) throw participantsError

      // Create other tables...
      const tables = [
        `CREATE TABLE IF NOT EXISTS events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS matches (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          participant1_id UUID REFERENCES participants(id) ON DELETE CASCADE,
          participant2_id UUID REFERENCES participants(id) ON DELETE CASCADE,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          match_score DECIMAL(5,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS meetings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
          duration_minutes INTEGER DEFAULT 30,
          status VARCHAR(50) DEFAULT 'scheduled',
          meeting_url TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS insights (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          priority INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS kpi_metrics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          metric_name VARCHAR(100) NOT NULL,
          metric_value DECIMAL(10,2) NOT NULL,
          metric_unit VARCHAR(20),
          percentage_change DECIMAL(5,2),
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,
      ]

      for (const sql of tables) {
        const { error } = await supabase.rpc("exec_sql", { sql })
        if (error) throw error
      }

      setSetupStatus((prev) => ({ ...prev, tables: "success" }))
    } catch (err) {
      console.error("Table creation error:", err)
      setSetupStatus((prev) => ({ ...prev, tables: "error" }))
      throw err
    }
  }

  const insertSampleData = async () => {
    try {
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

      if (participantsError) throw participantsError

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

      if (kpiError) throw kpiError

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

      if (insightsError) throw insightsError

      setSetupStatus((prev) => ({ ...prev, data: "success" }))
    } catch (err) {
      console.error("Data insertion error:", err)
      setSetupStatus((prev) => ({ ...prev, data: "error" }))
      throw err
    }
  }

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await createTables()
      await insertSampleData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(setupStatus.tables)}
            <span className="text-sm">Create database tables</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(setupStatus.data)}
            <span className="text-sm">Insert sample data</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSetup} disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {setupStatus.tables === "success" && setupStatus.data === "success" ? "Setup Complete" : "Setup Database"}
        </Button>
      </CardContent>
    </Card>
  )
}
