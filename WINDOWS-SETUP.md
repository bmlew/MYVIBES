# 🪟 Windows Setup Guide - MYVIBES

Quick setup guide for Windows users!

## ⚡ Quick Start (3 Steps)

### Step 1: Open Command Prompt or PowerShell
```cmd
# Press Windows Key + R
# Type: cmd
# Press Enter

# Navigate to your project
cd C:\User\MyVibes
```

Or open **PowerShell**:
```powershell
# Right-click Start Menu → Windows PowerShell
cd C:\User\MyVibes
```

### Step 2: Install Dependencies
```cmd
npm install
```

This will take 2-3 minutes. ☕

### Step 3: Run the App
```cmd
npm run dev
```

**Open browser:** http://localhost:5173 🎉

---

## 📋 Windows Commands Reference

### Development:
```cmd
npm install              REM Install dependencies
npm run dev             REM Start dev server
npm run build           REM Build for production
npm run preview         REM Preview build
```

### Verification:
```cmd
REM Check for secrets (PowerShell)
powershell -ExecutionPolicy Bypass -File check-secrets.ps1

REM Or manually check
findstr /s /i "api_key" src\*.tsx src\*.ts
```

### Git:
```cmd
git init                REM Initialize git
git status              REM Check status
git add .               REM Stage all files
git commit -m "Initial commit: MYVIBES platform"
git push                REM Push to GitHub
```

---

## 🔧 Setup Instructions (Detailed)

### 1. Install Node.js (If Not Installed)
1. Go to https://nodejs.org
2. Download "LTS" version (recommended)
3. Run installer
4. Check installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install Git (If Not Installed)
1. Go to https://git-scm.com/download/win
2. Download and install
3. Check installation:
   ```cmd
   git --version
   ```

### 3. Install Dependencies
```cmd
cd C:\User\MyVibes
npm install
```

### 4. Create .env File (Optional)

**Option A: Using Command Prompt**
```cmd
copy .env.example .env
notepad .env
```

Add this content:
```
VITE_SUPABASE_PROJECT_ID=skpkuhhvcslzdopfccxo
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGt1aGh2Y3NsemRvcGZjY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTMxMzEsImV4cCI6MjA3ODA4OTEzMX0.sUKl3ujqAJJ0i4SRQrJjical1HVtHWOL0JJrfdOPRCk
```

**Option B: It works without .env!**
The app has built-in fallback credentials, so you can skip this step.

### 5. Start Development Server
```cmd
npm run dev
```

Open: http://localhost:5173

---

## 🎯 Windows-Specific Files

I've created Windows batch files for you:

### quick-setup.bat
```cmd
REM Run this to set up everything
quick-setup.bat
```

### check-secrets.bat
```cmd
REM Security check
check-secrets.bat
```

### pre-upload.bat
```cmd
REM Pre-GitHub verification
pre-upload.bat
```

---

## 📤 Upload to GitHub (Windows)

### Step 1: Initialize Git
```cmd
git init
```

### Step 2: Configure Git (First Time Only)
```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Check Files
```cmd
git status
```

Make sure `.env` is NOT listed (it should be in .gitignore)

### Step 4: Commit
```cmd
git add .
git commit -m "Initial commit: MYVIBES platform"
```

### Step 5: Create GitHub Repo
1. Go to https://github.com/new
2. Name: `myvibes`
3. Private or Public
4. Don't initialize with README
5. Click "Create repository"

### Step 6: Push to GitHub
```cmd
git remote add origin https://github.com/YOUR-USERNAME/myvibes.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy to Production

### Backend (Supabase):
```cmd
REM Install Supabase CLI
npm install -g supabase

REM Login
supabase login

REM Link project
supabase link --project-ref your-project-ref

REM Deploy function
supabase functions deploy make-server-175b2872

REM Set secrets
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-key"
REM ... (see QUICK-DEPLOY.md for all secrets)
```

### Frontend (Vercel):
```cmd
REM Install Vercel CLI
npm install -g vercel

REM Login
vercel login

REM Deploy
vercel --prod
```

See **QUICK-DEPLOY.md** for complete instructions.

---

## 🚨 Common Windows Issues & Fixes

### Issue: "npm is not recognized"
**Fix:** Install Node.js from https://nodejs.org
Then restart Command Prompt

### Issue: "git is not recognized"
**Fix:** Install Git from https://git-scm.com/download/win
Then restart Command Prompt

### Issue: Scripts won't run (.sh files)
**Fix:** Use the .bat versions instead:
- `quick-setup.bat` instead of `quick-setup.sh`
- `check-secrets.bat` instead of `check-secrets.sh`
- `pre-upload.bat` instead of `pre-upload.sh`

### Issue: PowerShell execution policy error
**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Port 5173 already in use
**Fix:**
```cmd
REM Find and kill process
netstat -ano | findstr :5173
taskkill /PID <process-id> /F

REM Or use different port
npm run dev -- --port 3000
```

### Issue: ENOENT error during npm install
**Fix:**
```cmd
REM Clear npm cache
npm cache clean --force

REM Delete node_modules if exists
rmdir /s /q node_modules

REM Reinstall
npm install
```

### Issue: Line ending warnings (CRLF/LF)
**Fix:**
```cmd
git config --global core.autocrlf true
```

---

## 💡 Windows Tips

### Use Git Bash (Alternative)
Git for Windows includes Git Bash which can run .sh scripts:
1. Install Git for Windows
2. Right-click in folder → "Git Bash Here"
3. Run bash scripts normally:
   ```bash
   bash quick-setup.sh
   ```

### Use VS Code Terminal
1. Open project in VS Code
2. Terminal → New Terminal
3. Choose Command Prompt or PowerShell
4. Run commands

### Use Windows Terminal (Modern)
1. Install from Microsoft Store: "Windows Terminal"
2. Better than Command Prompt
3. Supports tabs, themes, etc.

---

## 📁 Your Windows Project Structure

```
C:\User\MyVibes\
├── src\                    ← React app
├── supabase\              ← Backend
├── public\                ← Assets
├── node_modules\          ← Dependencies (after npm install)
│
├── package.json
├── .gitignore
├── .env (optional)
├── .env.example
│
├── Documentation (.md files)
└── Scripts:
    ├── quick-setup.bat    ← Windows version
    ├── check-secrets.bat  ← Windows version
    └── pre-upload.bat     ← Windows version
```

---

## ✅ Windows Setup Checklist

- [ ] Node.js installed (node --version works)
- [ ] Git installed (git --version works)
- [ ] Opened Command Prompt / PowerShell
- [ ] Navigated to project: `cd C:\User\MyVibes`
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] Opened http://localhost:5173
- [ ] App works! ✅

---

## 🎯 Your Next Steps (Windows)

### 1. Open Command Prompt
```
Windows Key + R → type "cmd" → Enter
```

### 2. Navigate to Project
```cmd
cd C:\User\MyVibes
```

### 3. Install Dependencies
```cmd
npm install
```

### 4. Start App
```cmd
npm run dev
```

### 5. Test
Open http://localhost:5173 in browser

---

## 📞 Windows-Specific Help

### Command Prompt Basics:
```cmd
cd folder           REM Change directory
cd ..              REM Go up one level
dir                REM List files
cls                REM Clear screen
```

### PowerShell Basics:
```powershell
cd folder          # Change directory
cd ..             # Go up one level
ls                # List files
Clear-Host        # Clear screen
```

---

## 🎉 You're Ready!

**Run this now:**
```cmd
cd C:\User\MyVibes
npm install
npm run dev
```

Then open http://localhost:5173 🚀

---

**Questions?** See:
- Full deployment: `QUICK-DEPLOY.md`
- Environment setup: `ENV-SETUP.md`
- All docs: `INDEX.md`
