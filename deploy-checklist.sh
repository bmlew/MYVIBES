#!/bin/bash

# MYVIBES Deployment Checklist Script
# This script helps you verify all deployment requirements

echo "🚀 MYVIBES Deployment Checklist"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_installed() {
  if command -v $1 &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 is installed"
    return 0
  else
    echo -e "${RED}✗${NC} $1 is NOT installed"
    return 1
  fi
}

echo "📋 Checking Prerequisites..."
echo ""

# Check Node.js
check_installed node
if [ $? -eq 0 ]; then
  echo "  Version: $(node --version)"
fi
echo ""

# Check npm
check_installed npm
if [ $? -eq 0 ]; then
  echo "  Version: $(npm --version)"
fi
echo ""

# Check Supabase CLI
check_installed supabase
if [ $? -eq 0 ]; then
  echo "  Version: $(supabase --version)"
else
  echo -e "  ${YELLOW}Install with: npm install -g supabase${NC}"
fi
echo ""

# Check Vercel CLI
check_installed vercel
if [ $? -eq 0 ]; then
  echo "  Version: $(vercel --version)"
else
  echo -e "  ${YELLOW}Install with: npm install -g vercel${NC}"
fi
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env file exists"
else
  echo -e "${RED}✗${NC} .env file NOT found"
  echo -e "  ${YELLOW}Create .env with your Supabase credentials${NC}"
fi
echo ""

# Check if package.json exists
if [ -f "package.json" ]; then
  echo -e "${GREEN}✓${NC} package.json exists"
else
  echo -e "${RED}✗${NC} package.json NOT found"
  echo -e "  ${YELLOW}Are you in the project root directory?${NC}"
fi
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules exists"
else
  echo -e "${RED}✗${NC} node_modules NOT found"
  echo -e "  ${YELLOW}Run: npm install${NC}"
fi
echo ""

# Check if supabase functions exist
if [ -d "supabase/functions/server" ]; then
  echo -e "${GREEN}✓${NC} Supabase functions directory exists"
else
  echo -e "${RED}✗${NC} Supabase functions directory NOT found"
fi
echo ""

echo "================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Create Supabase project at https://supabase.com"
echo "2. Run: supabase login"
echo "3. Run: supabase link --project-ref your-project-ref"
echo "4. Run: supabase functions deploy make-server-175b2872"
echo "5. Run: vercel login"
echo "6. Run: vercel"
echo "7. Run: vercel --prod"
echo ""
echo "📖 See deploy.md for detailed instructions"
echo ""
