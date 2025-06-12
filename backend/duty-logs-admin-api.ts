import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceRoleKey && 
    !supabaseUrl.includes('your_supabase_project_url_here') && 
    !supabaseServiceRoleKey.includes('your_supabase_service_role_key_here')) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
}

export interface AdminDutyLogData {
  id: string
  discord_id: string
  username: string
  character_name: string
  department: string
  rank: string
  call_sign: string
  clock_in: string
  clock_out: string | null
  duration: number | null
  location?: string
  notes?: string
  status: 'active' | 'completed'
  created_at: string
  updated_at?: string
}

export interface DepartmentStats {
  department: string
  totalUsers: number
  activeUsers: number
  totalHours: number
  averageSessionTime: number
  totalSessions: number
}

export interface AdminStatistics {
  totalUsers: number
  totalActiveUsers: number
  totalHours: number
  totalSessions: number
  averageSessionTime: number
  departmentStats: DepartmentStats[]
  todayStats: {
    totalSessions: number
    totalHours: number
    activeUsers: number
  }
  weeklyStats: {
    totalSessions: number
    totalHours: number
    uniqueUsers: number
  }
}

export interface AdminDutyLogsResponse {
  dutyLogs: AdminDutyLogData[]
  statistics: AdminStatistics
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  filters: {
    department?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
}

export class DutyLogsAdminAPI {
  
  // Admin role IDs that can access admin panel
  private static readonly adminRoles = [
    '1382104576139858041', // Admin role
    '1380074287104266318', // Chief/Leadership roles
    // Add more admin role IDs here
  ]

  static async isUserAdmin(discordId: string, guildId: string): Promise<boolean> {
    try {
      if (!supabase) {
        return false
      }

      // For development/testing: Allow specific Discord IDs
      // Add your Discord ID here for admin access
      const devAdminIds = [
        '1284925883240550552', // Add your Discord ID here
        // Add more Discord IDs as needed
      ]

      // Check if user is in dev admin list
      if (devAdminIds.includes(discordId)) {
        console.log(`✅ Admin access granted for dev user: ${discordId}`)
        return true
      }

      // Production check: verify user has duty logs (indicates they're staff)
      // This is a simple verification - in production you'd want Discord API role checking
      const { data: userLogs, error } = await supabase
        .from('duty_logs')
        .select('id')
        .eq('discord_id', discordId)
        .limit(1)

      if (error) {
        console.error('Error checking user admin status:', error)
        return false
      }

      // If user has duty logs, they're likely staff who should have admin access
      const hasLogs = userLogs && userLogs.length > 0
      if (hasLogs) {
        console.log(`✅ Admin access granted for staff user: ${discordId}`)
        return true
      }

      console.log(`❌ Admin access denied for ${discordId}: No admin privileges found`)
      return false
    } catch (error) {
      console.error('Admin check error:', error)
      return false
    }
  }

  static async getAllDutyLogs(
    adminDiscordId: string,
    page: number = 1,
    limit: number = 50,
    filters: {
      department?: string
      status?: string
      dateFrom?: string
      dateTo?: string
      search?: string
    } = {}
  ): Promise<AdminDutyLogsResponse> {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured')
      }

      // Check if user is admin (simplified - implement proper role checking)
      const isAdmin = await this.isUserAdmin(adminDiscordId, process.env.GUILD_ID || '')
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      let query = supabase
        .from('duty_logs')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.department) {
        query = query.eq('department', filters.department)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      if (filters.search) {
        query = query.or(`username.ilike.%${filters.search}%,character_name.ilike.%${filters.search}%,call_sign.ilike.%${filters.search}%`)
      }

      // Get total count for pagination
      const { count: totalCount } = await query

      // Apply pagination and sorting
      const { data: dutyLogs, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error('Error fetching admin duty logs:', error)
        throw new Error('Failed to fetch duty logs')
      }

      // Calculate statistics
      const statistics = await this.calculateAdminStatistics(filters)

      const totalPages = Math.ceil((totalCount || 0) / limit)

      return {
        dutyLogs: dutyLogs || [],
        statistics,
        pagination: {
          total: totalCount || 0,
          page,
          limit,
          totalPages
        },
        filters
      }
    } catch (error) {
      console.error('Admin duty logs error:', error)
      throw error
    }
  }

  static async calculateAdminStatistics(filters: any = {}): Promise<AdminStatistics> {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured')
      }

      // Build base query for statistics
      let baseQuery = supabase.from('duty_logs').select('*')

      // Apply date filters if provided
      if (filters.dateFrom) {
        baseQuery = baseQuery.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        baseQuery = baseQuery.lte('created_at', filters.dateTo)
      }

      const { data: allLogs, error } = await baseQuery

      if (error) {
        console.error('Error calculating admin statistics:', error)
        throw new Error('Failed to calculate statistics')
      }

      const logs = allLogs || []

      // Calculate overall statistics
      const uniqueUsers = new Set(logs.map(log => log.discord_id)).size
      const activeLogs = logs.filter(log => log.status === 'active')
      const activeUsers = new Set(activeLogs.map(log => log.discord_id)).size
      const completedLogs = logs.filter(log => log.status === 'completed' && log.duration)
      const totalHours = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const averageSessionTime = completedLogs.length > 0 ? totalHours / completedLogs.length : 0

      // Calculate today's statistics
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayLogs = logs.filter(log => new Date(log.created_at) >= today)
      const todayCompleted = todayLogs.filter(log => log.status === 'completed' && log.duration)
      const todayHours = todayCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)
      const todayActiveUsers = new Set(todayLogs.map(log => log.discord_id)).size

      // Calculate weekly statistics
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const weeklyLogs = logs.filter(log => new Date(log.created_at) >= startOfWeek)
      const weeklyCompleted = weeklyLogs.filter(log => log.status === 'completed' && log.duration)
      const weeklyHours = weeklyCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)
      const weeklyUniqueUsers = new Set(weeklyLogs.map(log => log.discord_id)).size

      // Calculate department statistics
      const departments = ['PD', 'EMS', 'Mechanic', 'Merry weather']
      const departmentStats: DepartmentStats[] = departments.map(dept => {
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

      return {
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
    } catch (error) {
      console.error('Calculate admin statistics error:', error)
      throw error
    }
  }

  static async getUserDutyHistory(
    adminDiscordId: string,
    targetUserId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ dutyLogs: AdminDutyLogData[], pagination: any, userStats: any }> {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured')
      }

      // Check if user is admin
      const isAdmin = await this.isUserAdmin(adminDiscordId, process.env.GUILD_ID || '')
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Get user's duty logs with pagination
      const { data: dutyLogs, error, count } = await supabase
        .from('duty_logs')
        .select('*', { count: 'exact' })
        .eq('discord_id', targetUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error('Error fetching user duty history:', error)
        throw new Error('Failed to fetch user duty history')
      }

      // Calculate user-specific statistics
      const { data: allUserLogs } = await supabase
        .from('duty_logs')
        .select('*')
        .eq('discord_id', targetUserId)

      const userLogs = allUserLogs || []
      const completedLogs = userLogs.filter(log => log.status === 'completed' && log.duration)
      const totalHours = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const averageSessionTime = completedLogs.length > 0 ? totalHours / completedLogs.length : 0

      // Today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayLogs = userLogs.filter(log => new Date(log.created_at) >= today)
      const todayCompleted = todayLogs.filter(log => log.status === 'completed' && log.duration)
      const todayHours = todayCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)

      // Weekly stats
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const weeklyLogs = userLogs.filter(log => new Date(log.created_at) >= startOfWeek)
      const weeklyCompleted = weeklyLogs.filter(log => log.status === 'completed' && log.duration)
      const weeklyHours = weeklyCompleted.reduce((sum, log) => sum + (log.duration || 0), 0)

      const userStats = {
        totalHours: Math.round(totalHours * 100) / 100,
        totalSessions: completedLogs.length,
        averageSessionTime: Math.round(averageSessionTime * 100) / 100,
        todayHours: Math.round(todayHours * 100) / 100,
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        isCurrentlyOnDuty: userLogs.some(log => log.status === 'active'),
        lastSession: userLogs.length > 0 ? userLogs[0] : null
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        dutyLogs: dutyLogs || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages
        },
        userStats
      }
    } catch (error) {
      console.error('Get user duty history error:', error)
      throw error
    }
  }

  static async exportDutyLogs(
    adminDiscordId: string,
    filters: any = {},
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured')
      }

      // Check if user is admin
      const isAdmin = await this.isUserAdmin(adminDiscordId, process.env.GUILD_ID || '')
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      let query = supabase.from('duty_logs').select('*')

      // Apply filters
      if (filters.department) query = query.eq('department', filters.department)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

      const { data: logs, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error('Failed to export duty logs')
      }

      if (format === 'json') {
        return JSON.stringify(logs, null, 2)
      }

      // CSV format
      if (!logs || logs.length === 0) {
        return 'No data available'
      }

      const headers = [
        'ID', 'Discord ID', 'Username', 'Character Name', 'Department', 'Rank', 
        'Call Sign', 'Clock In', 'Clock Out', 'Duration (hours)', 'Location', 
        'Notes', 'Status', 'Created At'
      ]

      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.id,
          log.discord_id,
          `"${log.username}"`,
          `"${log.character_name}"`,
          log.department,
          `"${log.rank}"`,
          log.call_sign,
          log.clock_in,
          log.clock_out || '',
          log.duration || '',
          `"${log.location || ''}"`,
          `"${log.notes || ''}"`,
          log.status,
          log.created_at
        ].join(','))
      ]

      return csvRows.join('\n')
    } catch (error) {
      console.error('Export duty logs error:', error)
      throw error
    }
  }

  static async getActiveSessions(adminDiscordId: string): Promise<AdminDutyLogData[]> {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured')
      }

      // Check if user is admin
      const isAdmin = await this.isUserAdmin(adminDiscordId, process.env.GUILD_ID || '')
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      const { data: activeSessions, error } = await supabase
        .from('duty_logs')
        .select('*')
        .eq('status', 'active')
        .order('clock_in', { ascending: false })

      if (error) {
        console.error('Error fetching active sessions:', error)
        throw new Error('Failed to fetch active sessions')
      }

      return activeSessions || []
    } catch (error) {
      console.error('Get active sessions error:', error)
      throw error
    }
  }
} 