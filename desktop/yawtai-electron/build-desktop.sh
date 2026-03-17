#!/bin/bash

# YawtAI Desktop App Build Script
echo "🚀 Building YawtAI Desktop Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the electron directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production (portable only to avoid path issues)
echo "🔨 Building portable version..."
export CSC_LINK=""
export CSC_KEY=""
export WIN_CSC_LINK=""
export WIN_CSC_KEY=""
npm run build

# Check if build was successful
if [ ! -f "dist/YawtAI-Portable-1.0.0.exe" ]; then
    echo "❌ Error: Build failed - Portable executable not found"
    exit 1
fi

echo "✅ Desktop app build completed successfully!"
echo "📁 Portable executable: dist/YawtAI-Portable-1.0.0.exe"
echo "📊 File size: $(du -h dist/YawtAI-Portable-1.0.0.exe | cut -f1)"

# Create distribution folder if it doesn't exist
mkdir -p "../../distribution"

# Copy to distribution folder
echo "📋 Copying to distribution folder..."
cp "dist/YawtAI-Portable-1.0.0.exe" "../../distribution/YawtAI-Desktop-Portable-1.0.0.exe"

echo "✅ Ready for distribution in: ../../distribution/"
echo "🎉 YawtAI Desktop is ready for distribution!"
