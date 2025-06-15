'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  FaPaperPlane, 
  FaCheckCircle, 
  FaUser, 
  FaGlobe, 
  FaGamepad, 
  FaDiscord,
  FaIdCard,
  FaCalendarAlt,
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaBookOpen,
  FaStar,
  FaEnvelope,
  FaBell,
  FaRocket,
  FaHome
} from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

interface WhitelistFormData {
  // Step 1: Personal Information
  fullName: string
  discordId: string
  age: string
  country: string
  timezone: string
  
  // Step 2: Character & RP Information
  characterName: string
  characterAge: string
  characterBackground: string
  isNewToRP: string
  rpExperience?: string
  expectation: string
  
  // Step 3: Agreement
  rulesRead: string
  cfxLinked: string
  termsAccepted: boolean
  ageConfirmed: boolean
}

const WhitelistPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [serviceStatus, setServiceStatus] = useState<{
    api: string
    discord: string
    lastChecked?: Date
  } | null>(null)
  const [showServiceWarning, setShowServiceWarning] = useState(false)
  const totalSteps = 3

  const { register, handleSubmit, formState: { errors }, reset, trigger, getValues, watch, setValue } = useForm<WhitelistFormData>({
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange'
  })
  
  const isNewToRP = watch('isNewToRP')
  
  // Watch all form fields for real-time validation
  const watchedFields = watch()

  // Comprehensive list of blocked words (case-insensitive)
  const blockedWords = [
    // English profanity
    'fuck', 'fucking', 'fucker', 'fucked', 'fuk', 'fck', 'f*ck', 'f**k',
    'shit', 'shit', 'crap', 'damn', 'bitch', 'bastard', 'asshole', 'ass',
    'sex', 'sexy', 'porn', 'xxx', 'nude', 'naked', 'dick', 'cock', 'penis',
    'pussy', 'vagina', 'boobs', 'tits', 'breast', 'anal', 'oral',
    
    // Gaming/Internet slang
    'noob', 'nub', 'newb', 'scrub', 'trash', 'garbage', 'loser', 'idiot',
    'stupid', 'dumb', 'retard', 'gay', 'fag', 'homo', 'lesbian',
    
    // Hindi/Urdu profanity
    'chutiya', 'chutiye', 'madarchod', 'bhenchod', 'behen', 'sister',
    'gandu', 'randi', 'raand', 'saala', 'sala', 'kutte', 'kutta',
    'lavda', 'lund', 'loda', 'gaand', 'gand', 'chut', 'bhosadi',
    'mc', 'bc', 'ma ki', 'teri ma', 'maa ki', 'behenchod',
    
    // Other inappropriate terms
    'admin', 'mod', 'moderator', 'owner', 'staff', 'helper', 'support',
    'test', 'testing', 'sample', 'example', 'demo', 'trial',
    'none', 'null', 'undefined', 'blank', 'empty', 'na', 'n/a',
    'unknown', 'anonymous', 'anon', 'temp', 'temporary', 'fake',
    
    // Numbers as names
    '123', '111', '000', '999', '69', '420',
    
    // Common inappropriate combinations
    'your mom', 'ur mom', 'yo mama', 'deez nuts', 'ligma', 'sugma',
    'joe mama', 'candice', 'updog', 'bofa',
    
    // Racist terms (keeping minimal for detection)
    'nigga', 'nigger', 'negro', 'nazi', 'hitler', 'terrorist',
    
    // Drug references
    'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'drug', 'drugs',
    'high', 'stoned', 'drunk', 'alcohol', 'beer', 'vodka', 'whiskey'
  ]

  // Function to check for blocked words
  const containsBlockedWords = (text: string): string[] => {
    if (!text) return []
    const lowerText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    const words = lowerText.split(/\s+/)
    const foundBlockedWords: string[] = []
    
    // Check individual words
    words.forEach(word => {
      if (blockedWords.includes(word)) {
        foundBlockedWords.push(word)
      }
    })
    
    // Check for blocked words within the text (partial matches)
    blockedWords.forEach(blockedWord => {
      if (lowerText.includes(blockedWord)) {
        foundBlockedWords.push(blockedWord)
      }
    })
    
    return Array.from(new Set(foundBlockedWords)) // Remove duplicates
  }

  // Function to count words in text
  const countWords = (text: string): number => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Function to validate names
  const validateName = (name: string, fieldName: string) => {
    if (!name) return `${fieldName} is required`
    
    // Check minimum length only
    if (name.length < 2) return `${fieldName} must be at least 2 characters`
    
    return true
  }

  // Real-time validation function with visual feedback
  const validateFieldRealTime = (fieldName: keyof WhitelistFormData, value: string) => {
    setTimeout(() => {
      trigger(fieldName)
    }, 100) // Small delay to prevent excessive validation calls
  }

  // Enhanced Discord ID handler with real-time validation
  const handleDiscordIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Remove all non-digits
    setValue('discordId', value)
    validateFieldRealTime('discordId', value)
  }

  // Real-time name validation handler
  const handleNameInput = (fieldName: 'fullName' | 'characterName') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue(fieldName, value)
    validateFieldRealTime(fieldName, value)
  }

  // Real-time textarea validation handler
  const handleTextareaInput = (fieldName: 'characterBackground' | 'rpExperience' | 'expectation') => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setValue(fieldName, value)
    validateFieldRealTime(fieldName, value)
  }

  // Enhanced spam protection
  const checkSpamProtection = () => {
    const now = Date.now()
    const timeSinceLastSubmit = now - lastSubmitTime
    
    // Rate limiting: Max 1 submission per 5 minutes
    if (timeSinceLastSubmit < 300000) { // 5 minutes
      const remainingTime = Math.ceil((300000 - timeSinceLastSubmit) / 60000)
      throw new Error(`Please wait ${remainingTime} more minutes before submitting another application.`)
    }
    
    // Attempt limiting: Max 3 attempts per hour
    const storedAttempts = localStorage.getItem('whitelistAttempts')
    const storedTime = localStorage.getItem('whitelistAttemptsTime')
    
    if (storedAttempts && storedTime) {
      const attempts = parseInt(storedAttempts)
      const time = parseInt(storedTime)
      const hoursSinceFirstAttempt = (now - time) / (1000 * 60 * 60)
      
      if (hoursSinceFirstAttempt < 1 && attempts >= 3) {
        throw new Error('Too many submission attempts. Please wait 1 hour before trying again.')
      }
      
      if (hoursSinceFirstAttempt >= 1) {
        // Reset attempts after 1 hour
        localStorage.setItem('whitelistAttempts', '1')
        localStorage.setItem('whitelistAttemptsTime', now.toString())
      } else {
        localStorage.setItem('whitelistAttempts', (attempts + 1).toString())
      }
    } else {
      localStorage.setItem('whitelistAttempts', '1')
      localStorage.setItem('whitelistAttemptsTime', now.toString())
    }
    
    setLastSubmitTime(now)
    setSubmitAttempts(prev => prev + 1)
  }

  // Enhanced form validation
  const validateFormData = (data: WhitelistFormData) => {
    // Additional security checks
    const errors: string[] = []
    
    // Validate full name
    const fullNameValidation = validateName(data.fullName, 'Full name')
    if (fullNameValidation !== true) {
      errors.push(fullNameValidation)
    }
    
    // Validate character name
    const characterNameValidation = validateName(data.characterName, 'Character name')
    if (characterNameValidation !== true) {
      errors.push(characterNameValidation)
    }
    
    // Check for duplicate names
    if (data.fullName.toLowerCase().trim() === data.characterName.toLowerCase().trim()) {
      errors.push('Character name must be different from your real name')
    }
    
    // Validate Discord ID format
    if (!/^\d{17,20}$/.test(data.discordId)) {
      errors.push('Discord ID must be 17-20 digits long')
    }
    
    // Validate age
    const age = parseInt(data.age)
    if (isNaN(age) || age < 16 || age > 99) {
      errors.push('Age must be between 16 and 99')
    }
    
    // Check character background word count
    if (data.characterBackground) {
      const wordCount = countWords(data.characterBackground)
      if (wordCount < 50) {
        errors.push('Character background must be at least 50 words')
      }
    }
    
    // Check expectations word count
    if (data.expectation) {
      const wordCount = countWords(data.expectation)
      if (wordCount < 20) {
        errors.push('Expectations must be at least 20 words')
      }
    }
    
    return errors
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const validateAndSubmit = async (data: WhitelistFormData) => {
    try {
      // Check service status before submission
      if (serviceStatus?.discord === 'unavailable') {
        const userConfirmed = confirm(
          '⚠️ Discord Service Unavailable\n\n' +
          'Our Discord bot is currently unavailable, which means your application may not be processed immediately. ' +
          'You can still submit your application, and it will be processed once the service is restored.\n\n' +
          'Do you want to proceed with the submission?'
        )
        
        if (!userConfirmed) {
          return
        }
      }
      
      // Check spam protection first
      checkSpamProtection()
      
      // Enhanced form validation
      const validationErrors = validateFormData(data)
      if (validationErrors.length > 0) {
        alert('❌ Validation Failed:\n' + validationErrors.join('\n'))
        return
      }

      // Determine required fields based on RP experience selection
      const baseStep2Fields: (keyof WhitelistFormData)[] = ['characterName', 'characterAge', 'characterBackground', 'isNewToRP', 'expectation']
      const step2Fields: (keyof WhitelistFormData)[] = isNewToRP === 'No' 
        ? [...baseStep2Fields, 'rpExperience']
        : baseStep2Fields

      // Validate all required fields before submission
      const allFields: (keyof WhitelistFormData)[] = [
        'fullName', 'discordId', 'age', 'country', 'timezone',
        ...step2Fields,
        'rulesRead', 'cfxLinked', 'termsAccepted', 'ageConfirmed'
      ]
      
      const isValid = await trigger(allFields)
      
      if (!isValid) {
        // Find first step with errors and navigate to it
        const step1Fields: (keyof WhitelistFormData)[] = ['fullName', 'discordId', 'age', 'country', 'timezone']
        const step3Fields: (keyof WhitelistFormData)[] = ['rulesRead', 'cfxLinked', 'termsAccepted', 'ageConfirmed']
        
        const hasStep1Errors = step1Fields.some(field => errors[field])
        const hasStep2Errors = step2Fields.some(field => errors[field])
        
        if (hasStep1Errors) {
          setCurrentStep(1)
        } else if (hasStep2Errors) {
          setCurrentStep(2)
        } else {
          setCurrentStep(3)
        }
        return
      }
      
      // If all valid, proceed with submission
      setIsSubmitting(true)
      
      try {
        // Submit to Discord bot via API
        const response = await fetch('/api/whitelist/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            submissionTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            submitAttempts: submitAttempts + 1
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit application')
        }

        console.log('✅ Application submitted successfully:', result)
        setIsSubmitted(true)
        reset()
        setCurrentStep(1)
        
        // Clear attempts on successful submission
        localStorage.removeItem('whitelistAttempts')
        localStorage.removeItem('whitelistAttemptsTime')
        
      } catch (error) {
        console.error('❌ Error submitting application:', error)
        
        // Enhanced error handling with user-friendly messages
        if (error instanceof TypeError && error.message.includes('fetch')) {
          alert('🔌 Connection Error: Unable to reach the server. Please check your internet connection and try again.')
        } else if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()
          
          if (errorMessage.includes('discord bot service unavailable')) {
            alert('🤖 Discord Service Unavailable\n\nOur Discord bot is currently starting up or experiencing connectivity issues. This is usually temporary.\n\nPlease try again in 2-3 minutes. If the issue persists, contact our support team.')
          } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            alert('⏱️ Rate Limited: Please wait 5 minutes before submitting another application.')
          } else if (errorMessage.includes('400') || errorMessage.includes('validation')) {
            alert('📝 Invalid Data: Please check all fields and ensure your information is correct.')
          } else if (errorMessage.includes('500') || errorMessage.includes('internal server error')) {
            alert('🔧 Server Error: Our services may be temporarily unavailable. Please try again in a few minutes.')
          } else if (errorMessage.includes('failed to post application to discord')) {
            alert('📡 Discord Integration Error\n\nWe couldn\'t send your application to Discord. This might be due to:\n• Discord API issues\n• Channel configuration problems\n\nPlease try again in a few minutes.')
          } else {
            alert(`❌ Submission Failed: ${error.message}\n\nPlease verify your information and try again. If the problem persists, contact support.`)
          }
        } else {
          alert('❌ Unexpected Error: Something went wrong. Please refresh the page and try again.')
        }
      } finally {
        setIsSubmitting(false)
      }
    } catch (spamError) {
      if (spamError instanceof Error) {
        alert(`🚫 ${spamError.message}`)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 
    'China', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 
    'Ireland', 'Italy', 'Japan', 'Malaysia', 'Mexico', 'Netherlands', 'Norway', 'Pakistan', 'Philippines', 'Poland',
    'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 
    'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Other'
  ]

  const timezones = [
    'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00',
    'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00',
    'UTC+04:00', 'UTC+05:00', 'UTC+05:30 (IST)', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00',
    'UTC+11:00', 'UTC+12:00'
  ]

  // Check service status on component mount and periodically
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        
        setServiceStatus({
          api: data.services?.api || 'unknown',
          discord: data.services?.discord || 'unknown',
          lastChecked: new Date()
        })
        
        // Show warning if Discord service is unavailable
        if (data.services?.discord !== 'operational') {
          setShowServiceWarning(true)
        } else {
          setShowServiceWarning(false)
        }
      } catch (error) {
        console.warn('Could not check service status:', error)
        setServiceStatus({
          api: 'unknown',
          discord: 'unknown',
          lastChecked: new Date()
        })
        setShowServiceWarning(true)
      }
    }

    // Check immediately
    checkServiceStatus()
    
    // Check every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isSubmitted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-dark relative overflow-hidden">
          <Navbar />
          
          {/* Subtle Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-32 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* Minimalist Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="mb-12"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-primary/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <FaCheckCircle className="text-4xl text-primary" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Clean Typography */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-6 mb-16"
              >
                <h1 className="text-4xl md:text-5xl font-display font-light text-white tracking-tight">
                  Application
                  <span className="block font-bold gradient-text">Submitted</span>
                </h1>
                
                <p className="text-xl text-gray-300 font-light leading-relaxed max-w-lg mx-auto">
                  Welcome to MAYAAALOKAM. Your journey begins now.
                </p>
                
                <div className="pt-4">
                  <div className="inline-flex items-center space-x-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    <FaClock className="text-xs" />
                    <span>Review within 24 hours</span>
                  </div>
                </div>
              </motion.div>

              {/* Simplified Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-gradient-to-br from-card/30 to-card/10 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/5"
              >
                <h3 className="text-xl font-semibold text-white mb-6">What&apos;s Next?</h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <span className="text-gray-300">Application review by our team</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <span className="text-gray-300">Discord notification with results</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <span className="text-gray-300">Server access and onboarding</span>
                  </div>
                </div>
              </motion.div>

              {/* Minimal Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-gradient-to-r from-primary/90 to-primary/80 text-dark px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-3 min-h-[56px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FaHome className="text-lg relative z-10" />
                  <span className="relative z-10">Return Home</span>
                </motion.a>
                
                <motion.a
                  href="https://discord.gg/2dv9AdVV"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-gradient-to-r from-transparent to-transparent border-2 border-primary/30 text-primary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 flex items-center justify-center space-x-3 min-h-[56px] backdrop-blur-sm"
                >
                  <FaDiscord className="text-lg" />
                  <span>Join Discord</span>
                </motion.a>
              </motion.div>

              {/* Application ID - Minimal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-12 pt-8 border-t border-white/5"
              >
                <p className="text-xs text-gray-500 font-mono tracking-wider">
                  ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark">
        <Navbar />
        
        <section className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 sm:mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-3 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-primary/20"
              >
                <FaShieldAlt className="text-primary text-sm" />
                <span className="text-primary text-sm font-semibold">Whitelist Application</span>
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-3 sm:mb-4">
                Join Our Community
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Complete your application in 3 simple steps to become part of MAYAAALOKAM.
              </p>
            </motion.div>

            {/* Application Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0"
            >
              <div className="bg-card/50 rounded-xl p-4 sm:p-6 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:bg-card/70">
                <FaShieldAlt className="text-3xl sm:text-4xl text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-bold text-white mb-2 text-sm sm:text-base">Age 16+</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Must be at least 16 years old</p>
              </div>
              <div className="bg-card/50 rounded-xl p-4 sm:p-6 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:bg-card/70">
                <FaBookOpen className="text-3xl sm:text-4xl text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-bold text-white mb-2 text-sm sm:text-base">Read Rules</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Understand our guidelines</p>
              </div>
              <div className="bg-card/50 rounded-xl p-4 sm:p-6 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:bg-card/70">
                <FaGamepad className="text-3xl sm:text-4xl text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="font-bold text-white mb-2 text-sm sm:text-base">FiveM Ready</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Have FiveM installed</p>
              </div>
            </motion.div>

            {/* Premium Progress Bar */}
            <div className="mb-8 sm:mb-12 px-4 sm:px-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary/30 border-t-primary rounded-full"
                  />
                  <span className="text-base sm:text-lg font-semibold text-white">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {Math.round(((currentStep - 1) / totalSteps) * 100)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Complete</div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gradient-to-r from-dark-400/50 to-dark-400/80 rounded-full h-3 sm:h-4 overflow-hidden backdrop-blur-sm border border-white/5">
                  <motion.div
                    className="bg-gradient-to-r from-primary via-accent to-primary h-3 sm:h-4 rounded-full relative overflow-hidden bg-[length:200%_100%]"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((currentStep - 1) / totalSteps) * 100}%`,
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ 
                      width: { duration: 0.8, ease: "easeInOut" },
                      backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
                
                {/* Step indicators */}
                <div className="absolute top-0 w-full flex justify-between">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <motion.div
                      key={step}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-500 ${
                        step < currentStep
                          ? 'bg-primary border-primary shadow-primary/50 shadow-lg'
                          : step === currentStep
                          ? 'bg-primary/50 border-primary border-dashed shadow-primary/30 shadow-md'
                          : 'bg-dark-400 border-gray-600'
                      }`}
                      animate={step <= currentStep ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, delay: step * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form Container */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative bg-gradient-to-br from-card/60 via-card/40 to-card/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-primary/30 shadow-2xl overflow-hidden mx-4 sm:mx-0"
            >
              {/* Premium background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl sm:rounded-3xl" />
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-16 sm:-translate-y-32 translate-x-16 sm:translate-x-32" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-accent/10 rounded-full blur-3xl translate-y-12 sm:translate-y-24 -translate-x-12 sm:-translate-x-24" />
              
              {/* Service Status Warning */}
              {showServiceWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-20 mb-6 p-4 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-yellow-400 text-sm">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-yellow-400 font-semibold text-sm mb-1">
                        Discord Service Status
                      </h4>
                      <p className="text-yellow-300/90 text-sm leading-relaxed">
                        {serviceStatus?.discord === 'unavailable' 
                          ? 'Our Discord bot is currently starting up or experiencing connectivity issues. You can still fill out the form, but submission may be temporarily unavailable.'
                          : 'We\'re experiencing some connectivity issues. Your application may not submit immediately.'
                        }
                      </p>
                      {serviceStatus?.lastChecked && (
                        <p className="text-yellow-400/70 text-xs mt-2">
                          Last checked: {serviceStatus.lastChecked.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Content with relative positioning */}
              <div className="relative z-10">
              <form onSubmit={handleSubmit(validateAndSubmit)}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Personal Information</h2>
                        <p className="text-gray-400">Tell us about yourself</p>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-4">
                        <label htmlFor="fullName" className="flex items-center space-x-3 text-white font-semibold text-lg">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center"
                          >
                            <FaUser className="text-primary text-sm" />
                          </motion.div>
                          <span>Your Full Name *</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            id="fullName"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md group-hover:from-gray-800/90 group-hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.fullName ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-primary focus:shadow-primary/25 focus:shadow-xl hover:border-primary/50 hover:shadow-primary/15 hover:shadow-lg'
                            }`}
                            placeholder="Enter your full name"
                            {...register('fullName', { 
                              required: 'Full name is required',
                              validate: (value) => validateName(value, 'Full name')
                            })}
                            onChange={handleNameInput('fullName')}
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          {/* Real-time validation indicator */}
                          {watchedFields.fullName && !errors.fullName && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                        </div>
                        {errors.fullName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30"
                          >
                            <span>⚠️</span>
                            <span>{errors.fullName.message}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Discord User ID */}
                      <div className="space-y-4">
                        <label htmlFor="discordId" className="flex items-center space-x-3 text-white font-semibold text-lg">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                            className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center"
                          >
                            <FaDiscord className="text-blue-400 text-sm" />
                          </motion.div>
                          <span>Discord User ID *</span>
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            id="discordId"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md group-hover:from-gray-800/90 group-hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.discordId ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-blue-400 focus:shadow-blue-500/25 focus:shadow-xl hover:border-blue-400/50 hover:shadow-blue-500/15 hover:shadow-lg'
                            }`}
                            placeholder="123456789012345678"
                            {...register('discordId', { 
                              required: 'Discord user ID is required',
                              pattern: {
                                value: /^\d{17,20}$/,
                                message: 'Discord user ID must be 17-20 digits long'
                              }
                            })}
                            onChange={handleDiscordIdInput}
                            maxLength={20}
                            inputMode="numeric"
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          {/* Discord ID validation indicator */}
                          {watchedFields.discordId && !errors.discordId && watchedFields.discordId.length >= 17 && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                          
                          {/* Character count indicator for Discord ID */}
                          {watchedFields.discordId && (
                            <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-dark/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                              {watchedFields.discordId.length}/20
                            </div>
                          )}
                        </div>
                        
                        {/* Help text for finding Discord ID */}
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <p className="text-blue-400 text-sm font-medium mb-2">
                            💡 How to find your Discord User ID:
                          </p>
                          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                            <li>Open Discord Settings (gear icon)</li>
                            <li>Go to Advanced → Enable &quot;Developer Mode&quot;</li>
                            <li>Right-click your profile → &quot;Copy User ID&quot;</li>
                          </ol>
                        </div>
                        
                        {errors.discordId && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30"
                          >
                            <span>⚠️</span>
                            <span>{errors.discordId.message}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Age, Country, Timezone */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <label htmlFor="age" className="flex items-center space-x-2 text-white font-medium">
                            <FaCalendarAlt className="text-primary" />
                            <span>Age *</span>
                          </label>
                          <select
                            id="age"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.age ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-primary focus:shadow-primary/25 focus:shadow-xl hover:border-primary/50 hover:shadow-primary/15 hover:shadow-lg'
                            }`}
                            {...register('age', { required: 'Age is required' })}
                          >
                            <option value="" className="bg-dark text-gray-400">Select age</option>
                            {Array.from({ length: 50 }, (_, i) => i + 16).map(age => (
                              <option key={age} value={age} className="bg-dark text-white">{age}</option>
                            ))}
                          </select>
                          {errors.age && (
                            <p className="text-red-400 text-sm">{errors.age.message}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="country" className="flex items-center space-x-2 text-white font-medium">
                            <FaGlobe className="text-primary" />
                            <span>Country *</span>
                          </label>
                          <select
                            id="country"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.country ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-green-400 focus:shadow-green-500/25 focus:shadow-xl hover:border-green-400/50 hover:shadow-green-500/15 hover:shadow-lg'
                            }`}
                            {...register('country', { required: 'Country is required' })}
                          >
                            <option value="" className="bg-dark text-gray-400">Select country</option>
                            {countries.map((country) => (
                              <option key={country} value={country} className="bg-dark text-white">{country}</option>
                            ))}
                          </select>
                          {errors.country && (
                            <p className="text-red-400 text-sm">{errors.country.message}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="timezone" className="flex items-center space-x-2 text-white font-medium">
                            <FaClock className="text-primary" />
                            <span>Timezone *</span>
                          </label>
                          <select
                            id="timezone"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.timezone ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-cyan-400 focus:shadow-cyan-500/25 focus:shadow-xl hover:border-cyan-400/50 hover:shadow-cyan-500/15 hover:shadow-lg'
                            }`}
                            {...register('timezone', { required: 'Timezone is required' })}
                          >
                            <option value="" className="bg-dark text-gray-400">Select timezone</option>
                            {timezones.map((tz) => (
                              <option key={tz} value={tz} className="bg-dark text-white">{tz}</option>
                            ))}
                          </select>
                          {errors.timezone && (
                            <p className="text-red-400 text-sm">{errors.timezone.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Character & RP Information */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Character & Roleplay</h2>
                        <p className="text-gray-400">Create your character and tell us about your RP experience</p>
                      </div>

                      {/* Character Name & Age */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label htmlFor="characterName" className="flex items-center space-x-2 text-white font-medium">
                            <FaIdCard className="text-primary" />
                            <span>Character Name *</span>
                          </label>
                          <input
                            type="text"
                            id="characterName"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.characterName ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-emerald-400 focus:shadow-emerald-500/25 focus:shadow-xl hover:border-emerald-400/50 hover:shadow-emerald-500/15 hover:shadow-lg'
                            }`}
                            placeholder="John Doe"
                            {...register('characterName', { 
                              required: 'Character name is required',
                              validate: (value) => validateName(value, 'Character name')
                            })}
                            onChange={handleNameInput('characterName')}
                          />
                          
                          {/* Character name validation indicator */}
                          {watchedFields.characterName && !errors.characterName && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                          
                          {errors.characterName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30 mt-2"
                            >
                              <span>⚠️</span>
                              <span>{errors.characterName.message}</span>
                            </motion.p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <label htmlFor="characterAge" className="flex items-center space-x-2 text-white font-medium">
                            <FaCalendarAlt className="text-primary" />
                            <span>Character Age *</span>
                          </label>
                          <select
                            id="characterAge"
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 font-medium text-lg focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.characterAge ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-amber-400 focus:shadow-amber-500/25 focus:shadow-xl hover:border-amber-400/50 hover:shadow-amber-500/15 hover:shadow-lg'
                            }`}
                            {...register('characterAge', { required: 'Character age is required' })}
                          >
                            <option value="" className="bg-dark text-gray-400">Select age</option>
                            {Array.from({ length: 65 }, (_, i) => i + 18).map(age => (
                              <option key={age} value={age} className="bg-dark text-white">{age}</option>
                            ))}
                          </select>
                          {errors.characterAge && (
                            <p className="text-red-400 text-sm">{errors.characterAge.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Character Background */}
                      <div className="space-y-4">
                        <label htmlFor="characterBackground" className="flex items-center space-x-3 text-white font-semibold text-lg">
                          <motion.div
                            animate={{ 
                              rotateY: [0, 180, 360],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center"
                          >
                            <FaEdit className="text-purple-400 text-sm" />
                          </motion.div>
                          <span>Character Background Story *</span>
                        </label>
                        <div className="relative">
                          <textarea
                            id="characterBackground"
                            rows={5}
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 resize-none backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg leading-relaxed focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.characterBackground ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-cyan-400 focus:shadow-cyan-500/25 focus:shadow-xl hover:border-cyan-400/50 hover:shadow-cyan-500/15 hover:shadow-lg'
                            }`}
                            placeholder="Tell us a detailed story about your character. Their origins, motivations, and personality..."
                            {...register('characterBackground', { 
                              required: 'Character background is required',
                              validate: (value) => {
                                if (!value) return 'Character background is required'
                                const wordCount = countWords(value)
                                if (wordCount < 50) {
                                  return `Background must be at least 50 words (currently ${wordCount} words)`
                                }
                                return true
                              }
                            })}
                            onChange={handleTextareaInput('characterBackground')}
                          />
                          
                          {/* Character background validation indicator */}
                          {watchedFields.characterBackground && !errors.characterBackground && countWords(watchedFields.characterBackground) >= 50 && (
                            <div className="absolute top-3 right-4">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                        </div>
                        
                        {errors.characterBackground && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30"
                          >
                            <span>⚠️</span>
                            <span>{errors.characterBackground.message}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Are you new to roleplay? */}
                      <div className="space-y-3">
                        <label className="block text-white font-medium">
                          Are you new to roleplay? *
                        </label>
                        <div className="space-y-3">
                          {['Yes, I am new to roleplay', 'No, I have roleplay experience'].map((option) => (
                            <label key={option} className="flex items-center space-x-3 cursor-pointer bg-dark/30 p-4 rounded-xl hover:bg-dark/50 transition-colors">
                              <input
                                type="radio"
                                value={option.startsWith('Yes') ? 'Yes' : 'No'}
                                className="w-5 h-5 text-primary focus:ring-primary"
                                {...register('isNewToRP', { required: 'Please select your roleplay experience level' })}
                              />
                              <span className="text-gray-300">{option}</span>
                            </label>
                          ))}
                        </div>
                        {errors.isNewToRP && (
                          <p className="text-red-400 text-sm">{errors.isNewToRP.message}</p>
                        )}
                      </div>

                      {/* Conditional RP Experience Field */}
                      {isNewToRP === 'No' && (
                        <div className="space-y-3">
                          <label htmlFor="rpExperience" className="flex items-center space-x-2 text-white font-medium">
                            <FaGamepad className="text-primary" />
                            <span>Tell us about your roleplay experience *</span>
                          </label>
                          <div className="relative">
                          <textarea
                            id="rpExperience"
                            rows={4}
                            className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 resize-none backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg leading-relaxed focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                              errors.rpExperience ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-indigo-400 focus:shadow-indigo-500/25 focus:shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-500/15 hover:shadow-lg'
                            }`}
                            placeholder="Describe your previous roleplay experience, servers you've played on, favorite character types, etc..."
                            {...register('rpExperience', isNewToRP === 'No' ? { 
                              required: 'Please describe your RP experience',
                              minLength: { value: 10, message: 'Description must be at least 10 characters' }
                            } : {})}
                            onChange={handleTextareaInput('rpExperience')}
                          />
                          
                          {/* RP Experience validation indicator */}
                          {watchedFields.rpExperience && !errors.rpExperience && watchedFields.rpExperience.length >= 10 && (
                            <div className="absolute top-3 right-4">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                          
                          {errors.rpExperience && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30 mt-2"
                            >
                              <span>⚠️</span>
                              <span>{errors.rpExperience.message}</span>
                            </motion.p>
                          )}
                          </div>
                        </div>
                      )}

                      {/* What are you looking for? */}
                      <div className="space-y-3">
                        <label htmlFor="expectation" className="flex items-center space-x-2 text-white font-medium">
                          <FaStar className="text-primary" />
                          <span>What are you looking for in a roleplay server? *</span>
                        </label>
                        <div className="relative">
                        <textarea
                          id="expectation"
                          rows={3}
                          className={`w-full px-6 py-5 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 rounded-2xl text-white focus:outline-none transition-all duration-500 resize-none backdrop-blur-md hover:from-gray-800/90 hover:to-gray-900/70 placeholder:text-gray-400 font-medium text-lg leading-relaxed focus:bg-gradient-to-br focus:from-gray-800/90 focus:to-gray-900/80 ${
                            errors.expectation ? 'border-red-400 shadow-red-500/25 shadow-xl bg-red-900/20' : 'border-gray-700/60 focus:border-rose-400 focus:shadow-rose-500/25 focus:shadow-xl hover:border-rose-400/50 hover:shadow-rose-500/15 hover:shadow-lg'
                          }`}
                          placeholder="e.g., Serious RP, making friends, exploring the city, business RP, police/criminal RP..."
                          {...register('expectation', { 
                            required: 'Please tell us what you expect',
                            validate: (value) => {
                              if (!value) return 'Please tell us what you expect'
                              const wordCount = countWords(value)
                              if (wordCount < 20) {
                                return `Response must be at least 20 words (currently ${wordCount} words)`
                              }
                              return true
                            }
                          })}
                                                     onChange={handleTextareaInput('expectation')}
                          />
                          
                          {/* Expectation validation indicator */}
                          {watchedFields.expectation && !errors.expectation && countWords(watchedFields.expectation) >= 20 && (
                            <div className="absolute top-3 right-4">
                              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                            </div>
                          )}
                          
                          {errors.expectation && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-sm font-medium flex items-center space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-400/30 mt-2"
                            >
                              <span>⚠️</span>
                                                            <span>{errors.expectation.message}</span>
                            </motion.p>
                          )}
                        </div>
                        </div>
                    </motion.div>
                  )}

                  {/* Step 3: Final Agreement */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Final Steps</h2>
                        <p className="text-gray-400">Complete your application</p>
                      </div>

                      {/* Application Summary */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
                        <h3 className="text-primary font-bold text-xl mb-6">Application Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div>
                            <p className="text-gray-400 mb-1">Full Name:</p>
                            <p className="text-white font-medium">{getValues('fullName') || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Character Name:</p>
                            <p className="text-white font-medium">{getValues('characterName') || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Discord:</p>
                            <p className="text-white font-medium">{getValues('discordId') || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Country:</p>
                            <p className="text-white font-medium">{getValues('country') || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rules & FiveM Check */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="block text-white font-medium">
                            Have you read and understood our server rules? *
                          </label>
                          <div className="space-y-3">
                            {['Yes, I have read and understood all rules', 'I need to read them first'].map((option) => (
                              <label key={option} className="flex items-center space-x-3 cursor-pointer bg-dark/30 p-4 rounded-xl hover:bg-dark/50 transition-colors">
                                <input
                                  type="radio"
                                  value={option}
                                  className="w-5 h-5 text-primary focus:ring-primary"
                                  {...register('rulesRead', { required: 'Please confirm you have read the rules' })}
                                />
                                <span className="text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.rulesRead && (
                            <p className="text-red-400 text-sm">{errors.rulesRead.message}</p>
                          )}
                          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <p className="text-primary text-sm">
                              📖 <a href="/rules" target="_blank" className="underline hover:text-primary/80">Read our server rules here</a> before continuing.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-white font-medium">
                            Do you have FiveM installed with a CFX account? *
                          </label>
                          <div className="space-y-3">
                            {['Yes, everything is ready', 'Yes, but need setup help', 'No, not yet'].map((option) => (
                              <label key={option} className="flex items-center space-x-3 cursor-pointer bg-dark/30 p-4 rounded-xl hover:bg-dark/50 transition-colors">
                                <input
                                  type="radio"
                                  value={option}
                                  className="w-5 h-5 text-primary focus:ring-primary"
                                  {...register('cfxLinked', { required: 'Please confirm your FiveM status' })}
                                />
                                <span className="text-gray-300">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.cfxLinked && (
                            <p className="text-red-400 text-sm">{errors.cfxLinked.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Agreement Checkboxes */}
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4 p-4 bg-dark/30 rounded-xl">
                          <input
                            type="checkbox"
                            id="ageConfirmed"
                            className="w-5 h-5 mt-1 text-primary focus:ring-primary rounded"
                            {...register('ageConfirmed', { required: 'You must confirm your age' })}
                          />
                          <label htmlFor="ageConfirmed" className="text-gray-300 flex-1">
                            I confirm that I am at least 16 years old and eligible to play on this server. *
                          </label>
                        </div>
                        {errors.ageConfirmed && (
                          <p className="text-red-400 text-sm">{errors.ageConfirmed.message}</p>
                        )}

                        <div className="flex items-start space-x-4 p-4 bg-dark/30 rounded-xl">
                          <input
                            type="checkbox"
                            id="termsAccepted"
                            className="w-5 h-5 mt-1 text-primary focus:ring-primary rounded"
                            {...register('termsAccepted', { required: 'You must accept the terms' })}
                          />
                          <label htmlFor="termsAccepted" className="text-gray-300 flex-1">
                            I agree to follow all server rules, respect other players, and understand that breaking rules may result in punishment or ban. *
                          </label>
                        </div>
                        {errors.termsAccepted && (
                          <p className="text-red-400 text-sm">{errors.termsAccepted.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Premium Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-12 sm:mt-16 space-y-4 sm:space-y-0">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    whileHover={{ scale: currentStep === 1 ? 1 : 1.05, x: currentStep === 1 ? 0 : -3 }}
                    whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
                    className={`relative flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-500 text-sm sm:text-lg overflow-hidden w-full sm:w-auto min-h-[48px] ${
                      currentStep === 1 
                        ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-dark/80 to-dark/60 text-white hover:from-dark hover:to-dark/80 border-2 border-white/10 hover:border-primary/40 shadow-lg hover:shadow-primary/20'
                    }`}
                  >
                    {currentStep !== 1 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <motion.div
                      animate={currentStep !== 1 ? { x: [0, -3, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="relative z-10"
                    >
                      <FaArrowLeft className="text-sm sm:text-base" />
                    </motion.div>
                    <span className="relative z-10">Previous</span>
                  </motion.button>

                  {currentStep < totalSteps ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      whileHover={{ scale: 1.05, x: 3 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-dark px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-lg overflow-hidden w-full sm:w-auto min-h-[48px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">Next Step</span>
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="relative z-10"
                      >
                        <FaArrowRight className="text-sm sm:text-base" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                      className={`relative px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-4 text-sm sm:text-lg overflow-hidden w-full sm:w-auto min-h-[48px] ${
                        isSubmitting 
                          ? 'bg-gray-600/30 cursor-not-allowed text-gray-500' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:shadow-2xl hover:shadow-green-500/30'
                      }`}
                    >
                      {!isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      )}
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-400 border-t-transparent rounded-full relative z-10"
                          />
                          <span className="relative z-10">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ 
                              rotate: [0, 15, -15, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                            className="relative z-10"
                          >
                            <FaPaperPlane className="text-sm sm:text-base" />
                          </motion.div>
                          <span className="relative z-10">Submit Application</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 sm:mt-12 text-center px-4 sm:px-0"
            >
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Need help with your application?</p>
              <motion.a
                href="https://discord.gg/2dv9AdVV"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors duration-300 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg min-h-[44px]"
              >
                <FaDiscord className="text-sm sm:text-base" />
                <span className="text-sm sm:text-base">Contact us on Discord</span>
              </motion.a>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  )
}

export default WhitelistPage 