'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SectionDividerProps {
  variant?: 'minimal' | 'premium' | 'dots' | 'glow'
}

const SectionDivider: React.FC<SectionDividerProps> = ({ variant = 'minimal' }) => {
  
  if (variant === 'minimal') {
    return (
      <div className="relative overflow-hidden">
        <div className="flex items-center justify-center">
          <motion.div
            className="relative w-64 h-1 rounded-full"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Main gradient line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent rounded-full" />
            
            {/* Secondary gradient overlay for more depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full" />
            
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full blur-sm"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Center highlight dot */}
            <motion.div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (variant === 'premium') {
    return (
      <div className="relative py-16 overflow-hidden">
        <div className="flex items-center justify-center">
          <motion.div
            className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="mx-6 w-2 h-2 bg-primary rounded-full relative"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
          </motion.div>
          <motion.div
            className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className="py-12 flex justify-center">
        <div className="flex space-x-3">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-1 h-1 bg-primary/50 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              viewport={{ once: true }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'glow') {
    return (
      <div className="relative py-16 overflow-hidden">
        <motion.div
          className="w-32 h-px mx-auto relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <motion.div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-primary rounded-full"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default SectionDivider 