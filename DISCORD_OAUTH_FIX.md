# Discord OAuth Localhost Error Fix for Production

## Problem
Getting localhost errors when trying to login with Discord on the production server hosted on Render.

## Root Cause
The Discord application in Discord Developer Portal still has localhost redirect URIs configured, causing OAuth to fail in production.

## Solution Steps

### 1. Fix Discord Developer Portal Settings

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Login with your Discord account

2. **Select Your Application**
   - Find and select your application (ID: `1383425418949824574`)

3. **Navigate to OAuth2 Settings**
   - Click on **OAuth2** in the left sidebar
   - Click on **General**

4. **Update Redirect URIs**
   - In the **Redirects** section, you'll see a list of redirect URIs
   - **REMOVE** any localhost URLs such as:
     - `http://localhost:3000/api/discord/callback`
     - `http://localhost:3001/api/discord/callback`
     - `http://127.0.0.1:3000/api/discord/callback`
     - `http://127.0.0.1:3001/api/discord/callback`
   
   - **KEEP/ADD** only the production URL:
     - `https://mayaaalokam-frontend.onrender.com/api/discord/callback`

5. **Save Changes**
   - Click **Save Changes** at the bottom of the page

### 2. Verify Render Environment Variables

Make sure these environment variables are set correctly in your Render dashboard:

```env
NEXT_PUBLIC_DISCORD_CLIENT_ID=1383425418949824574
DISCORD_CLIENT_ID=1383425418949824574
DISCORD_CLIENT_SECRET=st5vnm6aygCSd81muhXi4izCAaVRm_g3
DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
NEXT_PUBLIC_DISCORD_REDIRECT_URI=https://mayaaalokam-frontend.onrender.com/api/discord/callback
```

### 3. Test the Configuration

Run the verification script:
```bash
node verify-discord-config.js
```

### 4. Redeploy on Render

After making changes to Discord Developer Portal:
1. Go to your Render dashboard
2. Find your service
3. Click **Manual Deploy** to trigger a fresh deployment
4. Wait for deployment to complete

## Common Issues & Solutions

### Issue: Still getting localhost error after fixing
**Solution:** 
- Clear browser cache and cookies
- Wait 5-10 minutes for Discord's changes to propagate
- Try in incognito/private browsing mode

### Issue: "Invalid redirect_uri" error
**Solution:**
- Double-check the redirect URI in Discord Developer Portal matches exactly:
  `https://mayaaalokam-frontend.onrender.com/api/discord/callback`
- Ensure there are no trailing slashes or extra characters

### Issue: "Invalid client" error
**Solution:**
- Verify `DISCORD_CLIENT_ID` matches the Application ID in Discord Developer Portal
- Ensure `DISCORD_CLIENT_SECRET` is correct and not expired

## Verification Checklist

- [ ] Removed all localhost URLs from Discord Developer Portal
- [ ] Added production URL to Discord Developer Portal
- [ ] Saved changes in Discord Developer Portal  
- [ ] Verified environment variables in Render
- [ ] Redeployed the application
- [ ] Tested Discord login in production

## Production URL
Your production Discord OAuth callback URL should be:
```
https://mayaaalokam-frontend.onrender.com/api/discord/callback
```

## Need Help?
If you're still experiencing issues:
1. Check the browser console for error messages
2. Check Render logs for any OAuth-related errors
3. Verify your domain is accessible and not blocked 