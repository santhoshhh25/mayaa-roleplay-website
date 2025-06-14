# 🚀 Quick Start - Deploy to GitHub & Render

This guide will get your MAYAAALOKAM Roleplay project deployed in under 30 minutes.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed 
- [ ] GitHub account
- [ ] Render account (free)
- [ ] Discord Developer account
- [ ] Supabase account (free)

## ⚡ 5-Minute Setup

### 1. Clone & Install
```bash
# If you haven't already
git clone <your-repo-url>
cd mayaaalokam-roleplay
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values (required!)
# Get these from Discord Developer Portal and Supabase
```

### 3. Test Locally
```bash
# Run deployment check
npm run deploy:check

# If all green, you're ready to deploy!
```

## 🌐 Deploy to Render (10 minutes)

### 1. Push to GitHub
```bash
# Add all files
git add .
git commit -m "Ready for deployment"

# Push to GitHub (create repo first if needed)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select your repository
5. Click **"Apply"** 

### 3. Configure Environment Variables
Set these in both services (Frontend & Backend):

**Critical Variables:**
- `BOT_TOKEN` - Your Discord bot token
- `APPLICATION_GUILD_ID` - Your Discord server ID
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DISCORD_CLIENT_ID` - Discord app client ID
- `DISCORD_CLIENT_SECRET` - Discord app client secret
- `NEXTAUTH_URL` - Your frontend Render URL
- `NEXT_PUBLIC_API_URL` - Your backend Render URL

## 🔧 Get Required Credentials

### Discord Bot Setup (5 minutes)
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application → Create bot
3. Copy **Bot Token** → `BOT_TOKEN`
4. Copy **Application ID** → `DISCORD_CLIENT_ID`
5. Go to OAuth2 → Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
6. Enable **Message Content Intent** & **Server Members Intent**

### Supabase Setup (5 minutes)
1. Go to [Supabase](https://supabase.com) → New Project
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Go to Settings → API → Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to SQL Editor → Run the script from `backend/database-setup.sql`

### Discord Server IDs (2 minutes)
1. Enable Developer Mode in Discord (Settings → Advanced)
2. Right-click your server → Copy Server ID → `APPLICATION_GUILD_ID`
3. Right-click channels → Copy Channel IDs for:
   - `FORM_CHANNEL_ID` (where applications go)
   - `RESPONSE_CHANNEL_ID` (where responses go)
4. Right-click roles → Copy Role IDs for staff roles

## ✅ Deployment Checklist

- [ ] All environment variables set in Render
- [ ] Both services deployed successfully
- [ ] Frontend health check responds: `https://your-frontend.onrender.com/`
- [ ] Backend health check responds: `https://your-backend.onrender.com/health`
- [ ] Discord bot shows as online
- [ ] Test whitelist application form

## 🎯 Immediate Post-Deployment

1. **Test the application:** Submit a test whitelist application
2. **Verify Discord integration:** Check if applications appear in Discord
3. **Test duty logs:** Log in and try the duty system
4. **Monitor logs:** Check Render dashboard for any errors

## 🆘 Common Issues & Fixes

### Build Failures
```bash
# Locally test builds
npm run build
npm run bot:build
```

### Environment Variable Errors
```bash
# Check your .env file
npm run deploy:check
```

### Discord Bot Not Connecting
- Verify bot token is correct
- Check bot permissions in Discord server
- Ensure bot is invited to the server

### Database Issues
- Verify Supabase credentials
- Check if database schema was created
- Test connection from Supabase dashboard

## 📞 Need Help?

1. Run `npm run deploy:check` for detailed diagnostics
2. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full details
3. Review Render deployment logs
4. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed, your URLs will be:
- **Frontend:** `https://your-app-name.onrender.com`
- **Backend:** `https://your-bot-name.onrender.com`

**Important:** Save these URLs and update your Discord OAuth redirect URIs!

---

**Total Time:** ~20-30 minutes ⏱️ 