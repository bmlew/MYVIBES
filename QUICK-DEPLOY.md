# 🚀 MYVIBES Quick Deploy Reference

## 🎯 What is PWA?

**Progressive Web App** = Web app that works like a native mobile app

### Benefits:
- 📲 **Install on home screen** (no app store needed)
- ⚡ **Works offline** (cached content available)
- 🔔 **Push notifications** (updates about specials)
- 💰 **No app store fees** (save 30% commission)
- 🚀 **Instant updates** (no approval wait time)

### MYVIBES PWA Features:
✅ Installable on iOS, Android, Desktop
✅ Offline mode for menus & favorites
✅ Full-screen native app experience
✅ Add to home screen prompt
✅ Fast loading with service worker

---

## ⚡ Quick Deploy Commands

### One-Time Setup:
```bash
# Install tools
npm install -g supabase vercel

# Login to services
supabase login
vercel login
```

### Deploy Backend:
```bash
# Link to Supabase project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy make-server-175b2872

# Set secrets (run each line)
supabase secrets set SUPABASE_URL="https://xxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="eyJhbGci..."
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
supabase secrets set SUPABASE_DB_URL="postgresql://..."
supabase secrets set SMTP2GO_API_KEY="your-key"
supabase secrets set YOCO_SECRET_KEY="your-key"
supabase secrets set GOOGLE_MAPS_API_KEY="your-key"
```

### Deploy Frontend:
```bash
# Preview deploy
vercel

# Production deploy
vercel --prod

# Add environment variables
vercel env add VITE_SUPABASE_PROJECT_ID production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### Future Updates:
```bash
# Deploy everything
supabase functions deploy make-server-175b2872
vercel --prod
```

---

## 📋 5-Minute Deploy Checklist

### Before You Start:
- [ ] Supabase account created (https://supabase.com)
- [ ] Vercel account created (https://vercel.com)
- [ ] Have your API keys ready (SMTP2GO, Yoco, Google Maps)

### Step 1: Supabase (5 min)
1. Create new project in Supabase
2. Copy URL, anon key, service role key
3. Run: `supabase link --project-ref XXX`
4. Run: `supabase functions deploy make-server-175b2872`
5. Set all secrets with `supabase secrets set`

### Step 2: Vercel (3 min)
1. Run: `vercel`
2. Answer prompts (project name: myvibes)
3. Go to Vercel dashboard → Settings → Environment Variables
4. Add VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY
5. Run: `vercel --prod`

### Step 3: Test (2 min)
1. Visit your Vercel URL
2. Test: Can see venues? ✅
3. Test: Can create account? ✅
4. Test: Can make reservation? ✅

### Done! 🎉
Your app is live at: https://myvibes.vercel.app

---

## 🔑 Where to Get Your Credentials

### Supabase Credentials:
1. Go to https://supabase.com/dashboard
2. Select your project
3. **Settings → API**:
   - Project URL: `https://xxxxx.supabase.co`
   - anon/public key: `eyJhbGci...` (public, safe for frontend)
   - service_role key: `eyJhbGci...` (secret, backend only!)
4. **Settings → Database**:
   - Connection string (URI): `postgresql://...`

### API Keys You Already Have:
- ✅ SMTP2GO_API_KEY (for emails)
- ✅ YOCO_SECRET_KEY (for payments)
- ✅ GOOGLE_MAPS_API_KEY (for location)

---

## 🎨 Update Production URLs

### Option 1: Environment Variables (Recommended)

Update `/src/utils/supabase/info.tsx`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

Then set in Vercel dashboard.

### Option 2: Hardcode (Simpler)

Update `/src/utils/supabase/info.tsx`:

```typescript
export const projectId = 'abcdefghijklmnop'; // Your project ref
export const publicAnonKey = 'eyJhbGci...'; // Your anon key
```

---

## 🌐 Add Custom Domain

### 1. In Vercel:
```bash
vercel domains add myvibes.co.za
```

### 2. In DNS Provider (GoDaddy, Namecheap, etc.):
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3. Wait & Verify:
- DNS propagation: 5 mins - 24 hours
- Check status in Vercel dashboard

---

## 📱 Test PWA Installation

### Mobile (iOS/Android):
1. Visit site in Safari/Chrome
2. Look for "Add to Home Screen" banner
3. Tap "Add"
4. Find MYVIBES icon on home screen
5. Launch - opens full-screen! 🎉

### Desktop (Chrome/Edge):
1. Look for ⊕ install icon in address bar
2. Click to install
3. Opens in app window

---

## 🔍 View Logs

```bash
# Supabase function logs
supabase functions logs make-server-175b2872

# Vercel logs
vercel logs

# Or view in dashboards:
# Supabase: Edge Functions → Logs
# Vercel: Deployments → Select → Logs
```

---

## 🆘 Common Issues & Fixes

### "Failed to fetch" errors
**Fix:** Update CORS in `/supabase/functions/server/index.tsx`:
```typescript
app.use('*', cors({
  origin: ['https://myvibes.vercel.app', 'https://myvibes.co.za']
}));
```
Then redeploy: `supabase functions deploy make-server-175b2872`

### Environment variables not working
**Fix:** 
1. Must start with `VITE_` for frontend
2. Redeploy after adding variables
3. Clear browser cache

### PWA not installing
**Fix:**
1. Must be HTTPS (Vercel has this)
2. Try incognito mode
3. Check manifest.json loads

### Emails not sending
**Fix:**
1. Check SMTP2GO_API_KEY is set
2. Verify domain in SMTP2GO dashboard
3. Check function logs for errors

---

## 📊 Cost Breakdown

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month (plenty for startup)
- **Supabase**: 500MB database, 2GB file storage
- **Total Monthly Cost**: R0 until you scale! 🎉

### When You Scale:
- Vercel Pro: $20/month (more bandwidth)
- Supabase Pro: $25/month (more database)
- Still way cheaper than native apps!

---

## 🎯 Next Steps After Deploy

1. ✅ Share URL with test users
2. ✅ Set up Google Analytics (optional)
3. ✅ Configure email templates in SMTP2GO
4. ✅ Test payment flow with Yoco
5. ✅ Add businesses to platform
6. ✅ Monitor performance in dashboards
7. ✅ Market to restaurants! 🚀

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs  
- **Deployment Guide**: See `/deploy.md`
- **Architecture**: See `/deployment-architecture.md`

---

## 🎉 You're Ready to Deploy!

Run this now:
```bash
# Check prerequisites
bash deploy-checklist.sh

# Then follow deploy.md instructions
```

**Good luck! 🚀 Your app will be live in ~10 minutes!**
