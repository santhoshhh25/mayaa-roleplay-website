import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'MAYAAALOKAM Roleplay Server is running',
    timestamp: new Date().toISOString(),
    service: 'frontend'
  })
} 