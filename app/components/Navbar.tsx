'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaDiscord, FaCrown, FaTrophy } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Set initial scroll state
    setScrolled(window.scrollY > 50)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Rules', href: '/rules' },
    { name: 'Elite Players', href: '/elite-players' },
    { name: 'Whitelist', href: '/whitelist' },
    { name: 'Duty Logs', href: '/duty-logs' },
    { name: 'Memberships', href: '/memberships' },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark/95 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Image
                src="https://i.ibb.co/pBC4n3Yh/Picsart-25-05-29-23-13-39-384.png"
                alt="MAYAAALOKAM Logo"
                width={240}
                height={60}
                className="h-10 sm:h-12 md:h-14 w-auto"
                priority
                quality={85}
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${
                    item.name === 'Elite Players'
                      ? `text-primary ${pathname === item.href ? 'bg-primary/10' : ''} hover:text-accent overflow-hidden`
                      : item.name === 'Memberships'
                        ? `text-amber-400 ${pathname === item.href ? 'bg-amber-400/10' : ''} hover:text-amber-300 overflow-hidden`
                        : pathname === item.href 
                          ? 'bg-white/10 text-primary' 
                          : 'text-white/80 hover:bg-white/5 hover:text-primary'
                  }`}
                >
                  {item.name === 'Elite Players' && <FaTrophy />}
                  {item.name === 'Memberships' && <FaCrown />}
                  {item.name}
                  {item.name === 'Elite Players' && (
                    <span className="absolute inset-0 bg-[linear-gradient(110deg,#FFD700,45%,#FFEA00,55%,#FFD700)] bg-[length:200%_100%] animate-shimmer opacity-20" />
                  )}
                  {item.name === 'Memberships' && (
                    <span className="absolute inset-0 bg-[linear-gradient(110deg,#a18d5b,45%,#f0e1a5,55%,#a18d5b)] bg-[length:200%_100%] animate-shimmer opacity-20" />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/whitelist">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-dark px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-glow"
              >
                Apply Now
              </motion.button>
            </Link>
            
            <Link href="https://discord.gg/2dv9AdVV" target="_blank">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="discord-btn text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2"
              >
                <FaDiscord className="text-lg" />
                <span>Discord</span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="lg:hidden p-2 sm:p-3 text-white/90 hover:text-primary transition-colors duration-300 rounded-lg hover:bg-white/5 flex items-center justify-center min-w-[44px] min-h-[44px] relative z-50"
            aria-label="Toggle menu"
            style={{ marginRight: 0 }}
          >
            <div className="flex items-center justify-center w-6 h-6">
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden border-t border-white/20 bg-gradient-to-b from-dark/98 via-dark/95 to-dark/90 backdrop-blur-xl shadow-2xl"
            >
              <div className="relative overflow-hidden">
                {/* Premium background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                
                <nav className="relative py-4 px-3 space-y-2">
                  {/* Navigation Items */}
                  <div className="space-y-1">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`relative group block px-4 py-2.5 transition-all duration-300 rounded-lg min-h-[44px] flex items-center text-base font-medium gap-2 backdrop-blur-sm ${
                            item.name === 'Elite Players'
                              ? `text-primary ${pathname === item.href ? 'bg-primary/15 border border-primary/30' : 'hover:bg-primary/10 border border-transparent'} hover:text-accent overflow-hidden shadow-lg`
                              : item.name === 'Memberships'
                                ? `text-amber-400 ${pathname === item.href ? 'bg-amber-400/15 border border-amber-400/30' : 'hover:bg-amber-400/10 border border-transparent'} hover:text-amber-300 overflow-hidden shadow-lg`
                                : pathname === item.href 
                                  ? 'bg-white/15 text-primary border border-primary/30 shadow-lg backdrop-blur-md' 
                                  : 'text-white/90 hover:bg-white/10 hover:text-primary border border-transparent hover:border-white/20 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-2 relative z-10">
                            {item.name === 'Elite Players' && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <FaTrophy className="text-lg" />
                              </motion.div>
                            )}
                            {item.name === 'Memberships' && (
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              >
                                <FaCrown className="text-lg" />
                              </motion.div>
                            )}
                            <span className="font-semibold">{item.name}</span>
                          </div>
                          
                          {/* Premium hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          
                          {item.name === 'Elite Players' && (
                            <span className="absolute inset-0 bg-[linear-gradient(110deg,#FFD700,45%,#FFEA00,55%,#FFD700)] bg-[length:200%_100%] animate-shimmer opacity-15 rounded-lg" />
                          )}
                          {item.name === 'Memberships' && (
                            <span className="absolute inset-0 bg-[linear-gradient(110deg,#a18d5b,45%,#f0e1a5,55%,#a18d5b)] bg-[length:200%_100%] animate-shimmer opacity-15 rounded-lg" />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Compact CTA Buttons Container */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="pt-4 mt-4 border-t border-gradient-to-r from-transparent via-white/20 to-transparent space-y-2.5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg blur-sm" />
                      <Link href="/whitelist" onClick={() => setIsOpen(false)}>
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-dark py-3.5 rounded-lg font-bold text-base transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 min-h-[48px] flex items-center justify-center border border-primary/30 backdrop-blur-sm overflow-hidden group"
                        >
                          <span className="relative z-10">Apply Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                        </motion.button>
                      </Link>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-blue-500/20 rounded-lg blur-sm" />
                      <Link href="https://discord.gg/2dv9AdVV" target="_blank">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-md text-white py-3.5 rounded-lg font-bold text-base transition-all duration-300 hover:from-discord/90 hover:via-discord hover:to-discord/90 hover:shadow-xl hover:shadow-discord/25 min-h-[48px] flex items-center justify-center space-x-2.5 border border-white/20 hover:border-discord/40 overflow-hidden group"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative z-10"
                          >
                            <FaDiscord className="text-lg" />
                          </motion.div>
                          <span className="relative z-10">Join Discord</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default Navbar 