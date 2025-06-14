import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Discord OAuth error:', error)
      return NextResponse.redirect(new URL(`/duty-logs?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      console.error('No code parameter provided')
      return NextResponse.redirect(new URL('/duty-logs?error=missing_code', request.url))
    }

    // Redirect to the frontend with the code
    // The frontend will handle the token exchange via the oauth endpoint
    return NextResponse.redirect(new URL(`/duty-logs?code=${code}`, request.url))

  } catch (error) {
    console.error('Discord callback error:', error)
    return NextResponse.redirect(new URL('/duty-logs?error=callback_error', request.url))
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 