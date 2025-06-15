import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical'
  timestamp: string
  services: {
    frontend: {
      status: 'healthy' | 'degraded' | 'critical'
      uptime: number
      responseTime: number
      url: string
    }
    backend: {
      status: 'healthy' | 'degraded' | 'critical'
      uptime: number
      responseTime: number
      url: string
      lastCheck: string
    }
  }
  summary: {
    totalServices: number
    healthyServices: number
    degradedServices: number
    criticalServices: number
  }
  recommendations: string[]
}

async function checkBackendStatus(): Promise<{ status: 'healthy' | 'degraded' | 'critical'; uptime: number; responseTime: number; lastCheck: string }> {
  const startTime = Date.now()
  
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
    
    if (!backendUrl) {
      throw new Error('Backend URL not configured')
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'System-Status-Check/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      const data = await response.json()
      return {
        status: data.overall || (responseTime > 5000 ? 'degraded' : 'healthy'),
        uptime: data.uptime || 0,
        responseTime,
        lastCheck: new Date().toISOString()
      }
    } else {
      return {
        status: 'critical',
        uptime: 0,
        responseTime,
        lastCheck: new Date().toISOString()
      }
    }
    
  } catch (error) {
    return {
      status: 'critical',
      uptime: 0,
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString()
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check backend status
    const backendStatus = await checkBackendStatus()
    
    // Frontend is healthy if we can respond
    const frontendResponseTime = Date.now() - startTime
    const frontendStatus = {
      status: frontendResponseTime > 3000 ? 'degraded' as const : 'healthy' as const,
      uptime: process.uptime(),
      responseTime: frontendResponseTime,
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    }
    
    // Determine overall status
    const services = [frontendStatus.status, backendStatus.status]
    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy'
    
    if (services.includes('critical')) {
      overall = 'critical'
    } else if (services.includes('degraded')) {
      overall = 'degraded'
    }
    
    // Count service statuses
    const healthyCount = services.filter(s => s === 'healthy').length
    const degradedCount = services.filter(s => s === 'degraded').length  
    const criticalCount = services.filter(s => s === 'critical').length
    
    // Generate recommendations
    const recommendations: string[] = []
    if (backendStatus.status === 'critical') {
      recommendations.push('Backend service is down - check server logs')
    }
    if (backendStatus.responseTime > 5000) {
      recommendations.push('Backend response time is slow - consider performance optimization')
    }
    if (frontendStatus.responseTime > 2000) {
      recommendations.push('Frontend response time is slow - check for blocking operations')
    }
    if (overall !== 'healthy') {
      recommendations.push('System health is degraded - monitor closely')
    }
    
    const systemStatus: SystemStatus = {
      overall,
      timestamp: new Date().toISOString(),
      services: {
        frontend: frontendStatus,
        backend: {
          status: backendStatus.status,
          uptime: backendStatus.uptime,
          responseTime: backendStatus.responseTime,
          url: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'Backend URL not configured',
          lastCheck: backendStatus.lastCheck
        }
      },
      summary: {
        totalServices: 2,
        healthyServices: healthyCount,
        degradedServices: degradedCount,
        criticalServices: criticalCount
      },
      recommendations
    }
    
    return NextResponse.json({
      ...systemStatus,
      message: `System is ${overall}`,
      checkDuration: `${Date.now() - startTime}ms`
    }, {
      status: overall === 'critical' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    // Bulletproof fallback - never let system status fail completely
    return NextResponse.json({
      overall: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        frontend: {
          status: 'degraded',
          uptime: process.uptime(),
          responseTime: Date.now() - startTime,
          url: 'unknown'
        },
        backend: {
          status: 'unknown',
          uptime: 0,
          responseTime: 0,
          url: 'unknown',
          lastCheck: new Date().toISOString()
        }
      },
      summary: {
        totalServices: 2,
        healthyServices: 0,
        degradedServices: 1,
        criticalServices: 1
      },
      recommendations: ['System status check failed - manual investigation required'],
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'System status check failed but frontend is operational'
    }, {
      status: 200, // Always return 200 for system status to prevent cascading failures
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
} 