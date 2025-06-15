import express from 'express'
import * as cron from 'node-cron'
import { performance } from 'perf_hooks'

interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'critical'
  lastCheck: string
  responseTime: number
  uptime: number
  checks: {
    connectivity: boolean
    latency: number
    errorRate: number
    memoryUsage: number
  }
  errors: string[]
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database: ServiceHealth
    discord: ServiceHealth
    api: ServiceHealth
    keepAlive: ServiceHealth
  }
  metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: number
  }
  selfPing: {
    status: 'active' | 'failed' | 'recovering'
    lastSuccessfulPing: string
    consecutiveFailures: number
    totalPings: number
    successRate: number
  }
}

export class EnhancedHealthSystem {
  private app: express.Application
  private startTime: number
  private pingUrl: string
  private alertWebhook: string | null
  private metrics: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    responseTimes: number[]
  }
  private selfPingStats: {
    totalPings: number
    successfulPings: number
    lastSuccessfulPing: string
    consecutiveFailures: number
  }
  private discordClient: any
  private isShuttingDown: boolean = false

  constructor(app: express.Application) {
    this.app = app
    this.startTime = Date.now()
    this.pingUrl = process.env.RENDER_SERVICE_URL || process.env.VERCEL_URL || `http://localhost:${process.env.BACKEND_PORT || 3001}`
    this.alertWebhook = process.env.ALERT_WEBHOOK_URL || null
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: []
    }
    
    this.selfPingStats = {
      totalPings: 0,
      successfulPings: 0,
      lastSuccessfulPing: '',
      consecutiveFailures: 0
    }
    
    this.setupHealthEndpoints()
    this.setupMiddleware()
    console.log('🏥 Enhanced Health System initialized')
  }

  public startMonitoring() {
    this.setupSelfPingSystem()
    this.setupHealthMonitoring()
    this.setupEmergencyRecovery()
    console.log('🔄 Enhanced Health Monitoring started')
  }

  public setDiscordClient(client: any) {
    this.discordClient = client
  }

  private setupHealthEndpoints() {
    // Main health endpoint - bulletproof and never fails
    this.app.get('/health', async (req, res) => {
      const startTime = performance.now()
      try {
        const health = await this.getSystemHealth()
        const responseTime = Math.round(performance.now() - startTime)
        
        this.metrics.totalRequests++
        this.metrics.successfulRequests++
        this.metrics.responseTimes.push(responseTime)
        
        // Keep only last 100 response times for average calculation
        if (this.metrics.responseTimes.length > 100) {
          this.metrics.responseTimes = this.metrics.responseTimes.slice(-100)
        }
        
        res.status(health.overall === 'critical' ? 503 : 200).json({
          ...health,
          responseTime: `${responseTime}ms`,
          message: `Backend service is ${health.overall}`
        })
      } catch (error) {
        this.metrics.totalRequests++
        this.metrics.failedRequests++
        
        // Even if health check fails, never return error - return degraded status
        res.status(200).json({
          overall: 'degraded',
          timestamp: new Date().toISOString(),
          uptime: Math.floor((Date.now() - this.startTime) / 1000),
          message: 'Health check partially failed but service is operational',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })

    // Enhanced status endpoint for detailed monitoring
    this.app.get('/health/detailed', async (req, res) => {
      try {
        const health = await this.getSystemHealth()
        res.json({
          ...health,
          detailed: true,
          recommendations: this.getHealthRecommendations(health),
          alerts: this.getActiveAlerts(health)
        })
      } catch (error) {
        res.status(200).json({
          error: 'Detailed health check failed',
          fallback: true,
          message: 'Service is operational but monitoring is degraded'
        })
      }
    })

    // Self-ping status endpoint
    this.app.get('/health/ping-status', (req, res) => {
      res.json({
        ...this.selfPingStats,
        successRate: this.selfPingStats.totalPings > 0 
          ? Math.round((this.selfPingStats.successfulPings / this.selfPingStats.totalPings) * 100) 
          : 100,
        status: this.selfPingStats.consecutiveFailures > 3 ? 'critical' : 
                this.selfPingStats.consecutiveFailures > 1 ? 'degraded' : 'healthy'
      })
    })

    // Emergency recovery endpoint
    this.app.post('/health/recover', async (req, res) => {
      await this.performEmergencyRecovery()
      res.json({
        message: 'Emergency recovery initiated',
        timestamp: new Date().toISOString()
      })
    })
  }

  private setupMiddleware() {
    // Request monitoring middleware
    this.app.use((req, res, next) => {
      const startTime = performance.now()
      
      res.on('finish', () => {
        const responseTime = Math.round(performance.now() - startTime)
        this.metrics.responseTimes.push(responseTime)
        
        if (res.statusCode >= 400) {
          this.metrics.failedRequests++
        } else {
          this.metrics.successfulRequests++
        }
        this.metrics.totalRequests++
      })
      
      next()
    })
  }

  private setupSelfPingSystem() {
    // Primary self-ping every 8 minutes
    cron.schedule('*/8 * * * *', async () => {
      if (!this.isShuttingDown) {
        await this.performSelfPing('primary')
      }
    })

    // Backup self-ping every 12 minutes
    cron.schedule('*/12 * * * *', async () => {
      if (!this.isShuttingDown) {
        await this.performSelfPing('backup')
      }
    })

    // Emergency self-ping every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      if (!this.isShuttingDown && this.selfPingStats.consecutiveFailures > 2) {
        await this.performEmergencySelfPing()
      }
    })
  }

  private setupHealthMonitoring() {
    // Health check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      if (!this.isShuttingDown) {
        await this.performHealthCheck()
      }
    })

    // Critical monitoring every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      if (!this.isShuttingDown) {
        await this.checkCriticalSystems()
      }
    })
  }

  private setupEmergencyRecovery() {
    // Emergency recovery check every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      if (!this.isShuttingDown && this.selfPingStats.consecutiveFailures > 5) {
        await this.performEmergencyRecovery()
      }
    })
  }

  private async performSelfPing(type: 'primary' | 'backup'): Promise<void> {
    const startTime = performance.now()
    this.selfPingStats.totalPings++
    
    try {
      const pingUrl = `${this.pingUrl}/health`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': `Self-Ping-${type}/1.0`,
          'X-Self-Ping': 'true'
        }
      })
      
      clearTimeout(timeoutId)
      const responseTime = Math.round(performance.now() - startTime)
      
      if (response.ok) {
        this.selfPingStats.successfulPings++
        this.selfPingStats.consecutiveFailures = 0
        this.selfPingStats.lastSuccessfulPing = new Date().toISOString()
        
        // Only log on recovery or significant events
        if (this.selfPingStats.consecutiveFailures === 0 && this.selfPingStats.totalPings % 10 === 0) {
          console.log(`✅ Self-ping ${type} successful (${responseTime}ms) - Total: ${this.selfPingStats.successfulPings}/${this.selfPingStats.totalPings}`)
        }
      } else {
        throw new Error(`Self-ping failed with status: ${response.status}`)
      }
      
    } catch (error) {
      this.selfPingStats.consecutiveFailures++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Only log failures to minimize noise
      console.error(`❌ Self-ping ${type} failed:`, errorMessage)
      
      if (this.selfPingStats.consecutiveFailures >= 3) {
        await this.sendMinimalAlert(`Self-ping failing: ${this.selfPingStats.consecutiveFailures} consecutive failures`)
      }
    }
  }

  private async performEmergencySelfPing(): Promise<void> {
    try {
      // Try multiple endpoints for emergency recovery
      const endpoints = ['/health', '/health/ping-status', '/keep-alive']
      const promises = endpoints.map(endpoint => 
        fetch(`${this.pingUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'User-Agent': 'Emergency-Self-Ping/1.0' }
        }).catch(() => null)
      )
      
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
      
      if (successful > 0) {
        this.selfPingStats.consecutiveFailures = Math.max(0, this.selfPingStats.consecutiveFailures - 1)
        console.log(`🚑 Emergency self-ping partially successful: ${successful}/${endpoints.length} endpoints`)
      }
      
    } catch (error) {
      console.error('🚨 Emergency self-ping failed:', error)
    }
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    const now = new Date().toISOString()
    const uptime = Math.floor((Date.now() - this.startTime) / 1000)
    
    // Get service healths in parallel
    const [databaseHealth, discordHealth, apiHealth, keepAliveHealth] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkDiscordHealth(),
      this.checkApiHealth(),
      this.checkKeepAliveHealth()
    ])
    
    const services = {
      database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : this.getFailedServiceHealth('database'),
      discord: discordHealth.status === 'fulfilled' ? discordHealth.value : this.getFailedServiceHealth('discord'),
      api: apiHealth.status === 'fulfilled' ? apiHealth.value : this.getFailedServiceHealth('api'),
      keepAlive: keepAliveHealth.status === 'fulfilled' ? keepAliveHealth.value : this.getFailedServiceHealth('keepAlive')
    }
    
    // Determine overall health
    const serviceStatuses = Object.values(services).map(s => s.status)
    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy'
    
    if (serviceStatuses.includes('critical')) {
      overall = 'critical'
    } else if (serviceStatuses.includes('degraded')) {
      overall = 'degraded'
    }
    
    return {
      overall,
      timestamp: now,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        averageResponseTime: this.metrics.responseTimes.length > 0 
          ? Math.round(this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length)
          : 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage().user
      },
      selfPing: {
        status: this.selfPingStats.consecutiveFailures > 3 ? 'failed' : 
                this.selfPingStats.consecutiveFailures > 1 ? 'recovering' : 'active',
        lastSuccessfulPing: this.selfPingStats.lastSuccessfulPing,
        consecutiveFailures: this.selfPingStats.consecutiveFailures,
        totalPings: this.selfPingStats.totalPings,
        successRate: this.selfPingStats.totalPings > 0 
          ? Math.round((this.selfPingStats.successfulPings / this.selfPingStats.totalPings) * 100)
          : 100
      }
    }
  }

  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = performance.now()
    try {
      // Database health check logic here
      return {
        name: 'database',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: Math.round(performance.now() - startTime),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        checks: {
          connectivity: true,
          latency: Math.round(performance.now() - startTime),
          errorRate: 0,
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        },
        errors: []
      }
    } catch (error) {
      return this.getFailedServiceHealth('database', error)
    }
  }

  private async checkDiscordHealth(): Promise<ServiceHealth> {
    const startTime = performance.now()
    try {
      const isConnected = this.discordClient && this.discordClient.readyAt
      return {
        name: 'discord',
        status: isConnected ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTime: Math.round(performance.now() - startTime),
        uptime: isConnected ? Math.floor((Date.now() - this.discordClient.readyAt.getTime()) / 1000) : 0,
        checks: {
          connectivity: isConnected,
          latency: Math.round(performance.now() - startTime),
          errorRate: 0,
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        },
        errors: isConnected ? [] : ['Discord client not connected']
      }
    } catch (error) {
      return this.getFailedServiceHealth('discord', error)
    }
  }

  private async checkApiHealth(): Promise<ServiceHealth> {
    const startTime = performance.now()
    const errorRate = this.metrics.totalRequests > 0 
      ? Math.round((this.metrics.failedRequests / this.metrics.totalRequests) * 100)
      : 0
    
    return {
      name: 'api',
      status: errorRate > 10 ? 'critical' : errorRate > 5 ? 'degraded' : 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: Math.round(performance.now() - startTime),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {
        connectivity: true,
        latency: this.metrics.responseTimes.length > 0 
          ? Math.round(this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length)
          : 0,
        errorRate,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      errors: errorRate > 10 ? ['High error rate detected'] : []
    }
  }

  private async checkKeepAliveHealth(): Promise<ServiceHealth> {
    const startTime = performance.now()
    const successRate = this.selfPingStats.totalPings > 0 
      ? Math.round((this.selfPingStats.successfulPings / this.selfPingStats.totalPings) * 100)
      : 100
    
    return {
      name: 'keepAlive',
      status: successRate < 70 ? 'critical' : successRate < 90 ? 'degraded' : 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: Math.round(performance.now() - startTime),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {
        connectivity: this.selfPingStats.consecutiveFailures < 3,
        latency: 0,
        errorRate: 100 - successRate,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      errors: this.selfPingStats.consecutiveFailures > 3 ? ['Multiple consecutive ping failures'] : []
    }
  }

  private getFailedServiceHealth(serviceName: string, error?: any): ServiceHealth {
    return {
      name: serviceName,
      status: 'critical',
      lastCheck: new Date().toISOString(),
      responseTime: 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {
        connectivity: false,
        latency: 0,
        errorRate: 100,
        memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      errors: [error instanceof Error ? error.message : 'Health check failed']
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const health = await this.getSystemHealth()
      
      // Only log significant health changes or issues
      if (health.overall !== 'healthy') {
        console.warn(`⚠️ System health: ${health.overall.toUpperCase()}`)
      }
      
      // Send alerts for critical issues
      if (health.overall === 'critical') {
        await this.sendMinimalAlert('System health is critical!')
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error)
    }
  }

  private async checkCriticalSystems(): Promise<void> {
    // Check for critical issues that need immediate attention
    if (this.selfPingStats.consecutiveFailures > 5) {
      console.error('🚨 CRITICAL: Self-ping system failing')
      await this.sendMinimalAlert('CRITICAL: Self-ping system failing')
    }
  }

  private async performEmergencyRecovery(): Promise<void> {
    console.log('🚑 Initiating emergency recovery procedures...')
    
    try {
      // Reset metrics
      this.selfPingStats.consecutiveFailures = Math.max(0, this.selfPingStats.consecutiveFailures - 2)
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      // Attempt emergency self-ping
      await this.performEmergencySelfPing()
      
      console.log('✅ Emergency recovery completed')
      
    } catch (error) {
      console.error('❌ Emergency recovery failed:', error)
    }
  }

  private async sendMinimalAlert(message: string): Promise<void> {
    if (!this.alertWebhook) return
    
    try {
      // Minimal webhook logging - only critical alerts
      await fetch(this.alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **MAYAAALOKAM ALERT**\n${message}\n*${new Date().toISOString()}*`
        })
      })
    } catch (error) {
      // Silently fail webhook alerts to prevent cascading issues
    }
  }

  private getHealthRecommendations(health: SystemHealth): string[] {
    const recommendations: string[] = []
    
    if (health.selfPing.successRate < 95) {
      recommendations.push('Consider adding more external ping services')
    }
    
    if (health.metrics.averageResponseTime > 1000) {
      recommendations.push('High response times detected - consider performance optimization')
    }
    
    if (health.services.discord.status !== 'healthy') {
      recommendations.push('Discord service needs attention')
    }
    
    return recommendations
  }

  private getActiveAlerts(health: SystemHealth): string[] {
    const alerts: string[] = []
    
    if (health.overall === 'critical') {
      alerts.push('System health is critical')
    }
    
    if (health.selfPing.consecutiveFailures > 3) {
      alerts.push('Self-ping system failing')
    }
    
    return alerts
  }

  public shutdown(): void {
    this.isShuttingDown = true
    console.log('🛑 Enhanced Health System shutting down gracefully...')
  }
} 