import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 DISCORD OAUTH DIAGNOSTIC')
console.log('=' * 40)

console.log('\n📋 Environment Variables:')
console.log(`NEXT_PUBLIC_DISCORD_CLIENT_ID: ${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`)
console.log(`DISCORD_CLIENT_ID: ${process.env.DISCORD_CLIENT_ID}`)
console.log(`DISCORD_CLIENT_SECRET: ${process.env.DISCORD_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`)
console.log(`NEXT_PUBLIC_DISCORD_REDIRECT_URI: ${process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI}`)
console.log(`DISCORD_REDIRECT_URI: ${process.env.DISCORD_REDIRECT_URI}`)

console.log('\n🔗 OAuth URLs:')
const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

if (clientId && redirectUri) {
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds`
  console.log(`Discord Auth URL: ${authUrl}`)
} else {
  console.log('❌ Cannot generate auth URL - missing client ID or redirect URI')
}

console.log('\n⚠️  COMMON ISSUES:')
console.log('1. Make sure Discord App redirect URI matches NEXT_PUBLIC_DISCORD_REDIRECT_URI')
console.log('2. Remove any localhost URLs from Discord Developer Portal')
console.log('3. Ensure environment variables are set correctly in Render')

console.log('\n🔧 DISCORD DEVELOPER PORTAL CHECKLIST:')
console.log('□ Go to https://discord.com/developers/applications')
console.log(`□ Select application: ${clientId}`)
console.log('□ OAuth2 → General → Redirects')
console.log(`□ Add: https://mayaaalokam-frontend.onrender.com/api/discord/callback`)
console.log('□ Remove any localhost URLs')
console.log('□ Save changes') 