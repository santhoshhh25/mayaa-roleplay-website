import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface PingStats {
  totalPings: number
  successfulPings: number
  lastPing: string
  uptime: number
  status: 'healthy' | 'degraded'
}

// In-memory stats (will reset on restart, which is fine for self-ping)
let pingStats: PingStats = {
  totalPings: 0,
  successfulPings: 0,
  lastPing: '',
  uptime: Date.now(),
  status: 'healthy'
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Update ping statistics
    pingStats.totalPings++
    pingStats.successfulPings++
    pingStats.lastPing = new Date().toISOString()
    
    const responseTime = Date.now() - startTime
    const uptimeSeconds = Math.floor((Date.now() - pingStats.uptime) / 1000)
    
    // Calculate success rate
    const successRate = pingStats.totalPings > 0 
      ? Math.round((pingStats.successfulPings / pingStats.totalPings) * 100)
      : 100
    
    // Determine status
    pingStats.status = successRate >= 95 ? 'healthy' : 'degraded'
    
    return NextResponse.json({
      status: 'ok',
      message: 'Frontend self-ping successful',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      stats: {
        ...pingStats,
        uptime: uptimeSeconds,
        successRate: `${successRate}%`
      },
      service: 'mayaaalokam-frontend-selfping'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    // Even if something fails, always return success to keep the service alive
    return NextResponse.json({
      status: 'ok',
      message: 'Frontend self-ping completed with minor issues',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

export async function POST() {
  // Allow POST requests for external ping services
  return GET()
} 