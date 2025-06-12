import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

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

    // Fetch duty logs for the user, ordered by created_at desc
    const { data: dutyLogs, error } = await supabase
      .from('duty_logs')
      .select('*')
      .eq('discord_id', discordId)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 logs

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch duty logs' }, { status: 500 })
    }

    // Calculate statistics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of current week

    const todayLogs = dutyLogs.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= today && log.status === 'completed' && log.duration
    })

    const weeklyLogs = dutyLogs.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= startOfWeek && log.status === 'completed' && log.duration
    })

    const completedLogs = dutyLogs.filter(log => log.status === 'completed' && log.duration)

    const todayHours = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    const weeklyHours = weeklyLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    const totalHours = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)

    // Check if user has an active session
    const activeSession = dutyLogs.find(log => log.status === 'active')

    return NextResponse.json({
      dutyLogs,
      statistics: {
        todayHours: Math.round(todayHours * 100) / 100,
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100,
        isOnDuty: !!activeSession,
        activeSession: activeSession || null
      }
    })
  } catch (error) {
    console.error('Duty logs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 