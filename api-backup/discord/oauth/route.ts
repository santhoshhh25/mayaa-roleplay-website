import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    console.log('=== Discord OAuth Debug Info ===')
    console.log('Code received:', code ? `${code.substring(0, 10)}...` : 'NO CODE')
    console.log('Client ID:', DISCORD_CLIENT_ID ? `${DISCORD_CLIENT_ID.substring(0, 10)}...` : 'MISSING')
    console.log('Client Secret:', DISCORD_CLIENT_SECRET ? `${DISCORD_CLIENT_SECRET.substring(0, 5)}...` : 'MISSING')
    console.log('Redirect URI:', REDIRECT_URI)

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !REDIRECT_URI) {
      console.error('Missing OAuth configuration:')
      console.error('- Client ID:', !!DISCORD_CLIENT_ID)
      console.error('- Client Secret:', !!DISCORD_CLIENT_SECRET)
      console.error('- Redirect URI:', !!REDIRECT_URI)
      return NextResponse.json({ error: 'Discord OAuth not configured' }, { status: 500 })
    }

    const tokenParams = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    })

    console.log('Token exchange parameters:')
    console.log('- grant_type:', tokenParams.get('grant_type'))
    console.log('- client_id:', tokenParams.get('client_id'))
    console.log('- redirect_uri:', tokenParams.get('redirect_uri'))
    console.log('- code length:', code.length)

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Discord token exchange failed:', error)
      console.error('Response status:', tokenResponse.status)
      console.error('Response headers:', Object.fromEntries(tokenResponse.headers.entries()))
      return NextResponse.json({ 
        error: 'Failed to exchange code for token',
        details: error,
        debug: {
          status: tokenResponse.status,
          clientId: DISCORD_CLIENT_ID,
          redirectUri: REDIRECT_URI
        }
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
    })
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 