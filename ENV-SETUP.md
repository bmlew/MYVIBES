# 🔧 Environment Variables Setup

## ✅ GOOD NEWS: App Works Without .env File!

The app now has **built-in development credentials** that work out of the box.

## 🎯 Current Status

### Development (Figma Make / Local):
- ✅ **Works immediately** - Built-in fallback credentials
- ✅ **No .env file required** for testing
- ✅ **Ready to use** right now!

### Production (Vercel Deployment):
- ⚠️ **Requires environment variables** in Vercel dashboard
- ⚠️ **Must override** development credentials
- ✅ **Instructions below**

---

## 🚀 Quick Start (No Setup Needed!)

**The app should work right now!** Just refresh your browser.

The warnings in console are **informational only** - the app still works.

---

## 📝 For Production Deployment

When deploying to Vercel, you **MUST** set these environment variables:

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**

### Step 2: Add These Variables

**Variable 1:**
```
Name: VITE_SUPABASE_PROJECT_ID
Value: skpkuhhvcslzdopfccxo
Environment: Production, Preview, Development
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGt1aGh2Y3NsemRvcGZjY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTMxMzEsImV4cCI6MjA3ODA4OTEzMX0.sUKl3ujqAJJ0i4SRQrJjical1HVtHWOL0JJrfdOPRCk
Environment: Production, Preview, Development
```

### Step 3: Redeploy
```bash
vercel --prod
```

---

## 💻 For Local Development (Optional)

If you want to use a `.env` file locally:

### Step 1: Create .env File
```bash
# In your project root, create .env file
touch .env
```

### Step 2: Add Your Credentials
```env
VITE_SUPABASE_PROJECT_ID=skpkuhhvcslzdopfccxo
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGt1aGh2Y3NsemRvcGZjY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTMxMzEsImV4cCI6MjA3ODA4OTEzMX0.sUKl3ujqAJJ0i4SRQrJjical1HVtHWOL0JJrfdOPRCk
```

### Step 3: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔍 How It Works

### Development Mode (Current):
```typescript
// Uses built-in fallback
export const projectId = 'skpkuhhvcslzdopfccxo';
export const publicAnonKey = 'eyJhbGci...';
```

### Production Mode (With Environment Variables):
```typescript
// Uses Vercel environment variables
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## ✅ Verify It's Working

### Check Console:
You should see ONE of these messages:

**Option 1 (Development - Using Fallback):**
```
ℹ️ Using development Supabase credentials (fallback)
💡 For production: Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in Vercel dashboard
```
✅ This is **FINE** for development!

**Option 2 (Production - Using Environment Variables):**
```
✅ Using Supabase credentials from environment variables
```
✅ This is what you want in production!

### Check Functionality:
- ✅ Can see venues
- ✅ Can create account
- ✅ Can make reservations
- ✅ Business dashboard works
- ✅ No "Failed to fetch" errors

---

## 🚨 Troubleshooting

### Still seeing errors?

**Error: "Failed to fetch"**

**Solution 1: Refresh the page**
```bash
# In browser: Ctrl+R or Cmd+R
```

**Solution 2: Hard refresh**
```bash
# In browser: Ctrl+Shift+R or Cmd+Shift+R
```

**Solution 3: Clear cache and reload**
```bash
# In DevTools (F12):
# Right-click refresh button → "Empty Cache and Hard Reload"
```

**Solution 4: Check Supabase is running**
- Go to https://supabase.com/dashboard
- Verify your project is active
- Check project ID matches

---

## 🔐 Security Notes

### Is it safe to have credentials in code?

**For the anon/public key: YES** ✅
- This key is **meant to be public**
- It's exposed in your frontend anyway
- It has Row Level Security (RLS) protection
- Safe to commit to GitHub

**For the service role key: NO** ❌
- **NEVER** put this in frontend code
- Only in Supabase secrets (backend)
- Already configured correctly

### For GitHub Upload:
- The credentials in the code are the **public anon key**
- Safe to commit
- But using environment variables is **best practice**
- Makes it easy to change without code changes

---

## 📋 Summary

### Current Setup (Development):
- ✅ App works with built-in credentials
- ✅ No .env file needed
- ✅ Ready to use immediately
- ℹ️ Console shows "using fallback" message (this is OK)

### For Production (Vercel):
- ⚠️ MUST set environment variables in Vercel
- ⚠️ Override development credentials
- ✅ Follow deployment guide (QUICK-DEPLOY.md)

### For Local Development:
- 📝 Optional: Create .env file
- 📝 Optional: Add credentials
- 📝 Optional: Restart dev server
- ✅ Works either way!

---

## 🎉 You're All Set!

**The app should work right now without any changes!**

Just refresh your browser and start using it.

---

**Questions?** See `START-HERE.md` or `QUICK-DEPLOY.md`
