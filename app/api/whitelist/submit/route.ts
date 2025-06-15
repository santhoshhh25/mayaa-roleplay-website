import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    
    // Use production backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    
    if (!backendUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not configured')
    }
    const submitUrl = `${backendUrl}/api/whitelist/submit`
    
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'User-Agent': request.headers.get('user-agent') || ''
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    // Return the backend response with the same status code
    return NextResponse.json(data, { status: response.status })
    
  } catch (error) {
    console.error('❌ Error forwarding whitelist submission:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to process whitelist submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 