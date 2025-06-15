import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Forward the request to the backend where Discord client secret is available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    
    if (!backendUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not configured')
    }
    const response = await fetch(`${backendUrl}/api/discord/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Backend OAuth exchange failed:', response.status, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const tokenData = await response.json()
    return NextResponse.json(tokenData)

  } catch (error) {
    console.error('OAuth endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 