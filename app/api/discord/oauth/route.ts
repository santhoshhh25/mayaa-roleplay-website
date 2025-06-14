import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Discord OAuth configuration')
      return NextResponse.json({ 
        error: 'Discord OAuth not configured',
        details: 'Missing Discord credentials' 
      }, { status: 500 })
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Discord token exchange failed:', response.status, errorData)
      return NextResponse.json({ 
        error: 'Failed to exchange code for token',
        details: errorData 
      }, { status: response.status })
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