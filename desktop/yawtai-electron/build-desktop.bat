@echo off
REM YawtAI Desktop App Build Script

echo 🚀 Building YawtAI Desktop Application...

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the electron directory.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Build for production (portable only to avoid path issues)
echo 🔨 Building portable version...
set CSC_LINK=
set CSC_KEY=
set WIN_CSC_LINK=
set WIN_CSC_KEY=
call npm run build

REM Check if build was successful
if not exist "dist\YawtAI-Portable-1.0.0.exe" (
    echo ❌ Error: Build failed - Portable executable not found
    pause
    exit /b 1
)

echo ✅ Desktop app build completed successfully!
echo 📁 Portable executable: dist\YawtAI-Portable-1.0.0.exe
echo 📊 File size: 
for %%I in ("dist\YawtAI-Portable-1.0.0.exe") do echo %%~zI bytes

echo.
echo 🎉 YawtAI Desktop is ready for distribution!
echo 📦 Distribute the portable executable to users
echo 🔗 Users can run it directly without installation

REM Create distribution folder if it doesn't exist
if not exist "..\..\distribution" mkdir "..\..\distribution"

REM Copy to distribution folder
echo 📋 Copying to distribution folder...
copy "dist\YawtAI-Portable-1.0.0.exe" "..\..\distribution\YawtAI-Desktop-Portable-1.0.0.exe"

echo ✅ Ready for distribution in: ..\..\distribution\
pause
