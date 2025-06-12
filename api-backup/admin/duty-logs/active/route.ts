import { NextRequest, NextResponse } from 'next/server'
import { DutyLogsAdminAPI } from '../../../../../backend/duty-logs-admin-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const adminDiscordId = searchParams.get('admin_discord_id')
    if (!adminDiscordId) {
      return NextResponse.json({ error: 'Admin Discord ID required' }, { status: 400 })
    }

    const activeSessions = await DutyLogsAdminAPI.getActiveSessions(adminDiscordId)

    return NextResponse.json({ activeSessions })
  } catch (error) {
    console.error('Admin active sessions API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 