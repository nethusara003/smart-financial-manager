# 🚀 Stage 4: Deployment Configuration Guide

## Overview
This guide will help you configure production and staging deployments for Smart Financial Tracker.

**Estimated Time:** 2-3 hours  
**Prerequisites:** GitHub repository, credit card for platform signups (free tiers available)

---

## 📋 Deployment Architecture

```
Production Environment:
├── Frontend: Vercel (https://your-app.vercel.app)
├── Backend: Render (https://your-api.onrender.com)
└── Database: MongoDB Atlas (Cloud)

Staging Environment:
├── Frontend: Vercel Preview (https://staging-your-app.vercel.app)
├── Backend: Render Preview
└── Database: MongoDB Atlas (Separate cluster)
```

---

## 🔐 Step 1: Configure GitHub Secrets

### 1.1 Access GitHub Secrets
1. Go to your repository: https://github.com/nethusara003/smart-financial-tracker
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 1.2 Required Secrets List

Add these secrets one by one:

#### Database Secrets
```
Name: MONGODB_URI_PRODUCTION
Value: mongodb+srv://username:password@cluster.mongodb.net/smart_financial_tracker?retryWrites=true&w=majority

Name: MONGODB_URI_STAGING
Value: mongodb+srv://username:password@cluster-staging.mongodb.net/smart_financial_tracker_staging?retryWrites=true&w=majority
```

#### Authentication Secrets
```
Name: JWT_SECRET_PRODUCTION
Value: (Generate a random 64-character string)

Name: JWT_SECRET_STAGING
Value: (Generate a random 64-character string)
```

**Generate JWT Secret:**
```powershell
# Run in PowerShell to generate random secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

#### Email Service Secrets (Production)
```
Name: EMAIL_HOST
Value: smtp.gmail.com

Name: EMAIL_PORT
Value: 587

Name: EMAIL_USER
Value: your-email@gmail.com

Name: EMAIL_PASSWORD
Value: your-gmail-app-password
```

#### Vercel Deployment Secrets (Frontend)
```
Name: VERCEL_TOKEN
Value: (Get from Vercel dashboard - see Step 2)

Name: VERCEL_ORG_ID
Value: (Get from Vercel - see Step 2)

Name: VERCEL_PROJECT_ID
Value: (Get from Vercel - see Step 2)
```

#### Render Deployment Secrets (Backend)
```
Name: RENDER_API_KEY
Value: (Get from Render dashboard - see Step 3)

Name: RENDER_SERVICE_ID
Value: (Get from Render - see Step 3)
```

#### Application URLs
```
Name: FRONTEND_URL_PRODUCTION
Value: https://your-app.vercel.app

Name: FRONTEND_URL_STAGING
Value: https://staging-your-app.vercel.app

Name: BACKEND_URL_PRODUCTION
Value: https://your-api.onrender.com

Name: BACKEND_URL_STAGING
Value: https://staging-your-api.onrender.com
```

---

## 🗄️ Step 2: Set Up MongoDB Atlas (Database)

### 2.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Try Free** and create an account
3. Choose **FREE** tier (M0 Sandbox)

### 2.2 Create Production Cluster
1. Click **Build a Database**
2. Select **FREE** (M0) option
3. Choose your preferred cloud provider and region
4. Name your cluster: `smart-financial-prod`
5. Click **Create**

### 2.3 Configure Database Access
1. Click **Database Access** in left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `sft_admin`
5. Password: **Auto-generate secure password** (save this!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 2.4 Configure Network Access
1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, restrict to your backend server IPs
4. Click **Confirm**

### 2.5 Get Connection String
1. Click **Database** in left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string:
   ```
   mongodb+srv://sft_admin:<password>@smart-financial-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password
6. Add database name before `?`: `/smart_financial_tracker?`
7. **Save this as `MONGODB_URI_PRODUCTION` secret in GitHub**

### 2.6 Create Staging Cluster (Optional)
Repeat steps 2.2-2.5 for staging environment:
- Cluster name: `smart-financial-staging`
- Save connection string as `MONGODB_URI_STAGING`

---

## 🎨 Step 3: Set Up Vercel (Frontend Deployment)

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Click **Sign Up**
3. **Sign up with GitHub** (recommended)
4. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Find **smart-financial-tracker** repository
3. Click **Import**

### 3.3 Configure Build Settings
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.4 Add Environment Variables
Click **Environment Variables** and add:

```
Name: VITE_API_URL
Value: https://your-api.onrender.com/api
Environment: Production

Name: VITE_API_URL
Value: https://staging-your-api.onrender.com/api
Environment: Preview
```

### 3.5 Deploy
1. Click **Deploy**
2. Wait for deployment to complete (~2-5 minutes)
3. Copy your production URL (e.g., `https://smart-financial-tracker-v1.vercel.app`)

### 3.6 Get Vercel Credentials for GitHub Actions

#### Get Vercel Token
1. Go to **Account Settings** → **Tokens**
2. Click **Create Token**
3. Name: `GitHub Actions CI/CD`
4. Scope: **Full Access**
5. Expiration: **No expiration** (or your preference)
6. Click **Create**
7. **Copy the token** (save as `VERCEL_TOKEN` in GitHub Secrets)

#### Get Organization ID
1. Go to **Account Settings** → **General**
2. Find **Your ID** (starts with `team_...` or `user_...`)
3. **Copy** (save as `VERCEL_ORG_ID` in GitHub Secrets)

#### Get Project ID
1. Go to your project dashboard
2. Click **Settings** → **General**
3. Scroll to **Project ID**
4. **Copy** (save as `VERCEL_PROJECT_ID` in GitHub Secrets)

---

## ⚙️ Step 4: Set Up Render (Backend Deployment)

### 4.1 Create Render Account
1. Go to https://render.com
2. Click **Get Started**
3. **Sign up with GitHub** (recommended)
4. Authorize Render to access your repositories

### 4.2 Create Web Service
1. Click **New** → **Web Service**
2. Connect **smart-financial-tracker** repository
3. Configure service:

```
Name: smart-financial-backend
Region: Choose closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

### 4.3 Configure Instance Type
1. Select **Free** tier (or paid if you prefer)
   - ⚠️ Free tier spins down after 15 minutes of inactivity
2. Click **Create Web Service**

### 4.4 Add Environment Variables
In the **Environment** tab, add:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = [Your MongoDB Atlas connection string from Step 2]
JWT_SECRET = [Your generated JWT secret]
FRONTEND_URL = https://your-app.vercel.app
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-gmail-app-password
```

### 4.5 Get Render API Credentials

#### Get API Key
1. Go to **Account Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `GitHub Actions Deployment`
4. **Copy the key** (save as `RENDER_API_KEY` in GitHub Secrets)

#### Get Service ID
1. Go to your web service dashboard
2. Look at the URL: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxx`
3. Copy the `srv-xxxxxxxxxxxxx` part (save as `RENDER_SERVICE_ID` in GitHub Secrets)

### 4.6 Configure CORS
Your backend should already have CORS configured in `server.js`. Verify:

```javascript
// Update CORS origin in backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 🔄 Step 5: Update Deployment Workflows

Now that you have all credentials, let's update the deployment workflows:

### 5.1 Update deploy.yml with Your URLs

The workflow is already created. You just need to ensure all GitHub Secrets are added correctly.

### 5.2 Test Production Deployment

#### Manual Deploy (First Time)
1. Go to GitHub repository → **Actions** tab
2. Click **Deploy to Production** workflow
3. Click **Run workflow** → **Run workflow**
4. Watch the deployment process (~5-10 minutes)

#### Verify Deployment
1. **Frontend:** Visit your Vercel URL
2. **Backend:** Visit `https://your-api.onrender.com/health`
3. Test login and core features

---

## 🧪 Step 6: Set Up Staging Environment

### 6.1 Create Staging Branch
```powershell
cd "F:\Smart Financial Tracker"
git checkout -b develop
git push -u origin develop
```

### 6.2 Configure Branch Protection
1. Go to GitHub Settings → **Branches**
2. Add rule for `main`:
   - Require pull request reviews
   - Require status checks to pass (CI Pipeline)
3. Add rule for `develop`:
   - Require status checks to pass

### 6.3 Automatic Staging Deployments
The `deploy-staging.yml` workflow will automatically deploy when you push to `develop` branch.

---

## 📊 Step 7: Configure Deployment Notifications (Optional)

### 7.1 Slack Notifications
1. Create Slack incoming webhook
2. Add `SLACK_WEBHOOK_URL` to GitHub Secrets
3. Workflows will send deployment notifications

### 7.2 Discord Notifications
1. Create Discord webhook in your server
2. Add `DISCORD_WEBHOOK_URL` to GitHub Secrets

---

## ✅ Step 8: Verification Checklist

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string tested
- [ ] GitHub Secret `MONGODB_URI_PRODUCTION` added

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Project imported and deployed
- [ ] Environment variables configured
- [ ] Production URL accessible
- [ ] GitHub Secrets added: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Backend (Render)
- [ ] Render account created
- [ ] Web service created and deployed
- [ ] Environment variables configured
- [ ] Health endpoint accessible
- [ ] GitHub Secrets added: `RENDER_API_KEY`, `RENDER_SERVICE_ID`

### GitHub Actions
- [ ] All required secrets added
- [ ] CI workflow passing
- [ ] Deploy workflow tested
- [ ] Deployments successful

### Application
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] User registration works
- [ ] Login works
- [ ] Transactions CRUD works
- [ ] Guest user mode works

---

## 🚨 Troubleshooting

### Common Issues

#### Issue: "MongoDB connection failed"
**Solution:**
- Verify connection string format
- Check database user password
- Ensure IP whitelist includes 0.0.0.0/0
- Wait 5 minutes for MongoDB Atlas to propagate changes

#### Issue: "Vercel build failed"
**Solution:**
- Check build logs in Vercel dashboard
- Verify `VITE_API_URL` environment variable
- Ensure `frontend` directory has `package.json`
- Check for TypeScript/linting errors

#### Issue: "Render service won't start"
**Solution:**
- Check service logs in Render dashboard
- Verify all environment variables are set
- Ensure `PORT` environment variable is `10000`
- Check MongoDB connection string is correct

#### Issue: "CORS errors in browser"
**Solution:**
- Update `FRONTEND_URL` in Render environment variables
- Restart Render service after changing env vars
- Check CORS configuration in `backend/server.js`

#### Issue: "GitHub Actions workflow failed"
**Solution:**
- Check workflow logs for specific error
- Verify all GitHub Secrets are added correctly
- Ensure secret names match exactly (case-sensitive)
- Check deploy.yml for correct service IDs

---

## 📱 Step 9: Mobile & Production Optimization

### Frontend Performance
1. Enable Vercel Analytics (free)
2. Configure caching headers
3. Enable compression

### Backend Performance
1. Upgrade from Render Free tier (if needed)
2. Enable Redis caching (optional)
3. Configure connection pooling

### Database Optimization
1. Create database indexes
2. Enable MongoDB Atlas monitoring
3. Set up automated backups

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor server uptime
   - Track user analytics

2. **Security Hardening**
   - Add rate limiting
   - Implement CSP headers
   - Enable HTTPS strict mode
   - Add security headers

3. **Continuous Improvement**
   - Set up automated dependency updates (Dependabot)
   - Add E2E tests (Playwright)
   - Implement feature flags
   - A/B testing infrastructure

---

## 📞 Support Resources

- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions

---

## 🎊 Deployment Complete!

Once all steps are completed, your application will be:

✅ **Automatically tested** on every push  
✅ **Automatically deployed** to production (main branch)  
✅ **Automatically deployed** to staging (develop branch)  
✅ **Monitored** for performance and errors  
✅ **Secured** with environment variables and best practices  

**Your URLs:**
- Frontend: https://[your-project].vercel.app
- Backend: https://[your-service].onrender.com
- Database: MongoDB Atlas Cloud

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Author:** Smart Financial Tracker Team
