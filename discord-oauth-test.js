// Discord OAuth Test Script
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 DISCORD OAUTH DIAGNOSTIC\n');
console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_DISCORD_CLIENT_ID:', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
console.log('NEXT_PUBLIC_DISCORD_REDIRECT_URI:', process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI);
console.log('NEXT_PUBLIC_FRONTEND_URL:', process.env.NEXT_PUBLIC_FRONTEND_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Generate the OAuth URL
const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;

if (!clientId || !redirectUri) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

const params = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'identify guilds',
});

const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

console.log('\n🔗 Generated Discord OAuth URL:');
console.log(authUrl);

console.log('\n✅ Use this URL to test Discord OAuth');
console.log('📝 If you get redirected to localhost, check your Discord Developer Portal settings');
console.log('   and make sure your redirect URI is set to the production URL.'); 