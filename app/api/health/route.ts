import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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
  try {
    // Check if we can reach the backend health endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    let backendStatus = 'unknown'
    try {
      // Use AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const backendResponse = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        backendStatus = backendData.botStatus || 'connected'
      } else {
        backendStatus = 'disconnected'
      }
    } catch (error) {
      backendStatus = 'disconnected'
    }

    return NextResponse.json({
      status: 'ok',
      message: 'MAYAAALOKAM Frontend is running',
      frontend: 'healthy',
      backend: backendStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 