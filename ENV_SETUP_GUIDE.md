# 🔧 Environment Variables Setup Guide

This guide explains how to set up environment variables for your two Render services using the separated environment files.

## 📁 **Files Created:**

- **`.env.frontend`** - Variables for `mayaaalokam-frontend` service
- **`.env.backend`** - Variables for `mayaaalokam-discord-bot` service

## 🚀 **How to Use on Render:**

### **Step 1: Frontend Service (`mayaaalokam-frontend`)**

1. Go to your Render Dashboard
2. Click on **`mayaaalokam-frontend`** service
3. Go to **Environment** tab
4. Copy ALL variables from **`.env.frontend`** file
5. Add each variable individually:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://mayaaalokam-frontend.onrender.com
NEXT_PUBLIC_DISCORD_CLIENT_ID=1383425418949824574
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
DISCORD_CLIENT_ID=1383425418949824574
DISCORD_CLIENT_SECRET=st5vnm6aygCSd81muhXi4izCAaVRm_g3
DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
NEXT_PUBLIC_SUPABASE_URL=https://sgixpojggmyslmfpupoc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXhwb2pnZ215c2xtZnB1cG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODcwODcsImV4cCI6MjA2NTE2MzA4N30.PrQuQzdbkEgq1zS1Faj-ZSJjy0n_sSy40UHME-y5kP0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXhwb2pnZ215c2xtZnB1cG9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU4NzA4NywiZXhwIjoyMDY1MTYzMDg3fQ.WnSjj8y0U4nJ3m4hyOVSnXnCeYDOQBpwCGbCSrRXy6E
MAYAALOKAM_LOGO_URL=https://i.ibb.co/Jw4bsx0H/header-logo.png
NEXTAUTH_URL=https://mayaaalokam-frontend.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### **Step 2: Backend Service (`mayaaalokam-discord-bot`)**

1. Go to your Render Dashboard
2. Click on **`mayaaalokam-discord-bot`** service
3. Go to **Environment** tab
4. Copy ALL variables from **`.env.backend`** file
5. Add each variable individually:

```
NODE_ENV=production
PORT=3001
BACKEND_PORT=3001
BOT_TOKEN=your_discord_bot_token_here
APPLICATION_GUILD_ID=1380074286974505071
ADD_ROLE=1380109766222680155
FORM_CHANNEL_ID=1380106496725221446
RESPONSE_CHANNEL_ID=1380106564576477245
ALLOWED_ROLE_ID=1380074287104266318
WHITELISTED_ROLE_ID=1380109766222680155
WHITELIST_CHANNEL_ID=1383428512077053952
DUTY_LOGS_GUILD_ID=1380084225453199360
DUTY_LOGS_CHANNEL_ID=1383428628355743784
DUTY_LOGS_AUTHORIZED_ROLES=1383428884393099396,1383429038298894446,1383429096830275724,1383429225436151838
GUILD_ID=1380074286974505071
NEXT_PUBLIC_DISCORD_CLIENT_ID=1383425418949824574
DISCORD_CLIENT_ID=1383425418949824574
DISCORD_CLIENT_SECRET=st5vnm6aygCSd81muhXi4izCAaVRm_g3
DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
NEXT_PUBLIC_SUPABASE_URL=https://sgixpojggmyslmfpupoc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXhwb2pnZ215c2xtZnB1cG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODcwODcsImV4cCI6MjA2NTE2MzA4N30.PrQuQzdbkEgq1zS1Faj-ZSJjy0n_sSy40UHME-y5kP0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXhwb2pnZ215c2xtZnB1cG9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU4NzA4NywiZXhwIjoyMDY1MTYzMDg3fQ.WnSjj8y0U4nJ3m4hyOVSnXnCeYDOQBpwCGbCSrRXy6E
RENDER_SERVICE_URL=https://mayaaalokam-frontend.onrender.com
ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/1383430325245317231/ywbxXuKW-O-N5eL48b0kfVQeuEbd2Kh-zyqbLSr4sCNG6Zly6YLMfRQQBjqEZeazxV4m
FIVEM_SYNC_API_KEY=k7pB9sX3gH5jR2mF8aZ1cE4vN6qT0wLg
MAYAALOKAM_LOGO_URL=https://i.ibb.co/Jw4bsx0H/header-logo.png
```

## 🔍 **Variable Breakdown:**

### **Frontend Only:**
- `NEXT_PUBLIC_*` - Client-side accessible variables
- `NEXTAUTH_*` - Authentication configuration
- Basic server config (PORT, NODE_ENV)

### **Backend Only:**
- `BOT_TOKEN` - Discord bot token (SENSITIVE)
- All Discord channel/role IDs
- `FIVEM_SYNC_API_KEY` - FiveM server sync
- Keep-alive and webhook URLs

### **Shared Variables:**
- Discord OAuth credentials
- Supabase configuration
- Branding assets

## ⚠️ **Important Notes:**

1. **Never commit sensitive tokens** to version control
2. **Update URLs** if your Render service URLs change
3. **Both services need some shared variables** for proper communication
4. **NEXT_PUBLIC_ variables** are exposed to the browser - don't put secrets there
5. **Generate a secure NEXTAUTH_SECRET** if using NextAuth

## 🔄 **After Setting Variables:**

1. **Redeploy both services** on Render
2. **Check logs** for any missing variable errors
3. **Test functionality** to ensure everything works

## 🛠️ **Generate New Secrets:**

If you need to generate new secure keys:

```bash
# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For FIVEM_SYNC_API_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
``` 