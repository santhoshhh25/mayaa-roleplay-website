import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    const response = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }
      
      const errorData = await response.text()
      console.error('Discord guilds fetch failed:', response.status, errorData)
      return NextResponse.json({ 
        error: 'Failed to fetch user guilds',
        details: errorData 
      }, { status: response.status })
    }

    const guildsData = await response.json()
    
    return NextResponse.json(guildsData)

  } catch (error) {
    console.error('Guilds endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 