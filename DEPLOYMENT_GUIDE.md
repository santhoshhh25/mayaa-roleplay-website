# 🚀 MAYAAALOKAM Roleplay - Deployment Guide

This guide will help you deploy the MAYAAALOKAM Roleplay project to GitHub and Render.

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Git installed on your system
- GitHub account
- Render account (free tier available)
- Discord Developer Account
- Supabase account (free tier available)

## 🔧 Pre-Deployment Setup

### 1. Environment Variables Configuration

Before deploying, ensure you have all necessary environment variables configured. Use the `.env.example` file as a template:

```bash
cp .env.example .env
```

**Required Environment Variables:**
- `BOT_TOKEN` - Discord bot token
- `APPLICATION_GUILD_ID` - Discord server ID for applications
- `DUTY_LOGS_GUILD_ID` - Discord server ID for duty logs
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `DISCORD_CLIENT_ID` - Discord application client ID
- `DISCORD_CLIENT_SECRET` - Discord application client secret

### 2. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script from `backend/database-setup.sql` in your Supabase SQL editor
3. Note down your project URL and API keys

### 3. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Create a bot user and copy the token
4. Enable necessary intents (Message Content Intent, Server Members Intent)
5. Get your Guild IDs and Channel IDs from Discord (Enable Developer Mode)

## 📁 GitHub Repository Setup

### 1. Initialize Git Repository

```bash
# If not already initialized
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MAYAAALOKAM Roleplay project"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `mayaaalokam-roleplay` (or your preferred name)
3. Don't initialize with README (we already have one)

### 3. Push to GitHub

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/mayaaalokam-roleplay.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Render Deployment

### Option 1: Using render.yaml (Recommended)

1. **Connect GitHub to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" > "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your project

2. **Configure Services:**
   The `render.yaml` file will automatically create two services:
   - `mayaaalokam-frontend` (Next.js app on port 3000)
   - `mayaaalokam-discord-bot` (Discord bot on port 3001)

3. **Set Environment Variables:**
   For each service, set the required environment variables in the Render dashboard:
   
   **Frontend Service:**
   - `NEXT_PUBLIC_DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your frontend URL)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_API_URL` (your backend URL)
   
   **Backend Service:**
   - All Discord bot configuration variables
   - All Supabase configuration variables
   - `RENDER_SERVICE_URL` (your backend URL for keep-alive)

### Option 2: Manual Deployment

1. **Deploy Frontend:**
   - Create a new Web Service
   - Connect your GitHub repository
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment: Node.js

2. **Deploy Backend:**
   - Create another Web Service
   - Same repository, but use backend configuration
   - Build command: `npm install && npm run bot:build`
   - Start command: `npm run bot:start`
   - Environment: Node.js

## 🔐 Security Considerations

### Environment Variables Security

**Never commit sensitive data to GitHub:**
- `.env` files are excluded via `.gitignore`
- Use Render's environment variables dashboard
- Rotate secrets regularly

### Recommended Security Practices

1. **Use strong, unique passwords**
2. **Enable 2FA on all accounts**
3. **Regularly update dependencies**
4. **Monitor deployment logs**
5. **Use HTTPS in production**

## 📊 Monitoring and Maintenance

### Health Checks

Both services include health check endpoints:
- Frontend: `https://your-frontend-url.render.com/`
- Backend: `https://your-backend-url.render.com/health`

### Logs

Monitor your application logs in the Render dashboard:
- Check for errors during deployment
- Monitor runtime performance
- Track Discord bot connectivity

### Updates

To update your deployment:

```bash
# Make your changes
git add .
git commit -m "Update: description of changes"
git push origin main
```

Render will automatically redeploy when changes are pushed to the main branch.

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in Render dashboard

2. **Discord Bot Not Connecting:**
   - Verify bot token is correct
   - Check Discord server permissions
   - Ensure bot is invited to the server

3. **Database Connection Issues:**
   - Verify Supabase credentials
   - Check database schema is created
   - Test connection from local environment

4. **Environment Variable Issues:**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify values are correct

### Getting Help

1. Check the Render logs for specific error messages
2. Review the project documentation
3. Test locally before deploying
4. Check Discord Developer Portal for bot issues

## 🎯 Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend health check responds
- [ ] Discord bot is online
- [ ] Whitelist applications work
- [ ] Duty logs system functions
- [ ] All environment variables are set
- [ ] SSL certificates are active
- [ ] Monitoring is configured

## 📈 Scaling Considerations

### Free Tier Limitations

- Render free tier has compute hour limits
- Services sleep after 15 minutes of inactivity
- Consider paid plans for production use

### Performance Optimization

1. **Frontend:**
   - Enable static generation where possible
   - Optimize images and assets
   - Use CDN for static files

2. **Backend:**
   - Implement connection pooling
   - Use caching where appropriate
   - Monitor memory usage

## 🔄 Continuous Integration

Consider setting up GitHub Actions for automated testing:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review Render documentation
3. Check GitHub Issues
4. Contact the development team

---

**Happy Deploying! 🚀** 