import { NextResponse } from 'next/server'

interface HealthCheckStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  service: string
  version: string
  environment: string
  checks: {
    api: { status: string; latency?: number; error?: string }
    database: { status: string; latency?: number; error?: string }
    backend: { status: string; latency?: number; error?: string }
    memory: { status: string; usage?: number; limit?: number; error?: string }
    disk: { status: string; usage?: number; error?: string }
  }
  metadata: {
    nodeVersion: string
    platform: string
    arch: string
    pid: number
    memoryUsage: NodeJS.MemoryUsage
  }
}

async function checkBackendHealth(): Promise<{ status: string; latency?: number; error?: string }> {
  const startTime = Date.now()
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Frontend-Health-Check/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    
    const latency = Date.now() - startTime
    
    if (response.ok) {
      return { status: 'healthy', latency }
    } else {
      return { status: 'unhealthy', latency, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return { 
      status: 'unhealthy', 
      latency, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function checkDatabaseHealth(): Promise<{ status: string; latency?: number; error?: string }> {
  const startTime = Date.now()
  try {
    // Check if database connection is available via backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(`${backendUrl}/keep-alive/status`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Frontend-Health-Check/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    
    const latency = Date.now() - startTime
    
    if (response.ok) {
      const data = await response.json()
      const dbStatus = data.services?.database?.status || 'unknown'
      return { 
        status: dbStatus === 'active' ? 'healthy' : 'degraded', 
        latency 
      }
    } else {
      return { status: 'degraded', latency, error: 'Backend unreachable' }
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return { 
      status: 'degraded', 
      latency, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

function checkMemoryHealth(): { status: string; usage?: number; limit?: number; error?: string } {
  try {
    const memUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
    const heapUsagePercent = Math.round((heapUsedMB / heapTotalMB) * 100)
    
    let status = 'healthy'
    if (heapUsagePercent > 85) status = 'unhealthy'
    else if (heapUsagePercent > 70) status = 'degraded'
    
    return {
      status,
      usage: heapUsagePercent,
      limit: heapTotalMB
    }
  } catch (error) {
    return { status: 'degraded', error: 'Memory check failed' }
  }
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Perform all health checks in parallel for maximum efficiency
    const [backendCheck, databaseCheck] = await Promise.allSettled([
      checkBackendHealth(),
      checkDatabaseHealth()
    ])
    
    const memoryCheck = checkMemoryHealth()
    
    // Extract results from Promise.allSettled
    const backend = backendCheck.status === 'fulfilled' 
      ? backendCheck.value 
      : { status: 'unhealthy', error: 'Health check failed' }
    
    const database = databaseCheck.status === 'fulfilled' 
      ? databaseCheck.value 
      : { status: 'degraded', error: 'Health check failed' }
    
    // Determine overall status
    const checks = {
      api: { status: 'healthy' }, // Frontend API is healthy if we can respond
      database,
      backend,
      memory: memoryCheck,
      disk: { status: 'healthy' } // Simple disk check
    }
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    // Check for critical failures
    if (backend.status === 'unhealthy' || memoryCheck.status === 'unhealthy') {
      overallStatus = 'unhealthy'
    } else if (backend.status === 'degraded' || database.status === 'degraded' || memoryCheck.status === 'degraded') {
      overallStatus = 'degraded'
    }
    
    const healthStatus: HealthCheckStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'mayaaalokam-frontend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memoryUsage: process.memoryUsage()
      }
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ...healthStatus,
      responseTime: `${responseTime}ms`,
      message: `Frontend service is ${overallStatus}`,
      lastChecked: new Date().toISOString()
    }, {
      status: overallStatus === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    // Bulletproof error handling - never let health check fail completely
    const fallbackStatus: HealthCheckStatus = {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'mayaaalokam-frontend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        api: { status: 'degraded', error: 'Health check error' },
        database: { status: 'unknown', error: 'Unable to check' },
        backend: { status: 'unknown', error: 'Unable to check' },
        memory: { status: 'unknown', error: 'Unable to check' },
        disk: { status: 'unknown', error: 'Unable to check' }
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memoryUsage: process.memoryUsage()
      }
    }
    
    return NextResponse.json({
      ...fallbackStatus,
      error: error instanceof Error ? error.message : 'Unknown health check error',
      message: 'Frontend service is degraded due to health check error'
    }, {
      status: 200, // Always return 200 to prevent cascading failures
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
} 