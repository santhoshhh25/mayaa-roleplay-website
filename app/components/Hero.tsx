'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaGamepad, FaDiscord, FaServer, FaSpinner } from 'react-icons/fa'
import Image from 'next/image'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })
  const [shuffledImages, setShuffledImages] = useState<number[]>([])
  const [serverStatus, setServerStatus] = useState({ online: false, players: 0, maxPlayers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Background images for slideshow - all available wallpaper images
  const backgroundImages = [
    '/images/slideshow/wallhaven-1k8r79.png',
    '/images/slideshow/wallhaven-2koyzy.jpeg',
    '/images/slideshow/wallhaven-5g2qk5.png',
    '/images/slideshow/wallhaven-6k9ymx.png',
    '/images/slideshow/wallhaven-9516lx.jpeg',
    '/images/slideshow/wallhaven-lqj3wr.jpeg',
    '/images/slideshow/wallhaven-mdk2y8.png',
    '/images/slideshow/wallhaven-mdmpy9.png',
    '/images/slideshow/wallhaven-oxkjyp.png',
    '/images/slideshow/wallhaven-oxr2jp.png',
    '/images/slideshow/wallhaven-r2vqqw.png',
    '/images/slideshow/wallhaven-rd77vj.png',
    '/images/slideshow/wallhaven-v9jd88.jpeg',
    '/images/slideshow/wallhaven-xlxv6d.png',
    '/images/slideshow/wallhaven-y8786g.png',
    '/images/slideshow/wallhaven-ymgl3x.jpeg',
    '/images/slideshow/wallhaven-ymzqjl.png',
    '/images/slideshow/wallhaven-z8gg9w.png',
    '/images/slideshow/wallhaven-zm36kg.jpeg',
  ]

  // Shuffle function
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  useEffect(() => {
    // Initialize shuffled order
    const indices = Array.from({ length: backgroundImages.length }, (_, i) => i)
    setShuffledImages(shuffleArray(indices))
  }, [backgroundImages.length])

  useEffect(() => {
    // Set initial window size
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
      
      window.addEventListener('resize', handleResize, { passive: true })
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (shuffledImages.length === 0) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentSlide((prev) => {
          const currentIndex = shuffledImages.indexOf(prev)
          const nextIndex = (currentIndex + 1) % shuffledImages.length
          
          // If we've gone through all images, reshuffle
          if (nextIndex === 0) {
            const newShuffled = shuffleArray(Array.from({ length: backgroundImages.length }, (_, i) => i))
            setShuffledImages(newShuffled)
            return newShuffled[0]
          }
          
          return shuffledImages[nextIndex]
        })
        setIsTransitioning(false)
      }, 800) // Half transition time
    }, 6000) // 6 seconds between changes

    return () => clearInterval(timer)
  }, [shuffledImages, backgroundImages.length])

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const response = await fetch('https://servers-frontend.fivem.net/api/servers/single/qg8454');
        if (!response.ok) {
          throw new Error('Server not found or offline');
        }
        const data = await response.json();
        if (data && data.Data) {
          setServerStatus({
            online: true,
            players: data.Data.clients,
            maxPlayers: data.Data.sv_maxclients,
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        setServerStatus({ online: false, players: 0, maxPlayers: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerData();
    const interval = setInterval(fetchServerData, 45000); // Refresh every 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Enhanced Snowfall effect component with multiple layers and realistic physics
  const SnowfallEffect = () => {
    const [isMounted, setIsMounted] = useState(false)
    const [windDirection, setWindDirection] = useState(1)
    
    // Only render snowflakes after component mounts to avoid hydration mismatch
    useEffect(() => {
      setIsMounted(true)
    }, [])

    useEffect(() => {
      if (!isMounted) return
      
      const windTimer = setInterval(() => {
        setWindDirection(prev => prev * -1 + (Math.random() - 0.5) * 0.4)
      }, 8000 + Math.random() * 4000) // Change wind every 8-12 seconds
      
      return () => clearInterval(windTimer)
    }, [isMounted])

    // Don't render anything on server to avoid hydration mismatch
    if (!isMounted) {
      return <div className="absolute inset-0 pointer-events-none overflow-hidden" />
    }

    // Create multiple layers of snow for depth
    const createSnowLayer = (count: number, sizeRange: [number, number], speedRange: [number, number], zIndex: number) => {
      return Array.from({ length: count }, (_, i) => {
        const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0]
        const opacity = Math.random() * 0.4 + 0.2 // 0.2-0.6
        const duration = Math.random() * (speedRange[1] - speedRange[0]) + speedRange[0]
        const delay = Math.random() * 8
        const windStrength = Math.random() * 60 + 20 // 20-80px wind sway
        const rotationSpeed = Math.random() * 2 + 0.5 // 0.5-2.5 rotations
        
        // Different snowflake types
        const snowflakeType = Math.random()
        let snowflakeClass = "rounded-full bg-white"
        
        if (snowflakeType > 0.85) {
          // Star-shaped snowflakes (15% chance)
          snowflakeClass = "text-white opacity-80"
        } else if (snowflakeType > 0.7) {
          // Crystalline snowflakes (15% chance)
          snowflakeClass = "rounded-full bg-gradient-to-br from-white to-blue-100 shadow-sm"
        }
        
        return (
          <motion.div
            key={`${zIndex}-${i}`}
            className={`absolute ${snowflakeType > 0.85 ? 'flex items-center justify-center' : ''}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${Math.random() * 110 - 5}%`, // Start slightly off screen
              zIndex,
            }}
            initial={{
              y: -50,
              opacity: 0,
              rotate: 0,
              x: 0,
            }}
            animate={{
              y: windowSize.height + 100,
              opacity: [0, opacity, opacity, opacity * 0.8, 0],
              rotate: 360 * rotationSpeed,
              x: [
                0, 
                windStrength * 0.3, 
                -windStrength * 0.2, 
                windStrength * 0.5, 
                -windStrength * 0.1,
                windStrength * 0.2,
                0
              ],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear",
              rotate: {
                duration: duration * 0.8,
                repeat: Infinity,
                ease: "linear"
              },
              x: {
                duration: duration * 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              },
              opacity: {
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {snowflakeType > 0.85 ? (
              <span style={{ fontSize: `${size * 0.8}px` }}>❄</span>
            ) : (
              <div className={snowflakeClass} style={{ width: '100%', height: '100%' }} />
            )}
          </motion.div>
        )
      })
    }

    // Multiple layers for depth effect
    const backgroundSnow = createSnowLayer(15, [1, 2], [12, 18], 12) // Far background - small, slow
    const midgroundSnow = createSnowLayer(20, [2, 4], [8, 14], 13)   // Mid layer - medium
    const foregroundSnow = createSnowLayer(12, [3, 6], [6, 12], 14)  // Foreground - large, fast
    const crystalSnow = createSnowLayer(8, [4, 8], [10, 16], 15)     // Special crystal flakes

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle wind animation overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            x: windDirection * 10,
          }}
          transition={{
            duration: 3,
            ease: "easeInOut"
          }}
        >
          {backgroundSnow}
        </motion.div>
        
        <motion.div
          className="absolute inset-0"
          animate={{
            x: windDirection * 15,
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut"
          }}
        >
          {midgroundSnow}
        </motion.div>
        
        <motion.div
          className="absolute inset-0"
          animate={{
            x: windDirection * 20,
          }}
          transition={{
            duration: 2,
            ease: "easeInOut"
          }}
        >
          {foregroundSnow}
        </motion.div>
        
        <motion.div
          className="absolute inset-0"
          animate={{
            x: windDirection * 25,
          }}
          transition={{
            duration: 1.8,
            ease: "easeInOut"
          }}
        >
          {crystalSnow}
        </motion.div>

        {/* Subtle ground accumulation effect */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-16" />
        
        {/* Atmospheric haze effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/2 pointer-events-none z-11" />
      </div>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {/* Background Images */}
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${image})`,
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: index === currentSlide && !isTransitioning ? 1 : 0,
              scale: index === currentSlide && !isTransitioning ? 1.05 : 1.1,
            }}
            transition={{ 
              opacity: { duration: 1.6, ease: "easeInOut" },
              scale: { duration: 8, ease: "easeOut" }
            }}
          />
        ))}
        
        {/* Dark overlay for better text readability */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-dark/90 via-dark-300/80 to-dark-darker/90 z-10"
          animate={{
            opacity: isTransitioning ? 0.95 : 0.8
          }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Animated particles */}
        <div className="particles absolute inset-0 z-5" />
      </div>

      {/* Enhanced Snowfall Effect */}
      <SnowfallEffect />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <motion.h2 
              className="text-xs sm:text-sm md:text-base font-display text-primary/70 mb-3 sm:mb-4 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Unleash Your Roleplay Identity In
            </motion.h2>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-light tracking-tight text-white mb-4 sm:mb-6 leading-none px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent">
                MAYAALOKAM
              </span>
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
          >
            Pick your role, write your story, and rule your fate. Welcome to MayaaLokam — a living world crafted by roleplayers, for roleplayers.
          </motion.p>

          {/* Combined Container for Widgets and CTAs */}
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Server Status Widgets */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-32 h-14 bg-dark/50 backdrop-blur-md rounded-lg flex items-center justify-center p-3 border border-white/10 shadow-lg transition-all duration-300">
                {isLoading ? (
                  <FaSpinner className="animate-spin text-lg text-primary" />
                ) : serverStatus.online ? (
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <FaServer className="text-green-400 text-sm" />
                      <p className="font-bold text-lg text-white">Online</p>
                    </div>
                    <p className="text-[10px] text-white/60 mt-0.5">Server Status</p>
                  </div>
                ) : (
                  <div className="text-center">
                     <div className="flex justify-center items-center gap-1.5">
                      <FaServer className="text-red-400 text-sm" />
                      <p className="font-bold text-lg text-white">Offline</p>
                    </div>
                    <p className="text-[10px] text-white/60 mt-0.5">Server Status</p>
                  </div>
                )}
              </div>
              
              <div className="w-32 h-14 bg-dark/50 backdrop-blur-md rounded-lg flex items-center justify-center p-3 border border-white/10 shadow-lg transition-all duration-300">
                {isLoading ? (
                  <FaSpinner className="animate-spin text-lg text-primary" />
                ) : serverStatus.online ? (
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <FaUsers className="text-primary text-sm" />
                      <p className="font-bold text-lg text-white">{serverStatus.players}/{serverStatus.maxPlayers}</p>
                    </div>
                    <p className="text-[10px] text-white/60 mt-0.5">Players</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <FaUsers className="text-gray-500 text-sm" />
                      <p className="font-bold text-lg text-gray-400">N/A</p>
                    </div>
                    <p className="text-[10px] text-white/60 mt-0.5">Players</p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="/whitelist"
                className="bg-primary text-dark px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-glow flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply Now
              </motion.a>
              <motion.a
                href="https://discord.gg/2dv9AdVV"
                target="_blank"
                rel="noopener noreferrer"
                className="discord-btn text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDiscord className="text-lg" />
                <span>Discord</span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero 