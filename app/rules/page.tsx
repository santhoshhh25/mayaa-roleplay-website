'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGamepad, FaUsers, FaGavel, FaBolt, FaExclamationTriangle, FaClipboardList, FaDiscord, FaChevronDown, FaChevronUp, FaShieldAlt, FaBook, FaStar, FaBan, FaEye, FaHandsHelping } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const RulesPage = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['general'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const ruleCategories = [
    {
      id: 'general',
      title: 'General Gameplay Rules',
      icon: FaGamepad,
      color: 'text-primary',
      bgGradient: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
      description: 'Essential rules for all roleplay activities',
      rules: [
        {
          title: '🧑‍🤝‍🧑 Respect Everyone',
          description: 'No ego, attitude, or selfish behavior. We want a fun, respectful community where everyone feels welcome.',
          severity: 'high'
        },
        {
          title: '🎭 Roleplay is Key',
          description: 'Stick to character at all times. Use in-game chat and emotes to create engaging stories, not just game mechanics.',
          severity: 'high'
        },
        {
          title: '🛑 No Fail RP',
          description: 'Don\'t break character or do unrealistic actions. Think about your character\'s life and make believable decisions.',
          severity: 'high'
        },
        {
          title: '💬 Prioritize Roleplay',
          description: 'Focus on interaction and storytelling, not just the game\'s features. Use /me and emotes for extra depth.',
          severity: 'medium'
        }
      ]
    },
    {
      id: 'character',
      title: 'Character Development',
      icon: FaUsers,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-400/30',
      description: 'Guidelines for creating and playing your character',
      rules: [
        {
          title: '🧑‍🎤 Realistic Characters',
          description: 'Create characters with depth and personality. No clones, real-life imitations, or overpowered personas.',
          severity: 'medium'
        },
        {
          title: '💡 Develop Your Character',
          description: 'Think about your character\'s backstory, motivations, fears, and flaws. No "cops and robbers" only mentality.',
          severity: 'low'
        },
        {
          title: '🧓 Age Restrictions',
          description: 'All characters must be 18+ years old. Keep character ages realistic and appropriate.',
          severity: 'high'
        }
      ]
    },
    {
      id: 'behavior',
      title: 'Behavioral Expectations',
      icon: FaGavel,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-400/30',
      description: 'Standards for interactions and conduct',
      rules: [
        {
          title: '🚫 No Meta-Gaming',
          description: 'Never use out-of-character information during in-character roleplay. Keep OOC and IC separate.',
          severity: 'high'
        },
        {
          title: '⚔️ No Random Deathmatching',
          description: 'Don\'t attack other players without proper roleplay context and buildup.',
          severity: 'high'
        },
        {
          title: '💀 No Revenge RP',
          description: 'Avoid targeting players repeatedly for past actions. No harassment or grudge-holding.',
          severity: 'high'
        },
        {
          title: '🏙️ Respect Safe Zones',
          description: 'Don\'t commit crimes in monitored areas like hospitals, police stations, or spawn points.',
          severity: 'medium'
        },
        {
          title: '⚡ No Combat Logging',
          description: 'Never leave roleplay situations to avoid consequences. Stay and roleplay it out.',
          severity: 'high'
        }
      ]
    },
    {
      id: 'special',
      title: 'Special Scenarios & Restrictions',
      icon: FaBolt,
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-400/30',
      description: 'Rules for specific situations and content',
      rules: [
        {
          title: '💥 No Power Gaming',
          description: 'Don\'t manipulate game mechanics unfairly or use unrealistic emotes to gain advantages.',
          severity: 'high'
        },
        {
          title: '🔞 No Explicit Content',
          description: 'Keep all content appropriate. No sexual, violent, or disturbing roleplay scenarios.',
          severity: 'high'
        },
        {
          title: '⚖️ No Targeting EMS/Police',
          description: 'Don\'t harm, kidnap, or unnecessarily target emergency services personnel.',
          severity: 'high'
        },
        {
          title: '🚔 Crime & Law Enforcement',
          description: 'When engaging in criminal activities, always prioritize roleplay and story over quick wins.',
          severity: 'medium'
        },
        {
          title: '💣 Heists & Gang Activities',
          description: 'Follow specific cooldown rules for heists, turf wars, and organized criminal activities.',
          severity: 'medium'
        }
      ]
    },
    {
      id: 'violations',
      title: 'Serious Violations',
      icon: FaBan,
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/20 to-orange-500/5',
      borderColor: 'border-orange-400/30',
      description: 'Actions that result in immediate consequences',
      rules: [
        {
          title: '🔒 No Hacking/Exploiting',
          description: 'Using cheats, bugs, or exploits results in immediate permanent ban. Report bugs instead.',
          severity: 'critical'
        },
        {
          title: '🛑 Gunplay Over Roleplay',
          description: 'Don\'t escalate to violence unnecessarily. Always try dialogue and creative conflict resolution first.',
          severity: 'high'
        },
        {
          title: '⚖️ No Spawn Camping',
          description: 'Don\'t target spawn locations, safe zones, or public areas for easy kills or robberies.',
          severity: 'high'
        }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Guidelines',
      icon: FaClipboardList,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-400/30',
      description: 'Important supplementary rules and policies',
      rules: [
        {
          title: '🔄 New Life Rule (NLR)',
          description: 'After character death, forget everything leading up to it. No re-engaging in the same situation.',
          severity: 'medium'
        },
        {
          title: '🏙️ Activity Cooldowns',
          description: 'Follow cooldown periods for robberies, heists, and other criminal activities as specified.',
          severity: 'low'
        },
        {
          title: '🛑 Language & Content',
          description: 'Keep language appropriate. Excessive profanity or inappropriate content may result in warnings.',
          severity: 'medium'
        }
      ]
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-200'
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-200'
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
      case 'low': return 'bg-green-500/20 border-green-500/50 text-green-200'
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-200'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'CRITICAL'
      case 'high': return 'HIGH'
      case 'medium': return 'MEDIUM'
      case 'low': return 'INFO'
      default: return 'INFO'
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        {/* Enhanced Hero Section */}
        <section className="pt-24 pb-16 px-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-primary/30"
              >
                <FaShieldAlt className="text-primary text-lg" />
                <span className="text-primary font-semibold">Community Guidelines</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-5xl md:text-7xl font-display font-bold gradient-text mb-6"
              >
                Server Rules
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed"
              >
                Our comprehensive guidelines ensure everyone enjoys a premium roleplay experience. 
                Click on any section below to explore the detailed rules and expectations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap justify-center gap-4 mb-8"
              >
                <div className="flex items-center space-x-2 bg-dark/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/20">
                  <FaBook className="text-primary text-sm" />
                  <span className="text-gray-300 text-sm">Easy to Read</span>
                </div>
                <div className="flex items-center space-x-2 bg-dark/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-accent/20">
                  <FaStar className="text-accent text-sm" />
                  <span className="text-gray-300 text-sm">Organized Sections</span>
                </div>
                <div className="flex items-center space-x-2 bg-dark/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/20">
                  <FaEye className="text-green-400 text-sm" />
                  <span className="text-gray-300 text-sm">Clear Examples</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Premium Collapsible Rules Sections */}
            <div className="space-y-6 max-w-5xl mx-auto">
              {ruleCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl rounded-2xl border transition-all duration-500 hover:shadow-2xl overflow-hidden ${
                    expandedSections.includes(category.id) 
                      ? `${category.borderColor} shadow-lg` 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Collapsible Header */}
                  <motion.button
                    onClick={() => toggleSection(category.id)}
                    className="w-full p-6 text-left focus:outline-none group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className={`p-3 rounded-xl bg-gradient-to-br ${category.bgGradient} transition-all duration-300`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <category.icon className={`text-2xl ${category.color}`} />
                        </motion.div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-primary transition-colors duration-300">
                            {category.title}
                          </h2>
                          <p className="text-gray-400 mt-1 text-sm md:text-base">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      
                      <motion.div
                        animate={{ rotate: expandedSections.includes(category.id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl text-gray-400 group-hover:text-primary transition-colors duration-300"
                      >
                        <FaChevronDown />
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {expandedSections.includes(category.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                          
                          <div className="grid gap-4">
                            {category.rules.map((rule, ruleIndex) => (
                              <motion.div
                                key={ruleIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: ruleIndex * 0.1 }}
                                className="group bg-dark/40 backdrop-blur-sm rounded-xl p-5 border border-white/5 hover:border-primary/30 hover:bg-dark/60 transition-all duration-300"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300 flex-1">
                                    {rule.title}
                                  </h3>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getSeverityColor(rule.severity)} ml-3`}>
                                    {getSeverityLabel(rule.severity)}
                                  </span>
                                </div>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                  {rule.description}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Quick Access Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-xl rounded-2xl p-8 border border-primary/20 max-w-4xl mx-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-6"
                >
                  <FaHandsHelping className="text-4xl text-primary mx-auto mb-4" />
                </motion.div>
                
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                  Need Help or Want to Report Something?
                </h3>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Our staff team is here to help! Whether you have questions about the rules or need to report a violation, 
                  we&apos;re committed to maintaining a fair and enjoyable environment for everyone.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <motion.a
                    href="https://discord.gg/2dv9AdVV"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary hover:bg-primary/90 text-dark px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-glow flex items-center space-x-3"
                  >
                    <FaDiscord className="text-xl" />
                    <span>Join Discord</span>
                  </motion.a>
                  
                  <motion.a
                    href="/whitelist"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-card to-card-hover hover:from-card-hover hover:to-card text-white px-8 py-4 rounded-xl font-bold border border-primary/30 hover:border-primary/50 transition-all duration-300 flex items-center space-x-3"
                  >
                    <FaGamepad className="text-lg" />
                    <span>Apply Now</span>
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

export default RulesPage