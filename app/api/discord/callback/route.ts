import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('=== Discord Callback Debug ===')
    console.log('Received code:', code ? `${code.substring(0, 15)}...` : 'NO CODE')
    console.log('Received error:', error)
    console.log('Full callback URL:', request.url)

    if (error) {
      // Redirect to duty logs page with error
      return NextResponse.redirect(new URL(`/duty-logs?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code) {
      // Redirect to duty logs page with error
      return NextResponse.redirect(new URL('/duty-logs?error=no_code', request.url))
    }

    // Redirect to duty logs page with the code (don't encode it)
    return NextResponse.redirect(new URL(`/duty-logs?code=${code}`, request.url))
  } catch (error) {
    console.error('Discord callback error:', error)
    return NextResponse.redirect(new URL('/duty-logs?error=callback_error', request.url))
  }
} 