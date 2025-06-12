import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
    }

    // Fetch user data from Discord API
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: authorization,
      },
    })

    if (!userResponse.ok) {
      const error = await userResponse.text()
      console.error('Discord user fetch failed:', error)
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 400 })
    }

    const userData = await userResponse.json()
    
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      email: userData.email,
      verified: userData.verified,
    })
  } catch (error) {
    console.error('Discord user API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 