@echo off
echo ============================================
echo   Quick Wallet Test - Start Servers
echo ============================================
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd /d %~dp0backend && echo Starting Backend... && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && echo Starting Frontend... && npm run dev"

echo.
echo ============================================
echo   Servers Starting...
echo ============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Wait 10 seconds, then:
echo 1. Open http://localhost:5173 in browser
echo 2. Login to your account
echo 3. Go to Tools -^> Wallet
echo 4. Click "Add Funds"
echo 5. Use test card: 4242 4242 4242 4242
echo.
echo Or run automated test:
echo   cd backend
echo   node test/test-wallet-system.js
echo.
pause
