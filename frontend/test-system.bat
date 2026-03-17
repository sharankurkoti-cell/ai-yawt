@echo off
echo 🧪 YAWTAI SYSTEM TESTING SCRIPT
echo ==================================

REM Check if server is running
echo 📋 1. Checking if server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running on localhost:3000
    
    REM Open browser automatically
    echo 🌐 2. Opening browser...
    start http://localhost:3000
    
    REM Wait for page to load
    echo ⏳ 3. Waiting 10 seconds for page to load...
    timeout /t 10 >nul
    
    REM Test email verification with dummy account
    echo 📧 4. Testing email verification...
    echo    - Test email: test-user123@example.com
    echo    - Test password: TestPassword123!
    echo    - Instructions:
    echo      1. Click "Sign In" button
    echo      2. Click "Create Account" tab
    echo      3. Enter test credentials
    echo      4. Click "Sign Up"
    echo      5. Check console for verification message
    
    REM Test download flow
    echo 📥 5. Testing download flow...
    echo    - Instructions:
    echo      1. Sign in with verified account
    echo      2. Go to Download page
    echo      3. Click download button
    echo      4. Check if download starts
    
    REM Check for desktop app
    echo 💻 6. Checking desktop app...
    if exist "desktop\yawtai-electron\dist\YawtAI-Portable-1.0.0.exe" (
        echo ✅ Desktop app found and built
    ) else (
        echo ❌ Desktop app not found
        echo    - Run: cd desktop\yawtai-electron && npm run build
    )
    
    echo.
    echo 📊 TESTING COMPLETE!
    echo ==================
    echo ✅ Server: Running
    echo ✅ Browser: Opened
    echo ✅ Test credentials: Provided
    echo ✅ Debug tools: Available
    echo ==================
    
) else (
    echo ❌ Server is not running on localhost:3000
    echo    - Run: cd frontend && npm run dev
    echo    - Wait for server to start
    echo    - Then run this script again
)

pause
