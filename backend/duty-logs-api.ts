import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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

export interface UserProfile {
  discord_id: string
  username: string
  character_name: string
  department: string
  rank: string
  call_sign: string
  created_at?: string
  updated_at?: string
}

export interface Department {
  id: number
  name: string
  abbreviation: string
  emoji: string
}

export interface Rank {
  id: number
  name: string
  hierarchy_level: number
  department_id: number
}

export class DutyLogsAPI {
  static async clockIn(data: DutyLogData): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
      const connectionCheck = checkSupabaseConnection()
      if (!connectionCheck.available) {
        console.error('Clock in failed - Supabase not available:', connectionCheck.error)
        return { success: false, message: connectionCheck.error || 'Database connection not configured' }
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
        
        // Enhanced error handling for common Supabase issues
        if (checkError.message && checkError.message.includes('Project not specified')) {
          console.error('❌ Supabase "Project not specified" error detected')
          console.error('   This usually indicates a configuration issue with your Supabase URL or keys')
          return { success: false, message: 'Database configuration error. Please verify Supabase settings.' }
        }
        
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

      // Update user profile with latest data
      await this.createOrUpdateUserProfile({
        discord_id: data.discord_id,
        username: data.username,
        character_name: data.character_name,
        department: data.department,
        rank: data.rank,
        call_sign: data.call_sign
      })

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
        message: '',  // No message for silent operation
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
        message: '',  // No message for silent operation
        duration: Math.round(durationInHours * 100) / 100
      }
    } catch (error) {
      console.error('Clock out error:', error)
      return { success: false, message: 'An unexpected error occurred during clock out' }
    }
  }

  static async getActiveSession(discordId: string): Promise<{ hasActiveSession: boolean; session?: any }> {
    try {
      const connectionCheck = checkSupabaseConnection()
      if (!connectionCheck.available) {
        console.error('Get active session failed - Supabase not available:', connectionCheck.error)
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
        
        // Enhanced error handling for common Supabase issues
        if (error.message && error.message.includes('Project not specified')) {
          console.error('❌ Supabase "Project not specified" error in getActiveSession')
          console.error('   This usually indicates a configuration issue with your Supabase URL or keys')
        }
        
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

  // User Profile Management
  static async getUserProfile(discordId: string): Promise<{ profile: UserProfile | null; isFirstTime: boolean }> {
    try {
      const connectionCheck = checkSupabaseConnection()
      if (!connectionCheck.available) {
        console.error('Get user profile failed - Supabase not available:', connectionCheck.error)
        return { profile: null, isFirstTime: true }
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('discord_id', discordId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        
        // Enhanced error handling for common Supabase issues
        if (error.message && error.message.includes('Project not specified')) {
          console.error('❌ Supabase "Project not specified" error in getUserProfile')
          console.error('   This usually indicates a configuration issue with your Supabase URL or keys')
        }
        
        return { profile: null, isFirstTime: true }
      }

      return {
        profile: profile || null,
        isFirstTime: !profile
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { profile: null, isFirstTime: true }
    }
  }

  static async createOrUpdateUserProfile(profileData: UserProfile): Promise<{ success: boolean; message: string }> {
    try {
      if (!supabase) {
        return { success: false, message: 'Database connection not configured' }
      }

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          discord_id: profileData.discord_id,
          username: profileData.username,
          character_name: profileData.character_name,
          department: profileData.department,
          rank: profileData.rank,
          call_sign: profileData.call_sign,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'discord_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error creating/updating user profile:', error)
        return { success: false, message: 'Failed to save user profile' }
      }

      return { success: true, message: 'Profile saved successfully' }
    } catch (error) {
      console.error('Create/update user profile error:', error)
      return { success: false, message: 'An unexpected error occurred while saving profile' }
    }
  }

  static async promoteUser(discordId: string, newRank: string, promotedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!supabase) {
        return { success: false, message: 'Database connection not configured' }
      }

      // Get current profile
      const { profile } = await this.getUserProfile(discordId)
      if (!profile) {
        return { success: false, message: 'User profile not found' }
      }

      // Update profile with new rank
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          rank: newRank,
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', discordId)

      if (updateError) {
        console.error('Error promoting user:', updateError)
        return { success: false, message: 'Failed to update user rank' }
      }

      // Log the promotion
      const { error: logError } = await supabase
        .from('promotion_logs')
        .insert({
          discord_id: discordId,
          username: profile.username,
          character_name: profile.character_name,
          department: profile.department,
          old_rank: profile.rank,
          new_rank: newRank,
          promoted_by: promotedBy,
          promoted_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging promotion:', logError)
        // Don't fail the promotion if logging fails
      }

      return { 
        success: true, 
        message: `${profile.character_name} promoted from ${profile.rank} to ${newRank}` 
      }
    } catch (error) {
      console.error('Promote user error:', error)
      return { success: false, message: 'An unexpected error occurred during promotion' }
    }
  }

  static async getDepartmentRanks(department: string): Promise<string[]> {
    const rankHierarchy: { [key: string]: string[] } = {
      'SASP': [
        'Cadet',
        'Officer I',
        'Officer II',
        'Officer III',
        'Senior Officer',
        'Corporal',
        'Sergeant',
        'Lieutenant',
        'Captain',
        'Deputy Chief',
        'Chief of Police'
      ],
      'Emergency Medical Services': [
        'EMT Basic',
        'EMT Advanced',
        'Paramedic',
        'Senior Paramedic',
        'Field Supervisor',
        'Operations Manager',
        'Assistant Chief',
        'EMS Chief'
      ],
      'Bennys Garage': [
        'Apprentice',
        'Mechanic I',
        'Mechanic II',
        'Senior Mechanic',
        'Lead Mechanic',
        'Shop Supervisor',
        'Service Manager'
      ],
      'Merry Weather': [
        'Recruit',
        'Security Officer',
        'Senior Officer',
        'Team Leader',
        'Supervisor',
        'Operations Manager',
        'Regional Director'
      ]
    }

    return rankHierarchy[department] || ['Member']
  }

  static async getDepartments(): Promise<Department[]> {
    try {
      const connectionCheck = checkSupabaseConnection()
      if (!connectionCheck.available) {
        console.error('Get departments failed - Supabase not available:', connectionCheck.error)
        // Return fallback departments if database is not available
        return [
          { id: 1, name: 'SASP', abbreviation: 'SASP', emoji: '🚔' },
          { id: 2, name: 'Emergency Medical Services', abbreviation: 'EMS', emoji: '🚑' },
          { id: 3, name: 'Bennys Garage', abbreviation: 'BENNYS', emoji: '🔧' },
          { id: 4, name: 'Merry Weather', abbreviation: 'MW', emoji: '🛡️' }
        ]
      }

      const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching departments:', error)
        
        // Enhanced error handling for common Supabase issues
        if (error.message && error.message.includes('Project not specified')) {
          console.error('❌ Supabase "Project not specified" error in getDepartments')
          console.error('   This usually indicates a configuration issue with your Supabase URL or keys')
        }
        
        // Return fallback departments if there's an error
        return [
          { id: 1, name: 'SASP', abbreviation: 'SASP', emoji: '🚔' },
          { id: 2, name: 'Emergency Medical Services', abbreviation: 'EMS', emoji: '🚑' },
          { id: 3, name: 'Bennys Garage', abbreviation: 'BENNYS', emoji: '🔧' },
          { id: 4, name: 'Merry Weather', abbreviation: 'MW', emoji: '🛡️' }
        ]
      }

      return departments || []
    } catch (error) {
      console.error('Get departments error:', error)
      // Return fallback departments if there's an unexpected error
      return [
        { id: 1, name: 'SASP', abbreviation: 'SASP', emoji: '🚔' },
        { id: 2, name: 'Emergency Medical Services', abbreviation: 'EMS', emoji: '🚑' },
        { id: 3, name: 'Bennys Garage', abbreviation: 'BENNYS', emoji: '🔧' },
        { id: 4, name: 'Merry Weather', abbreviation: 'MW', emoji: '🛡️' }
      ]
    }
  }

  static async getRanksByDepartment(departmentName: string): Promise<Rank[]> {
    try {
      const connectionCheck = checkSupabaseConnection()
      if (!connectionCheck.available) {
        console.error('Get ranks by department failed - Supabase not available:', connectionCheck.error)
        // Return fallback ranks based on department
        return this.getFallbackRanks(departmentName)
      }

      // First get the department ID
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', departmentName)
        .single()

      if (deptError || !department) {
        console.error('Error fetching department:', deptError)
        // Return fallback ranks if department lookup fails
        return this.getFallbackRanks(departmentName)
      }

      // Then get the ranks for that department
      const { data: ranks, error: ranksError } = await supabase
        .from('ranks')
        .select('*')
        .eq('department_id', department.id)
        .order('hierarchy_level')

      if (ranksError) {
        console.error('Error fetching ranks:', ranksError)
        // Return fallback ranks if ranks lookup fails
        return this.getFallbackRanks(departmentName)
      }

      return ranks || this.getFallbackRanks(departmentName)
    } catch (error) {
      console.error('Get ranks by department error:', error)
      // Return fallback ranks if there's an unexpected error
      return this.getFallbackRanks(departmentName)
    }
  }

  // Helper method to provide fallback ranks when database is unavailable
  private static getFallbackRanks(departmentName: string): Rank[] {
    const rankHierarchy: { [key: string]: string[] } = {
      'SASP': [
        'Cadet',
        'Officer I',
        'Officer II',
        'Officer III',
        'Senior Officer',
        'Corporal',
        'Sergeant',
        'Lieutenant',
        'Captain',
        'Deputy Chief',
        'Chief of Police'
      ],
      'Emergency Medical Services': [
        'EMT Basic',
        'EMT Advanced',
        'Paramedic',
        'Senior Paramedic',
        'Field Supervisor',
        'Operations Manager',
        'Assistant Chief',
        'EMS Chief'
      ],
      'Bennys Garage': [
        'Apprentice',
        'Mechanic I',
        'Mechanic II',
        'Senior Mechanic',
        'Lead Mechanic',
        'Shop Supervisor',
        'Service Manager'
      ],
      'Merry Weather': [
        'Recruit',
        'Security Officer',
        'Senior Officer',
        'Team Leader',
        'Supervisor',
        'Operations Manager',
        'Regional Director'
      ]
    }

    const ranks = rankHierarchy[departmentName] || ['Member']
    
    // Convert string array to Rank objects
    return ranks.map((rankName, index) => ({
      id: index + 1,
      name: rankName,
      hierarchy_level: index + 1,
      department_id: 1 // Fallback department ID
    }))
  }
} 