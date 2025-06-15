import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import WhitelistBot, { WhitelistApplication } from './discord-bot.js'
import { EnhancedHealthSystem } from './enhanced-health-system.js'

// Initialize enhanced logging system (MUST be first!)
import './implement-better-logging.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.BACKEND_PORT || 3001

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://mayaaalokam-frontend.onrender.com',
    process.env.NEXT_PUBLIC_API_URL || ''
  ].filter(url => url !== ''),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Initialize Discord bot and Enhanced Health System
let discordBot: WhitelistBot | null = null
let healthSystem: EnhancedHealthSystem | null = null

// Rate limiting - prevent spam submissions
const submissionTracker = new Map<string, number>()
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 1

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const lastSubmission = submissionTracker.get(ip) || 0
  
  if (now - lastSubmission < RATE_LIMIT_WINDOW) {
    return false // Rate limited
  }
  
  submissionTracker.set(ip, now)
  return true // Allowed
}

async function initializeBot() {
  try {
    // Initialize Enhanced Health System first
    healthSystem = new EnhancedHealthSystem(app)
    console.log('🏥 Enhanced Health System initialized')

    try {
      discordBot = new WhitelistBot()
      await discordBot.start()
      
      // Connect Discord bot to Enhanced Health System for monitoring
      if (healthSystem && discordBot) {
        healthSystem.setDiscordClient(discordBot.getClient())
        console.log('🔗 Discord bot connected to Enhanced Health monitoring')
      }
      
      console.log('🤖 Discord bot initialized successfully')
    } catch (discordError) {
      console.error('❌ Failed to initialize Discord bot:', discordError)
      console.log('⚠️ Server will continue running without Discord bot functionality')
      console.log('💡 You can still use the web interface, but Discord integration will be unavailable')
      discordBot = null
    }
    
    console.log('✅ All systems initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize server:', error)
    process.exit(1)
  }
}

// Routes
app.get('/health', (req, res) => {
  const discordStatus = discordBot ? {
    connected: discordBot.getClient().isReady(),
    uptime: discordBot.getClient().uptime,
    guilds: discordBot.getClient().guilds.cache.size
  } : null

  res.json({ 
    status: 'ok', 
    message: 'MAYAAALOKAM Whitelist API is running',
    botStatus: discordBot ? 'connected' : 'disconnected',
    discord: discordStatus,
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      discord: discordBot && discordBot.getClient().isReady() ? 'operational' : 'unavailable'
    }
  })
})

// Discord OAuth Routes
app.get('/api/discord/callback', (req, res) => {
  try {
    const { code, error } = req.query
    
    // Force production URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://mayaaalokam-frontend.onrender.com'
    
    console.log('Discord callback - request.url:', req.url)
    console.log('Discord callback - baseUrl:', baseUrl)

    if (error) {
      console.error('Discord OAuth error:', error)
      return res.redirect(`${baseUrl}/duty-logs?error=${encodeURIComponent(error as string)}`)
    }

    if (!code) {
      console.error('No code parameter provided')
      return res.redirect(`${baseUrl}/duty-logs?error=missing_code`)
    }

    // Redirect to the frontend with the code using explicit production URL
    const redirectUrl = `${baseUrl}/duty-logs?code=${code}`
    console.log('Discord callback - redirecting to:', redirectUrl)
    res.redirect(redirectUrl)

  } catch (error) {
    console.error('Discord callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://mayaaalokam-frontend.onrender.com'
    res.redirect(`${baseUrl}/duty-logs?error=callback_error`)
  }
})

app.post('/api/discord/oauth', async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Code is required' })
    }

    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Discord OAuth configuration')
      return res.status(500).json({ 
        error: 'Discord OAuth not configured',
        details: 'Missing Discord credentials' 
      })
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Discord token exchange failed:', response.status, errorData)
      return res.status(response.status).json({ 
        error: 'Failed to exchange code for token',
        details: errorData 
      })
    }

    const tokenData = await response.json()
    
    res.json(tokenData)

  } catch (error) {
    console.error('OAuth endpoint error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.get('/api/discord/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1]

    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }
      
      const errorData = await response.text()
      console.error('Discord user fetch failed:', response.status, errorData)
      return res.status(response.status).json({ 
        error: 'Failed to fetch user data',
        details: errorData 
      })
    }

    const userData = await response.json()
    
    res.json(userData)

  } catch (error) {
    console.error('User endpoint error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.post('/api/whitelist/submit', async (req, res) => {
  try {
    // console.log('📋 Received whitelist application submission')
    
    // Rate limiting check (TEMPORARILY DISABLED FOR TESTING)
    // const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
    // if (!checkRateLimit(clientIP)) {
    //   return res.status(429).json({
    //     success: false,
    //     error: 'Too many submissions. Please wait 5 minutes before submitting again.',
    //     retryAfter: RATE_LIMIT_WINDOW
    //   })
    // }
    
    // Validate required fields
    const requiredFields = [
      'fullName', 'discordId', 'age', 'country', 'timezone',
      'characterName', 'characterAge', 'characterBackground',
      'isNewToRP', 'expectation', 'rulesRead', 'cfxLinked',
      'termsAccepted', 'ageConfirmed'
    ]

    const missingFields = requiredFields.filter(field => !req.body[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      })
    }

    // Validate Discord ID format (comprehensive check)
    const discordIdRegex = /^\d{17,20}$/  // Updated to allow up to 20 digits
    const discordId = req.body.discordId.toString().trim()
    
    if (!discordIdRegex.test(discordId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid Discord ID format. Received: "${discordId}" (${discordId.length} characters). Please provide your Discord User ID (17-20 digits only, no special characters).`,
        details: {
          received: discordId,
          length: discordId.length,
          expected: '17-20 digits only'
        }
      })
    }

    // Validate age
    const age = parseInt(req.body.age)
    if (isNaN(age) || age < 13 || age > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid age provided'
      })
    }

    // Validate character age
    const characterAge = parseInt(req.body.characterAge)
    if (isNaN(characterAge) || characterAge < 18 || characterAge > 100) {
      return res.status(400).json({
        success: false,
        error: 'Character age must be between 18 and 100'
      })
    }

    // Validate boolean fields
    if (typeof req.body.termsAccepted !== 'boolean' || !req.body.termsAccepted) {
      return res.status(400).json({
        success: false,
        error: 'Terms must be accepted'
      })
    }

    if (typeof req.body.ageConfirmed !== 'boolean' || !req.body.ageConfirmed) {
      return res.status(400).json({
        success: false,
        error: 'Age must be confirmed'
      })
    }

    // Sanitize and prepare application data
    const sanitizeText = (text: string, maxLength: number = 2000): string => {
      return text.toString().trim().slice(0, maxLength)
    }

    const applicationData: WhitelistApplication = {
      fullName: sanitizeText(req.body.fullName, 100),
      discordId: discordId,
      age: req.body.age.toString(),
      country: sanitizeText(req.body.country, 50),
      timezone: sanitizeText(req.body.timezone, 20),
      characterName: sanitizeText(req.body.characterName, 100),
      characterAge: req.body.characterAge.toString(),
      characterBackground: sanitizeText(req.body.characterBackground, 2000),
      isNewToRP: sanitizeText(req.body.isNewToRP, 10),
      rpExperience: req.body.rpExperience ? sanitizeText(req.body.rpExperience, 2000) : undefined,
      expectation: sanitizeText(req.body.expectation, 2000),
      rulesRead: sanitizeText(req.body.rulesRead, 100),
      cfxLinked: sanitizeText(req.body.cfxLinked, 100),
      termsAccepted: req.body.termsAccepted,
      ageConfirmed: req.body.ageConfirmed,
      submittedAt: new Date()
    }

    // Additional validation
    if (applicationData.fullName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Full name must be at least 2 characters long'
      })
    }

    if (applicationData.characterName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Character name must be at least 2 characters long'
      })
    }

    if (applicationData.characterBackground.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Character background must be at least 50 characters long'
      })
    }

    if (applicationData.expectation.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Expectation field must be at least 20 characters long'
      })
    }

    // console.log(`📝 Processing application for: ${applicationData.fullName} (${applicationData.discordId})`)

    // Check if Discord bot is available
    if (!discordBot) {
      console.error('❌ Discord bot not initialized - service unavailable')
      return res.status(503).json({
        success: false,
        error: 'Discord bot service unavailable',
        message: 'The Discord bot service is currently unavailable. Please try again in a few minutes.',
        details: 'This usually happens when the Discord bot is starting up or experiencing connectivity issues.'
      })
    }

    // Check if Discord bot is connected
    if (!discordBot.getClient().isReady()) {
      console.error('❌ Discord bot not ready - attempting to reconnect')
      return res.status(503).json({
        success: false,
        error: 'Discord bot service unavailable',
        message: 'The Discord bot is currently connecting. Please try again in a few minutes.',
        details: 'The bot service is starting up and should be available shortly.'
      })
    }

    // Post to Discord
    const posted = await discordBot.postWhitelistApplication(applicationData)
    
    if (!posted) {
      console.error('❌ Failed to post application to Discord')
      return res.status(500).json({
        success: false,
        error: 'Failed to post application to Discord',
        message: 'Your application could not be submitted to Discord. Please try again.',
        details: 'This may be due to Discord API issues or channel configuration problems.'
      })
    }

    // console.log(`✅ Successfully posted application for ${applicationData.fullName}`)

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        submittedAt: applicationData.submittedAt,
        applicantName: applicationData.fullName,
        discordId: applicationData.discordId
      }
    })

  } catch (error) {
    console.error('❌ Error processing whitelist application:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

// Start server
async function startServer() {
  try {
    // Initialize Discord bot first
    await initializeBot()
    
    // Clear processed applications on startup (for testing)
    if (discordBot) {
      discordBot.clearProcessedApplications()
    }
    
    // Register error handling and 404 handler AFTER all routes are set up
    // Error handling middleware
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Unhandled error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    })

    // 404 handler (must be last!)
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      })
    })
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 MAYAAALOKAM Whitelist API server running on port ${PORT}`)
      console.log(`🌐 Health check: http://localhost:${PORT}/health`)
      console.log(`📋 Submit endpoint: http://localhost:${PORT}/api/whitelist/submit`)
      
      // Start enhanced health monitoring after server is ready
      if (healthSystem) {
        healthSystem.startMonitoring()
      }
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  // console.log('\n🛑 Received SIGINT. Graceful shutdown...')
  if (discordBot) {
    discordBot.getClient().destroy()
  }
  process.exit(0)
})

process.on('SIGTERM', () => {
  // console.log('\n🛑 Received SIGTERM. Graceful shutdown...')
  if (discordBot) {
    discordBot.getClient().destroy()
  }
  process.exit(0)
})

// Start the application
startServer()