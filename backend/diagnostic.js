import dotenv from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'

dotenv.config()

class DiagnosticTool {
  constructor() {
    this.issues = []
    this.warnings = []
    this.passed = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      'error': '❌',
      'warning': '⚠️',
      'success': '✅',
      'info': 'ℹ️'
    }[type] || 'ℹ️'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
    
    if (type === 'error') this.issues.push(message)
    else if (type === 'warning') this.warnings.push(message)
    else if (type === 'success') this.passed.push(message)
  }

  async runDiagnostics() {
    console.log('🔍 MAYAAALOKAM ROLEPLAY - DIAGNOSTIC TOOL')
    console.log('=' * 50)
    
    this.checkEnvironmentVariables()
    await this.checkDiscordBot()
    await this.checkChannels()
    await this.checkDependencies()
    
    this.generateReport()
  }

  checkEnvironmentVariables() {
    this.log('🔧 Checking Environment Variables...', 'info')
    
    const requiredVars = [
      'BOT_TOKEN',
      'APPLICATION_GUILD_ID',
      'DUTY_LOGS_GUILD_ID',
      'DUTY_LOGS_CHANNEL_ID',
      'DUTY_LOGS_AUTHORIZED_ROLES',
      'NEXT_PUBLIC_API_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        this.log(`${varName}: ✓ Set`, 'success')
      } else {
        this.log(`${varName}: ✗ Missing`, 'error')
      }
    })

    // Check for common issues
    if (process.env.NEXT_PUBLIC_API_URL === 'http://localhost:3000') {
      this.log('NEXT_PUBLIC_API_URL is set to localhost - this will cause issues in production', 'warning')
    }

    if (process.env.BOT_TOKEN && process.env.BOT_TOKEN.length < 50) {
      this.log('BOT_TOKEN appears to be invalid (too short)', 'error')
    }
  }

  async checkDiscordBot() {
    this.log('🤖 Testing Discord Bot Connection...', 'info')
    
    try {
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      })

      await client.login(process.env.BOT_TOKEN)
      this.log('Discord bot login successful', 'success')
      
      const guilds = client.guilds.cache
      this.log(`Connected to ${guilds.size} guild(s)`, 'info')
      
      guilds.forEach(guild => {
        this.log(`Guild: ${guild.name} (ID: ${guild.id})`, 'info')
      })
      
      client.destroy()
      
    } catch (error) {
      this.log(`Discord bot connection failed: ${error.message}`, 'error')
    }
  }

  async checkChannels() {
    this.log('📺 Checking Discord Channels...', 'info')
    
    try {
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      })

      await client.login(process.env.BOT_TOKEN)
      
      const channelIds = [
        process.env.DUTY_LOGS_CHANNEL_ID,
        process.env.FORM_CHANNEL_ID,
        process.env.RESPONSE_CHANNEL_ID
      ].filter(Boolean)

      for (const channelId of channelIds) {
        try {
          const channel = await client.channels.fetch(channelId)
          if (channel) {
            this.log(`Channel ${channelId}: ✓ Accessible (${channel.name})`, 'success')
          } else {
            this.log(`Channel ${channelId}: ✗ Not found`, 'error')
          }
        } catch (error) {
          this.log(`Channel ${channelId}: ✗ Error - ${error.message}`, 'error')
        }
      }
      
      client.destroy()
      
    } catch (error) {
      this.log(`Channel check failed: ${error.message}`, 'error')
    }
  }

  async checkDependencies() {
    this.log('📦 Checking Dependencies...', 'info')
    
    try {
      const fs = await import('fs')
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      
      const criticalDeps = ['discord.js', 'next', 'react', '@supabase/supabase-js']
      
      criticalDeps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          this.log(`${dep}: ✓ Version ${packageJson.dependencies[dep]}`, 'success')
        } else {
          this.log(`${dep}: ✗ Missing from dependencies`, 'error')
        }
      })
      
    } catch (error) {
      this.log(`Dependency check failed: ${error.message}`, 'error')
    }
  }

  generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT')
    console.log('=' * 50)
    
    console.log(`\n✅ PASSED CHECKS: ${this.passed.length}`)
    console.log(`⚠️  WARNINGS: ${this.warnings.length}`)
    console.log(`❌ ISSUES FOUND: ${this.issues.length}`)
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      this.warnings.forEach(warning => console.log(`   • ${warning}`))
    }
    
    if (this.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:')
      this.issues.forEach(issue => console.log(`   • ${issue}`))
      
      console.log('\n🔧 RECOMMENDED ACTIONS:')
      console.log('   1. Fix all environment variables')
      console.log('   2. Verify Discord bot permissions')
      console.log('   3. Check Discord channel access')
      console.log('   4. Redeploy both frontend and backend services')
    } else {
      console.log('\n🎉 All checks passed! Your deployment should be working correctly.')
    }
    
    console.log('\n💡 ADDITIONAL TIPS:')
    console.log('   • Use "npm run post-duty-panel" to manually post duty panel')
    console.log('   • Check Render logs for runtime errors')
    console.log('   • Verify environment variables are set correctly in Render dashboard')
  }
}

// Run diagnostics
const diagnostic = new DiagnosticTool()
diagnostic.runDiagnostics().catch(console.error) 