@echo off
REM YawtAI Frontend Deployment Script for Windows

echo 🚀 Starting YawtAI Frontend Deployment...

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Run tests (if available)
echo 🧪 Running tests...
call npm run test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Tests passed
) else (
    echo ⚠️  No tests found or tests failed, continuing...
)

REM Build for production
echo 🔨 Building for production...
call npm run build

REM Check if build was successful
if not exist "dist" (
    echo ❌ Error: Build failed - dist directory not found
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Build output ready for deployment

echo.
echo 🌐 Deployment Options:
echo 1. Vercel: vercel --prod
echo 2. Netlify: netlify deploy --prod --dir=dist
echo 3. GitHub Pages: gh-pages -d dist
echo 4. Custom hosting: Upload dist folder to your web server

echo.
echo 🎉 YawtAI Frontend is ready for deployment!
echo 📂 Build files are in the 'dist' folder
pause
