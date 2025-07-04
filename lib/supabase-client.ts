import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          company: string | null
          position: string | null
          industry: string | null
          location: string | null
          interests: string[]
          skills: string[]
          goals: string[]
          experience_level: string
          availability_status: string
          timezone: string | null
          ai_profile_summary: string | null
          qualification_score: number
          satisfaction_rating: number
          is_active: boolean
          is_verified: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          event_id: string
          match_score: number
          compatibility_factors: any
          ai_explanation: string | null
          status: string
          user1_response: string | null
          user2_response: string | null
          matched_at: string
          expires_at: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          type: string
          title: string | null
          is_active: boolean
          last_message_at: string | null
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          metadata: any
          is_read: boolean
          sent_at: string
        }
      }
      meetings: {
        Row: {
          id: string
          conversation_id: string
          organizer_id: string
          title: string
          description: string | null
          scheduled_at: string
          duration_minutes: number
          meeting_type: string
          meeting_url: string | null
          status: string
          created_at: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          event_type: string
          start_date: string
          end_date: string
          status: string
          created_at: string
        }
      }
    }
  }
}
