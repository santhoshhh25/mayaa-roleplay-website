import { NextRequest, NextResponse } from 'next/server'
import { DutyLogsAdminAPI } from '../../../../../backend/duty-logs-admin-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const adminDiscordId = searchParams.get('admin_discord_id')
    if (!adminDiscordId) {
      return NextResponse.json({ error: 'Admin Discord ID required' }, { status: 400 })
    }

    const format = (searchParams.get('format') || 'csv') as 'csv' | 'json'
    
    // Get filter parameters
    const filters = {
      department: searchParams.get('department') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const exportData = await DutyLogsAdminAPI.exportDutyLogs(
      adminDiscordId,
      filters,
      format
    )

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `duty_logs_export_${timestamp}.${format}`

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Admin duty logs export API error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 