import { createClient } from "@supabase/supabase-js"

// Use the existing environment variables from v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Flag to check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          industry: string | null
          company: string | null
          position: string | null
          qualification_score: number
          satisfaction_rating: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      matches: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          event_id: string
          match_score: number
          status: string
          created_at: string
        }
      }
      meetings: {
        Row: {
          id: string
          match_id: string
          title: string
          scheduled_at: string
          duration_minutes: number
          status: string
          meeting_url: string | null
          notes: string | null
          created_at: string
        }
      }
      insights: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          priority: number
          is_active: boolean
          created_at: string
        }
      }
      kpi_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          metric_unit: string | null
          percentage_change: number | null
          recorded_at: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          participant_id: string
          event_id: string
          activity_type: string
          timestamp: string
          metadata: any
        }
      }
    }
  }
}
