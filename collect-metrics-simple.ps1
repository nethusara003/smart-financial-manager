#!/usr/bin/env pwsh
# Collect metrics for abstract - simplified version
$BaseURL = "http://localhost:5000/api"
$OutputFile = "f:\Smart Financial Tracker\METRICS_COLLECTED.json"

Write-Host "METRICS COLLECTION SCRIPT" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Step 1: Register user
Write-Host "`nRegistering test user..." -ForegroundColor Green
$testUser = @{
    name = "Test User $(Get-Random)"
    email = "test-$(Get-Random)@example.com"
    password = "TestPassword123!"
    phone = "1234567890"
}

try {
    $registerResponse = Invoke-WebRequest -Uri "$BaseURL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($testUser | ConvertTo-Json) `
        -ErrorAction SilentlyContinue
    
    if ($registerResponse.StatusCode -eq 200) {
        $registerData = $registerResponse.Content | ConvertFrom-Json
        $JWT = $registerData.token
        $UserId = $registerData.user.id
        Write-Host "User registered: $($testUser.email)" -ForegroundColor Green
        Write-Host "User ID: $UserId" -ForegroundColor Green
    }
} catch {
    Write-Host "Error registering user: $_" -ForegroundColor Red
}

# Helper function
function Invoke-Authenticated {
    param([string]$Uri, [string]$Method = "GET", [object]$Body = $null)
    $headers = @{ "Authorization" = "Bearer $JWT" }
    if ($Body) {
        return Invoke-WebRequest -Uri $Uri -Method $Method -ContentType "application/json" `
            -Body ($Body | ConvertTo-Json) -Headers $headers -ErrorAction SilentlyContinue
    } else {
        return Invoke-WebRequest -Uri $Uri -Method $Method -Headers $headers -ErrorAction SilentlyContinue
    }
}

$metrics = @{
    collectTime = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    userId = $UserId
    email = $testUser.email
}

# Step 2: Generate sample data
Write-Host "`nGenerating sample data..." -ForegroundColor Green
$sampleResponse = Invoke-Authenticated -Uri "$BaseURL/sample-data/generate" -Method POST
if ($sampleResponse.StatusCode -eq 200) {
    $sampleData = $sampleResponse.Content | ConvertFrom-Json
    Write-Host "Sample data generated - Transactions: $($sampleData.data.transactions)" -ForegroundColor Green
    $metrics | Add-Member -NotePropertyName "dataset" -NotePropertyValue @{
        transactionCount = $sampleData.data.transactions
        budgetCount = $sampleData.data.budgets
        goalCount = $sampleData.data.goals
        billCount = $sampleData.data.bills
        userCount = 1
        dataType = "synthetic (3-month sample data)"
    }
}

# Step 3: Get forecasting metrics
Write-Host "`nFetching forecasting error metrics..." -ForegroundColor Green
$forecastResponse = Invoke-Authenticated -Uri "$BaseURL/forecasting/expenses" -Method GET
if ($forecastResponse.StatusCode -eq 200) {
    $forecast = $forecastResponse.Content | ConvertFrom-Json
    if ($forecast.summary.backtestQuality) {
        $bq = $forecast.summary.backtestQuality
        Write-Host "Forecasting metrics collected:" -ForegroundColor Green
        Write-Host "  MAE: $($bq.mae)" -ForegroundColor Green
        Write-Host "  RMSE: $($bq.rmse)" -ForegroundColor Green
        Write-Host "  MAPE: $($bq.mape) percent" -ForegroundColor Green
        
        $metrics | Add-Member -NotePropertyName "forecasting" -NotePropertyValue @{
            mae = $bq.mae
            rmse = $bq.rmse
            mape = $bq.mape
            windows = $bq.windows
            categories = $forecast.categoryForecasts.Count
            confidenceMethod = $forecast.confidenceModel.method
        }
    }
}

# Step 4: Get retirement metrics
Write-Host "`nFetching retirement simulation..." -ForegroundColor Green
$retirementInput = @{ years = 30; targetAmount = 500000; applyGrowthAdjustments = $true }
$simResponse = Invoke-Authenticated -Uri "$BaseURL/retirement/simulate" -Method POST -Body $retirementInput
if ($simResponse.StatusCode -eq 200) {
    $sim = $simResponse.Content | ConvertFrom-Json
    $mc = $sim.simulation
    Write-Host "Monte Carlo results:" -ForegroundColor Green
    Write-Host "  Probability of success: $($mc.probabilityOfSuccess * 100) percent" -ForegroundColor Green
    Write-Host "  Mean: $($mc.mean)" -ForegroundColor Green
    Write-Host "  Median: $($mc.median)" -ForegroundColor Green
    Write-Host "  90th percentile: $($mc.percentile90)" -ForegroundColor Green
    
    $metrics | Add-Member -NotePropertyName "retirement" -NotePropertyValue @{
        monteCarloSimulations = if ($sim.simulation.allSimulations) { $sim.simulation.allSimulations.Count } else { 1000 }
        probabilityOfSuccess = $mc.probabilityOfSuccess
        mean = $mc.mean
        median = $mc.median
        percentile90 = $mc.percentile90
        mlSource = $sim.predictions.source
    }
}

# Step 5: Get feedback / AI evaluation
Write-Host "`nChecking AI assistant feedback..." -ForegroundColor Green
$feedbackResponse = Invoke-Authenticated -Uri "$BaseURL/feedback" -Method GET
if ($feedbackResponse.StatusCode -eq 200) {
    $feedback = $feedbackResponse.Content | ConvertFrom-Json
    $totalFb = 0
    $avgRating = 0
    if ($feedback.stats) {
        $totalFb = $feedback.stats.totalFeedbacks
        $avgRating = $feedback.stats.averageRating
    }
    Write-Host "Feedback stats:" -ForegroundColor Green
    Write-Host "  Total feedbacks: $totalFb" -ForegroundColor Green
    Write-Host "  Average rating: $avgRating / 5" -ForegroundColor Green
    
    $metrics | Add-Member -NotePropertyName "aiAssistant" -NotePropertyValue @{
        totalFeedbacks = $totalFb
        averageRating = $avgRating
        status = "System instrumented; no formal user study conducted"
    }
}

# Save
Write-Host "`nSaving metrics..." -ForegroundColor Green
$metrics | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
Write-Host "Saved to: $OutputFile" -ForegroundColor Green

# Display summary for abstract
Write-Host "`n" -ForegroundColor Cyan
Write-Host "SUMMARY FOR ABSTRACT REWRITE" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "`n1. FORECASTING ERROR METRICS" -ForegroundColor Yellow
Write-Host "   - MAE: $($metrics.forecasting.mae)" -ForegroundColor White
Write-Host "   - RMSE: $($metrics.forecasting.rmse)" -ForegroundColor White
Write-Host "   - MAPE: $($metrics.forecasting.mape) percent" -ForegroundColor White
Write-Host "   - Windows: $($metrics.forecasting.windows)" -ForegroundColor White

Write-Host "`n2. DATASET DETAILS" -ForegroundColor Yellow
Write-Host "   - Transactions: $($metrics.dataset.transactionCount)" -ForegroundColor White
Write-Host "   - Users: $($metrics.dataset.userCount)" -ForegroundColor White
Write-Host "   - Type: $($metrics.dataset.dataType)" -ForegroundColor White

Write-Host "`n3. RETIREMENT MONTE CARLO" -ForegroundColor Yellow
Write-Host "   - Simulations: $($metrics.retirement.monteCarloSimulations)" -ForegroundColor White
Write-Host "   - Probability of success: $($metrics.retirement.probabilityOfSuccess * 100) percent" -ForegroundColor White
Write-Host "   - Median outcome: `$$($metrics.retirement.median)" -ForegroundColor White

Write-Host "`n4. AI ASSISTANT EVALUATION" -ForegroundColor Yellow
Write-Host "   - Feedback collected: $($metrics.aiAssistant.totalFeedbacks)" -ForegroundColor White
Write-Host "   - Average rating: $($metrics.aiAssistant.averageRating) / 5" -ForegroundColor White
Write-Host "   - Status: $($metrics.aiAssistant.status)" -ForegroundColor White

Write-Host "`n5. CONFIDENCE SCORING" -ForegroundColor Yellow
Write-Host "   - Method: Blended (Variance + Backtest)" -ForegroundColor White
Write-Host "   - High-confidence threshold: MAPE less than or equal to 12 percent" -ForegroundColor White
Write-Host "   - Outcome: Flagged automatically based on rolling-origin backtest" -ForegroundColor White

Write-Host "`nDone!" -ForegroundColor Green
