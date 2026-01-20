#!/bin/bash

# Quick Setup Script for MYVIBES Local Development
# Run this script to set up your local environment

echo "🚀 MYVIBES Local Setup"
echo "======================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✓ Found package.json"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "✓ Dependencies installed"
echo ""

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x pre-upload.sh 2>/dev/null
chmod +x check-secrets.sh 2>/dev/null
chmod +x deploy-checklist.sh 2>/dev/null

echo "✓ Scripts are executable"
echo ""

# Check for .env
if [ ! -f ".env" ]; then
    echo "ℹ️  No .env file found (this is OK - app has built-in fallbacks)"
    echo "📝 Optional: Copy .env.example to .env if you want to customize"
else
    echo "✓ .env file exists"
fi
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📚 Initializing git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi
echo ""

# Summary
echo "======================================"
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start dev server:  npm run dev"
echo "2. Open browser:      http://localhost:5173"
echo "3. Test the app"
echo "4. When ready:        bash pre-upload.sh"
echo ""
echo "📖 See LOCAL-SETUP-GUIDE.md for detailed instructions"
echo ""
