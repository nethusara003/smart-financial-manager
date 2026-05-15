# Pre-Deployment Verification Quick Check
# Run this before attempting deployment

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "       PRE-DEPLOYMENT VERIFICATION CHECKLIST" -ForegroundColor Green  
Write-Host "=================================================================`n" -ForegroundColor Cyan

$errors = @()

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host " [OK] Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host " [FAIL] Node.js not installed" -ForegroundColor Red
    $errors += "Node.js not installed"
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host " [OK] npm $npmVersion" -ForegroundColor Green
} else {
    Write-Host " [FAIL] npm not installed" -ForegroundColor Red
    $errors += "npm not installed"
}

# Check Git
Write-Host "`nChecking Git..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host " [OK] Git installed" -ForegroundColor Green
} else {
    Write-Host " [FAIL] Git not installed" -ForegroundColor Red
    $errors += "Git not installed"
}

# Check frontend dependencies
Write-Host "`nChecking frontend..." -ForegroundColor Yellow
if (Test-Path ".\frontend\node_modules") {
    Write-Host " [OK] Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host " [WARN] Frontend dependencies NOT installed" -ForegroundColor Yellow
    Write-Host "        Run: cd frontend && npm install" -ForegroundColor Gray
}

# Check backend dependencies
Write-Host "`nChecking backend..." -ForegroundColor Yellow
if (Test-Path ".\backend\node_modules") {
    Write-Host " [OK] Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host " [WARN] Backend dependencies NOT installed" -ForegroundColor Yellow
    Write-Host "        Run: cd backend && npm install" -ForegroundColor Gray
}

# Check workflows
Write-Host "`nChecking GitHub workflows..." -ForegroundColor Yellow
$workflows = @("ci.yml", "deploy.yml", "deploy-staging.yml", "pr-checks.yml", "coverage-report.yml", "performance.yml")
$workflowsFound = 0
foreach ($workflow in $workflows) {
    if (Test-Path ".\.github\workflows\$workflow") {
        $workflowsFound++
    }
}
Write-Host " [OK] $workflowsFound/6 workflows found" -ForegroundColor Green

# Check Dockerfiles
Write-Host "`nChecking Docker configuration..." -ForegroundColor Yellow
if ((Test-Path ".\frontend\Dockerfile") -and (Test-Path ".\backend\Dockerfile") -and (Test-Path ".\docker-compose.yml")) {
    Write-Host " [OK] Docker files present" -ForegroundColor Green
} else {
    Write-Host " [WARN] Some Docker files missing" -ForegroundColor Yellow
}

# Check backend .env
Write-Host "`nChecking environment..." -ForegroundColor Yellow
if (Test-Path ".\backend\.env") {
    Write-Host " [OK] Backend .env exists" -ForegroundColor Green
} else {
    Write-Host " [WARN] Backend .env not found" -ForegroundColor Yellow
    Write-Host "        Copy .env.example to .env for local testing" -ForegroundColor Gray
}

# Summary
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n [SUCCESS] System is ready for deployment setup!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Generate JWT secrets: .\generate-jwt-secrets.ps1" -ForegroundColor White
    Write-Host "  2. Review: PRE_DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
    Write-Host "  3. Review: DEPLOYMENT_CONFIGURATION_GUIDE.md" -ForegroundColor White
    Write-Host "  4. Start with MongoDB Atlas setup" -ForegroundColor White
} else {
    Write-Host "`n [ERRORS FOUND] Please fix the following:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host "`n" -ForegroundColor White
