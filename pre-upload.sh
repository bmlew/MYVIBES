#!/bin/bash

# Pre-upload verification script
# Run this before pushing to GitHub

echo "🚀 MYVIBES Pre-Upload Verification"
echo "===================================="
echo ""

# Make check-secrets.sh executable if needed
chmod +x check-secrets.sh 2>/dev/null

# Run security check
echo "1️⃣  Running security checks..."
if bash check-secrets.sh; then
  echo ""
else
  echo ""
  echo "❌ Security check failed! Fix issues before uploading."
  exit 1
fi

# Check if node_modules exists
echo "2️⃣  Checking build dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Installing dependencies..."
  npm install
else
  echo "✓ Dependencies installed"
fi
echo ""

# Try to build
echo "3️⃣  Testing production build..."
if npm run build > /dev/null 2>&1; then
  echo "✓ Build successful"
else
  echo "❌ Build failed! Fix errors before uploading."
  echo "Run 'npm run build' to see errors."
  exit 1
fi
echo ""

# Check for .env
echo "4️⃣  Checking environment configuration..."
if [ -f ".env" ]; then
  echo "✓ .env file exists"
else
  echo "⚠️  .env not found. Create one from .env.example for local testing."
fi
echo ""

# Check for .env.example
if [ -f ".env.example" ]; then
  echo "✓ .env.example exists"
else
  echo "⚠️  .env.example not found"
fi
echo ""

# Check critical files
echo "5️⃣  Checking critical files..."
CRITICAL_FILES=(
  "README.md"
  ".gitignore"
  "package.json"
  "deploy.md"
  "QUICK-DEPLOY.md"
)

MISSING=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "❌ $file missing"
    MISSING=$((MISSING+1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "❌ Missing critical files! Cannot proceed."
  exit 1
fi
echo ""

# Check git status
echo "6️⃣  Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "✓ Git repository initialized"
  
  # Check for untracked .env
  if git status --porcelain | grep -q "^?? .env$"; then
    echo "⚠️  .env is untracked (good - will be ignored)"
  fi
  
  # Check for staged .env
  if git status --porcelain | grep -q "^A  .env$"; then
    echo "❌ .env is staged! Remove it from git:"
    echo "   git reset HEAD .env"
    echo "   git rm --cached .env"
    exit 1
  fi
  
else
  echo "⚠️  Not a git repository. Initialize with: git init"
fi
echo ""

# Final summary
echo "===================================="
echo ""
echo "✅ All verification checks passed!"
echo ""
echo "📝 Next steps:"
echo "1. Review CLEANUP-CHECKLIST.md"
echo "2. Commit your code:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "3. Create GitHub repository"
echo "4. Push to GitHub:"
echo "   git remote add origin https://github.com/USERNAME/myvibes.git"
echo "   git push -u origin main"
echo ""
echo "🚀 Ready for GitHub upload!"
echo ""
