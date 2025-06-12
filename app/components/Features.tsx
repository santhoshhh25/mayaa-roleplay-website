'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaRocket, FaUsers, FaShieldAlt, FaGamepad, FaDollarSign, FaCar, FaCheckCircle } from 'react-icons/fa'

const Features = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration by ensuring consistent rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const features = [
    {
      icon: FaRocket,
      title: 'Optimized Performance',
      description: 'Smooth gameplay with high-performance server infrastructure and minimal lag.',
      highlights: ['99.9% Uptime', 'Low Latency', 'SSD Storage'],
      color: 'from-primary to-accent',
      glowColor: 'rgba(255, 215, 0, 0.3)',
    },
    {
      icon: FaUsers,
      title: 'Friendly Community',
      description: 'Join our welcoming Telugu gaming community with supportive players and inclusive environment.',
      highlights: ['Welcoming Members', 'Telugu Culture', 'Inclusive Environment'],
      color: 'from-primary to-yellow-300',
      glowColor: 'rgba(255, 215, 0, 0.25)',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Fair',
      description: 'Advanced anti-cheat systems and fair play policies ensure quality roleplay.',
      highlights: ['Anti-Cheat', 'Fair Rules', 'Moderated'],
      color: 'from-primary to-yellow-400',
      glowColor: 'rgba(255, 215, 0, 0.3)',
    },
    {
      icon: FaGamepad,
      title: 'Premium Scripts',
      description: 'Custom scripts and exclusive features for immersive roleplay experiences.',
      highlights: ['Custom Jobs', 'Unique Features', 'Regular Updates'],
      color: 'from-accent to-primary',
      glowColor: 'rgba(255, 234, 0, 0.3)',
    },
    {
      icon: FaDollarSign,
      title: 'Custom Economy',
      description: 'Dynamic in-game economy with businesses, banking systems, and realistic financial mechanics.',
      highlights: ['Business Ownership', 'Banking System', 'Money Laundering'],
      color: 'from-primary to-accent',
      glowColor: 'rgba(255, 215, 0, 0.25)',
    },
    {
      icon: FaCar,
      title: 'Custom Vehicles',
      description: 'Extensive collection of custom vehicles with unique modifications and customization options.',
      highlights: ['Custom Models', 'Vehicle Mods', 'Unique Designs'],
      color: 'from-accent to-yellow-300',
      glowColor: 'rgba(255, 234, 0, 0.3)',
    },
  ]

  return (
    <section className="py-20 bg-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-text mb-4 sm:mb-6 px-4 sm:px-0">
            Why Choose <span className="text-primary">Mayaaalokam</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto px-4 sm:px-0">
            Experience the ultimate GTA 5 roleplay server with cutting-edge features and an immersive community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative group h-80 sm:h-96"
              style={{ perspective: '1000px' }}
              onMouseEnter={() => isMounted && setHoveredCard(index)}
              onMouseLeave={() => isMounted && setHoveredCard(null)}
            >
              <div 
                className="relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-dark/90 to-dark-darker/90 border border-primary/20 backdrop-blur-sm transition-all duration-500"
                style={{
                  transform: isMounted && hoveredCard === index ? 'rotateX(5deg) rotateY(5deg)' : 'rotateX(0deg) rotateY(0deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Hover glow */}
                {isMounted && (
                  <div 
                    className={`absolute inset-0 rounded-xl transition-opacity duration-500 ${
                      hoveredCard === index ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      background: `radial-gradient(circle at center, ${feature.glowColor} 0%, transparent 70%)`
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative p-6 sm:p-8 text-center h-full flex flex-col justify-center items-center z-10">
                  <motion.div
                    className="text-4xl sm:text-5xl text-primary mb-4 sm:mb-6"
                    animate={isMounted ? {
                      scale: hoveredCard === index ? 1.1 : 1,
                      color: hoveredCard === index ? '#FFD700' : 'rgba(255, 215, 0, 0.8)'
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon />
                  </motion.div>

                  <motion.h3 
                    className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 font-display"
                    animate={isMounted ? {
                      scale: hoveredCard === index ? 1.05 : 1
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 sm:mb-6">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {feature.highlights.map((highlight, i) => (
                      <motion.div
                        key={i}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs border transition-all duration-300 ${
                          isMounted && hoveredCard === index 
                            ? 'bg-primary/20 border-primary/60 text-primary shadow-lg shadow-primary/20' 
                            : 'bg-primary/10 border-primary/30 text-primary/80'
                        }`}
                        whileHover={isMounted ? { scale: 1.05 } : {}}
                      >
                        <FaCheckCircle className="text-xs" />
                        <span className="text-xs">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Animated border */}
                <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 ${
                  isMounted && hoveredCard === index 
                    ? 'border-primary/50 shadow-xl shadow-primary/20' 
                    : 'border-transparent'
                }`} />

                {/* Corner decorations */}
                {isMounted && hoveredCard === index && (
                  <>
                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-primary/60 animate-pulse" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-primary/60 animate-pulse" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-primary/60 animate-pulse" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-primary/60 animate-pulse" />
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features 