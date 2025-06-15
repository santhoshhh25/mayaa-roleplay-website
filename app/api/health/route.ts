import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mayaaalokam-frontend',
      message: 'Frontend service is running'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'mayaaalokam-frontend',
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
} 