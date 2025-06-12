'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaEye, FaLock, FaDatabase, FaCookie, FaUserShield, FaGlobe } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: FaDatabase,
      content: [
        "Account Information: Discord ID, username, email address (if provided), and whitelist application details.",
        "Gameplay Data: Character information, in-game activities, chat logs, and server interaction data.",
        "Technical Data: IP addresses, device information, browser type, and connection logs for security purposes.",
        "Communication Data: Messages sent through our Discord server, support tickets, and community interactions.",
        "Payment Information: Transaction details for donations and memberships (processed securely through third-party providers)."
      ]
    },
    {
      title: "How We Use Your Information",
      icon: FaEye,
      content: [
        "Server Administration: Managing player accounts, whitelist applications, and maintaining server security.",
        "Community Management: Moderating Discord channels, enforcing rules, and facilitating community events.",
        "Service Improvement: Analyzing usage patterns to enhance gameplay experience and fix technical issues.",
        "Communication: Sending important updates, announcements, and responding to support requests.",
        "Legal Compliance: Meeting legal obligations and protecting against fraud, abuse, or security threats."
      ]
    },
    {
      title: "Information Sharing",
      icon: FaUserShield,
      content: [
        "We do not sell, rent, or trade your personal information to third parties for commercial purposes.",
        "Staff members have access to necessary information for server administration and moderation duties.",
        "Anonymous usage statistics may be shared with service providers to improve server performance.",
        "Legal authorities may receive information if required by law enforcement or court orders.",
        "Trusted partners (payment processors, hosting providers) may process data under strict confidentiality agreements."
      ]
    },
    {
      title: "Data Security",
      icon: FaLock,
      content: [
        "We implement industry-standard security measures to protect your personal information.",
        "All data transmissions are encrypted using SSL/TLS protocols.",
        "Access to personal data is restricted to authorized staff members only.",
        "Regular security audits and updates are performed to maintain data protection standards.",
        "Despite our efforts, no system is 100% secure, and we cannot guarantee absolute data security."
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: FaCookie,
      content: [
        "Our website uses essential cookies to provide basic functionality and user authentication.",
        "Analytics cookies help us understand how visitors interact with our website and services.",
        "Third-party services (Discord, payment processors) may set their own cookies per their privacy policies.",
        "You can control cookie settings through your browser, but some features may not function properly if disabled.",
        "We do not use cookies for invasive tracking or targeted advertising purposes."
      ]
    },
    {
      title: "Data Retention",
      icon: FaDatabase,
      content: [
        "Account data is retained as long as your account remains active and in good standing.",
        "Gameplay logs and chat history may be stored for up to 12 months for administrative purposes.",
        "Banned users' data may be retained indefinitely to prevent ban evasion and maintain security.",
        "Payment records are kept for tax and legal compliance purposes as required by law.",
        "You may request data deletion by contacting our team, subject to legal and operational requirements."
      ]
    },
    {
      title: "Your Rights",
      icon: FaUserShield,
      content: [
        "Access: You can request a copy of the personal information we hold about you.",
        "Correction: You may request corrections to inaccurate or incomplete personal information.",
        "Deletion: You can request deletion of your personal data, subject to certain limitations.",
        "Portability: You may request a copy of your data in a commonly used, machine-readable format.",
        "Objection: You can object to certain types of data processing, such as marketing communications."
      ]
    },
    {
      title: "Third-Party Services",
      icon: FaGlobe,
      content: [
        "Discord: Our primary communication platform, governed by Discord's Privacy Policy.",
        "Payment Processors: Secure handling of donation and membership transactions.",
        "Hosting Providers: Server infrastructure and website hosting services.",
        "Analytics Services: Understanding website usage and performance metrics.",
        "These services have their own privacy policies, and we encourage you to review them."
      ]
    },
    {
      title: "International Data Transfers",
      icon: FaGlobe,
      content: [
        "Our services may involve data transfers to countries with different privacy laws.",
        "We ensure adequate protection measures are in place for international data transfers.",
        "By using our services, you consent to the transfer of your data as necessary for service provision.",
        "We comply with applicable data protection regulations, including GDPR where applicable."
      ]
    },
    {
      title: "Children's Privacy",
      icon: FaUserShield,
      content: [
        "Our services are intended for users aged 13 and older, in compliance with online privacy laws.",
        "We do not knowingly collect personal information from children under 13 years of age.",
        "If we become aware that a child under 13 has provided personal information, we will delete it promptly.",
        "Parents or guardians who believe their child has provided information should contact us immediately."
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
                  <FaShieldAlt className="text-2xl text-primary" />
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text">
                  Privacy Policy
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Your privacy is important to us. This policy explains how MAYAALOKAM ROLEPLAY 
                collects, uses, and protects your personal information when you use our services.
              </p>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-3">
                  <FaShieldAlt className="text-blue-500 mr-3" />
                  <span className="text-blue-500 font-semibold">Privacy Commitment</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  <br />
                  We are committed to protecting your privacy and being transparent about our data practices.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Privacy Content */}
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

            {/* Contact for Privacy Concerns */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/30"
            >
              <h3 className="text-2xl font-display font-bold text-white mb-4">
                Privacy Inquiries & Data Requests
              </h3>
              <p className="text-gray-300 mb-6">
                If you have questions about this Privacy Policy, want to exercise your privacy rights, 
                or need to submit a data request, please contact us through one of the following methods:
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
                  <FaLock />
                  <span>Privacy Support</span>
                </motion.a>
                
                <motion.a
                  href="/terms-of-service"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-3 bg-card hover:bg-card-hover text-white px-6 py-3 rounded-lg font-semibold border border-primary/30 hover:border-primary/50 transition-all duration-300"
                >
                  <FaEye />
                  <span>Terms of Service</span>
                </motion.a>
              </div>

              <div className="mt-6 p-4 bg-dark/50 rounded-lg">
                <p className="text-sm text-gray-400">
                  <strong>Data Protection Officer:</strong> For serious privacy concerns or legal compliance issues, 
                  you may contact our designated data protection team through our Discord server with a ticket marked "PRIVACY REQUEST".
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default PrivacyPolicyPage 