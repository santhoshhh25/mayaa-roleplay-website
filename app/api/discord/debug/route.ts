import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
  const REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

  return NextResponse.json({
    config: {
      clientId: DISCORD_CLIENT_ID ? `${DISCORD_CLIENT_ID.substring(0, 10)}...${DISCORD_CLIENT_ID.substring(-5)}` : 'MISSING',
      clientSecret: DISCORD_CLIENT_SECRET ? `${DISCORD_CLIENT_SECRET.substring(0, 5)}...` : 'MISSING',
      redirectUri: REDIRECT_URI,
      hasClientId: !!DISCORD_CLIENT_ID,
      hasClientSecret: !!DISCORD_CLIENT_SECRET,
      hasRedirectUri: !!REDIRECT_URI,
    },
    instructions: {
      message: 'Check your Discord application settings at https://discord.com/developers/applications',
      steps: [
        '1. Go to OAuth2 > General in your Discord application',
        '2. Verify the redirect URI exactly matches: ' + REDIRECT_URI,
        '3. Make sure the Client ID matches your .env file',
        '4. Verify the Client Secret is correct in your .env file'
      ]
    }
  })
} 