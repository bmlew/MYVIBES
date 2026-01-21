# MYVIBES Vercel Deployment Guide

## ✅ Issues Fixed

### 1. PWA Service Worker Build Error - RESOLVED
**Problem:** The service worker was missing the `self.__WB_MANIFEST` placeholder required by Workbox.

**Solution:** Added the Workbox manifest placeholder to `/src/service-worker.ts`:
```typescript
const precacheManifest = self.__WB_MANIFEST;
```

### 2. Vercel Configuration - CREATED
**Problem:** No vercel.json configuration file existed.

**Solution:** Created `/vercel.json` with proper build settings:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: `vite`
- Proper rewrites for SPA routing
- Security headers and service worker headers

---

## 🚀 Deployment Steps

### Step 1: Test Local Build
Before deploying, ensure the build works locally:

```bash
npm run build
```

You should see output ending with:
```
PWA v1.2.0
✓ built in XXs
```

If you see any errors, stop and fix them before deploying.

### Step 2: Push to GitHub
Make sure all changes are committed and pushed:

```bash
git add .
git commit -m "Fix PWA service worker and add Vercel config"
git push origin main
```

### Step 3: Deploy to Vercel

#### Option A: Auto-Deploy (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `https://github.com/bmlew/MYVIBES`
4. Vercel will auto-detect the settings from `vercel.json`
5. Click "Deploy"

#### Option B: Manual Configuration
If auto-detection fails:
1. **Framework Preset:** Vite
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`

### Step 4: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_YOCO_PUBLIC_KEY=your_yoco_public_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Important:** All environment variables in Vite must start with `VITE_` prefix.

### Step 5: Verify Deployment
1. Wait for deployment to complete (usually 2-5 minutes)
2. Visit your deployment URL
3. Test the following:
   - [ ] Landing page loads
   - [ ] Customer app works
   - [ ] Business dashboard accessible
   - [ ] Admin dashboard accessible
   - [ ] PWA installation prompt appears
   - [ ] Service worker registers (check browser console)

---

## 🔧 Common Issues & Solutions

### Issue: "Permission denied" on vite binary (Exit code 126)
**Solution:** The build scripts have been updated to use `npx`:
```json
"build": "npx vite build"
```
This is already configured. If issue persists, clear Vercel build cache.

### Issue: "Module not found" errors
**Solution:** Make sure all imports use the `@` alias correctly:
```typescript
import { Component } from '@/app/components/Component'
```

### Issue: Environment variables not working
**Solution:** 
1. Ensure all vars start with `VITE_`
2. Redeploy after adding environment variables
3. Check Vercel Dashboard → Deployments → Latest → Environment Variables

### Issue: Service Worker not registering
**Solution:**
1. Check browser console for errors
2. Verify `/service-worker.js` exists at deployment URL
3. Check Network tab for 404 errors

### Issue: Supabase connection fails
**Solution:**
1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Verify API keys are correct and not expired

### Issue: 404 on page refresh
**Solution:** This should be handled by `vercel.json` rewrites. If it persists:
1. Check `vercel.json` is committed to repo
2. Redeploy the project
3. Verify in Vercel Dashboard → Settings → Rewrites

---

## 📊 Performance Optimization

Your build is already optimized with:
- ✅ Code splitting for vendor libraries
- ✅ Terser minification
- ✅ Tree shaking
- ✅ CSS code splitting
- ✅ Console.log removal in production
- ✅ PWA caching strategies

### Expected Build Sizes:
- react-vendor: ~30-40 KB
- ui-vendor: ~150-160 KB  
- chart-vendor: ~400-450 KB
- icon-vendor: ~30 KB
- Main app chunks: ~100-200 KB each

---

## 🌍 Custom Domain Setup (Optional)

### Add Custom Domain:
1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `myvibes.co.za`)
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic, 1-5 minutes)

### Update Supabase Allowed Origins:
1. Supabase Dashboard → Settings → API
2. Add your Vercel URL to allowed origins:
   - `https://your-project.vercel.app`
   - `https://www.your-domain.com` (if using custom domain)

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- **main branch** → Production deployment
- **other branches** → Preview deployments

### To Disable Auto-Deploy:
Vercel Dashboard → Settings → Git → Disable "Auto-deploy"

---

## 📱 PWA Testing After Deployment

### Desktop (Chrome):
1. Visit deployed URL
2. Click install icon in address bar
3. Verify app installs and works offline

### Mobile (Android):
1. Visit deployed URL in Chrome
2. Tap "Add to Home Screen" prompt
3. Test offline functionality

### Mobile (iOS):
1. Visit deployed URL in Safari
2. Tap Share → Add to Home Screen
3. Note: iOS has limited PWA support

---

## 🐛 Debugging Deployment Issues

### View Build Logs:
Vercel Dashboard → Deployments → Select Deployment → View Build Logs

### View Runtime Logs:
Vercel Dashboard → Deployments → Select Deployment → View Function Logs

### Common Build Failures:

#### Timeout Error:
**Solution:** Increase build timeout in Vercel Dashboard → Settings → Functions

#### Out of Memory:
**Solution:** 
1. Remove unused dependencies
2. Optimize images before upload
3. Consider upgrading Vercel plan

#### TypeScript Errors:
**Solution:**
1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Commit and redeploy

---

## ✅ Post-Deployment Checklist

- [ ] Site is live and accessible
- [ ] All pages load correctly
- [ ] Supabase connection working
- [ ] Environment variables configured
- [ ] PWA installs successfully
- [ ] Service worker registered
- [ ] Offline mode works
- [ ] Payment integration works (Yoco)
- [ ] Email notifications working (SMTP2GO)
- [ ] WhatsApp notifications working
- [ ] Google Maps showing locations
- [ ] Image uploads working
- [ ] Mobile responsive design correct
- [ ] SSL certificate active (https://)
- [ ] Custom domain configured (if applicable)

---

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vite Documentation:** https://vitejs.dev
- **Supabase Documentation:** https://supabase.com/docs
- **PWA Documentation:** https://web.dev/progressive-web-apps/

---

## 🎉 Deployment Complete!

Your MYVIBES platform is now live! Share your deployment URL with:
- Beta testers
- Potential investors
- Early adopter restaurants
- Marketing partners

Remember to monitor:
- Vercel Analytics (built-in)
- Supabase Dashboard (database activity)
- User feedback
- Error logs

**Next Steps:**
1. Test all features thoroughly
2. Gather user feedback
3. Monitor performance metrics
4. Plan marketing launch
5. Onboard first restaurants

---

**Last Updated:** January 2025
**Platform Version:** MYVIBES v1.0
**Build Status:** ✅ Production Ready