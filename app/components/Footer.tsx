'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaDiscord, FaYoutube, FaInstagram, FaHeart } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    server: [
      { name: 'Whitelist', href: '/whitelist' },
      { name: 'Rules', href: '/rules' },
      { name: 'Duty Logs', href: '/duty-logs' },
      { name: 'Memberships', href: '/memberships' },
    ],
    community: [
      { name: 'Discord', href: 'https://discord.gg/2dv9AdVV' },
      { name: 'YouTube', href: 'https://www.youtube.com/@MayaalokamRP' },
      { name: 'Instagram', href: 'https://www.instagram.com/mayaalokam_roleplay' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Mayaavi Games', href: 'https://mayaavigames.com' },
      { name: 'Support', href: '/support' },
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],
  }

  const socialLinks = [
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://www.youtube.com/@MayaalokamRP',
      color: 'text-red-500 hover:text-red-400',
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: 'https://discord.gg/2dv9AdVV',
      color: 'text-discord hover:text-discord/80',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://www.instagram.com/mayaalokam_roleplay',
      color: 'text-pink-500 hover:text-pink-400',
    },
  ]

  return (
    <footer className="bg-dark-darker relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-block mb-4 sm:mb-6">
                <Image
                  src="https://i.ibb.co/pBC4n3Yh/Picsart-25-05-29-23-13-39-384.png"
                  alt="MAYAALOKAM Footer Logo"
                  width={200}
                  height={60}
                  className="h-10 sm:h-12 w-auto"
                  quality={80}
                  sizes="(max-width: 640px) 160px, 200px"
                />
              </Link>
              <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Experience the ultimate Telugu FiveM roleplay server. Create your story, 
                build your legacy, and become part of our thriving community.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2.5 sm:p-3 bg-card hover:bg-card-hover rounded-lg transition-all duration-300 ${social.color} min-h-[44px] min-w-[44px] flex items-center justify-center`}
                  >
                    <social.icon className="text-lg sm:text-xl" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Server Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-base sm:text-lg font-display font-bold text-white mb-4 sm:mb-6">Server</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.server.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm sm:text-base block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Community Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-base sm:text-lg font-display font-bold text-white mb-4 sm:mb-6">Community</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm sm:text-base block py-1"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Company Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-base sm:text-lg font-display font-bold text-white mb-4 sm:mb-6">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                      className="text-gray-400 hover:text-primary transition-colors duration-300 text-sm sm:text-base block py-1"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-white/10 py-6 sm:py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 sm:space-y-4 md:space-y-0">
            {/* Left Side - Copyright & Company */}
            <div className="flex flex-col space-y-1">
              <p className="text-gray-400 text-xs sm:text-sm">
                © {currentYear} MAYAAALOKAM ROLEPLAY. All rights reserved.
              </p>
              <div className="text-gray-500 text-xs">
                <a
                  href="https://mayaavigames.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-300"
                >
                  Mayaavi Games
                </a>
              </div>
            </div>
            
            {/* Right Side - Dev Credits */}
            <div className="flex items-center space-x-2 sm:space-x-3 py-2">
              <span className="text-green-500 font-mono text-xs sm:text-sm">Crafted by</span>
              <motion.span
                animate={{ 
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="text-base sm:text-lg"
              >
                ⚙️
              </motion.span>
              <span className="text-green-500 font-mono text-xs sm:text-sm font-semibold">this guy</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer 