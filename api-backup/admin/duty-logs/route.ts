import { NextRequest, NextResponse } from 'next/server'
import { DutyLogsAdminAPI } from '../../../../backend/duty-logs-admin-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get admin Discord ID from headers or auth token
    const adminDiscordId = searchParams.get('admin_discord_id')
    if (!adminDiscordId) {
      return NextResponse.json({ error: 'Admin Discord ID required' }, { status: 400 })
    }

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get filter parameters
    const filters = {
      department: searchParams.get('department') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const result = await DutyLogsAdminAPI.getAllDutyLogs(
      adminDiscordId,
      page,
      limit,
      filters
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin duty logs API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 