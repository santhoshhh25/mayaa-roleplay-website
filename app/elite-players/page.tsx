'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCrown, FaTrophy, FaDollarSign, FaUser, FaUniversity, 
  FaChartLine, FaStar, FaSpinner, FaMedal, FaGem,
  FaCoins, FaShieldAlt, FaFire
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import Image from 'next/image'

interface PlayerData {
  id: string
  name: string
  cash: number
  bank: number
  totalWealth: number
  avatar?: string
  rank?: string
}

const ElitePlayersPage = () => {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [isLoading, setIsLoading] = useState(false) // No loading screen


  // Mock data - In real implementation, this would come from your API
  const mockPlayerData: PlayerData[] = [
    {
      id: '1',
      name: 'Raja Reddy',
      cash: 2850000,
      bank: 12750000,
      totalWealth: 15600000,
      rank: 'Diamond Elite',
      avatar: 'https://i.pinimg.com/736x/77/4d/27/774d2791d7a6f7d98e2c711c272c4c6b.jpg'
    },
    {
      id: '2', 
      name: 'Krishna Sharma',
      cash: 1950000,
      bank: 11200000,
      totalWealth: 13150000,
      rank: 'Platinum King',
      avatar: 'https://i.pinimg.com/736x/c6/07/69/c60769c88ab2549a9982e6090c3c46ed.jpg'
    },
    {
      id: '3',
      name: 'Arjun Patel',
      cash: 3200000,
      bank: 9800000,
      totalWealth: 13000000,
      rank: 'Gold Legend',
      avatar: 'https://i.pinimg.com/736x/7e/a1/ff/7ea1ffa773831a72596458aa70146b8c.jpg'
    },
    {
      id: '4',
      name: 'Vikram Singh',
      cash: 1750000,
      bank: 10100000,
      totalWealth: 11850000,
      rank: 'Elite Master'
    },
    {
      id: '5',
      name: 'Ravi Kumar',
      cash: 2100000,
      bank: 8950000,
      totalWealth: 11050000,
      rank: 'Rising Star'
    },
    {
      id: '6',
      name: 'Sanjay Gupta',
      cash: 1650000,
      bank: 8850000,
      totalWealth: 10500000,
      rank: 'High Roller'
    },
    {
      id: '7',
      name: 'Anil Mehta',
      cash: 1850000,
      bank: 8200000,
      totalWealth: 10050000,
      rank: 'Wealthy Elite'
    },
    {
      id: '8',
      name: 'Suresh Rao',
      cash: 1450000,
      bank: 8350000,
      totalWealth: 9800000,
      rank: 'Money Maker'
    },
    {
      id: '9',
      name: 'Deepak Joshi',
      cash: 1950000,
      bank: 7650000,
      totalWealth: 9600000,
      rank: 'Cash King'
    },
    {
      id: '10',
      name: 'Ramesh Iyer',
      cash: 1350000,
      bank: 8150000,
      totalWealth: 9500000,
      rank: 'Elite Member'
    }
  ]

  useEffect(() => {
    // Fetch real player data from API
    const fetchPlayers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/elite-players?limit=10')
        const result = await response.json()
        
        if (result.success) {
          setPlayers(result.data)
        } else {
          console.error('Failed to fetch players:', result.error)
          // Fallback to mock data if API fails
          const sortedPlayers = [...mockPlayerData].sort((a, b) => b.totalWealth - a.totalWealth)
          setPlayers(sortedPlayers)
        }
      } catch (error) {
        console.error('Error fetching elite players:', error)
        // Fallback to mock data if API fails
        const sortedPlayers = [...mockPlayerData].sort((a, b) => b.totalWealth - a.totalWealth)
        setPlayers(sortedPlayers)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <FaCrown className="text-yellow-400" />
      case 2: return <FaTrophy className="text-gray-300" />
      case 3: return <FaMedal className="text-amber-600" />
      default: return <FaStar className="text-primary" />
    }
  }

  const getRankIconOverlay = (position: number) => {
    switch (position) {
      case 1: return <FaCrown className="text-black" />
      case 2: return <FaTrophy className="text-black" />
      case 3: return <FaMedal className="text-black" />
      default: return <FaStar className="text-black" />
    }
  }

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30'
      case 2: return 'from-gray-300/20 to-gray-500/20 border-gray-300/30'
      case 3: return 'from-amber-500/20 to-amber-700/20 border-amber-500/30'
      default: return 'from-primary/10 to-primary/5 border-primary/20'
    }
  }



  const topThree = players.slice(0, 3)
  const remainingPlayers = players.slice(3)

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl" />
            <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 border border-primary/30 shadow-lg"
              >
                <FaCrown className="text-primary text-lg sm:text-xl" />
                <span className="text-primary font-semibold text-sm sm:text-base">Hall of Fame</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text mb-4 sm:mb-6 px-2"
              >
                Elite Players
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
              >
From street hustlers to empire builders - these players wrote their own success stories. <span className="text-primary font-semibold">What will your roleplay legacy be?</span>
              </motion.p>


            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
                  <div className="absolute -top-2 -left-2 w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse" />
                </div>
                <p className="text-gray-400 font-medium">Loading Elite Players...</p>
              </motion.div>
            ) : (
              <>
                {/* Top 3 Players - Premium Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 px-2"
                >
                  {topThree.map((player, index) => (
                                          <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                        className={`relative group w-full ${
                          index === 0 
                            ? 'sm:col-span-2 lg:col-span-1 lg:order-2' 
                            : index === 1 
                              ? 'lg:order-1' 
                              : 'lg:order-3'
                        }`}
                      >
                        <div className={`relative bg-gradient-to-br ${getRankColor(index + 1)} rounded-2xl p-3 sm:p-4 border-2 backdrop-blur-xl hover:scale-105 transition-all duration-500 shadow-2xl overflow-hidden group ${
                          index === 0 ? 'lg:scale-110 ring-2 ring-primary/50 shadow-primary/20' : ''
                        }`}>
                                                  {/* Enhanced Background Pattern */}
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-16 translate-x-16" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-12 -translate-x-12" />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-xl" />
                          </div>

                          {/* Premium Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                  {/* Premium Position Badge */}
                          <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary via-accent to-primary rounded-full flex items-center justify-center shadow-xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-dark font-bold text-sm sm:text-lg drop-shadow-sm">#{index + 1}</span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                          </div>

                          {/* Premium Player Avatar */}
                          <div className="flex justify-center mb-2 sm:mb-3">
                            <div className="relative group/avatar">
                              {player.avatar ? (
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                                  {/* Premium Avatar Ring */}
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-1 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-full h-full rounded-full bg-dark/20 p-0.5">
                                      <Image
                                        src={player.avatar}
                                        alt={`${player.name} avatar`}
                                        fill
                                        className="rounded-full object-cover shadow-inner"
                                        sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                                      />
                                    </div>
                                  </div>
                                  {/* Rank Icon Overlay */}
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <div className="text-xs sm:text-sm lg:text-base drop-shadow-sm">
                                      {getRankIconOverlay(index + 1)}
                                    </div>
                                  </div>
                                  {/* Premium Glow Ring */}
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 -z-10 scale-110" />
                                </div>
                              ) : (
                                <div className="text-3xl sm:text-4xl lg:text-5xl">
                                  {getRankIcon(index + 1)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Compact Player Info */}
                          <div className="text-center mb-3 sm:mb-4 relative z-10">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 tracking-wide">{player.name}</h3>
                            <div className="inline-flex items-center bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 border border-primary/30 mb-1">
                              <p className="text-primary font-semibold text-xs sm:text-sm">{player.rank}</p>
                            </div>

                          </div>

                                                  {/* Premium Compact Stats */}
                          <div className="space-y-2 sm:space-y-3 relative z-10">
                            {/* Main Wealth Display */}
                            <div className="bg-gradient-to-r from-black/30 via-black/20 to-black/30 rounded-xl p-3 backdrop-blur-sm border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                              <div className="flex items-center justify-center space-x-2 mb-1">
                                <FaChartLine className="text-primary text-sm" />
                                <FaFire className="text-orange-400 text-sm animate-pulse" />
                              </div>
                              <p className="text-center text-lg sm:text-xl font-bold text-white mb-1">{formatCurrency(player.totalWealth)}</p>
                              <p className="text-center text-xs text-gray-400 font-medium">Total Wealth</p>
                            </div>

                            {/* Compact Cash & Bank */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-2 border border-green-500/20 backdrop-blur-sm">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <FaCoins className="text-green-400 text-xs" />
                                  <span className="text-green-300 text-xs font-medium">Cash</span>
                                </div>
                                <p className="text-center text-xs font-bold text-white">{formatCurrency(player.cash)}</p>
                              </div>
                              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-2 border border-blue-500/20 backdrop-blur-sm">
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <FaUniversity className="text-blue-400 text-xs" />
                                  <span className="text-blue-300 text-xs font-medium">Bank</span>
                                </div>
                                <p className="text-center text-xs font-bold text-white">{formatCurrency(player.bank)}</p>
                              </div>
                            </div>
                          </div>

                        

                          {/* Luxury Corner Accents */}
                          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-primary/40 rounded-tl-lg opacity-60" />
                          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-primary/40 rounded-bl-lg opacity-60" />
                          <div className="absolute top-2 right-8 w-3 h-3 border-r-2 border-t-2 border-primary/40 rounded-tr-lg opacity-60" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Players 4-10 - Enhanced Compact List */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                  className="max-w-5xl mx-auto px-2 sm:px-4"
                >
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 overflow-hidden shadow-2xl">
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-primary/15 to-accent/15 p-4 sm:p-6 border-b border-primary/20">
                      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
                        <FaTrophy className="text-primary text-lg sm:text-xl" />
                        <span>Elite Rankings</span>
                      </h2>
                      <p className="text-gray-400 mt-1 text-sm sm:text-base">Players ranked 4-10 by total wealth</p>
                    </div>

                                        {/* Enhanced List */}
                    <div className="divide-y divide-white/10">
                      {remainingPlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.6 + index * 0.1 }}
                          className="p-4 sm:p-6 hover:bg-white/5 transition-all duration-300 group border-l-4 border-transparent hover:border-primary/30"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            {/* Left Side - Rank and Name */}
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border border-primary/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <span className="text-primary font-bold text-sm sm:text-lg">#{index + 4}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-bold text-white truncate">{player.name}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-xs sm:text-sm text-gray-400 space-y-1 sm:space-y-0">
                                  <span className="truncate">{player.rank}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Side - Wealth Stats */}
                            <div className="text-left sm:text-right flex-shrink-0">
                              <div className="flex items-center space-x-2 mb-1 justify-start sm:justify-end">
                                <FaChartLine className="text-primary text-sm" />
                                <span className="text-lg sm:text-xl font-bold text-white">{formatCurrency(player.totalWealth)}</span>
                              </div>
                              <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 gap-2 sm:gap-0 text-xs sm:text-sm">
                                <div className="flex items-center space-x-1 text-green-400">
                                  <FaCoins className="text-xs" />
                                  <span className="truncate">{formatCurrency(player.cash)}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-blue-400">
                                  <FaUniversity className="text-xs" />
                                  <span className="truncate">{formatCurrency(player.bank)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.5 }}
                  className="text-center mt-12 sm:mt-16 px-4"
                >
                  <div className="bg-gradient-to-br from-primary/15 to-accent/10 rounded-2xl p-6 sm:p-8 border border-primary/20 backdrop-blur-sm max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full -translate-y-16 translate-x-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent to-primary rounded-full translate-y-12 -translate-x-12" />
                    </div>
                    
                    <div className="relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <FaCrown className="text-primary text-3xl sm:text-4xl mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Join the Elite</h3>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
                        Build your empire, accumulate vast wealth, and earn your place among MAYAAALOKAM&apos;s most successful players. 
                        <span className="text-primary font-semibold"> Will you rise to the challenge?</span>
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                        <a
                          href="/whitelist"
                          className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-dark px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-glow hover:scale-105 inline-flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                          <FaUser className="text-sm sm:text-base" />
                          <span>Start Your Journey</span>
                        </a>
                        <a
                          href="https://discord.gg/2dv9AdVV"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-2 border-primary text-primary hover:bg-primary hover:text-dark px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 inline-flex items-center justify-center space-x-2 text-sm sm:text-base backdrop-blur-sm"
                        >
                          <FaTrophy className="text-sm sm:text-base" />
                          <span>Learn the Game</span>
                        </a>
                      </div>
                    </div>
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

export default ElitePlayersPage