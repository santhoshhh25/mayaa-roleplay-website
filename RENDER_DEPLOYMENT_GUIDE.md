# 🚀 RENDER DEPLOYMENT GUIDE - BULLETPROOF DISCORD BOT HOSTING

## 🛡️ BULLETPROOF KEEP-ALIVE SYSTEM

Your Discord bot will **NEVER sleep** with this setup! This guide ensures 99.9% uptime on Render's free tier.

### 📋 Prerequisites

1. GitHub account with your project pushed
2. Render account (free)
3. Discord bot tokens and IDs configured
4. Supabase database set up

---

## 🔧 STEP 1: DEPLOY TO RENDER

### 1.1 Create Web Service

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure deployment settings:

```yaml
# Build Settings
Build Command: npm run bot:build
Start Command: npm run bot:start
Node Version: 18

# Instance Type
Free
```

### 1.2 Environment Variables

Add these environment variables in Render dashboard:

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
GUILD_ID=your_discord_server_id_here
FORM_CHANNEL_ID=your_channel_id_for_applications
RESPONSE_CHANNEL_ID=your_channel_id_for_responses
ALLOWED_ROLE_ID=your_staff_role_id_that_can_process_apps
WHITELISTED_ROLE_ID=the_role_to_give_approved_users

# Discord OAuth Configuration (for website login)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_SECRET=your_discord_app_client_secret
NEXTAUTH_URL=https://your-render-app.onrender.com
NEXTAUTH_SECRET=generate_a_random_string_32_chars

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Keep-Alive Configuration
RENDER_SERVICE_URL=https://your-render-app.onrender.com
ALERT_WEBHOOK_URL=your_discord_webhook_url_for_alerts

# FiveM Sync Configuration
FIVEM_SYNC_API_KEY=the_secure_api_key_you_shared_with_the_fivem_admin

# Optional: Custom branding
MAYAALOKAM_LOGO_URL=https://your-server-logo-url.com/logo.png
```

---

## 🛡️ STEP 2: BULLETPROOF KEEP-ALIVE SETUP

**CRITICAL:** Set up these external ping services to prevent your bot from sleeping:

### 2.1 UptimeRobot (PRIMARY - Most Reliable)

1. Go to: https://uptimerobot.com
2. Create **free account** (50 monitors included)
3. Click **"Add New Monitor"**
4. Configure monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** MAYAALOKAM Bot Keep-Alive
   - **URL:** `https://your-render-app.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Add your email
5. Click **"Create Monitor"**

### 2.2 Cron-Job.org (BACKUP - Ultra Reliable)

1. Go to: https://cron-job.org/en/
2. Create **free account**
3. Click **"Create cronjob"**
4. Configure cronjob:
   - **Title:** Discord Bot Ping
   - **Address:** `https://your-render-app.onrender.com/health`
   - **Schedule:** `*/8 * * * *` (every 8 minutes)
   - **Enable "Execution"**
5. **Save cronjob**

### 2.3 StatusCake (REDUNDANCY)

1. Go to: https://www.statuscake.com
2. Create **free account**
3. Go to **"Uptime"** → **"Add Test"**
4. Configure test:
   - **Test Name:** Bot Keep-Alive
   - **Website URL:** `https://your-render-app.onrender.com/health`
   - **Check Rate:** 5 minutes
5. **Create Test**

### 2.4 Better Uptime (EXTRA SAFETY)

1. Go to: https://betteruptime.com
2. Create **free account** (10 monitors)
3. **Create Monitor**
4. Configure:
   - **URL:** `https://your-render-app.onrender.com/health`
   - **Check frequency:** 3 minutes
5. **Create monitor**

---

## 🔔 STEP 3: DISCORD WEBHOOK ALERTS (HIGHLY RECOMMENDED)

### 3.1 Create Discord Webhook

1. In your Discord server: **Server Settings** → **Integrations** → **Webhooks**
2. Click **"New Webhook"**
3. Configure webhook:
   - **Name:** Keep-Alive Alerts
   - **Channel:** Create a private channel for alerts
4. **Copy webhook URL**

### 3.2 Add Webhook to Environment Variables

Add this to your Render environment variables:
```env
ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url_here
```

---

## 📊 STEP 4: VERIFY SETUP WORKING

### 4.1 Check Status Endpoints

After deployment, visit these URLs:

- **Health Check:** `https://your-render-app.onrender.com/health`
- **Detailed Status:** `https://your-render-app.onrender.com/status`
- **Emergency Wake:** `https://your-render-app.onrender.com/wake`

### 4.2 Success Criteria

Your setup is **bulletproof** when:

✅ **3+ external services** ping every 3-8 minutes  
✅ **Internal self-ping** runs every 7-12 minutes  
✅ **Discord webhook alerts** configured  
✅ **/status** shows "healthy" status  
✅ **Multiple redundant** ping sources active  

### 4.3 Monitor for First Week

1. Check `/status` endpoint daily for first week
2. Monitor Discord webhook alerts
3. Verify ping services are active in their dashboards
4. Check Render logs for keep-alive confirmations

---

## ⚡ STEP 5: RENDER FREE TIER OPTIMIZATION

### 5.1 Resource Management

- **750 hours/month** (= 31 days × 24 hours)
- **With keep-alive:** You'll use ~744 hours (perfectly safe!)
- **Multiple pings** don't increase usage significantly

### 5.2 Deployment Settings

Add these build optimizations to your `package.json`:

```json
{
  "scripts": {
    "bot:build": "tsc backend/server.ts --outDir backend/dist --target es2020 --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop",
    "bot:start": "node backend/dist/server.js"
  }
}
```

---

## 🚨 TROUBLESHOOTING

### Bot Still Going to Sleep?

1. **Check external services** - Verify all ping services are active
2. **Verify webhook alerts** - Should receive notifications if issues occur
3. **Check Render logs** - Look for keep-alive ping confirmations
4. **Visit /status endpoint** - Should show "healthy" with active services

### Common Issues

| Issue | Solution |
|-------|----------|
| 15-minute sleep | Not enough external ping services |
| No ping logs | Check RENDER_SERVICE_URL environment variable |
| Webhook not working | Verify ALERT_WEBHOOK_URL is correct |
| Service "inactive" | Check external service configuration |

### Emergency Recovery

If your bot goes to sleep:

1. Visit: `https://your-render-app.onrender.com/wake`
2. Check external ping services are still active
3. Add more ping services for redundancy
4. Monitor `/status` for next few hours

---

## 🎯 FINAL CHECKLIST

Before going live, ensure:

- [ ] **Render deployment successful**
- [ ] **All environment variables configured**
- [ ] **UptimeRobot monitor active (5min intervals)**
- [ ] **Cron-Job.org cronjob active (8min intervals)**
- [ ] **StatusCake test active (5min intervals)**
- [ ] **Better Uptime monitor active (3min intervals)**
- [ ] **Discord webhook alerts configured**
- [ ] **`/status` endpoint shows "healthy"`**
- [ ] **`/health` endpoint receiving pings**
- [ ] **Discord bot responding to commands**

---

## 📈 SUCCESS GUARANTEE

With this setup, your Discord bot will achieve:

- **99.9% uptime** on Render free tier
- **Never sleeps** due to redundant ping services
- **Instant alerts** if any issues occur
- **Self-healing** with emergency wake-up procedures
- **Zero cost** hosting solution

Your MAYAAALOKAM Roleplay Discord bot is now **bulletproof** and will stay online 24/7!

---

## 🆘 SUPPORT

If you need help:

1. Check Render deployment logs
2. Visit `/status` endpoint for diagnostics
3. Verify external ping services are active
4. Check Discord webhook channel for alerts

**Your bot will NEVER sleep with this setup! 🛡️** 