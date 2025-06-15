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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const search = searchParams.get('search') || ''

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

    // Build query with filters
    let query = supabase
      .from('duty_logs')
      .select('*', { count: 'exact' })

    // Apply filters
    if (department) {
      query = query.eq('department', department)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (search) {
      query = query.or(`username.ilike.%${search}%,character_name.ilike.%${search}%,call_sign.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count: totalCount } = await query

    // Apply pagination and sorting
    const { data: dutyLogs, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching admin duty logs:', error)
      return NextResponse.json({ error: 'Failed to fetch duty logs' }, { status: 500 })
    }

    // Calculate statistics
    const allLogsQuery = supabase.from('duty_logs').select('*')
    
    // Apply date filters for statistics
    if (dateFrom) {
      allLogsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      allLogsQuery.lte('created_at', dateTo)
    }

    const { data: allLogs } = await allLogsQuery

    const logs = allLogs || []
    const uniqueUsers = new Set(logs.map(log => log.discord_id)).size
    const activeLogs = logs.filter(log => log.status === 'active')
    const activeUsers = new Set(activeLogs.map(log => log.discord_id)).size
    const completedLogs = logs.filter(log => log.status === 'completed' && log.duration)
    const totalHours = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    const averageSessionTime = completedLogs.length > 0 ? totalHours / completedLogs.length : 0

    // Today's statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayLogs = logs.filter(log => new Date(log.created_at) >= today)
    const todayCompleted = todayLogs.filter(log => log.status === 'completed' && log.duration)
    const todayHours = todayCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)
    const todayActiveUsers = new Set(todayLogs.map(log => log.discord_id)).size

    // Weekly statistics
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const weeklyLogs = logs.filter(log => new Date(log.created_at) >= startOfWeek)
    const weeklyCompleted = weeklyLogs.filter(log => log.status === 'completed' && log.duration)
    const weeklyHours = weeklyCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)
    const weeklyUniqueUsers = new Set(weeklyLogs.map(log => log.discord_id)).size

    // Department statistics
    const departments = ['PD', 'EMS', 'Mechanic', 'Merry weather']
    const departmentStats = departments.map(dept => {
      const deptLogs = logs.filter(log => log.department === dept)
      const deptCompletedLogs = deptLogs.filter(log => log.status === 'completed' && log.duration)
      const deptActiveUsers = new Set(deptLogs.filter(log => log.status === 'active').map(log => log.discord_id)).size
      const deptTotalUsers = new Set(deptLogs.map(log => log.discord_id)).size
      const deptTotalHours = deptCompletedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const deptAvgSessionTime = deptCompletedLogs.length > 0 ? deptTotalHours / deptCompletedLogs.length : 0

      return {
        department: dept,
        totalUsers: deptTotalUsers,
        activeUsers: deptActiveUsers,
        totalHours: Math.round(deptTotalHours * 100) / 100,
        averageSessionTime: Math.round(deptAvgSessionTime * 100) / 100,
        totalSessions: deptCompletedLogs.length
      }
    })

    const statistics = {
      totalUsers: uniqueUsers,
      totalActiveUsers: activeUsers,
      totalHours: Math.round(totalHours * 100) / 100,
      totalSessions: completedLogs.length,
      averageSessionTime: Math.round(averageSessionTime * 100) / 100,
      departmentStats,
      todayStats: {
        totalSessions: todayCompleted.length,
        totalHours: Math.round(todayHours * 100) / 100,
        activeUsers: todayActiveUsers
      },
      weeklyStats: {
        totalSessions: weeklyCompleted.length,
        totalHours: Math.round(weeklyHours * 100) / 100,
        uniqueUsers: weeklyUniqueUsers
      }
    }

    const totalPages = Math.ceil((totalCount || 0) / limit)

    const response = {
      dutyLogs: dutyLogs || [],
      statistics,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages
      },
      filters: {
        department,
        status,
        dateFrom,
        dateTo,
        search
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin duty logs endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 