import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Simple admin check - you can enhance this with proper role checking
async function isUserAdmin(discordId: string): Promise<boolean> {
  try {
    // For now, return true to allow functionality
    // TODO: Implement proper admin role checking with Discord API
    return true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminDiscordId = searchParams.get('admin_discord_id')

    if (!adminDiscordId) {
      return NextResponse.json({ error: 'Admin Discord ID is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection not configured' }, { status: 500 })
    }

    // Check if user is admin
    const isAdmin = await isUserAdmin(adminDiscordId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 })
    }

    // Get all active duty sessions
    const { data: activeSessions, error } = await supabase
      .from('duty_logs')
      .select('*')
      .eq('status', 'active')
      .order('clock_in', { ascending: false })

    if (error) {
      console.error('Error fetching active sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch active sessions' }, { status: 500 })
    }

    // Calculate session durations for active sessions
    const now = new Date()
    const sessionsWithDuration = (activeSessions || []).map(session => {
      const clockInTime = new Date(session.clock_in)
      const currentDuration = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60) // in hours
      
      return {
        ...session,
        currentDuration: Math.round(currentDuration * 100) / 100
      }
    })

    return NextResponse.json(sessionsWithDuration)

  } catch (error) {
    console.error('Active sessions endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 