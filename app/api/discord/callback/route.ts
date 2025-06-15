import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Force the redirect to the production frontend URL from environment variables.
    // This avoids issues where Render's proxy makes the request.url appear as localhost.
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    const fallbackUrl = 'https://mayaaalokam-frontend.onrender.com'

    if (!baseUrl) {
      console.error('FATAL: NEXT_PUBLIC_FRONTEND_URL is not configured! Using fallback.')
    }
    
    const finalBaseUrl = baseUrl || fallbackUrl;

    if (error) {
      console.error('Discord OAuth error:', error)
      return NextResponse.redirect(new URL(`/duty-logs?error=${encodeURIComponent(error)}`, finalBaseUrl))
    }

    if (!code) {
      console.error('No code parameter provided')
      return NextResponse.redirect(new URL('/duty-logs?error=missing_code', finalBaseUrl))
    }

    // Redirect to the frontend with the code using the explicit production URL
    const redirectUrl = new URL(`/duty-logs?code=${code}`, finalBaseUrl)
    console.log('Discord callback - redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Discord callback error:', error)
    const finalBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://mayaaalokam-frontend.onrender.com'
    return NextResponse.redirect(new URL('/duty-logs?error=callback_error', finalBaseUrl))
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 