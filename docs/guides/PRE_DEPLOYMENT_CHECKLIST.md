# ✅ PRE-DEPLOYMENT CHECKLIST

## 📋 Complete Before Cloud Deployment

### 1. Local Environment Verification ✓

Run the verification script first:
```powershell
.\pre-deployment-check.ps1
```

**Required Items:**
- [ ] Node.js 20.x installed
- [ ] Git installed and configured
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] All tests passing (frontend + backend)
- [ ] Frontend builds successfully
- [ ] Backend syntax valid

---

### 2. Environment Configuration ✓

#### Backend .env (Local Testing)
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Update `MONGODB_URI` (can use local MongoDB for now)
- [ ] Set `JWT_SECRET` (use `.\generate-jwt-secrets.ps1`)
- [ ] Configure email settings (Gmail App Password)

#### Frontend .env (Local Testing - Optional)
- [ ] Copy `frontend/.env.example` to `frontend/.env` if needed
- [ ] `VITE_API_URL` should point to your backend

---

### 3. Code Repository Ready ✓

- [ ] All changes committed to Git
- [ ] Pushed to GitHub main branch
- [ ] CI pipeline running successfully
- [ ] No pending merge conflicts
- [ ] `.gitignore` excludes `.env` files

**Verify:**
```powershell
git status
git log --oneline -5
```

---

### 4. Database Setup (MongoDB Atlas) ⏳

**Action Required:**
1. [ ] Create account at https://cloud.mongodb.com
2. [ ] Create FREE cluster (M0 Sandbox)
3. [ ] Create database user with password
4. [ ] Add IP whitelist: `0.0.0.0/0` (allow from anywhere)
5. [ ] Get connection string
6. [ ] Test connection string locally
7. [ ] Save connection string for GitHub Secrets

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/smart_financial_tracker?retryWrites=true&w=majority
```

---

### 5. JWT Secrets Generation ⏳

**Action Required:**
```powershell
# Generate secrets
.\generate-jwt-secrets.ps1

# Or manually:
# -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Generated Secrets:
- [ ] Production JWT Secret (64 characters)
- [ ] Staging JWT Secret (64 characters)
- [ ] Both saved securely for GitHub Secrets

---

### 6. Email Service Configuration ⏳

**Gmail Setup:**
1. [ ] Enable 2-Factor Authentication on Gmail
2. [ ] Go to https://myaccount.google.com/apppasswords
3. [ ] Generate App Password for "Mail"
4. [ ] Save 16-character password

**Required Values:**
- [ ] `EMAIL_HOST`: smtp.gmail.com
- [ ] `EMAIL_PORT`: 587
- [ ] `EMAIL_USER`: your-email@gmail.com
- [ ] `EMAIL_PASSWORD`: (16-char app password)

---

### 7. Frontend Deployment (Vercel) ⏳

**Account Setup:**
1. [ ] Create account at https://vercel.com
2. [ ] Connect GitHub account
3. [ ] Import `smart-financial-tracker` repository

**Project Configuration:**
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

**Environment Variables (in Vercel):**
- [ ] `VITE_API_URL` = (Render backend URL - add after Step 8)

**Get Credentials:**
- [ ] Vercel Token (from Account Settings → Tokens)
- [ ] Vercel Org ID (from Account Settings)
- [ ] Vercel Project ID (from Project Settings)

**First Deployment:**
- [ ] Deploy manually first to verify it works
- [ ] Copy production URL (e.g., https://smart-financial-tracker.vercel.app)

---

### 8. Backend Deployment (Render) ⏳

**Account Setup:**
1. [ ] Create account at https://render.com
2. [ ] Connect GitHub account
3. [ ] Create new Web Service

**Service Configuration:**
- [ ] Repository: `smart-financial-tracker`
- [ ] Branch: `main`
- [ ] Root directory: `backend`
- [ ] Runtime: Node
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Instance type: Free (or paid)

**Environment Variables (in Render):**
- [ ] `NODE_ENV` = production
- [ ] `PORT` = 10000
- [ ] `MONGODB_URI` = (from Step 4)
- [ ] `JWT_SECRET` = (from Step 5 - production)
- [ ] `FRONTEND_URL` = (from Step 7 Vercel URL)
- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] `EMAIL_USER` = your-email@gmail.com
- [ ] `EMAIL_PASSWORD` = (from Step 6)

**Get Credentials:**
- [ ] Render API Key (from Account Settings → API Keys)
- [ ] Render Service ID (from service URL: srv-xxxxx)

**First Deployment:**
- [ ] Deploy manually first to verify it works
- [ ] Test health endpoint: https://your-service.onrender.com/health
- [ ] Copy backend URL

**Update Vercel:**
- [ ] Go back to Vercel → Environment Variables
- [ ] Update `VITE_API_URL` = https://your-api.onrender.com/api
- [ ] Redeploy frontend

---

### 9. GitHub Secrets Configuration ⏳

**Navigate to:**
https://github.com/nethusara003/smart-financial-tracker/settings/secrets/actions

**Add All 16 Secrets:**

#### Database (2 secrets)
- [ ] `MONGODB_URI_PRODUCTION` = (MongoDB Atlas connection string)
- [ ] `MONGODB_URI_STAGING` = (same or different cluster)

#### Authentication (2 secrets)
- [ ] `JWT_SECRET_PRODUCTION` = (from Step 5)
- [ ] `JWT_SECRET_STAGING` = (from Step 5)

#### Email (4 secrets)
- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] `EMAIL_USER` = your-email@gmail.com
- [ ] `EMAIL_PASSWORD` = (from Step 6)

#### Vercel (3 secrets)
- [ ] `VERCEL_TOKEN` = (from Step 7)
- [ ] `VERCEL_ORG_ID` = (from Step 7)
- [ ] `VERCEL_PROJECT_ID` = (from Step 7)

#### Render (2 secrets)
- [ ] `RENDER_API_KEY` = (from Step 8)
- [ ] `RENDER_SERVICE_ID` = (from Step 8)

#### URLs (4 secrets)
- [ ] `FRONTEND_URL_PRODUCTION` = https://your-app.vercel.app
- [ ] `FRONTEND_URL_STAGING` = https://staging-your-app.vercel.app
- [ ] `BACKEND_URL_PRODUCTION` = https://your-api.onrender.com
- [ ] `BACKEND_URL_STAGING` = (staging backend URL if separate)

**Total: __/16 Secrets Added**

---

### 10. Test Automatic Deployment ⏳

**Trigger Deployment:**
```powershell
# Make a small change
git add .
git commit -m "test: trigger deployment workflow"
git push origin main
```

**Verify:**
1. [ ] Go to GitHub → Actions tab
2. [ ] Watch "Deploy to Production" workflow
3. [ ] Verify frontend deployment succeeds
4. [ ] Verify backend deployment succeeds
5. [ ] Check health endpoint works
6. [ ] Test the live application

**Workflow URL:**
https://github.com/nethusara003/smart-financial-tracker/actions

---

### 11. Application Testing ⏳

**Test Production Deployment:**
- [ ] Frontend loads at Vercel URL
- [ ] Backend health check responds
- [ ] User registration works
- [ ] User login works
- [ ] Create transaction works
- [ ] View transactions works
- [ ] Guest mode works
- [ ] No CORS errors in browser console
- [ ] No 500 errors

**Test Staging Deployment (Optional):**
- [ ] Create `develop` branch
- [ ] Push changes to `develop`
- [ ] Verify staging deployment workflow runs
- [ ] Test staging environment

---

### 12. Final Verification ✓

**Documentation:**
- [ ] Review DEPLOYMENT_CONFIGURATION_GUIDE.md
- [ ] Review GITHUB_SECRETS_CHECKLIST.md
- [ ] Update README.md with deployment URLs

**Monitoring:**
- [ ] Set up error tracking (optional - Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up deployment notifications

**Security:**
- [ ] Verify all secrets are in GitHub Secrets (not in code)
- [ ] Confirm .env files are in .gitignore
- [ ] Enable branch protection rules on `main`
- [ ] Require PR reviews before merging

---

## 🎯 Success Criteria

You're ready for production when:
- ✅ All checklist items completed
- ✅ CI pipeline passing on GitHub
- ✅ Manual deployments successful on both platforms
- ✅ Automatic deployment workflow tested and working
- ✅ Live application accessible and functional
- ✅ Health checks responding correctly
- ✅ No errors in browser console or server logs

---

## 📞 Help & Troubleshooting

**Common Issues:**
- MongoDB connection fails → Check connection string format, IP whitelist
- Vercel build fails → Check build logs, verify environment variables
- Render service won't start → Check environment variables, view logs
- CORS errors → Verify `FRONTEND_URL` in Render environment variables
- 401 errors → Check `JWT_SECRET` is set correctly

**Useful Commands:**
```powershell
# Test local build
cd frontend && npm run build

# Test backend syntax
node --check backend/server.js

# View Git status
git status

# Check CI pipeline
# Visit: https://github.com/nethusara003/smart-financial-tracker/actions
```

---

**Last Updated:** February 10, 2026
**Estimated Total Time:** 2-3 hours (first time setup)
