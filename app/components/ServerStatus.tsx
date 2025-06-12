'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaClock, FaServer, FaGlobe } from 'react-icons/fa'

const ServerStatus = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-dark-300/50 to-dark-400/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-4">
            Live Server Status
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join our active community and experience premium roleplay gaming at its finest.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card rounded-xl p-6 hover:bg-card-hover transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_theme(colors.green.400)]" />
                <span className="text-green-400 font-semibold text-lg">Server Online</span>
              </div>
              
              {/* Custom Server Status Display */}
              <div className="rounded-lg overflow-hidden shadow-lg bg-dark/30 border border-primary/20">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaServer className="text-primary text-xl" />
                      <div>
                        <h3 className="text-white font-bold text-lg">MAYAAALOKAM ROLEPLAY</h3>
                        <p className="text-gray-400 text-sm">Connect ID: qg8454</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">230/230</div>
                      <div className="text-xs text-gray-400">Players</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <FaGlobe className="text-primary" />
                    <div>
                      <div className="text-white font-semibold">Location</div>
                      <div className="text-gray-400 text-sm">India</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaClock className="text-primary" />
                    <div>
                      <div className="text-white font-semibold">Uptime</div>
                      <div className="text-gray-400 text-sm">99.9%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-dark/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-1">230</div>
                <div className="text-sm text-gray-400">Active Players</div>
              </div>
              
              <div className="bg-dark/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-gray-400">Server Uptime</div>
              </div>
              
              <div className="bg-dark/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-1">Premium</div>
                <div className="text-sm text-gray-400">Experience</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <motion.a
                href="fivem://connect/qg8454"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary hover:bg-primary/90 text-dark px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-glow inline-flex items-center space-x-2"
              >
                <span>Connect to Server</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ServerStatus 