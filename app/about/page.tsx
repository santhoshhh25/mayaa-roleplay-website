'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaGamepad, FaStar, FaRocket, FaShieldAlt, FaGlobe, FaAward, FaCrown } from 'react-icons/fa'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const AboutPage = () => {
  const achievements = [
    { icon: FaShieldAlt, label: 'Server Uptime', value: '99.9%' },
    { icon: FaStar, label: 'Community Rating', value: '4.9/5' },
    { icon: FaAward, label: 'Premium Features', value: '100+' },
    { icon: FaCrown, label: 'Years of Excellence', value: '2+' },
  ]

  const values = [
    {
      icon: FaHeart,
      title: 'Community Excellence',
      description: 'We prioritize genuine connections and meaningful interactions that create lasting bonds within our Telugu gaming family.',
      color: 'text-red-400'
    },
    {
      icon: FaRocket,
      title: 'Innovation & Quality',
      description: 'Cutting-edge technology meets creative storytelling to deliver an unparalleled roleplay experience.',
      color: 'text-blue-400'
    },
    {
      icon: FaShieldAlt,
      title: 'Trust & Security',
      description: 'Advanced anti-cheat systems and fair moderation ensure a safe, welcoming environment for all members.',
      color: 'text-green-400'
    },
    {
      icon: FaGlobe,
      title: 'Cultural Heritage',
      description: 'Celebrating Telugu culture while embracing global gaming standards to create something truly unique.',
      color: 'text-purple-400'
    },
  ]

  const features = [
    {
      title: 'Premium Infrastructure',
      description: 'State-of-the-art servers ensuring 99.9% uptime with minimal latency for seamless gameplay.',
      icon: '🏗️'
    },
    {
      title: 'Custom Development',
      description: 'Proprietary scripts and features designed specifically for our community\'s unique needs.',
      icon: '⚙️'
    },
    {
      title: 'Professional Management',
      description: '24/7 dedicated staff with years of experience in server management and community building.',
      icon: '👥'
    },
    {
      title: 'Continuous Evolution',
      description: 'Regular updates and new content based on community feedback and industry best practices.',
      icon: '🚀'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6"
              >
                <FaAward className="text-primary text-sm sm:text-base" />
                <span className="text-primary font-semibold text-sm sm:text-base">Premium Roleplay Experience</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold gradient-text mb-6 sm:mb-8 px-2 sm:px-0"
              >
                About MAYAAALOKAM
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4"
              >
                Where Telugu culture meets cutting-edge roleplay technology. 
                A premium gaming destination built by passionate developers, 
                for the global Telugu community.
              </motion.p>
            </motion.div>

            {/* Achievements Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <achievement.icon className="text-3xl sm:text-4xl lg:text-5xl text-primary mx-auto mb-3 sm:mb-4 lg:mb-6" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">{achievement.value}</div>
                  <div className="text-gray-400 font-medium text-sm sm:text-base">{achievement.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-dark-400/20 via-dark-300/30 to-dark-400/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6 sm:space-y-8 order-2 lg:order-1"
              >
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6"
                  >
                    <FaGamepad className="text-primary text-xs sm:text-sm" />
                    <span className="text-primary text-xs sm:text-sm font-semibold">Our Story</span>
                  </motion.div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text mb-6 sm:mb-8">
                    Built for Excellence
                  </h2>
                </div>
                
                <div className="space-y-4 sm:space-y-6 text-gray-300 text-base sm:text-lg leading-relaxed">
                  <p>
                    MAYAAALOKAM represents the pinnacle of roleplay gaming, where authentic Telugu culture 
                    seamlessly blends with cutting-edge technology. Our vision was clear from the beginning: 
                    create a digital world that honors our heritage while pushing the boundaries of immersive storytelling.
                  </p>
                  <p>
                    Every aspect of our server has been meticulously crafted by industry professionals who understand 
                    both the technical demands of modern gaming and the cultural nuances that make our community special. 
                    We don't just host games – we curate experiences.
                  </p>
                  <p>
                    Today, MAYAAALOKAM stands as a testament to what passionate innovation can achieve. 
                    We've created more than a server; we've built a digital home where every story matters, 
                    every interaction is meaningful, and every moment is crafted to perfection.
                  </p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
                >
                  <motion.a
                    href="/whitelist"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary hover:bg-primary/90 text-dark px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-glow w-full sm:w-auto text-center"
                  >
                    Join Our World
                  </motion.a>
                  
                  <motion.a
                    href="/rules"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300 text-center sm:text-left"
                  >
                    Learn More →
                  </motion.a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative order-1 lg:order-2"
              >
                <motion.div
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-gradient-to-br from-card via-card-hover to-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center border border-primary/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/30">
                      <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-dark">ML</span>
                    </div>
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-4 sm:mb-6">
                    Premium Excellence
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base lg:text-lg">
                    Where every detail matters, every story counts, and every experience 
                    is crafted to exceed expectations. Welcome to the future of roleplay.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16 lg:mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6"
              >
                <FaStar className="text-primary text-sm sm:text-base" />
                <span className="text-primary font-semibold text-sm sm:text-base">Our Core Values</span>
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text mb-6 sm:mb-8 px-2 sm:px-0">
                What Drives Us
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-2 sm:px-4">
                The fundamental principles that shape every decision, every feature, 
                and every interaction within our gaming universe.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-primary/10 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                    <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0 self-start">
                      <value.icon className={`text-2xl sm:text-3xl ${value.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 sm:mb-4">{value.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-base sm:text-lg">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-br from-dark-400/20 via-dark-300/30 to-dark-400/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
                Why Choose Excellence
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Behind every great experience lies exceptional infrastructure, 
                dedicated craftsmanship, and unwavering commitment to quality.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-white/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mayaavi Games Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
                Powered by Mayaavi Games
              </h2>
              <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-12">
                MAYAAALOKAM is proudly developed and maintained by Mayaavi Games, 
                a leading gaming company dedicated to creating innovative and immersive experiences 
                that push the boundaries of what's possible in digital entertainment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-12 border border-primary/20"
            >
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-block mb-6"
                >
                  <Image
                    src="https://mayaavigames.com/wp-content/uploads/2024/04/mayaavi-logo-1-1-1.png"
                    alt="Mayaavi Games"
                    width={300}
                    height={100}
                    className="h-20 w-auto mx-auto"
                    quality={80}
                    sizes="(max-width: 640px) 200px, 300px"
                  />
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-card/50 rounded-2xl p-6 text-center">
                  <h4 className="font-bold text-white mb-3 text-lg">Industry Expertise</h4>
                  <p className="text-gray-400">Years of experience in game development and server management</p>
                </div>
                <div className="bg-card/50 rounded-2xl p-6 text-center">
                  <h4 className="font-bold text-white mb-3 text-lg">24/7 Excellence</h4>
                  <p className="text-gray-400">Round-the-clock monitoring and professional support services</p>
                </div>
                <div className="bg-card/50 rounded-2xl p-6 text-center">
                  <h4 className="font-bold text-white mb-3 text-lg">Continuous Innovation</h4>
                  <p className="text-gray-400">Regular updates and cutting-edge feature development</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.a
                  href="https://mayaavigames.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/90 text-dark px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-glow inline-flex items-center space-x-3"
                >
                  <span>Visit Mayaavi Games</span>
                  <FaRocket className="text-lg" />
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-dark-400/20 via-dark-300/30 to-dark-400/20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-8">
                Ready to Begin Your Story?
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Join thousands of storytellers in the most immersive Telugu roleplay experience. 
                Your adventure starts with a single click.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                <motion.a
                  href="/whitelist"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/90 text-dark px-12 py-5 rounded-xl font-bold text-xl transition-all duration-300 hover:shadow-glow"
                >
                  Apply for Whitelist
                </motion.a>
                
                <motion.a
                  href="https://discord.gg/2dv9AdVV"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="discord-btn text-white px-12 py-5 rounded-xl font-bold text-xl flex items-center space-x-3"
                >
                  <span>Join Our Community</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default AboutPage 