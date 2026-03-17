#!/bin/bash

echo "🚀 Installing YawtAI Platform Dependencies..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend/yawt-website
npm install

# Install backend API server dependencies
echo "📦 Installing API server dependencies..."
cd ../../backend/api-server
npm install

# Install AI engine dependencies
echo "📦 Installing AI engine dependencies..."
cd ../ai-engine
npm install

# Install debug agent dependencies
echo "📦 Installing debug agent dependencies..."
cd ../debug-agent
npm install

# Install project generator dependencies
echo "📦 Installing project generator dependencies..."
cd ../project-generator
npm install

# Install desktop app dependencies
echo "📦 Installing desktop app dependencies..."
cd ../../desktop/yawtai-electron
npm install

# Install desktop renderer dependencies
echo "📦 Installing desktop renderer dependencies..."
cd src/renderer
npm install

echo "✅ All dependencies installed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy infra/docker/.env.example to .env and configure your API keys"
echo "2. Run 'npm run migrate' in backend/api-server to set up the database"
echo "3. Start services with 'docker-compose up -d' from infra/docker/"
echo "4. Or run services individually:"
echo "   - Frontend: cd frontend/yawt-website && npm run dev"
echo "   - API Server: cd backend/api-server && npm run dev"
echo "   - AI Engine: cd backend/ai-engine && npm run dev"
echo "   - Debug Agent: cd backend/debug-agent && npm run dev"
echo "   - Project Generator: cd backend/project-generator && npm run dev"
echo "   - Desktop App: cd desktop/yawtai-electron && npm run dev"
