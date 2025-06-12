'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCrown, FaStar, FaGem, FaCheck, FaCoins, FaCar, FaHome, FaUser, FaShieldAlt, FaUsers, FaPhone, FaMedal, FaTrophy, FaBolt, FaInfinity, FaHeart, FaMagic, FaLightbulb, FaRocket } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const MembershipsPage = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const membershipTiers = [
    {
      name: 'Standard',
      price: '₹499',
      icon: FaUser,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/30 via-blue-600/20 to-indigo-500/30',
      borderColor: 'border-blue-500/40',
      glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
      popular: false,
      benefits: {
        vipCoins: '180',
        customPhone: '1 Custom Phone number with 10 numbers (for one character)',
        customPlate: '1 Custom Vehicle plate number of 8 digits (for only owned vehicle)',
        characterSlots: '0',
        house: null,
        customPed: null,
        discounts: false,
        queuePriority: 'Basic Role and level 1 queue priority',
        discordRole: 'Basic Role',
        duration: '1 Month',
        extras: []
      }
    },
    {
      name: 'Premium',
      price: '₹799',
      icon: FaStar,
      color: 'text-primary',
      bgGradient: 'from-primary/30 via-yellow-500/20 to-orange-400/30',
      borderColor: 'border-primary/60',
      glowColor: 'shadow-[0_0_40px_rgba(255,215,0,0.4)]',
      popular: false,
      benefits: {
        vipCoins: '300',
        customPhone: '1 Custom phone number with 8 numbers (for one character)',
        customPlate: '2 Custom vehicle plate number of 6 digits (for only owned vehicle)',
        characterSlots: '1',
        house: null,
        customPed: null,
        discounts: false,
        queuePriority: 'Level-2 Queue Priority',
        discordRole: 'Premium role in discord',
        duration: '1 Month',
        extras: []
      }
    },
    {
      name: 'Plus',
      price: '₹1499',
      icon: FaCrown,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/30 via-violet-500/20 to-pink-500/30',
      borderColor: 'border-purple-500/60',
      glowColor: 'shadow-[0_0_40px_rgba(147,51,234,0.4)]',
      popular: false,
      benefits: {
        vipCoins: '650',
        customPhone: '1 Custom phone number with 6 numbers (for one character)',
        customPlate: '2 Custom vehicle plate number of 6 digits (for only owned vehicle)',
        characterSlots: '1',
        house: '1 Small House (TP House not a walk-in)',
        customPed: null,
        discounts: false,
        queuePriority: 'Level-3 Queue Priority',
        discordRole: 'Plus role in discord',
        duration: '1 Month',
        extras: []
      }
    },
    {
      name: 'Pro',
      price: '₹2499',
      icon: FaMedal,
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/30 via-red-500/20 to-yellow-500/30',
      borderColor: 'border-orange-500/60',
      glowColor: 'shadow-[0_0_40px_rgba(249,115,22,0.4)]',
      popular: false,
      benefits: {
        vipCoins: '1150',
        customPhone: '2 Custom phone numbers with 4 numbers (for two characters 1111-9999)',
        customPlate: '4 Custom vehicle plate numbers of 5 digits (for only owned vehicles)',
        characterSlots: '1',
        house: '1 Medium House (TP House not a walk-in)',
        customPed: '1 Custom Ped of your choice (from our list)',
        discounts: true,
        queuePriority: 'Level-4 Queue Priority',
        discordRole: 'Pro role in discord',
        duration: '1 Month',
        extras: []
      }
    },
    {
      name: 'Ultimate',
      price: '₹2999',
      icon: FaTrophy,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-400/30 via-blue-500/20 to-teal-400/30',
      borderColor: 'border-cyan-400/60',
      glowColor: 'shadow-[0_0_40px_rgba(34,211,238,0.4)]',
      popular: false,
      benefits: {
        vipCoins: '1500',
        customPhone: '3 Custom phone numbers with 4 numbers (for two characters 11-99)',
        customPlate: '5 Custom vehicle plate numbers of 4 digits (for only owned vehicles)',
        characterSlots: '2',
        house: '1 Big House (TP House not a walk-in)',
        customPed: '1 Custom Ped of your choice (subject to availability)',
        discounts: true,
        queuePriority: 'Level-5 Queue Priority',
        discordRole: 'Ultimate role in discord',
        duration: '1 Month',
        extras: []
      }
    },
    {
      name: 'Exclusive',
      price: '₹3499',
      icon: FaGem,
      color: 'text-pink-400',
      bgGradient: 'from-pink-400/30 via-purple-500/20 to-rose-400/30',
      borderColor: 'border-pink-400/60',
      glowColor: 'shadow-[0_0_50px_rgba(244,114,182,0.5)]',
      popular: false,
      benefits: {
        vipCoins: '2100',
        customPhone: '4 Custom phone numbers with 2 numbers (for three characters 11-99)',
        customPlate: '5 Custom vehicle plate numbers of 2 digits (for only owned vehicles)',
        characterSlots: '2',
        house: '1 Big House (walk-in) or a TP house wherever you want (even on island)',
        customPed: '1 Custom Ped of your choice (subject to availability)',
        discounts: true,
        queuePriority: 'Level-6 Queue Priority',
        discordRole: 'Exclusive role in discord',
        duration: '1 Month',
        extras: ['x1 Premium Helicopter']
      }
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-200 to-dark-300" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              initial={{ 
                x: Math.random() * 1200, 
                y: Math.random() * 800,
                scale: 0 
              }}
              animate={{
                y: [null, -20, 20],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <Navbar />
        
        <section className="pt-32 pb-20 px-4 relative z-10">
          <div className="container mx-auto">
            {/* Enhanced Header */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-8"
              >
                <FaMagic className="text-primary text-lg" />
                <span className="text-primary font-semibold">Premium Memberships</span>
                <FaMagic className="text-primary text-lg" />
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-8 relative">
                <motion.span
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_100%]"
                >
                  MayaaLokam
                </motion.span>
                <br />
                <span className="text-white/90">Membership Plans</span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
              >
                Unlock exclusive benefits and enhance your gaming experience with our premium membership tiers. 
                <span className="text-primary font-semibold"> Choose your path to greatness.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center space-x-3 bg-card/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-primary/20">
                  <FaShieldAlt className="text-green-400 text-xl" />
                  <span className="text-gray-300 font-medium">Use <code className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">/vipopen</code> in-game to access VIP MENU</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <FaBolt className="text-xs" />
                    <span>Instant Activation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <FaInfinity className="text-xs" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <FaHeart className="text-xs" />
                    <span>Community Loved</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Trust Promise Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm rounded-xl p-4 border border-primary/20 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaHeart className="text-red-400 text-lg" />
                  </motion.div>
                  
                  <p className="text-gray-300 text-sm md:text-base text-center">
                    <span className="text-primary font-semibold">100% of your support</span> goes directly to 
                    <span className="text-accent font-semibold"> server development & community growth</span>
                  </p>
                  
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <FaShieldAlt className="text-green-400 text-lg" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Membership Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
            >
              {membershipTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className={`relative group cursor-pointer ${hoveredCard === index ? tier.glowColor : ''}`}
                >
                  {/* Premium Card Container */}
                  <div className={`
                    relative rounded-xl p-5 
                    border ${tier.borderColor} 
                    transition-all duration-300 ease-out
                    ${hoveredCard === index ? 'border-opacity-100 shadow-lg' : 'border-opacity-40'}
                    overflow-hidden
                    bg-gray-900
                    h-full
                  `}>
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} transition-opacity duration-300 ${hoveredCard === index ? 'opacity-40' : 'opacity-25'}`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Compact Icon Section */}
                      <div className="text-center mb-4">
                        <motion.div
                          animate={hoveredCard === index ? { 
                            scale: [1, 1.05, 1]
                          } : {}}
                          transition={{ duration: 0.4 }}
                          className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tier.bgGradient} mb-3 relative overflow-hidden`}
                        >
                          <tier.icon className={`text-2xl ${tier.color} relative z-10`} />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          />
                        </motion.div>

                        <h3 className="text-xl font-display font-bold text-white mb-1">{tier.name}</h3>
                        
                        {/* Compact Pricing */}
                        <div className="flex items-center justify-center mb-1">
                          <div className={`text-xl font-bold ${tier.color}`}>{tier.price}</div>
                        </div>
                        <div className="text-gray-400 text-xs">per month</div>
                      </div>

                      {/* Compact Benefits List */}
                      <div className="space-y-2 mb-4 flex-1">
                        {/* VIP Coins with Animation */}
                        <motion.div 
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between p-2 bg-black/30 rounded-lg backdrop-blur-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              <FaCoins className="text-primary text-sm" />
                            </motion.div>
                            <span className="text-gray-300 text-sm">VIP Coins</span>
                          </div>
                          <span className="text-white font-bold text-sm">{tier.benefits.vipCoins}</span>
                        </motion.div>

                        {/* Custom Phone */}
                        <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <FaPhone className="text-green-400 text-sm" />
                            <span className="text-white text-sm font-semibold">Custom Phone</span>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed">{tier.benefits.customPhone}</p>
                        </div>

                        {/* Custom Plate */}
                        <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <FaCar className="text-blue-400 text-sm" />
                            <span className="text-white text-sm font-semibold">Custom Plate</span>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed">{tier.benefits.customPlate}</p>
                        </div>

                        {/* Character Slots */}
                        {tier.benefits.characterSlots !== '0' && (
                          <motion.div 
                            whileHover={{ x: 3 }}
                            className="flex items-center justify-between p-2 bg-black/30 rounded-lg"
                          >
                            <span className="text-gray-300 text-sm">Extra Character Slots</span>
                            <span className="text-white font-bold text-sm">{tier.benefits.characterSlots}</span>
                          </motion.div>
                        )}

                        {/* House */}
                        {tier.benefits.house && (
                          <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <FaHome className="text-purple-400 text-sm" />
                              <span className="text-white text-sm font-semibold">House</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{tier.benefits.house}</p>
                          </div>
                        )}

                        {/* Custom Ped */}
                        {tier.benefits.customPed && (
                          <div className="bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <FaUser className="text-orange-400 text-sm" />
                              <span className="text-white text-sm font-semibold">Custom Ped</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{tier.benefits.customPed}</p>
                          </div>
                        )}

                        {/* Business Discounts */}
                        {tier.benefits.discounts && (
                          <motion.div 
                            whileHover={{ x: 3 }}
                            className="flex items-center justify-between p-2 bg-green-900/30 rounded-lg border border-green-500/20"
                          >
                            <span className="text-gray-300 text-sm">Business Discounts</span>
                            <FaCheck className="text-green-400 text-sm" />
                          </motion.div>
                        )}

                        {/* Queue Priority */}
                        <motion.div 
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between p-2 bg-black/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FaUsers className="text-green-400 text-sm" />
                            <span className="text-gray-300 text-sm">Queue Priority</span>
                          </div>
                          <span className="text-white text-xs font-semibold">{tier.benefits.queuePriority}</span>
                        </motion.div>

                        {/* Extra Benefits */}
                        {tier.benefits.extras.length > 0 && (
                          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 border border-primary/20">
                            <h4 className="text-white text-sm font-bold mb-2 flex items-center space-x-2">
                              <FaMagic className="text-primary text-sm" />
                              <span>Exclusive Bonuses</span>
                            </h4>
                            <ul className="space-y-1">
                              {tier.benefits.extras.map((extra, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                  <FaCheck className="text-green-400 text-xs" />
                                  <span className="text-gray-300 text-xs">{extra}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Compact CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTier(tier.name)}
                        className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 relative overflow-hidden bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 mt-auto"
                      >
                        <span className="relative z-10">
                          Choose {tier.name}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto mt-24"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Everything you need to know about our premium membership plans
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    question: "How do I access VIP features?",
                    answer: "Use the /vipopen command in-game to access the VIP menu where you can claim your benefits and manage your membership perks.",
                    icon: FaShieldAlt,
                    color: "text-green-400"
                  },
                  {
                    question: "Are custom plates permanent?",
                    answer: "Yes, custom plates are permanent once assigned to your owned vehicles and remain yours indefinitely.",
                    icon: FaCar,
                    color: "text-blue-400"
                  },
                  {
                    question: "What about houses?",
                    answer: "Houses provided are TP (teleport) houses unless specified as walk-in. They remain accessible during your active membership.",
                    icon: FaHome,
                    color: "text-purple-400"
                  },
                  {
                    question: "Do character slots expire?",
                    answer: "Extra character slots remain available even after membership expires, but you'll lose other benefits like queue priority and custom features.",
                    icon: FaUser,
                    color: "text-orange-400"
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-${faq.color.split('-')[1]}-500/20 to-${faq.color.split('-')[1]}-600/20`}>
                        <faq.icon className={`text-2xl ${faq.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{faq.question}</h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-24"
            >
              <div className="relative bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-primary/30 overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,215,0,0.1),transparent)] animate-pulse" />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="inline-flex p-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-8"
                  >
                                         <FaMagic className="text-4xl text-primary" />
                  </motion.div>
                  
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                    Ready to Upgrade Your Experience?
                  </h3>
                  <p className="text-gray-300 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
                    Join thousands of players who have enhanced their MayaaLokam experience with our premium membership plans. 
                    <span className="text-primary font-semibold"> Start your premium journey today!</span>
                  </p>
                  
                  <motion.a
                    href="https://discord.gg/2dv9AdVV"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-4 discord-btn text-white px-10 py-5 rounded-xl font-bold text-xl relative overflow-hidden group"
                  >
                    <span className="relative z-10">Get Started Now</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="relative z-10"
                    >
                      <FaBolt />
                    </motion.div>
                    
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20"
                    />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default MembershipsPage 