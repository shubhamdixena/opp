import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string
          title: string
          slug: string
          organization_id: string
          description: string
          full_description: string | null
          eligibility: any
          benefits: any
          timeline: any
          deadline: string
          program_start: string | null
          duration: string | null
          location: string
          region: string
          funding_type: 'fully_funded' | 'partially_funded' | 'self_funded'
          career_stage: string | null
          application_url: string
          is_featured: boolean
          is_new: boolean
          created_at: string
          updated_at: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          country: string | null
          logo_emoji: string
          created_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          emoji: string
          description: string | null
          slug: string
          created_at: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
      }
    }
  }
}
