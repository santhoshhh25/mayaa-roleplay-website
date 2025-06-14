import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

// Enhanced Supabase client initialization with better error handling
function initializeSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Supabase configuration missing:')
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
    console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✅ Set' : '❌ Missing'}`)
    return null
  }

  if (supabaseUrl.includes('your_supabase_project_url_here') || 
      supabaseServiceRoleKey.includes('your_supabase_service_role_key_here')) {
    console.error('❌ Supabase configuration contains placeholder values')
    return null
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Supabase client initialized successfully')
    console.log(`   Project URL: ${supabaseUrl}`)
    return client
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error)
    return null
  }
}

// Initialize the client
supabase = initializeSupabase()

// Helper function to check if Supabase is available
function checkSupabaseConnection(): { available: boolean; error?: string } {
  if (!supabase) {
    return { 
      available: false, 
      error: 'Supabase client not initialized. Check your environment variables.' 
    }
  }
  return { available: true }
}

export { supabase, checkSupabaseConnection } 