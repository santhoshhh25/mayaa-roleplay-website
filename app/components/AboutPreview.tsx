'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FaUsers, FaGamepad, FaHeart, FaGlobe, FaAward, FaShieldAlt } from 'react-icons/fa'

const AboutPreview = () => {
  const highlights = [
    {
      icon: FaUsers,
      title: 'Telugu Community',
      description: 'Celebrating our rich culture in every interaction',
      color: 'text-primary'
    },
    {
      icon: FaGamepad,
      title: 'Custom Features',
      description: 'Unique scripts and immersive gameplay mechanics',
      color: 'text-blue-400'
    },
    {
      icon: FaHeart,
      title: 'Passionate Support',
      description: '24/7 dedicated staff ensuring the best experience',
      color: 'text-red-400'
    },
    {
      icon: FaGlobe,
      title: 'Global Reach',
      description: 'Connecting Telugu gamers worldwide',
      color: 'text-green-400'
    }
  ]

  const stats = [
    { value: '∞', label: 'Story Possibilities' },
    { value: '99.9%', label: 'Uptime' },
    { value: '365', label: 'Days of Adventure' },
    { value: '24/7', label: 'Support' }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-dark-400/20 via-dark-300/30 to-dark-400/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Header */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6"
              >
                <FaAward className="text-primary text-sm" />
                <span className="text-primary text-xs sm:text-sm font-semibold">Premium Roleplay Experience</span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold gradient-text mb-4 sm:mb-6 leading-tight">
                About 
                <span className="block text-primary">Mayaaalokam</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-6">
                Where Telugu culture meets cutting-edge roleplay technology. Built by passionate gamers, 
                for the global Telugu community.
              </p>
              
              <p className="text-gray-400 leading-relaxed">
                Our server isn&apos;t just about gaming—it&apos;s about building lasting friendships, 
                exploring limitless possibilities, and experiencing the thrill of living multiple lives 
                in one incredible virtual world that celebrates our heritage.
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-primary/10 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                      <highlight.icon className={`text-base sm:text-lg ${highlight.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">{highlight.title}</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">{highlight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-4 sm:p-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-xs font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <motion.a
                href="/about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary hover:bg-primary/90 text-dark px-6 sm:px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-glow flex items-center space-x-2 w-full sm:w-auto justify-center min-h-[48px]"
              >
                <span>Discover Our Story</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
              
              <motion.a
                href="/whitelist"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center min-h-[48px] bg-primary/10 hover:bg-primary/20 px-6 py-3 rounded-xl"
              >
                <span>Join Today</span>
                <FaShieldAlt className="text-sm" />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Main Visual Card */}
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-br from-card via-card-hover to-card rounded-3xl p-6 sm:p-8 text-center border border-primary/20 overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center relative"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/30">
                  <span className="text-2xl sm:text-4xl font-bold text-dark">ML</span>
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              </motion.div>
              
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3 sm:mb-4">
                Premium Experience
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Crafted with passion, delivered with excellence. Experience roleplay 
                like never before in our immersive Telugu gaming world.
              </p>
              
              <div className="flex justify-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="w-2 h-2 bg-primary/60 rounded-full" />
                <div className="w-2 h-2 bg-primary/30 rounded-full" />
              </div>
            </motion.div>

            {/* Powered by Mayaavi Games */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-card/80 via-card-hover/80 to-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300"
            >
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 tracking-wider uppercase"
                >
                  Powered by
                </motion.p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex justify-center mb-3 sm:mb-4"
                >
                  <Image
                    src="https://mayaavigames.com/wp-content/uploads/2024/04/mayaavi-logo-1-1-1.png"
                    alt="Mayaavi Games"
                    width={180}
                    height={70}
                    className="h-10 sm:h-14 w-auto"
                    quality={80}
                    sizes="(max-width: 640px) 120px, 180px"
                  />
                </motion.div>
                
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                  A premium gaming experience brought to you by Mayaavi Games, 
                  leaders in innovative gaming solutions and immersive experiences.
                </p>
                
                <motion.a
                  href="https://mayaavigames.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-semibold transition-all duration-300 bg-primary/10 hover:bg-primary/20 px-3 sm:px-4 py-2 rounded-lg min-h-[44px]"
                >
                  <span className="text-xs sm:text-sm">Visit Mayaavi Games</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutPreview 