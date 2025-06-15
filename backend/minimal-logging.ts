interface LogLevel {
  CRITICAL: number
  ERROR: number  
  WARN: number
  INFO: number
  DEBUG: number
}

interface MinimalLogger {
  lastAlert: Map<string, number>
  alertCooldown: number
  webhookUrl: string | null
}

class MinimalLoggingSystem {
  private static instance: MinimalLoggingSystem
  private logLevel: LogLevel = {
    CRITICAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
  }
  private currentLevel: number = 2 // WARN and above by default
  private lastAlert: Map<string, number> = new Map()
  private alertCooldown: number = 15 * 60 * 1000 // 15 minutes
  private webhookUrl: string | null
  private messageBuffer: string[] = []
  private bufferFlushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.webhookUrl = process.env.ALERT_WEBHOOK_URL || null
    this.currentLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'WARN')
    this.setupBufferFlush()
  }

  public static getInstance(): MinimalLoggingSystem {
    if (!MinimalLoggingSystem.instance) {
      MinimalLoggingSystem.instance = new MinimalLoggingSystem()
    }
    return MinimalLoggingSystem.instance
  }

  private parseLogLevel(level: string): number {
    return this.logLevel[level.toUpperCase() as keyof LogLevel] ?? this.logLevel.WARN
  }

  private setupBufferFlush() {
    // Flush buffered messages every 5 minutes to reduce webhook spam
    this.bufferFlushInterval = setInterval(() => {
      if (this.messageBuffer.length > 0) {
        this.flushBuffer()
      }
    }, 5 * 60 * 1000)
  }

  private flushBuffer() {
    if (this.messageBuffer.length === 0) return

    const summary = this.createLogSummary()
    this.messageBuffer = []
    
    if (summary) {
      this.sendWebhookAlert(summary)
    }
  }

  private createLogSummary(): string | null {
    if (this.messageBuffer.length === 0) return null

    const errorCount = this.messageBuffer.filter(msg => msg.includes('ERROR')).length
    const warnCount = this.messageBuffer.filter(msg => msg.includes('WARN')).length
    const criticalCount = this.messageBuffer.filter(msg => msg.includes('CRITICAL')).length

    if (criticalCount === 0 && errorCount === 0 && warnCount < 3) {
      return null // Don't send summary for minor warnings
    }

    let summary = `📊 **MAYAAALOKAM System Summary** (${new Date().toLocaleString()})\n`
    
    if (criticalCount > 0) summary += `🚨 Critical: ${criticalCount}\n`
    if (errorCount > 0) summary += `❌ Errors: ${errorCount}\n`
    if (warnCount > 0) summary += `⚠️ Warnings: ${warnCount}\n`

    // Include only the most recent critical/error messages
    const recentCritical = this.messageBuffer
      .filter(msg => msg.includes('CRITICAL'))
      .slice(-2)
      .join('\n')
    
    if (recentCritical) {
      summary += `\n**Recent Critical:**\n${recentCritical}`
    }

    return summary
  }

  public critical(message: string, category: string = 'SYSTEM'): void {
    const logMessage = `🚨 [CRITICAL][${category}] ${message}`
    
    // Always log critical messages immediately
    console.error(logMessage)
    
    // Send immediate webhook for critical issues
    if (this.shouldSendAlert(message, 'CRITICAL')) {
      this.sendWebhookAlert(`🚨 **CRITICAL ALERT**\n${message}\n*${new Date().toISOString()}*`)
    }
  }

  public error(message: string, category: string = 'SYSTEM'): void {
    if (this.currentLevel >= this.logLevel.ERROR) {
      const logMessage = `❌ [ERROR][${category}] ${message}`
      console.error(logMessage)
      
      // Buffer error messages for summary
      if (this.shouldLog(message, 'ERROR')) {
        this.messageBuffer.push(logMessage)
      }
    }
  }

  public warn(message: string, category: string = 'SYSTEM'): void {
    if (this.currentLevel >= this.logLevel.WARN) {
      const logMessage = `⚠️ [WARN][${category}] ${message}`
      console.warn(logMessage)
      
      // Only buffer significant warnings
      if (this.isSignificantWarning(message)) {
        this.messageBuffer.push(logMessage)
      }
    }
  }

  public info(message: string, category: string = 'SYSTEM'): void {
    if (this.currentLevel >= this.logLevel.INFO) {
      // Don't send info messages to webhooks, only console
      console.log(`ℹ️ [INFO][${category}] ${message}`)
    }
  }

  public debug(message: string, category: string = 'SYSTEM'): void {
    if (this.currentLevel >= this.logLevel.DEBUG) {
      console.log(`🔍 [DEBUG][${category}] ${message}`)
    }
  }

  private shouldSendAlert(message: string, level: string): boolean {
    const key = `${level}:${message.substring(0, 50)}`
    const now = Date.now()
    const lastSent = this.lastAlert.get(key) || 0
    
    if (now - lastSent > this.alertCooldown) {
      this.lastAlert.set(key, now)
      return true
    }
    
    return false
  }

  private shouldLog(message: string, level: string): boolean {
    // Rate limit similar messages to prevent spam
    const key = `${level}:${message.substring(0, 30)}`
    const now = Date.now()
    const lastLogged = this.lastAlert.get(key) || 0
    
    if (now - lastLogged > 60000) { // 1 minute cooldown for similar messages
      this.lastAlert.set(key, now)
      return true
    }
    
    return false
  }

  private isSignificantWarning(message: string): boolean {
    const significantKeywords = [
      'failed', 'error', 'timeout', 'critical', 'unable', 'disconnected',
      'unavailable', 'degraded', 'slow', 'high', 'exceeded'
    ]
    
    return significantKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  private async sendWebhookAlert(message: string): Promise<void> {
    if (!this.webhookUrl) return

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.substring(0, 2000) // Discord message limit
        })
      })
    } catch (error) {
      // Silently fail webhook alerts to prevent infinite loops
      console.error('Failed to send webhook alert:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  public getStats(): { buffered: number; alertsSent: number; lastFlush: string } {
    return {
      buffered: this.messageBuffer.length,
      alertsSent: this.lastAlert.size,
      lastFlush: new Date().toISOString()
    }
  }

  public shutdown(): void {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval)
    }
    
    // Send final summary if there are buffered messages
    if (this.messageBuffer.length > 0) {
      this.flushBuffer()
    }
  }
}

// Create singleton instance
const minimalLogger = MinimalLoggingSystem.getInstance()

// Override console methods for minimal logging
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
}

console.error = (...args) => {
  const message = args.join(' ')
  
  // Categorize and filter console.error calls
  if (message.includes('CRITICAL') || message.includes('🚨')) {
    minimalLogger.critical(message.replace(/🚨|\[CRITICAL\]/g, '').trim())
  } else if (message.includes('Self-ping') || message.includes('keep-alive')) {
    // Minimize keep-alive/ping error noise
    if (message.includes('consecutive failures') || message.includes('failing')) {
      minimalLogger.error(message, 'KEEPALIVE')
    }
  } else if (message.includes('Discord') || message.includes('bot')) {
    minimalLogger.error(message, 'DISCORD')
  } else {
    minimalLogger.error(message)
  }
}

console.warn = (...args) => {
  const message = args.join(' ')
  
  // Filter out noisy warnings
  if (message.includes('System health:') && !message.includes('CRITICAL')) {
    // Only log health warnings once per hour
    if (minimalLogger.shouldLog && minimalLogger.shouldLog(message, 'HEALTH_WARN')) {
      minimalLogger.warn(message, 'HEALTH')
    }
  } else {
    minimalLogger.warn(message)
  }
}

// Keep info logs clean - no webhook spam
console.log = (...args) => {
  const message = args.join(' ')
  
  // Filter out excessive success messages
  if (message.includes('Self-ping') && message.includes('successful')) {
    // Only log every 10th successful ping
    const match = message.match(/Total: (\d+)\/(\d+)/)
    if (match && parseInt(match[1]) % 10 === 0) {
      minimalLogger.info(message, 'KEEPALIVE')
    }
  } else if (message.includes('✅') || message.includes('🔄') || message.includes('🛡️')) {
    // System status messages - minimal logging
    minimalLogger.info(message)
  } else {
    // Regular log messages
    originalConsole.log(...args)
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  minimalLogger.shutdown()
})

process.on('SIGTERM', () => {
  minimalLogger.shutdown()
})

export { minimalLogger, MinimalLoggingSystem }
export default minimalLogger 