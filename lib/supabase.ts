import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey && 
    !supabaseUrl.includes('your_supabase_project_url_here') && 
    !supabaseKey.includes('your_supabase_anon_key_here')) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  })
}

export { supabase }

// Types for the duty logs table
export interface DutyLog {
  id: string
  discord_id: string
  username: string
  character_name: string
  department: string
  rank: string
  call_sign: string
  clock_in: string
  clock_out?: string
  duration?: number
  location?: string
  notes?: string
  status: 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface DutyLogInsert {
  discord_id: string
  username: string
  character_name: string
  department: string
  rank: string
  call_sign: string
  clock_in: string
  location?: string
  notes?: string
  status: 'active'
} 