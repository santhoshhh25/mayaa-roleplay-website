# GitHub Actions Deployment Setup for Railway

This guide will help you set up automated deployment from GitHub to Railway using GitHub Actions.

## 🚀 Quick Setup

### Step 1: Repository Setup

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

### Step 2: Get Railway Token

1. Go to [Railway.app](https://railway.app)
2. Click on your profile → **Account Settings**
3. Navigate to **Tokens** tab
4. Click **Create Token**
5. Give it a name (e.g., "GitHub Actions")
6. Copy the generated token

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `RAILWAY_TOKEN`
   - **Value**: The token you copied from Railway

### Step 4: Configure Railway Project

1. In Railway, create a new project from your GitHub repository
2. Connect your GitHub repository to Railway
3. Configure environment variables using the `.env.railway` file
4. Deploy once manually to verify everything works

## 🔄 How It Works

### Automatic Deployment Triggers

✅ **Push to main/master branch** → Automatic deployment  
✅ **Pull requests** → Build and test only (no deployment)  
✅ **All branches** → Run CI tests  

### Workflow Steps

1. **Continuous Integration** (`ci.yml`):
   - Runs on every push and PR
   - Tests on Node.js 18.x and 20.x
   - Linting, type checking, building
   - Security audit
   - Dependency verification

2. **Railway Deployment** (`deploy-railway.yml`):
   - Runs only on main/master branch
   - Tests first, then deploys
   - Automatic notification of success/failure

## 📊 GitHub Actions Workflows

### CI Workflow Features:
- ✅ **Multi-Node Testing** (18.x, 20.x)
- ✅ **ESLint Code Quality**
- ✅ **TypeScript Type Checking**
- ✅ **Build Verification**
- ✅ **Security Audit**
- ✅ **Dependency Analysis**

### Deployment Workflow Features:
- ✅ **Automated Testing Before Deploy**
- ✅ **Railway CLI Integration**
- ✅ **Deployment Notifications**
- ✅ **Rollback on Failure**

## 🔧 Advanced Configuration

### Custom Branch Deployment

To deploy from a different branch, update `.github/workflows/deploy-railway.yml`:

```yaml
on:
  push:
    branches: [ main, staging, production ]  # Add your branches
```

### Environment-Specific Deployments

You can set up multiple Railway projects for different environments:

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/staging'
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_STAGING_TOKEN }}

deploy-production:
  if: github.ref == 'refs/heads/main'
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_PRODUCTION_TOKEN }}
```

### Slack/Discord Notifications

Add notification steps to your workflow:

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: "MAYAAALOKAM Deployment"
    description: "Deployment ${{ job.status }}"
```

## 🛠️ Manual Deployment

If you need to deploy manually:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy current branch
railway deploy
```

## 📋 Checklist for First Deployment

- [ ] Code pushed to GitHub repository
- [ ] Railway token added to GitHub secrets
- [ ] Railway project connected to GitHub
- [ ] Environment variables configured in Railway
- [ ] First manual deployment successful
- [ ] GitHub Actions workflows enabled
- [ ] Test automatic deployment with a small change

## 🔍 Monitoring Deployments

### GitHub Actions
- View workflow runs in **Actions** tab
- Check logs for detailed deployment information
- Monitor build times and success rates

### Railway Dashboard
- View deployment history and logs
- Monitor resource usage
- Check health status

### Health Endpoints
- **Application Health**: `https://your-app.railway.app/health`
- **API Status**: Check response times and uptime

## 🚨 Troubleshooting

### Common Issues

#### 1. Railway Token Invalid
- **Problem**: Authentication fails
- **Solution**: Regenerate token in Railway and update GitHub secret

#### 2. Build Failures
- **Problem**: CI tests fail
- **Solution**: Check logs, fix linting/type errors, verify dependencies

#### 3. Deployment Timeout
- **Problem**: Deployment takes too long
- **Solution**: Check Railway logs, verify database connections

#### 4. Environment Variables Missing
- **Problem**: App crashes due to missing env vars
- **Solution**: Compare `.env.railway` with Railway dashboard settings

#### 5. Discord Bot Not Starting
- **Problem**: Bot shows disconnected after deployment
- **Solution**: Verify Discord token and bot permissions

### Debug Commands

```bash
# Check Railway project status
railway status

# View Railway logs
railway logs

# Test local build
npm run build && npm run bot:build

# Verify environment
node test-env.js
```

## 🔐 Security Best Practices

✅ **Never commit sensitive tokens to Git**  
✅ **Use GitHub Secrets for all tokens**  
✅ **Regularly rotate Railway tokens**  
✅ **Enable branch protection rules**  
✅ **Review pull requests before merging**  
✅ **Monitor deployment logs for issues**  

## 📈 Performance Optimization

- **Build Caching**: GitHub Actions automatically cache npm dependencies
- **Parallel Testing**: CI runs tests on multiple Node.js versions
- **Fast Deployment**: Railway CLI provides optimized deployment
- **Health Monitoring**: Automatic failure detection and restart

---

## 🎉 You're All Set!

Your MAYAAALOKAM application now has:
- ✅ **Automated CI/CD pipeline**
- ✅ **Multi-environment testing**
- ✅ **Security auditing**
- ✅ **Automatic Railway deployment**
- ✅ **Monitoring and notifications**

Push a change to your main branch and watch the magic happen! 🚀 