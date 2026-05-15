# 🚨 Deployment Workflows - READ BEFORE USING

## Current Status: **MANUAL TRIGGER ONLY**

The deployment workflows (`deploy.yml` and `deploy-staging.yml`) are currently set to **manual trigger only** to prevent failures while you're setting up cloud services and GitHub Secrets.

---

## Why Manual-Only?

The workflows are fully configured but require:
- ✅ 16 GitHub Secrets to be added
- ✅ Vercel account and project set up
- ✅ Render account and service set up
- ✅ MongoDB Atlas cluster configured

Without these, the workflows will fail every time you push to `main` or `develop`.

---

## How to Trigger Manually

### Deploy to Production
1. Go to: https://github.com/nethusara003/smart-financial-tracker/actions
2. Click **"Deploy to Production"** in the left sidebar
3. Click **"Run workflow"** button
4. Select branch: `main`
5. Click **"Run workflow"**

### Deploy to Staging
1. Go to: https://github.com/nethusara003/smart-financial-tracker/actions
2. Click **"Deploy to Staging"** in the left sidebar
3. Click **"Run workflow"** button
4. Select branch: `develop`
5. Click **"Run workflow"**

---

## When to Enable Automatic Deployment

After you've completed all steps in **PRE_DEPLOYMENT_CHECKLIST.md**:

### 1. Verify All Secrets Added (16/16)
Go to: https://github.com/nethusara003/smart-financial-tracker/settings/secrets/actions

Check you have all:
- Database: MONGODB_URI_PRODUCTION, MONGODB_URI_STAGING
- Auth: JWT_SECRET_PRODUCTION, JWT_SECRET_STAGING
- Email: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
- Vercel: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- Render: RENDER_API_KEY, RENDER_SERVICE_ID
- URLs: FRONTEND_URL_PRODUCTION, FRONTEND_URL_STAGING, BACKEND_URL_PRODUCTION, BACKEND_URL_STAGING

### 2. Test Manual Deployment First
1. Trigger **"Deploy to Production"** manually
2. Verify it succeeds
3. Check your app works at Vercel URL
4. Check backend health at Render URL/health

### 3. Enable Automatic Deployment

Once manual deployment works, enable automatic deployment:

**Edit `.github/workflows/deploy.yml`:**
```yaml
on:
  workflow_dispatch:
  push:              # Uncomment these lines
    branches: [main] # Uncomment these lines
```

**Edit `.github/workflows/deploy-staging.yml`:**
```yaml
on:
  workflow_dispatch:
  push:                # Uncomment these lines
    branches: [develop] # Uncomment these lines
```

Then commit and push:
```powershell
git add .github/workflows/
git commit -m "chore: enable automatic deployment"
git push origin main
```

---

## What Happens When Enabled

**Production Deployment (`main` branch):**
- Every push to `main` triggers automatic deployment
- Frontend deploys to Vercel
- Backend deploys to Render
- Health check runs after deployment
- If health check fails, workflow fails

**Staging Deployment (`develop` branch):**
- Every push to `develop` triggers automatic deployment
- Frontend deploys to Vercel preview
- Backend deploys to Render staging

---

## Current Workflow Behavior

### ✅ Working Now:
- CI Pipeline (runs on every push/PR) ✅
- PR Checks (runs on every PR) ✅
- Coverage Report (runs on PRs) ✅
- Performance Audit (manual + weekly schedule) ✅

### ⏸️ Manual Only (Until You Enable):
- Deploy to Production (manual only)
- Deploy to Staging (manual only)

---

## Troubleshooting

### "Secrets are not defined" Error
→ You need to add all 16 secrets to GitHub repository settings

### "Health check failed" Error
→ Backend didn't start correctly on Render, check Render logs

### "Vercel deployment failed" Error
→ Check Vercel build logs, verify VITE_API_URL is set

### Workflow doesn't appear in Actions
→ Make sure you've pushed the workflows to GitHub

---

## Quick Reference Commands

```powershell
# Check current git status
git status

# View recent commits
git log --oneline -5

# Create develop branch for staging
git checkout -b develop
git push -u origin develop

# Switch back to main
git checkout main
```

---

## Need Help?

1. **Review**: PRE_DEPLOYMENT_CHECKLIST.md
2. **Detailed Setup**: DEPLOYMENT_CONFIGURATION_GUIDE.md
3. **Secrets List**: GITHUB_SECRETS_CHECKLIST.md
4. **Verify System**: `.\quick-check.ps1`

---

**Last Updated:** February 10, 2026  
**Status:** Manual deployment ready, automatic deployment disabled until secrets configured
