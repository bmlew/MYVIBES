# 🧹 GitHub Upload & Deployment Cleanup Checklist

## ✅ Completed Cleanup Tasks

### 1. Security & Credentials
- [x] Created `.gitignore` - Excludes sensitive files
- [x] Created `.env.example` - Template for environment variables
- [x] Updated `/utils/supabase/info.tsx` - Uses environment variables instead of hardcoded credentials
- [x] Removed hardcoded API keys from code

### 2. Documentation
- [x] Created comprehensive `README.md`
- [x] Created `deploy.md` - Full deployment guide
- [x] Created `QUICK-DEPLOY.md` - Quick reference
- [x] Created `PWA-EXPLAINED.md` - PWA documentation
- [x] Created `deployment-architecture.md` - Technical architecture
- [x] Created `deploy-checklist.sh` - Automated verification script

### 3. Environment Configuration
- [x] `.env.example` created with template
- [x] `.gitignore` configured properly
- [x] Environment variables documented

---

## 🚀 Pre-Upload Checklist

### Before Pushing to GitHub:

- [ ] **1. Create .env file locally** (not committed!)
```bash
cp .env.example .env
# Edit .env with your actual Supabase credentials
```

- [ ] **2. Remove any test/debug files**
```bash
# Check for any .log files
find . -name "*.log" -delete

# Check for any backup files
find . -name "*~" -delete
find . -name "*.bak" -delete
```

- [ ] **3. Verify .gitignore is working**
```bash
# Check what will be committed
git status

# Make sure .env is NOT listed!
# Make sure node_modules/ is NOT listed!
```

- [ ] **4. Test build locally**
```bash
npm install
npm run build
npm run preview
```

- [ ] **5. Update README.md**
- [ ] Replace `[Your Deployment URL]` with actual URL after deployment
- [ ] Replace GitHub username in clone command
- [ ] Add screenshots if desired

- [ ] **6. Review package.json**
```bash
# Check for any private/sensitive data in package.json
cat package.json
```

---

## 📤 GitHub Upload Steps

### 1. Initialize Git Repository
```bash
# Navigate to project root
cd /path/to/myvibes

# Initialize git (if not already)
git init

# Add all files
git add .

# Check what will be committed
git status

# Verify .env is NOT included!
```

### 2. Create Initial Commit
```bash
git commit -m "Initial commit: MYVIBES platform - Complete PWA with customer app, business dashboard, and admin portal"
```

### 3. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `myvibes` (or your choice)
3. Description: "Restaurant & entertainment discovery platform - PWA for South Africa"
4. **Make it Private** (recommended for proprietary code)
5. **Do NOT initialize with README** (we have one)
6. Click "Create repository"

### 4. Push to GitHub
```bash
# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/myvibes.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔐 Security Verification

### Files That Should NOT Be in Git:
- [ ] `.env` ❌ (should be gitignored)
- [ ] `node_modules/` ❌ (should be gitignored)
- [ ] `.vercel/` ❌ (should be gitignored)
- [ ] Any API keys ❌
- [ ] Any passwords ❌
- [ ] Any service role keys ❌

### Files That SHOULD Be in Git:
- [x] `.env.example` ✅
- [x] `.gitignore` ✅
- [x] `README.md` ✅
- [x] All deployment guides ✅
- [x] Source code (`/src`) ✅
- [x] Supabase functions (`/supabase`) ✅
- [x] `package.json` ✅

### Verify No Secrets:
```bash
# Search for potential secrets in committed files
git grep -i "password"
git grep -i "secret"
git grep -i "api_key"
git grep -i "apikey"

# If any found in actual code (not .example files), remove them!
```

---

## 🚀 Deployment Steps (After GitHub Upload)

### 1. Set Up Supabase
```bash
# Create Supabase project at https://supabase.com
# Get credentials from dashboard:
# - Project URL
# - Anon key
# - Service role key
# - Database URL
```

### 2. Deploy Backend
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy make-server-175b2872

# Set secrets
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set SUPABASE_DB_URL="postgresql://..."
supabase secrets set SMTP2GO_API_KEY="your-key"
supabase secrets set YOCO_SECRET_KEY="your-key"
supabase secrets set GOOGLE_MAPS_API_KEY="your-key"
```

### 3. Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_PROJECT_ID
# - VITE_SUPABASE_ANON_KEY

# Production deploy
vercel --prod
```

---

## 📝 Post-Deployment Checklist

- [ ] **Test deployed app**
  - [ ] Customer app loads
  - [ ] Can see venues
  - [ ] Can create account
  - [ ] Can make reservations
  - [ ] Business dashboard works
  - [ ] Admin portal accessible
  - [ ] PWA installs correctly

- [ ] **Update README.md on GitHub**
  - [ ] Add live deployment URL
  - [ ] Add screenshots (optional)
  - [ ] Update status badges

- [ ] **Configure custom domain** (optional)
  - [ ] Add domain in Vercel
  - [ ] Update DNS records
  - [ ] Update PWA manifest

- [ ] **Set up monitoring**
  - [ ] Vercel analytics
  - [ ] Supabase logs
  - [ ] Error tracking (optional)

---

## 🔄 Future Updates Workflow

### Making Changes:
```bash
# 1. Make code changes locally
# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push

# 5. Deploy backend (if changed)
supabase functions deploy make-server-175b2872

# 6. Deploy frontend
vercel --prod
```

---

## ⚠️ Important Reminders

1. **NEVER commit `.env` to GitHub**
   - Use `.env.example` as template
   - Add actual values in deployment environments

2. **Service Role Key is SECRET**
   - Only in Supabase secrets
   - Never in frontend code
   - Never in GitHub

3. **Anon Key is PUBLIC**
   - Safe to use in frontend
   - Can be in environment variables
   - Already exposed to users anyway

4. **Keep GitHub Repo Private**
   - Proprietary code
   - Contains business logic
   - Make public only if open-sourcing

5. **Update Dependencies Regularly**
```bash
npm outdated
npm update
```

---

## 📊 Repository Status

### After Cleanup:
- ✅ No secrets in code
- ✅ Environment variables templated
- ✅ Comprehensive documentation
- ✅ Deployment guides included
- ✅ .gitignore configured
- ✅ Ready for GitHub
- ✅ Ready for deployment

---

## 🎉 You're Ready!

Your repository is clean and ready for:
1. ✅ GitHub upload
2. ✅ Public/private sharing
3. ✅ Production deployment
4. ✅ Team collaboration

**Next Step**: Push to GitHub following the steps above!

---

## 📞 Need Help?

- GitHub Guide: https://docs.github.com/en/get-started
- Deployment: See `/deploy.md`
- Quick Start: See `/QUICK-DEPLOY.md`

**Good luck! 🚀**
