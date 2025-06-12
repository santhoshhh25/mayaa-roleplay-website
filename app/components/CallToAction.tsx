'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaDiscord, FaYoutube, FaInstagram } from 'react-icons/fa'

const CallToAction = () => {
  const socialLinks = [
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://www.youtube.com/@MayaalokamRP',
      color: 'text-red-500',
      hoverColor: 'hover:text-red-400',
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: 'https://discord.gg/2dv9AdVV',
      color: 'text-discord',
      hoverColor: 'hover:text-discord/80',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://www.instagram.com/mayaalokam_roleplay',
      color: 'text-pink-500',
      hoverColor: 'hover:text-pink-400',
    },
  ]

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-dark to-dark-darker relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 particles opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold gradient-text mb-4 sm:mb-6 px-4 sm:px-0">
            Join the Adventure
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0">
            Your story begins here. Connect with our community, stay updated, and become part of something extraordinary.
          </p>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center space-x-4 sm:space-x-8 mb-8 sm:mb-12"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                viewport={{ once: true }}
                className={`p-3 sm:p-4 bg-card hover:bg-card-hover rounded-xl transition-all duration-300 ${social.hoverColor} group min-h-[56px] min-w-[56px] flex items-center justify-center`}
              >
                <social.icon className={`text-2xl sm:text-3xl ${social.color} group-hover:scale-110 transition-transform duration-300`} />
              </motion.a>
            ))}
          </motion.div>

          {/* Main CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-4 sm:px-0"
          >
            <motion.a
              href="/whitelist"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary/90 text-dark px-8 sm:px-10 py-4 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 hover:shadow-glow flex items-center space-x-3 min-w-[280px] sm:min-w-[250px] justify-center w-full sm:w-auto"
            >
              <span>Start Your Journey</span>
            </motion.a>

            <motion.a
              href="/memberships"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark px-8 sm:px-10 py-4 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 flex items-center space-x-3 min-w-[280px] sm:min-w-[250px] justify-center w-full sm:w-auto"
            >
              <span>View Memberships</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction 