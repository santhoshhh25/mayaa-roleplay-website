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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const discordId = searchParams.get('discord_id')

    if (!discordId) {
      return NextResponse.json({ error: 'Discord ID is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection not configured' }, { status: 500 })
    }

    // Get user's duty logs
    const { data: dutyLogs, error } = await supabase
      .from('duty_logs')
      .select('*')
      .eq('discord_id', discordId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching duty logs:', error)
      return NextResponse.json({ error: 'Failed to fetch duty logs' }, { status: 500 })
    }

    // Calculate user statistics
    const completedLogs = dutyLogs.filter(log => log.status === 'completed' && log.duration)
    const totalHours = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    const averageSessionTime = completedLogs.length > 0 ? totalHours / completedLogs.length : 0

    // Today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayLogs = dutyLogs.filter(log => new Date(log.created_at) >= today)
    const todayCompleted = todayLogs.filter(log => log.status === 'completed' && log.duration)
    const todayHours = todayCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)

    // Weekly stats
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const weeklyLogs = dutyLogs.filter(log => new Date(log.created_at) >= startOfWeek)
    const weeklyCompleted = weeklyLogs.filter(log => log.status === 'completed' && log.duration)
    const weeklyHours = weeklyCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)

    // Check if currently on duty
    const isOnDuty = dutyLogs.some(log => log.status === 'active')
    const activeSession = dutyLogs.find(log => log.status === 'active') || null

    const response = {
      dutyLogs: dutyLogs || [],
      statistics: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalSessions: completedLogs.length,
        averageSessionTime: Math.round(averageSessionTime * 100) / 100,
        todayHours: Math.round(todayHours * 100) / 100,
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        isOnDuty,
        activeSession
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Duty logs endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 