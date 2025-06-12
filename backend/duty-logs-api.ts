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

export interface DutyLogData {
  discord_id: string
  username: string
  character_name: string
  department: string
  rank: string
  call_sign: string
  location?: string
  notes?: string
}

export class DutyLogsAPI {
  static async clockIn(data: DutyLogData): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
      if (!supabase) {
        return { success: false, message: 'Database connection not configured' }
      }

      // Check if user already has an active session
      const { data: existingSession, error: checkError } = await supabase
        .from('duty_logs')
        .select('id')
        .eq('discord_id', data.discord_id)
        .eq('status', 'active')
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error checking existing session:', checkError)
        
        // If we're getting HTML instead of JSON, it's likely a configuration issue
        if (typeof checkError.message === 'string' && checkError.message.includes('<!DOCTYPE html>')) {
          console.error('❌ Received HTML response from Supabase - check your URL and keys')
          return { success: false, message: 'Database configuration error. Please verify Supabase settings.' }
        }
        
        return { success: false, message: 'Failed to check existing duty session' }
      }

      if (existingSession) {
        return { success: false, message: 'You are already clocked in! Please clock out first.' }
      }

      // Create new duty session
      const { data: newSession, error: insertError } = await supabase
        .from('duty_logs')
        .insert({
          discord_id: data.discord_id,
          username: data.username,
          character_name: data.character_name,
          department: data.department,
          rank: data.rank,
          call_sign: data.call_sign,
          clock_in: new Date().toISOString(),
          location: data.location,
          notes: data.notes,
          status: 'active'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Error creating duty session:', insertError)
        return { success: false, message: 'Failed to create duty session' }
      }

      return { 
        success: true, 
        message: `Successfully clocked in as ${data.character_name} (${data.rank})!`,
        sessionId: newSession.id
      }
    } catch (error) {
      console.error('Clock in error:', error)
      return { success: false, message: 'An unexpected error occurred during clock in' }
    }
  }

  static async clockOut(discordId: string, notes?: string): Promise<{ success: boolean; message: string; duration?: number }> {
    try {
      if (!supabase) {
        return { success: false, message: 'Database connection not configured' }
      }

      // Find active session
      const { data: activeSession, error: findError } = await supabase
        .from('duty_logs')
        .select('*')
        .eq('discord_id', discordId)
        .eq('status', 'active')
        .single()

      if (findError || !activeSession) {
        return { success: false, message: 'No active duty session found. You need to clock in first!' }
      }

      const clockInTime = new Date(activeSession.clock_in)
      const clockOutTime = new Date()
      const durationInHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

      // Update session with clock out information
      const { error: updateError } = await supabase
        .from('duty_logs')
        .update({
          clock_out: clockOutTime.toISOString(),
          duration: Math.round(durationInHours * 100) / 100, // Round to 2 decimal places
          status: 'completed',
          notes: notes || activeSession.notes,
          updated_at: clockOutTime.toISOString()
        })
        .eq('id', activeSession.id)

      if (updateError) {
        console.error('Error updating duty session:', updateError)
        return { success: false, message: 'Failed to clock out' }
      }

      const hours = Math.floor(durationInHours)
      const minutes = Math.round((durationInHours - hours) * 60)

      return {
        success: true,
        message: `Successfully clocked out! Total duty time: ${hours}h ${minutes}m`,
        duration: Math.round(durationInHours * 100) / 100
      }
    } catch (error) {
      console.error('Clock out error:', error)
      return { success: false, message: 'An unexpected error occurred during clock out' }
    }
  }

  static async getActiveSession(discordId: string): Promise<{ hasActiveSession: boolean; session?: any }> {
    try {
      if (!supabase) {
        return { hasActiveSession: false }
      }

      const { data: activeSession, error } = await supabase
        .from('duty_logs')
        .select('*')
        .eq('discord_id', discordId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking active session:', error)
        return { hasActiveSession: false }
      }

      return {
        hasActiveSession: !!activeSession,
        session: activeSession || null
      }
    } catch (error) {
      console.error('Get active session error:', error)
      return { hasActiveSession: false }
    }
  }

  static async getUserStats(discordId: string): Promise<{ todayHours: number; weeklyHours: number; totalHours: number }> {
    try {
      if (!supabase) {
        return { todayHours: 0, weeklyHours: 0, totalHours: 0 }
      }

      const { data: allLogs, error } = await supabase
        .from('duty_logs')
        .select('duration, created_at')
        .eq('discord_id', discordId)
        .eq('status', 'completed')
        .not('duration', 'is', null)

      if (error) {
        console.error('Error fetching user stats:', error)
        return { todayHours: 0, weeklyHours: 0, totalHours: 0 }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())

      const todayLogs = allLogs.filter(log => new Date(log.created_at) >= today)
      const weeklyLogs = allLogs.filter(log => new Date(log.created_at) >= startOfWeek)

      const todayHours = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const weeklyHours = weeklyLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      const totalHours = allLogs.reduce((sum, log) => sum + (log.duration || 0), 0)

      return {
        todayHours: Math.round(todayHours * 100) / 100,
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return { todayHours: 0, weeklyHours: 0, totalHours: 0 }
    }
  }
} 