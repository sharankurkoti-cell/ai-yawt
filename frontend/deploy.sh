#!/bin/bash

# YawtAI Frontend Deployment Script
echo "🚀 Starting YawtAI Frontend Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (if available)
echo "🧪 Running tests..."
if npm run test 2>/dev/null; then
    echo "✅ Tests passed"
else
    echo "⚠️  No tests found or tests failed, continuing..."
fi

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output: $(du -sh dist | cut -f1)"
echo "📄 Files created: $(find dist -type f | wc -l)"

# Optional: Deploy to hosting service
echo ""
echo "🌐 Deployment Options:"
echo "1. Vercel: vercel --prod"
echo "2. Netlify: netlify deploy --prod --dir=dist"
echo "3. GitHub Pages: gh-pages -d dist"
echo "4. Custom hosting: Upload dist folder to your web server"

echo ""
echo "🎉 YawtAI Frontend is ready for deployment!"
echo "📂 Build files are in the 'dist' folder"
