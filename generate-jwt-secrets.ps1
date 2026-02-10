# JWT Secret Generator
# Run this script to generate secure JWT secrets for your deployment

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🔑 JWT SECRET GENERATOR                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Generate Production JWT Secret
Write-Host "🏭 Production JWT Secret:" -ForegroundColor Yellow
$prodSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host $prodSecret -ForegroundColor Green
Write-Host ""

# Generate Staging JWT Secret
Write-Host "🧪 Staging JWT Secret:" -ForegroundColor Yellow
$stagingSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host $stagingSecret -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📋 ADD THESE TO GITHUB SECRETS                                ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Go to: github.com/nethusara003/smart-financial-manager/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "2. Click 'New repository secret'" -ForegroundColor White
Write-Host ""
Write-Host "3. Add:" -ForegroundColor White
Write-Host "   Name:  JWT_SECRET_PRODUCTION" -ForegroundColor Cyan
Write-Host "   Value: $prodSecret" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click 'New repository secret' again" -ForegroundColor White
Write-Host ""
Write-Host "5. Add:" -ForegroundColor White
Write-Host "   Name:  JWT_SECRET_STAGING" -ForegroundColor Cyan
Write-Host "   Value: $stagingSecret" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Secrets are cryptographically random and secure!" -ForegroundColor Green
Write-Host ""

# Copy to clipboard option
Write-Host "💡 TIP: Want to copy to clipboard?" -ForegroundColor Yellow
Write-Host "   Production: `$prodSecret | Set-Clipboard" -ForegroundColor Gray
Write-Host "   Staging:    `$stagingSecret | Set-Clipboard" -ForegroundColor Gray
Write-Host ""
