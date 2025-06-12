# GitHub Pages Deployment Guide

This guide explains how to deploy your MAYAAALOKAM Roleplay website to GitHub Pages for client preview without breaking existing functionality.

## What's Been Set Up

### 1. Next.js Configuration (`next.config.js`)
- Added `output: 'export'` for static site generation
- Set `trailingSlash: true` for GitHub Pages compatibility
- Disabled server-side features for static export

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- Automatically builds and deploys on pushes to `main` branch
- Uses official GitHub Pages deployment actions
- Caches dependencies for faster builds

### 3. Environment Configuration
- Created `.env.production` with only public variables
- Removed sensitive credentials for client-safe deployment

### 4. GitHub Pages Compatibility
- Added `.nojekyll` file to prevent Jekyll processing
- Updated `.gitignore` to exclude sensitive files

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically run and deploy

### 3. Access Your Site
- Your site will be available at: `https://[username].github.io/[repository-name]`
- The URL will be shown in the Actions tab after successful deployment

## Important Notes

### What Works in Static Deployment
✅ **Frontend interface and navigation**
✅ **Static pages (About, Rules, Terms, etc.)**
✅ **Responsive design and styling**
✅ **Client-side JavaScript and React components**
✅ **Supabase integration (read-only data)**

### What Doesn't Work in Static Deployment
❌ **Discord bot functionality**
❌ **OAuth authentication**
❌ **Server-side API routes**
❌ **Backend database operations**
❌ **Real-time features**

### For Client Preview
This deployment is perfect for:
- Showcasing the website design and layout
- Demonstrating user interface and navigation
- Reviewing static content and pages
- Testing responsive design across devices

## Manual Build (Optional)

To test the static build locally:

```bash
# Build the static export
npm run build:github-pages

# The static files will be in the 'out' directory
# You can serve them locally with any static server
npx serve out
```

## Maintenance

The site will automatically update when you push changes to the `main` branch. The GitHub Actions workflow will:

1. Install dependencies
2. Build the static export
3. Deploy to GitHub Pages

## Troubleshooting

### Build Failures
- Check the Actions tab for build logs
- Ensure all dependencies are listed in `package.json`
- Verify no server-side code is breaking the static export

### Missing Environment Variables
- Public environment variables should be prefixed with `NEXT_PUBLIC_`
- Sensitive variables are excluded from static deployment for security

### 404 Errors
- Ensure `trailingSlash: true` is set in `next.config.js`
- Check that the `.nojekyll` file exists in the `public` directory

## Security Note

The GitHub Pages deployment only includes public environment variables and static assets. No sensitive credentials (Discord tokens, private keys, etc.) are exposed in the static build.

This ensures your client can preview the interface safely without access to your backend systems or sensitive data. 