# 🔧 Render Environment Variables Setup Guide

This guide shows you **exactly** what environment variables to set in your Render services.

## 📋 **IMPORTANT:** You'll have 2 services in Render:
1. **mayaaalokam-frontend** (Next.js website)
2. **mayaaalokam-discord-bot** (Discord bot backend)

## 🔑 **Environment Variables for BOTH Services**

Copy and paste these into **BOTH** services in Render Dashboard:

### Discord Bot Configuration
```
BOT_TOKEN=your_discord_bot_token_here
APPLICATION_GUILD_ID=your_discord_server_id_here
DUTY_LOGS_GUILD_ID=your_discord_server_id_here
FORM_CHANNEL_ID=your_channel_id_for_applications
RESPONSE_CHANNEL_ID=your_channel_id_for_responses
WHITELIST_CHANNEL_ID=your_whitelist_channel_id
DUTY_LOGS_CHANNEL_ID=your_duty_logs_channel_id
ALLOWED_ROLE_ID=your_staff_role_id_that_can_process_apps
WHITELISTED_ROLE_ID=the_role_to_give_approved_users
ADD_ROLE=the_role_to_give_approved_users
GUILD_ID=your_discord_server_id_here
```

### Discord OAuth Configuration
```
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_ID=your_discord_app_client_id
DISCORD_CLIENT_SECRET=your_discord_app_client_secret
```

### Supabase Database Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### API & Service URLs (UPDATE AFTER DEPLOYMENT)
```
NEXT_PUBLIC_API_URL=https://mayaaalokam-discord-bot-[your-hash].onrender.com
DISCORD_REDIRECT_URI=https://mayaaalokam-discord-bot-[your-hash].onrender.com/api/discord/callback
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://mayaaalokam-discord-bot-[your-hash].onrender.com/api/discord/callback
RENDER_SERVICE_URL=https://mayaaalokam-discord-bot-[your-hash].onrender.com
```

### NextAuth Configuration (FRONTEND ONLY)
```
NEXTAUTH_URL=https://mayaaalokam-frontend-[your-hash].onrender.com
NEXTAUTH_SECRET=generate_random_32_character_string
```

### Optional Configuration
```
DUTY_LOGS_AUTHORIZED_ROLES=role1_id,role2_id,role3_id
ALERT_WEBHOOK_URL=your_discord_webhook_url_for_alerts
FIVEM_SYNC_API_KEY=your_secure_api_key_here
MAYAALOKAM_LOGO_URL=https://your-server-logo-url.com/logo.png
```

---

## 🛠️ **Step-by-Step Setup Instructions**

### Step 1: Deploy First (to get URLs)
1. Deploy to Render using Blueprint
2. Wait for both services to deploy
3. Copy the URLs from Render dashboard

### Step 2: Set Environment Variables
1. Go to Render Dashboard
2. Click on **mayaaalokam-frontend** service
3. Go to **Environment** tab
4. Add all variables from the list above
5. Repeat for **mayaaalokam-discord-bot** service

### Step 3: Update URLs
Once you have your Render URLs, update these variables:
- Replace `[your-hash]` with your actual Render service hash
- Set `NEXTAUTH_URL` to your frontend URL
- Set `NEXT_PUBLIC_API_URL` to your backend URL
- Set `RENDER_SERVICE_URL` to your backend URL

### Step 4: Generate NEXTAUTH_SECRET
1. Visit: https://generate-secret.vercel.app/32
2. Copy the generated string
3. Use it as your `NEXTAUTH_SECRET`

---

## 📝 **How to Get Required Values**

### Discord Values
1. **BOT_TOKEN**: Discord Developer Portal → Your App → Bot → Token
2. **CLIENT_ID & SECRET**: Discord Developer Portal → Your App → OAuth2 → General
3. **SERVER_ID**: Discord → Enable Developer Mode → Right-click server → Copy ID
4. **CHANNEL_IDS**: Right-click channels → Copy ID
5. **ROLE_IDS**: Right-click roles → Copy ID

### Supabase Values
1. **PROJECT_URL**: Supabase Dashboard → Settings → API → Project URL
2. **ANON_KEY**: Supabase Dashboard → Settings → API → anon public key
3. **SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → service_role key

---

## 🚨 **Critical Notes**

1. **URL Updates**: You MUST update the URLs after deployment
2. **Both Services**: Set variables in BOTH frontend and backend services
3. **Discord OAuth**: Update redirect URIs in Discord Developer Portal
4. **Case Sensitive**: Variable names are case-sensitive
5. **No Quotes**: Don't wrap values in quotes in Render

---

## ✅ **Verification Checklist**

- [ ] All Discord IDs are 17-20 digit numbers
- [ ] Bot token starts with your bot's name
- [ ] Supabase URL is https://[project-id].supabase.co
- [ ] All role IDs are from your Discord server
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] URLs are updated with actual Render URLs
- [ ] Variables are set in BOTH services

---

## 🔄 **After Setting Variables**

1. **Redeploy Services**: Force redeploy both services
2. **Test Health Checks**:
   - Frontend: `https://your-frontend-url.onrender.com`
   - Backend: `https://your-backend-url.onrender.com/health`
3. **Update Discord OAuth**: Add your frontend URL as redirect URI
4. **Test Discord Bot**: Check if bot comes online
5. **Test Website**: Try logging in and submitting applications

---

## 🆘 **Common Issues**

- **Bot Not Online**: Check BOT_TOKEN and server permissions
- **Login Fails**: Verify DISCORD_CLIENT_SECRET and redirect URIs
- **Database Errors**: Check Supabase keys and project URL
- **API Errors**: Verify NEXT_PUBLIC_API_URL points to backend
- **Build Fails**: Check for typos in variable names

---

**Next Step**: Use this guide when setting up environment variables in Render Dashboard! 