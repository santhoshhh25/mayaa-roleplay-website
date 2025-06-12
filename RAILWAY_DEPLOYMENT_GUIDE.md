# Railway Deployment Guide for MAYAAALOKAM Roleplay Application

This guide will help you deploy your Next.js application with Discord bot functionality to Railway while preserving all existing features.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### 3. Configure Environment Variables

In Railway's dashboard, go to your project and add these environment variables:

#### Required Variables:
```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token
APPLICATION_GUILD_ID=your_discord_guild_id
ADD_ROLE=your_add_role_id
FORM_CHANNEL_ID=your_form_channel_id
RESPONSE_CHANNEL_ID=your_response_channel_id
ALLOWED_ROLE_ID=your_allowed_role_id
WHITELISTED_ROLE_ID=your_whitelisted_role_id
WHITELIST_CHANNEL_ID=your_whitelist_channel_id

# Secondary Discord Server - Duty Logs
DUTY_LOGS_GUILD_ID=your_duty_logs_guild_id
DUTY_LOGS_CHANNEL_ID=your_duty_logs_channel_id
DUTY_LOGS_AUTHORIZED_ROLES=role1,role2,role3

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Discord OAuth
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# FiveM Integration
FIVEM_SYNC_API_KEY=your_fivem_api_key

# Branding
MAYAALOKAM_LOGO_URL=your_logo_url
```

#### Auto-Generated Variables (Railway sets these automatically):
- `PORT` - Railway will set this automatically
- `RAILWAY_PUBLIC_DOMAIN` - Your app's public URL
- `RAILWAY_STATIC_URL` - Static assets URL

### 4. Update Environment-Specific URLs

After deployment, you'll need to update these URLs in your environment variables:

```env
# Replace with your Railway app URL
NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
DISCORD_REDIRECT_URI=https://your-app-name.railway.app/api/discord/callback
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://your-app-name.railway.app/api/discord/callback
RENDER_SERVICE_URL=https://your-app-name.railway.app
```

## 🔧 Technical Details

### Build Process
Railway will automatically:
1. Run `npm install` to install dependencies
2. Run `npm run build` to build the Next.js app
3. Run `npm run bot:build` to build the Discord bot
4. Start both services with `npm run start:all`

### Port Configuration
- Railway automatically assigns a port via the `PORT` environment variable
- The app is configured to use Railway's port with fallback to local development ports
- Both Next.js frontend and backend Discord bot will run on the same instance

### Services Running
Your Railway deployment will run:
- **Next.js Frontend**: Web interface for whitelist applications
- **Express Backend**: API server for handling form submissions
- **Discord Bot**: Automated Discord integration
- **Keep-Alive Service**: Monitoring and health checks

## 🛠️ Post-Deployment Configuration

### 1. Discord Bot Setup
Update your Discord application settings:
- Add your Railway domain to OAuth2 redirect URIs
- Update webhook URLs if using any
- Ensure bot permissions are correctly set in your Discord servers

### 2. Supabase Configuration
If using Supabase for data storage:
- Add your Railway domain to allowed origins in Supabase settings
- Verify database connections work with the new environment

### 3. Test All Features
Verify these functionalities work:
- ✅ Web form submissions
- ✅ Discord bot responses
- ✅ OAuth authentication
- ✅ Database connections
- ✅ Admin panel access
- ✅ Duty log system
- ✅ FiveM integration (if applicable)

## 🔍 Monitoring and Logs

### View Logs
1. Go to your Railway project dashboard
2. Click on your service
3. Navigate to the "Logs" tab
4. Monitor for any errors or issues

### Health Check
Your app includes a health endpoint:
```
GET https://your-app-name.railway.app/health
```

This will return the status of both the API and Discord bot.

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Discord Bot Not Starting
- **Problem**: Bot shows as "disconnected" in health check
- **Solution**: Verify `BOT_TOKEN` is correct and bot has proper permissions

#### 2. CORS Errors
- **Problem**: Frontend can't connect to backend
- **Solution**: Environment variables are automatically configured for Railway domains

#### 3. Database Connection Issues
- **Problem**: Supabase or database connections failing
- **Solution**: Check if database allows connections from Railway's IP ranges

#### 4. Environment Variables Not Loading
- **Problem**: App can't find required configuration
- **Solution**: Double-check all environment variables are set in Railway dashboard

#### 5. Port Binding Issues
- **Problem**: App won't start or shows port errors
- **Solution**: Ensure you're not hardcoding ports - Railway handles this automatically

## 🔄 Updating Your Deployment

To update your app:
1. Push changes to your GitHub repository
2. Railway will automatically detect changes and redeploy
3. Monitor the deployment logs for any issues

## 📊 Performance Optimization

Railway deployments include:
- Automatic scaling based on traffic
- CDN for static assets
- Optimized build caching
- Health monitoring and restarts

## 🔐 Security Considerations

- All environment variables are encrypted
- HTTPS is automatically enabled
- Discord tokens and API keys are secure
- CORS is properly configured for your domain

## 💰 Cost Management

Railway offers:
- Generous free tier for development
- Pay-as-you-scale pricing
- Resource usage monitoring
- Automatic sleep for inactive apps (on free tier)

## 📞 Support

If you encounter issues:
1. Check Railway's status page
2. Review deployment logs
3. Verify all environment variables
4. Test individual services (web app, Discord bot, database)

---

**Note**: This deployment preserves all existing functionality while making your app accessible on the internet. No code changes are required beyond the automated Railway configuration. 