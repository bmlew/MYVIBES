#!/bin/bash

# Script to check for potential secrets in code before GitHub upload

echo "🔍 Checking for potential secrets in code..."
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues found
ISSUES=0

echo "📋 Checking for common secret patterns..."
echo ""

# Check for API keys
echo "Checking for API keys..."
if grep -r "api_key\s*=\s*['\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v ".example" | grep -v "your-"; then
  echo -e "${RED}⚠️  Found potential API keys!${NC}"
  ISSUES=$((ISSUES+1))
else
  echo -e "${GREEN}✓ No hardcoded API keys found${NC}"
fi
echo ""

# Check for passwords
echo "Checking for passwords..."
if grep -r "password\s*=\s*['\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v ".example" | grep -v "your-" | grep -v "PASSWORD" | grep -v "password:" | grep -v "password," | grep -v "Password"; then
  echo -e "${RED}⚠️  Found potential passwords!${NC}"
  ISSUES=$((ISSUES+1))
else
  echo -e "${GREEN}✓ No hardcoded passwords found${NC}"
fi
echo ""

# Check for secret keys
echo "Checking for secret keys..."
if grep -r "secret_key\s*=\s*['\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v ".example" | grep -v "your-"; then
  echo -e "${RED}⚠️  Found potential secret keys!${NC}"
  ISSUES=$((ISSUES+1))
else
  echo -e "${GREEN}✓ No hardcoded secret keys found${NC}"
fi
echo ""

# Check for tokens
echo "Checking for tokens..."
if grep -r "token\s*=\s*['\"]" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v ".example" | grep -v "your-" | grep -v "Token" | grep -v "token:" | grep -v "token,"; then
  echo -e "${RED}⚠️  Found potential tokens!${NC}"
  ISSUES=$((ISSUES+1))
else
  echo -e "${GREEN}✓ No hardcoded tokens found${NC}"
fi
echo ""

# Check if .env exists
echo "Checking for .env file..."
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ .env file exists (will be ignored by git)${NC}"
else
  echo -e "${YELLOW}⚠️  .env file not found - create one from .env.example${NC}"
fi
echo ""

# Check if .gitignore exists
echo "Checking for .gitignore..."
if [ -f ".gitignore" ]; then
  echo -e "${GREEN}✓ .gitignore exists${NC}"
  
  # Check if .env is in gitignore
  if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✓ .env is in .gitignore${NC}"
  else
    echo -e "${RED}⚠️  .env is NOT in .gitignore!${NC}"
    ISSUES=$((ISSUES+1))
  fi
else
  echo -e "${RED}⚠️  .gitignore not found!${NC}"
  ISSUES=$((ISSUES+1))
fi
echo ""

# Check if .env.example exists
echo "Checking for .env.example..."
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓ .env.example exists${NC}"
else
  echo -e "${YELLOW}⚠️  .env.example not found - template for others${NC}"
fi
echo ""

# Check for node_modules
echo "Checking for node_modules..."
if [ -d "node_modules" ]; then
  if grep -q "^node_modules/$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓ node_modules will be ignored${NC}"
  else
    echo -e "${RED}⚠️  node_modules exists but not in .gitignore!${NC}"
    ISSUES=$((ISSUES+1))
  fi
else
  echo -e "${GREEN}✓ node_modules not present${NC}"
fi
echo ""

# Check utils/supabase/info.tsx
echo "Checking Supabase config..."
if [ -f "utils/supabase/info.tsx" ]; then
  if grep -q "import.meta.env" utils/supabase/info.tsx; then
    echo -e "${GREEN}✓ Supabase config uses environment variables${NC}"
  else
    echo -e "${RED}⚠️  Supabase config may have hardcoded values!${NC}"
    ISSUES=$((ISSUES+1))
  fi
else
  echo -e "${YELLOW}⚠️  Supabase config file not found${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo ""
if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready for GitHub upload.${NC}"
else
  echo -e "${RED}⚠️  Found $ISSUES potential issues. Please review above.${NC}"
  echo ""
  echo "Recommended actions:"
  echo "1. Remove any hardcoded secrets"
  echo "2. Move secrets to .env file"
  echo "3. Ensure .env is in .gitignore"
  echo "4. Use environment variables (import.meta.env)"
fi
echo ""

exit $ISSUES
