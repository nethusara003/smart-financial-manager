# 🔐 GitHub Secrets Quick Reference

## Copy-Paste Template for GitHub Secrets

Go to: https://github.com/nethusara003/smart-financial-tracker/settings/secrets/actions

---

## 📋 Required Secrets Checklist

### 🗄️ Database (MongoDB Atlas)
```
Secret Name: MONGODB_URI_PRODUCTION
Secret Value: mongodb+srv://username:password@cluster.mongodb.net/smart_financial_tracker?retryWrites=true&w=majority
Status: ⬜ Not Added
```

```
Secret Name: MONGODB_URI_STAGING
Secret Value: mongodb+srv://username:password@cluster-staging.mongodb.net/smart_financial_tracker_staging?retryWrites=true&w=majority
Status: ⬜ Not Added
```

---

### 🔑 Authentication
```
Secret Name: JWT_SECRET_PRODUCTION
Secret Value: (64-character random string)
Status: ⬜ Not Added

Generate with PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

```
Secret Name: JWT_SECRET_STAGING
Secret Value: (64-character random string - different from production)
Status: ⬜ Not Added
```

---

### 📧 Email Service (Gmail)
```
Secret Name: EMAIL_HOST
Secret Value: smtp.gmail.com
Status: ⬜ Not Added
```

```
Secret Name: EMAIL_PORT
Secret Value: 587
Status: ⬜ Not Added
```

```
Secret Name: EMAIL_USER
Secret Value: your-email@gmail.com
Status: ⬜ Not Added
```

```
Secret Name: EMAIL_PASSWORD
Secret Value: your-gmail-app-password
Status: ⬜ Not Added

Get Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy 16-character password
```

---

### 🎨 Vercel (Frontend)
```
Secret Name: VERCEL_TOKEN
Secret Value: (from Vercel Account Settings → Tokens)
Status: ⬜ Not Added

How to get:
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions"
4. Copy token
```

```
Secret Name: VERCEL_ORG_ID
Secret Value: team_xxxxx or user_xxxxx
Status: ⬜ Not Added

How to get:
1. Go to https://vercel.com/account
2. Scroll to "Your ID"
3. Copy ID
```

```
Secret Name: VERCEL_PROJECT_ID
Secret Value: prj_xxxxxxxxxxxxxxxxxxxxx
Status: ⬜ Not Added

How to get:
1. Go to Vercel project settings
2. Find "Project ID"
3. Copy ID
```

---

### ⚙️ Render (Backend)
```
Secret Name: RENDER_API_KEY
Secret Value: rnd_xxxxxxxxxxxxxxxxxxxx
Status: ⬜ Not Added

How to get:
1. Go to https://dashboard.render.com/account/api-keys
2. Click "Create API Key"
3. Name: "GitHub Actions"
4. Copy key
```

```
Secret Name: RENDER_SERVICE_ID
Secret Value: srv-xxxxxxxxxxxxx
Status: ⬜ Not Added

How to get:
1. Go to your Render service dashboard
2. Look at URL: https://dashboard.render.com/web/srv-xxxxxxxxxxxxx
3. Copy srv-xxxxxxxxxxxxx part
```

---

### 🌐 Application URLs
```
Secret Name: FRONTEND_URL_PRODUCTION
Secret Value: https://your-app.vercel.app
Status: ⬜ Not Added
```

```
Secret Name: FRONTEND_URL_STAGING
Secret Value: https://staging-your-app.vercel.app
Status: ⬜ Not Added
```

```
Secret Name: BACKEND_URL_PRODUCTION
Secret Value: https://your-api.onrender.com
Status: ⬜ Not Added
```

```
Secret Name: BACKEND_URL_STAGING
Secret Value: https://staging-your-api.onrender.com
Status: ⬜ Not Added
```

---

## 🎯 Total Secrets Required: 16

### Progress Tracker
- Database: 0/2 ⬜⬜
- Authentication: 0/2 ⬜⬜
- Email: 0/4 ⬜⬜⬜⬜
- Vercel: 0/3 ⬜⬜⬜
- Render: 0/2 ⬜⬜
- URLs: 0/4 ⬜⬜⬜⬜

**Total: 0/16 Complete**

---

## ✅ Verification Commands

### Test MongoDB Connection
```bash
# Install mongosh if needed
winget install MongoDB.Shell

# Test connection
mongosh "your-connection-string"
```

### Test Backend Health
```bash
# After deployment
curl https://your-api.onrender.com/health
```

### Test Frontend
```bash
# After deployment
curl -I https://your-app.vercel.app
```

---

## 🚀 Quick Start Workflow

1. **Create MongoDB Atlas account** → Get connection string → Add `MONGODB_URI_PRODUCTION`
2. **Generate JWT secrets** → Add `JWT_SECRET_PRODUCTION` and `JWT_SECRET_STAGING`
3. **Set up Gmail app password** → Add all 4 email secrets
4. **Create Vercel account** → Deploy manually → Get credentials → Add 3 Vercel secrets
5. **Create Render account** → Deploy manually → Get credentials → Add 2 Render secrets
6. **Copy deployment URLs** → Add 4 URL secrets
7. **Run GitHub Actions workflow** → Test automatic deployment

---

## 📱 Platform Quick Links

- **GitHub Secrets:** https://github.com/nethusara003/smart-financial-tracker/settings/secrets/actions
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

---

## 🔧 Testing After Setup

```powershell
# Clone and test locally with production-like environment
cd "F:\Smart Financial Tracker"

# Test frontend build
cd frontend
npm run build

# Test backend
cd ../backend
$env:MONGODB_URI = "your-connection-string"
$env:JWT_SECRET = "your-jwt-secret"
npm start
```

---

## ⚠️ Security Notes

1. **Never commit secrets** to git
2. **Use different secrets** for staging and production
3. **Rotate secrets** every 90 days
4. **Enable 2FA** on all platform accounts
5. **Restrict MongoDB IP access** to Render IPs in production (after testing)
6. **Use strong passwords** (min 32 characters for JWT)

---

**Last Updated:** February 10, 2026
