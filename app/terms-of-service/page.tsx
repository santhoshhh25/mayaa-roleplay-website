'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaGavel, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const TermsOfServicePage = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FaShieldAlt,
      content: [
        "By accessing or using MAYAALOKAM ROLEPLAY services, including our FiveM server, Discord community, and website, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, you must not access or use our services.",
        "We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes."
      ]
    },
    {
      title: "Server Rules & Conduct",
      icon: FaGavel,
      content: [
        "All players must follow our community rules and roleplay guidelines at all times.",
        "Harassment, discrimination, or toxic behavior will result in immediate penalties.",
        "Cheating, exploiting, or using unauthorized modifications is strictly prohibited.",
        "Real Money Trading (RMT) or selling in-game items for real currency is forbidden.",
        "Players must maintain character immersion and avoid breaking roleplay scenarios."
      ]
    },
    {
      title: "Account Responsibility",
      icon: FaInfoCircle,
      content: [
        "You are responsible for maintaining the security of your account credentials.",
        "Sharing accounts or allowing others to use your account is prohibited.",
        "You must provide accurate information during registration and whitelist application.",
        "Any violations committed using your account will be attributed to you, regardless of who performed them."
      ]
    },
    {
      title: "Content & Intellectual Property",
      icon: FaShieldAlt,
      content: [
        "All server content, scripts, and custom modifications are proprietary to MAYAALOKAM ROLEPLAY.",
        "Players retain rights to their original roleplay characters and stories.",
        "You grant us permission to use, display, and share content you create within our community.",
        "Respect intellectual property rights of others and do not share copyrighted material without permission."
      ]
    },
    {
      title: "Disciplinary Actions",
      icon: FaExclamationTriangle,
      content: [
        "Violations may result in warnings, temporary suspensions, or permanent bans.",
        "Disciplinary decisions are made at the discretion of our staff team.",
        "Appeals process is available through our Discord community for contested actions.",
        "Repeated violations will result in escalated penalties, including permanent removal."
      ]
    },
    {
      title: "Service Availability",
      icon: FaInfoCircle,
      content: [
        "We strive to maintain 99.9% server uptime but cannot guarantee uninterrupted service.",
        "Scheduled maintenance and updates may temporarily interrupt service.",
        "We reserve the right to suspend or terminate services at any time without prior notice.",
        "No compensation will be provided for service interruptions or data loss."
      ]
    },
    {
      title: "Financial Transactions",
      icon: FaGavel,
      content: [
        "All donations and membership purchases are non-refundable unless required by law.",
        "Donations are voluntary contributions to support server operations and development.",
        "Membership benefits may change over time, and we reserve the right to modify offerings.",
        "Chargebacks or payment disputes may result in permanent account suspension."
      ]
    },
    {
      title: "Privacy & Data Collection",
      icon: FaShieldAlt,
      content: [
        "We collect and process personal data in accordance with our Privacy Policy.",
        "By using our services, you consent to our data collection and processing practices.",
        "We implement reasonable security measures to protect your personal information.",
        "Third-party services may collect additional data as outlined in their respective privacy policies."
      ]
    },
    {
      title: "Limitation of Liability",
      icon: FaExclamationTriangle,
      content: [
        "MAYAALOKAM ROLEPLAY is provided 'as is' without warranties of any kind.",
        "We are not liable for any direct, indirect, incidental, or consequential damages.",
        "Our total liability shall not exceed the amount paid by you in the preceding 12 months.",
        "You acknowledge that online gaming carries inherent risks and play at your own discretion."
      ]
    },
    {
      title: "Governing Law",
      icon: FaGavel,
      content: [
        "These terms are governed by applicable local and international laws.",
        "Any disputes will be resolved through binding arbitration or appropriate legal channels.",
        "If any provision is found unenforceable, the remaining terms remain in full effect.",
        "These terms constitute the entire agreement between you and MAYAALOKAM ROLEPLAY."
      ]
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-dark to-dark-darker">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4"
                >
                  <FaGavel className="text-2xl text-primary" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text">
                  Terms of Service
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Please read these terms carefully before using MAYAALOKAM ROLEPLAY services. 
                By accessing our server and community, you agree to abide by these terms and conditions.
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-3">
                  <FaExclamationTriangle className="text-yellow-500 mr-3" />
                  <span className="text-yellow-500 font-semibold">Important Notice</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  <br />
                  These terms are effective immediately and apply to all users of our services.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl p-6 md:p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                      <section.icon className="text-xl text-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/30"
            >
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                Questions or Concerns?
              </h3>
              <p className="text-gray-300 mb-6">
                If you have any questions about these Terms of Service or need clarification on any policies, 
                please don't hesitate to contact our team through the following channels:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="https://discord.gg/2dv9AdVV"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-3 bg-discord hover:bg-discord/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  <FaInfoCircle />
                  <span>Contact on Discord</span>
                </motion.a>
                
                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-3 bg-card hover:bg-card-hover text-white px-6 py-3 rounded-lg font-semibold border border-primary/30 hover:border-primary/50 transition-all duration-300"
                >
                  <FaShieldAlt />
                  <span>Learn More About Us</span>
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

export default TermsOfServicePage 