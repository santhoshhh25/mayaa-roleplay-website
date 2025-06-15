'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaDiscord, 
  FaClock, 
  FaCalendarAlt,
  FaUser,
  FaHistory,
  FaSignOutAlt,
  FaBriefcase,
  FaClipboardList,
  FaMapMarkerAlt,
  FaAward,
  FaExclamationTriangle,
  FaUsers,
  FaChartBar,
  FaCog,
  FaFilter,
  FaDownload,
  FaSearch,
  FaSyncAlt,
  FaEye
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { DiscordAuth, DiscordUser } from '../../lib/discord-auth'
import { DutyLog } from '../../lib/supabase'
import { AdminAuth } from '../../lib/admin-auth'

interface DutyLogStatistics {
  todayHours: number
  weeklyHours: number
  totalHours: number
  isOnDuty: boolean
  activeSession: DutyLog | null
}

interface DutyLogResponse {
  dutyLogs: DutyLog[]
  statistics: DutyLogStatistics
}

// Admin interfaces
interface AdminDutyLogData {
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

interface DepartmentStats {
  department: string
  totalUsers: number
  activeUsers: number
  totalHours: number
  averageSessionTime: number
  totalSessions: number
}

interface AdminStatistics {
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

interface AdminDutyLogsResponse {
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

const DutyLogsPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // No loading screen - immediate render
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [dutyData, setDutyData] = useState<DutyLogResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Admin functionality state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminData, setAdminData] = useState<AdminDutyLogsResponse | null>(null)
  const [activeSessions, setActiveSessions] = useState<AdminDutyLogData[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  
  // Admin filters and pagination
  const [adminCurrentPage, setAdminCurrentPage] = useState(1)
  const [adminFilters, setAdminFilters] = useState({
    department: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })
  const [showAdminFilters, setShowAdminFilters] = useState(false)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await DiscordAuth.validateStoredSession()
        if (session) {
          setUser(session.user)
          setIsLoggedIn(true)
          await fetchDutyLogs(session.user.id)
          await checkAdminAccess(session.user.id)
        }
      } catch (error) {
        console.warn('Session validation failed:', error)
        DiscordAuth.clearStoredAuth()
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setError(`Discord authentication failed: ${error}`)
        setIsLoading(false)
        return
      }

      if (code && !isLoggedIn && !user) {
        // Clean up URL immediately to prevent reuse
        window.history.replaceState({}, document.title, '/duty-logs')
        
        setIsLoading(true)
        try {
          // Exchange code for access token
          const token = await DiscordAuth.exchangeCodeForToken(code)
          
          // Get user data (this will also store it automatically)
          const userData = await DiscordAuth.getUser(token)
          setUser(userData)

          // Fetch duty logs
          await fetchDutyLogs(userData.id)
          await checkAdminAccess(userData.id)
          
          setIsLoggedIn(true)
        } catch (err) {
          console.error('OAuth error:', err)
          setError(err instanceof Error ? err.message : 'Failed to authenticate with Discord')
        } finally {
          setIsLoading(false)
        }
      }
    }

    // Only run OAuth callback if we're not already checking session
    if (!isLoading) {
      handleOAuthCallback()
    }
  }, [isLoggedIn, user, isLoading])

  const fetchDutyLogs = async (discordId: string) => {
    try {
      const response = await fetch(`/api/duty-logs?discord_id=${discordId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch duty logs: ${response.statusText}`)
      }
      const data: DutyLogResponse = await response.json()
      setDutyData(data)
    } catch (err) {
      console.error('Failed to fetch duty logs:', err)
      setError('Failed to load duty logs')
    }
  }

  // Check if user has admin access
  const checkAdminAccess = async (discordId: string) => {
    try {
      const hasAccess = await AdminAuth.hasAdminAccess(discordId)
      setIsAdmin(hasAccess)
      if (hasAccess) {
        await fetchAdminDutyLogs(discordId, 1)
        await fetchActiveSessions(discordId)
      }
    } catch (err) {
      console.error('Failed to check admin access:', err)
      setIsAdmin(false)
    }
  }

  // Fetch admin duty logs
  const fetchAdminDutyLogs = async (discordId: string, page: number = 1) => {
    setAdminLoading(true)
    setAdminError(null)
    try {
      const params = new URLSearchParams({
        admin_discord_id: discordId,
        page: page.toString(),
        limit: '20',
        ...adminFilters
      })
      
      const response = await fetch(`/api/admin/duty-logs?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch admin duty logs: ${response.statusText}`)
      }
      
      const data: AdminDutyLogsResponse = await response.json()
      setAdminData(data)
      setAdminCurrentPage(page)
    } catch (err) {
      console.error('Failed to fetch admin duty logs:', err)
      setAdminError('Failed to load admin duty logs')
    } finally {
      setAdminLoading(false)
    }
  }

  // Fetch active sessions
  const fetchActiveSessions = async (discordId: string) => {
    try {
      const response = await fetch(`/api/admin/duty-logs/active?admin_discord_id=${discordId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch active sessions: ${response.statusText}`)
      }
      
      const data: AdminDutyLogData[] = await response.json()
      setActiveSessions(data)
    } catch (err) {
      console.error('Failed to fetch active sessions:', err)
    }
  }

  // Export admin data
  const exportAdminData = async (format: 'csv' | 'json' = 'csv') => {
    if (!user) return
    
    try {
      const params = new URLSearchParams({
        admin_discord_id: user.id,
        format,
        ...adminFilters
      })
      
      const response = await fetch(`/api/admin/duty-logs/export?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `duty-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export data:', err)
      setAdminError('Failed to export data')
    }
  }

  // Apply admin filters
  const applyAdminFilters = () => {
    if (user) {
      setAdminCurrentPage(1)
      fetchAdminDutyLogs(user.id, 1)
    }
  }

  // Reset admin filters
  const resetAdminFilters = () => {
    setAdminFilters({
      department: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    })
    if (user) {
      fetchAdminDutyLogs(user.id, 1)
    }
  }

  const handleDiscordLogin = () => {
    setIsLoading(true)
    window.location.href = DiscordAuth.getAuthUrl()
  }

  const handleLogout = () => {
    // Clear stored authentication data
    DiscordAuth.clearStoredAuth()
    
    // Reset component state
    setIsLoggedIn(false)
    setUser(null)
    setDutyData(null)
    setError(null)
    setIsLoading(false)
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'SASP': return 'from-blue-500 to-blue-600'
      case 'EMS': return 'from-green-500 to-green-600'
      case 'Bennys Garage': return 'from-orange-500 to-orange-600'
      case 'Merry Weather': return 'from-yellow-500 to-yellow-600'
      case 'Fire Department': return 'from-red-500 to-red-600'
      case 'DOJ': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Loading state for session check
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-dark">
          <Navbar />
          
          <section className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-card rounded-2xl p-8 md:p-12 text-center max-w-md w-full border border-primary/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </motion.div>
              
              <h1 className="text-2xl font-display font-bold gradient-text mb-4">
                Checking Session
              </h1>
              
              <p className="text-gray-400">
                Validating your authentication...
              </p>
            </motion.div>
          </section>

          <Footer />
        </div>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-dark">
          <Navbar />
          
          <section className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-card rounded-2xl p-8 md:p-12 text-center max-w-md w-full border border-red-500/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaExclamationTriangle className="text-3xl text-red-400" />
              </motion.div>
              
              <h1 className="text-3xl font-display font-bold text-red-400 mb-4">
                Authentication Error
              </h1>
              
              <p className="text-gray-400 mb-8">
                {error}
              </p>

              <motion.button
                onClick={() => {
                  setError(null)
                  window.location.href = '/duty-logs'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-4 rounded-lg font-bold text-lg transition-colors duration-300"
              >
                Try Again
              </motion.button>
            </motion.div>
          </section>

          <Footer />
        </div>
      </PageTransition>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-dark">
          <Navbar />
          
          <section className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-card rounded-2xl p-8 md:p-12 text-center max-w-md w-full border border-primary/20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FaClipboardList className="text-3xl text-primary" />
              </motion.div>
              
              <h1 className="text-3xl font-display font-bold gradient-text mb-4">
                Personal Duty Logs
              </h1>
              
              <p className="text-gray-400 mb-8">
                View your duty hours, sessions, and work history. 
                Discord authentication required for authorized personnel.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>View duty history and statistics</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Track daily & weekly hours</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Monitor active duty sessions</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-blue-400 text-sm">
                  <FaBriefcase className="inline mr-2" />
                  Clock in/out functionality is only available via Discord bot duty panel buttons
                </p>
              </div>

              <motion.button
                onClick={handleDiscordLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className="w-full discord-btn text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <FaDiscord className="text-xl" />
                <span>{isLoading ? 'Authenticating...' : 'Login with Discord'}</span>
              </motion.button>

              <p className="text-xs text-gray-500 mt-4">
                Must be a member of MAYAAALOKAM Discord server with authorized job role
              </p>
            </motion.div>
          </section>

          <Footer />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        <section className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Header with User Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="bg-card rounded-2xl p-6 border border-primary/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left w-full md:w-auto">
                    <div className="flex-shrink-0">
                      {user?.avatar ? (
                        <img 
                          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full border-4 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/20">
                          <FaUser className="text-4xl text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-grow">
                      <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                        {dutyData?.dutyLogs[0]?.character_name || user?.username}
                      </h1>
                      <p className="text-sm text-gray-400">
                        {user?.username}#{user?.discriminator}
                      </p>
                      {dutyData?.dutyLogs[0] && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDepartmentColor(dutyData.dutyLogs[0].department)} text-white`}>
                            {dutyData.dutyLogs[0].rank}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">{dutyData.dutyLogs[0].department}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    {/* Mobile Buttons */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                      <div className="text-center p-3 rounded-lg bg-dark/50">
                        <div className="text-xl font-bold text-primary">{formatTime(currentTime)}</div>
                        <div className="text-xs text-gray-400">{formatDate(currentTime)}</div>
                      </div>
                      
                      <div className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg ${
                          dutyData?.statistics.isOnDuty ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                          <div className={`w-2 h-2 rounded-full ${dutyData?.statistics.isOnDuty ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                          <span className="font-semibold text-sm">
                              {dutyData?.statistics.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                          </span>
                      </div>

                      {/* Admin Panel Toggle Button - Mobile */}
                      {isAdmin && (
                        <motion.button
                          onClick={() => {
                            setShowAdminPanel(!showAdminPanel)
                            // Refresh personal duty logs when switching to personal view
                            if (showAdminPanel && user) {
                              fetchDutyLogs(user.id)
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`col-span-2 flex items-center justify-center space-x-2 px-3 py-3 rounded-lg border transition-colors duration-200 ${
                            showAdminPanel 
                              ? 'bg-primary/30 text-primary border-primary/30' 
                              : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/20'
                          }`}
                          title={showAdminPanel ? 'Switch to Your Personal Duty Logs' : 'Switch to Admin Panel (All Users)'}
                        >
                          <FaCog className="text-lg" />
                          <span className="font-semibold text-sm">{showAdminPanel ? 'My Duty Logs' : 'Admin Panel'}</span>
                        </motion.button>
                      )}

                      <motion.button
                          onClick={handleLogout}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="col-span-2 flex items-center justify-center space-x-2 px-3 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors duration-200"
                          title="Logout"
                      >
                          <FaSignOutAlt className="text-lg" />
                          <span className="font-semibold text-sm">Logout</span>
                      </motion.button>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{formatTime(currentTime)}</div>
                        <div className="text-sm text-gray-400">{formatDate(currentTime)}</div>
                      </div>
                      
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                        dutyData?.statistics.isOnDuty ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${dutyData?.statistics.isOnDuty ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="font-semibold">
                          {dutyData?.statistics.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                        </span>
                      </div>

                      {/* Admin Panel Toggle Button */}
                      {isAdmin && (
                        <motion.button
                          onClick={() => {
                            setShowAdminPanel(!showAdminPanel)
                            // Refresh personal duty logs when switching to personal view
                            if (showAdminPanel && user) {
                              fetchDutyLogs(user.id)
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                            showAdminPanel 
                              ? 'bg-primary/30 text-primary border-primary/30' 
                              : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/20'
                          }`}
                          title={showAdminPanel ? 'Switch to Your Personal Duty Logs' : 'Switch to Admin Panel (All Users)'}
                        >
                          <FaCog className="text-sm" />
                          <span className="font-semibold">{showAdminPanel ? 'My Logs' : 'Admin'}</span>
                        </motion.button>
                      )}

                      <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors duration-200"
                        title="Logout"
                      >
                        <FaSignOutAlt className="text-sm" />
                        <span className="font-semibold">Logout</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Conditional Content: Personal View or Admin Panel */}
            {showAdminPanel && isAdmin ? (
              /* Admin Panel Content */
              <>
                {/* Admin Statistics Dashboard */}
                {adminData?.statistics && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8"
                  >
                    <div className="bg-card rounded-xl p-6 border border-primary/20">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center">
                          <FaChartBar className="mr-3 text-primary" />
                          Administrative Overview
                        </h2>
                        <motion.button
                          onClick={() => user && fetchAdminDutyLogs(user.id, adminCurrentPage)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors duration-200"
                        >
                          <FaSyncAlt className="text-sm" />
                          <span>Refresh</span>
                        </motion.button>
                      </div>

                      {/* Overall Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400">{adminData.statistics.totalUsers}</div>
                          <div className="text-sm text-gray-400">Total Users</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-400">{adminData.statistics.totalActiveUsers}</div>
                          <div className="text-sm text-gray-400">Active Users</div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-400">{formatDuration(adminData.statistics.totalHours)}</div>
                          <div className="text-sm text-gray-400">Total Hours</div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-400">{adminData.statistics.todayStats.totalSessions}</div>
                          <div className="text-sm text-gray-400">Today's Sessions</div>
                        </div>
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-pink-400">{formatDuration(adminData.statistics.averageSessionTime)}</div>
                          <div className="text-sm text-gray-400">Avg Session</div>
                        </div>
                      </div>

                      {/* Department Statistics */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Department Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {adminData.statistics.departmentStats.map((dept) => (
                            <div key={dept.department} className="bg-dark/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white">{dept.department}</span>
                                <span className="text-sm text-gray-400">{dept.activeUsers}/{dept.totalUsers}</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatDuration(dept.totalHours)} total • {dept.totalSessions} sessions
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Active Sessions Monitor */}
                {activeSessions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-8"
                  >
                    <div className="bg-card rounded-xl p-6 border border-green-500/20">
                      <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3" />
                        Live Active Sessions ({activeSessions.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-white">{session.character_name}</span>
                              <span className="text-xs text-green-400">{session.department}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Started: {formatTime(session.clock_in)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {session.username} • {session.rank}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Admin Filters */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="bg-card rounded-xl p-6 border border-primary/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                      <h2 className="text-xl font-display font-bold text-white flex items-center">
                        <FaFilter className="mr-3 text-primary" />
                        Filters & Export
                      </h2>
                      
                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={() => setShowAdminFilters(!showAdminFilters)}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors duration-200"
                        >
                          <FaFilter className="text-sm" />
                          <span>{showAdminFilters ? 'Hide' : 'Show'} Filters</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => exportAdminData('csv')}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200"
                        >
                          <FaDownload className="text-sm" />
                          <span>Export CSV</span>
                        </motion.button>
                      </div>
                    </div>

                    {showAdminFilters && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Department</label>
                            <select
                              value={adminFilters.department}
                              onChange={(e) => setAdminFilters({...adminFilters, department: e.target.value})}
                              className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                            >
                              <option value="">All Departments</option>
                              <option value="SASP">SASP</option>
                              <option value="EMS">EMS</option>
                              <option value="Bennys Garage">Bennys Garage</option>
                              <option value="Merry Weather">Merry Weather</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Status</label>
                            <select
                              value={adminFilters.status}
                              onChange={(e) => setAdminFilters({...adminFilters, status: e.target.value})}
                              className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                            >
                              <option value="">All Status</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">From Date</label>
                            <input
                              type="date"
                              value={adminFilters.dateFrom}
                              onChange={(e) => setAdminFilters({...adminFilters, dateFrom: e.target.value})}
                              className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">To Date</label>
                            <input
                              type="date"
                              value={adminFilters.dateTo}
                              onChange={(e) => setAdminFilters({...adminFilters, dateTo: e.target.value})}
                              className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Search</label>
                            <input
                              type="text"
                              placeholder="Username, character..."
                              value={adminFilters.search}
                              onChange={(e) => setAdminFilters({...adminFilters, search: e.target.value})}
                              className="w-full bg-dark border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <motion.button
                            onClick={applyAdminFilters}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark rounded-lg font-semibold transition-colors duration-200"
                          >
                            <FaSearch className="text-sm" />
                            <span>Apply Filters</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={resetAdminFilters}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-2 px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors duration-200"
                          >
                            <span>Reset</span>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Admin Duty Logs Table */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="bg-card rounded-xl border border-primary/20 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h2 className="text-xl font-display font-bold text-white flex items-center">
                        <FaUsers className="mr-3 text-primary" />
                        All Staff Duty Logs
                        {adminData?.pagination && (
                          <span className="ml-2 text-sm text-gray-400">
                            ({adminData.pagination.total} total)
                          </span>
                        )}
                      </h2>
                    </div>

                    {adminLoading ? (
                      <div className="p-8 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className="text-gray-400">Loading admin data...</p>
                      </div>
                    ) : adminError ? (
                      <div className="p-8 text-center">
                        <FaExclamationTriangle className="text-3xl text-red-400 mx-auto mb-4" />
                        <p className="text-red-400">{adminError}</p>
                      </div>
                    ) : adminData?.dutyLogs.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        No duty logs found matching your criteria.
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-dark/50">
                              <tr>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Character</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Department</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Duration</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminData?.dutyLogs.map((log) => (
                                <tr key={log.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="text-white font-semibold">{log.username}</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="text-white">{log.character_name}</div>
                                    <div className="text-sm text-gray-400">{log.rank}</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getDepartmentColor(log.department)} text-white`}>
                                      {log.department}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    {log.duration ? (
                                      <span className="text-green-400 font-semibold">
                                        {formatDuration(log.duration)}
                                      </span>
                                    ) : (
                                      <span className="text-yellow-400">Active</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      log.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-400 text-sm">
                                    {formatDate(log.clock_in)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                          {adminData?.dutyLogs.map((log) => (
                            <div key={log.id} className="bg-dark/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="font-semibold text-white">{log.username}</div>
                                  <div className="text-sm text-gray-400">{log.character_name}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  log.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getDepartmentColor(log.department)} text-white`}>
                                  {log.department}
                                </span>
                                <span className="text-gray-400">{formatDate(log.clock_in)}</span>
                              </div>
                              {log.duration && (
                                <div className="mt-2 text-green-400 font-semibold">
                                  Duration: {formatDuration(log.duration)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {adminData?.pagination && adminData.pagination.totalPages > 1 && (
                          <div className="p-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Showing {((adminData.pagination.page - 1) * adminData.pagination.limit) + 1} to {Math.min(adminData.pagination.page * adminData.pagination.limit, adminData.pagination.total)} of {adminData.pagination.total} entries
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  onClick={() => user && fetchAdminDutyLogs(user.id, adminCurrentPage - 1)}
                                  disabled={adminCurrentPage <= 1}
                                  whileHover={{ scale: adminCurrentPage > 1 ? 1.05 : 1 }}
                                  className={`px-3 py-1 rounded text-sm ${
                                    adminCurrentPage <= 1 
                                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' 
                                      : 'bg-primary/20 hover:bg-primary/30 text-primary'
                                  }`}
                                >
                                  Previous
                                </motion.button>
                                
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded text-sm">
                                  {adminCurrentPage} of {adminData.pagination.totalPages}
                                </span>
                                
                                <motion.button
                                  onClick={() => user && fetchAdminDutyLogs(user.id, adminCurrentPage + 1)}
                                  disabled={adminCurrentPage >= adminData.pagination.totalPages}
                                  whileHover={{ scale: adminCurrentPage < adminData.pagination.totalPages ? 1.05 : 1 }}
                                  className={`px-3 py-1 rounded text-sm ${
                                    adminCurrentPage >= adminData.pagination.totalPages 
                                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' 
                                      : 'bg-primary/20 hover:bg-primary/30 text-primary'
                                  }`}
                                >
                                  Next
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              /* Personal View Content (existing content) */
              <>
                {/* Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
              <div className="bg-card rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FaClock className="text-2xl text-blue-400" />
                  <div className="text-2xl font-bold text-blue-400">
                    {formatDuration(dutyData?.statistics.todayHours || 0)}
                  </div>
                </div>
                <div className="text-gray-400">Today's Hours</div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <FaCalendarAlt className="text-2xl text-green-400" />
                  <div className="text-2xl font-bold text-green-400">
                    {formatDuration(dutyData?.statistics.weeklyHours || 0)}
                  </div>
                </div>
                <div className="text-gray-400">This Week</div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <FaAward className="text-2xl text-primary" />
                  <div className="text-2xl font-bold text-primary">
                    {formatDuration(dutyData?.statistics.totalHours || 0)}
                  </div>
                </div>
                <div className="text-gray-400">Total Hours</div>
              </div>
            </motion.div>

            {/* Active Session Alert */}
            {dutyData?.statistics.activeSession && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-green-400 mb-2">🟢 Currently On Duty</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Started:</span>
                    <span className="ml-2 text-white">{formatTime(dutyData.statistics.activeSession.clock_in)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Character:</span>
                    <span className="ml-2 text-white">{dutyData.statistics.activeSession.character_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rank:</span>
                    <span className="ml-2 text-white">{dutyData.statistics.activeSession.rank}</span>
                  </div>
                </div>
                {dutyData.statistics.activeSession.notes && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <span className="text-gray-400">Notes:</span>
                    <span className="ml-2 text-white">{dutyData.statistics.activeSession.notes}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Discord Buttons Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8"
            >
              <h3 className="text-lg font-display font-bold text-blue-400 mb-4 flex items-center">
                <FaDiscord className="mr-3" />
                Discord Duty Log Panel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">🟢 Clock In</span>
                  <span className="text-gray-400">Start your duty shift with character details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-semibold">🔴 Clock Out</span>
                  <span className="text-gray-400">End your duty shift</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ℹ️ Use the Discord duty log panel buttons to clock in/out. Character name, department, rank, and call sign are required for clock in. View detailed statistics and history on this web dashboard.
                </p>
              </div>
            </motion.div>

            {/* Duty History */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-card rounded-xl overflow-hidden border border-primary/20"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold text-white flex items-center">
                      <FaHistory className="mr-3 text-primary" />
                      Your Duty History
                      {isAdmin && (
                        <span className="ml-3 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-semibold">
                          Personal View
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {isAdmin 
                        ? 'Your personal duty sessions and hours (Admin viewing own logs)' 
                        : 'Recent duty sessions and hours worked'
                      }
                    </p>
                  </div>
                  {isAdmin && (
                    <motion.button
                      onClick={() => user && fetchDutyLogs(user.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors duration-200 text-sm"
                      title="Refresh your personal duty logs"
                    >
                      <FaSyncAlt className="text-xs" />
                      <span>Refresh</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead className="bg-dark/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Date</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Clock In</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Clock Out</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Duration</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Character</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Department</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dutyData?.dutyLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-6 text-center">
                          <div className="text-gray-400 mb-2">
                            No personal duty logs found.
                          </div>
                          {isAdmin ? (
                            <div className="text-sm">
                              <p className="text-blue-400 mb-1">
                                👨‍💼 You have admin access but no personal duty logs yet.
                              </p>
                              <p className="text-gray-400">
                                Use Discord duty log buttons to clock in/out if you have a job role, or switch to Admin Panel to manage all users.
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400">
                              Use Discord duty log buttons to clock in/out.
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      dutyData?.dutyLogs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 text-white text-sm">
                            {formatDate(log.clock_in)}
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                            {formatTime(log.clock_in)}
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                            {log.clock_out ? formatTime(log.clock_out) : <span className="text-yellow-400">In Progress</span>}
                          </td>
                          <td className="py-4 px-6 text-primary font-semibold text-sm">
                            {log.duration ? formatDuration(log.duration) : '-'}
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{log.character_name}</span>
                              <span className="text-xs text-gray-400">{log.call_sign}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                             <div className="flex flex-col">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getDepartmentColor(log.department)} text-white`}>
                                {log.department}
                              </span>
                              <span className="text-xs text-gray-400 mt-1">{log.rank}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-400 text-xs max-w-xs truncate">
                            {log.notes || '-'}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden">
                {dutyData?.dutyLogs.length === 0 ? (
                  <div className="py-8 px-6 text-center">
                    <div className="text-gray-400 mb-3">
                      No personal duty logs found.
                    </div>
                    {isAdmin ? (
                      <div className="text-sm space-y-2">
                        <p className="text-blue-400">
                          👨‍💼 You have admin access but no personal duty logs yet.
                        </p>
                        <p className="text-gray-400">
                          Use Discord duty log buttons to clock in/out if you have a job role, or switch to Admin Panel to manage all users.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        Use Discord duty log buttons to clock in/out.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {dutyData?.dutyLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-dark/50 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-white">{formatDate(log.clock_in)}</span>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getDepartmentColor(log.department)} text-white`}>
                              {log.department}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-400">Clock In</p>
                            <p className="text-white font-medium">{formatTime(log.clock_in)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Clock Out</p>
                            <p className="text-white font-medium">{log.clock_out ? formatTime(log.clock_out) : <span className="text-yellow-400">In Progress</span>}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-400">Duration</p>
                          <p className="text-primary font-bold text-lg">{log.duration ? formatDuration(log.duration) : '-'}</p>
                        </div>
                        
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <FaUser className="text-primary" />
                            <div>
                              <p className="text-white font-semibold">{log.character_name}</p>
                              <p className="text-gray-400 text-xs">{log.rank} • {log.call_sign}</p>
                            </div>
                          </div>
                          {log.notes && (
                            <p className="text-gray-300 text-xs bg-black/20 p-2 rounded">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
              </>
            )}

          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default DutyLogsPage 