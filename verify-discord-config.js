// Discord OAuth Configuration Verification Script
// Run this to verify your Discord OAuth setup is correct for production

console.log('🔍 Verifying Discord OAuth Configuration...\n')

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET', 
  'NEXT_PUBLIC_DISCORD_REDIRECT_URI',
  'DISCORD_REDIRECT_URI'
]

const config = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  publicRedirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  serverRedirectUri: process.env.DISCORD_REDIRECT_URI,
}

console.log('📋 Current Configuration:')
console.log('Client ID:', config.clientId || '❌ MISSING')
console.log('Client Secret:', config.clientSecret ? '✅ SET (hidden)' : '❌ MISSING')
console.log('Public Redirect URI:', config.publicRedirectUri || '❌ MISSING')
console.log('Server Redirect URI:', config.serverRedirectUri || '❌ MISSING')

console.log('\n🔗 Expected Production URLs:')
console.log('Should be: https://mayaaalokam-frontend.onrender.com/api/discord/callback')

// Check for localhost in redirect URIs
const hasLocalhost = (config.publicRedirectUri && config.publicRedirectUri.includes('localhost')) ||
                     (config.serverRedirectUri && config.serverRedirectUri.includes('localhost'))

if (hasLocalhost) {
  console.log('\n❌ ERROR: Localhost found in redirect URIs!')
  console.log('This will cause Discord OAuth to fail in production.')
} else {
  console.log('\n✅ No localhost found in redirect URIs')
}

// Check missing variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:')
  missingVars.forEach(varName => console.log(`   - ${varName}`))
} else {
  console.log('\n✅ All required environment variables are set')
}

console.log('\n🔧 Discord Developer Portal Checklist:')
console.log('1. Go to https://discord.com/developers/applications')
console.log('2. Select your application (ID: 1383425418949824574)')
console.log('3. Go to OAuth2 → General')
console.log('4. In Redirects section, REMOVE any localhost URLs')
console.log('5. Ensure ONLY this URL is present:')
console.log('   https://mayaaalokam-frontend.onrender.com/api/discord/callback')
console.log('6. Save changes')

console.log('\n🚀 After fixing, redeploy on Render to apply changes') 