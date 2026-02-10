# Pre-Deployment Verification Script
# Run this before attempting deployment to verify configuration

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║        🔍 PRE-DEPLOYMENT VERIFICATION CHECKLIST                ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$allPassed = $true

# Function to check if file exists
function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "✅ $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $description - MISSING!" -ForegroundColor Red
        return $false
    }
}

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $exists = Get-Command $command -ErrorAction SilentlyContinue
    if ($exists) {
        Write-Host "✅ $command installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $command NOT installed" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 CHECKING DEPENDENCIES..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host "   Version: $nodeVersion" -ForegroundColor Gray
} else {
    $allPassed = $false
}

# Check npm
if (Test-CommandExists "npm") {
    $npmVersion = npm --version
    Write-Host "   Version: $npmVersion" -ForegroundColor Gray
} else {
    $allPassed = $false
}

# Check Git
if (Test-CommandExists "git") {
    $gitVersion = git --version
    Write-Host "   $gitVersion" -ForegroundColor Gray
} else {
    $allPassed = $false
}

Write-Host ""
Write-Host "📁 CHECKING REQUIRED FILES..." -ForegroundColor Yellow
Write-Host ""

# Check configuration files
$allPassed = (Test-FileExists ".\frontend\package.json" "Frontend package.json") -and $allPassed
$allPassed = (Test-FileExists ".\backend\package.json" "Backend package.json") -and $allPassed
$allPassed = (Test-FileExists ".\frontend\.env.example" "Frontend .env.example") -and $allPassed
$allPassed = (Test-FileExists ".\backend\.env.example" "Backend .env.example") -and $allPassed
$allPassed = (Test-FileExists ".\frontend\Dockerfile" "Frontend Dockerfile") -and $allPassed
$allPassed = (Test-FileExists ".\backend\Dockerfile" "Backend Dockerfile") -and $allPassed
$allPassed = (Test-FileExists ".\docker-compose.yml" "docker-compose.yml") -and $allPassed
$allPassed = (Test-FileExists ".\.github\workflows\ci.yml" "CI workflow") -and $allPassed
$allPassed = (Test-FileExists ".\.github\workflows\deploy.yml" "Deploy workflow") -and $allPassed

Write-Host ""
Write-Host "🧪 CHECKING TEST INFRASTRUCTURE..." -ForegroundColor Yellow
Write-Host ""

$allPassed = (Test-FileExists ".\frontend\vitest.config.js" "Frontend test config") -and $allPassed
$allPassed = (Test-FileExists ".\backend\jest.config.js" "Backend test config") -and $allPassed

Write-Host ""
Write-Host "🔧 CHECKING BUILD CAPABILITY..." -ForegroundColor Yellow
Write-Host ""

# Check if dependencies are installed
if (Test-Path ".\frontend\node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend dependencies NOT installed - run: cd frontend && npm install" -ForegroundColor Yellow
    $allPassed = $false
}

if (Test-Path ".\backend\node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend dependencies NOT installed - run: cd backend && npm install" -ForegroundColor Yellow
    $allPassed = $false
}

Write-Host ""
Write-Host "🔐 CHECKING ENVIRONMENT CONFIGURATION..." -ForegroundColor Yellow
Write-Host ""

# Check if .env files exist (for local testing)
if (Test-Path ".\backend\.env") {
    Write-Host "✅ Backend .env exists (local development)" -ForegroundColor Green
    
    # Check for required environment variables
    $envContent = Get-Content '.\backend\.env' -Raw
    $requiredVars = @("MONGODB_URI", "JWT_SECRET", "PORT")
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "   ✓ $var configured" -ForegroundColor Gray
        } else {
            Write-Host "   ✗ $var MISSING" -ForegroundColor Red
            $allPassed = $false
        }
    }
} else {
    Write-Host "⚠️  Backend .env NOT found - Copy .env.example to .env for local testing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 RUNNING TESTS..." -ForegroundColor Yellow
Write-Host ""

# Test frontend build
Write-Host "Testing frontend build..." -ForegroundColor Gray
$frontendBuildResult = & { cd frontend; npm run build 2>&1 }
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build FAILED" -ForegroundColor Red
    $allPassed = $false
}

# Test backend syntax
Write-Host "Testing backend syntax..." -ForegroundColor Gray
$backendCheckResult = node --check ".\backend\server.js" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend syntax valid" -ForegroundColor Green
} else {
    Write-Host "❌ Backend syntax INVALID" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host ""
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You are ready to proceed with deployment setup!" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\generate-jwt-secrets.ps1" -ForegroundColor White
    Write-Host "  2. Set up MongoDB Atlas (see DEPLOYMENT_CONFIGURATION_GUIDE.md)" -ForegroundColor White
    Write-Host "  3. Set up Vercel account" -ForegroundColor White
    Write-Host "  4. Set up Render account" -ForegroundColor White
    Write-Host "  5. Add all GitHub Secrets (see GITHUB_SECRETS_CHECKLIST.md)" -ForegroundColor White
    Write-Host "  6. Test deployment workflows" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  SOME CHECKS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding with deployment." -ForegroundColor White
    Write-Host ""
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
