import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Use the request URL to determine the correct base URL for redirects
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    
    console.log('Discord callback - request.url:', request.url)
    console.log('Discord callback - baseUrl:', baseUrl)

    if (error) {
      console.error('Discord OAuth error:', error)
      return NextResponse.redirect(new URL(`/duty-logs?error=${encodeURIComponent(error)}`, baseUrl))
    }

    if (!code) {
      console.error('No code parameter provided')
      return NextResponse.redirect(new URL('/duty-logs?error=missing_code', baseUrl))
    }

    // Redirect to the frontend with the code using the same domain
    const redirectUrl = new URL(`/duty-logs?code=${code}`, baseUrl)
    console.log('Discord callback - redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Discord callback error:', error)
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    return NextResponse.redirect(new URL('/duty-logs?error=callback_error', baseUrl))
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 