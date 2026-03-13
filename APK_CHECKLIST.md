# APK Generation Checklist ✅

## 📋 Pre-Deployment

- [ ] All `figma:asset` imports removed
- [ ] Customer PWA files created:
  - [ ] `/app.html`
  - [ ] `/src/main-customer.tsx`
  - [ ] `/src/app/CustomerAppPWA.tsx`
  - [ ] `/public/manifest-customer.json`
- [ ] Vite config updated for multi-entry
- [ ] All 8 icon files in `/public/icons/`
- [ ] No console errors in browser

---

## 🚀 Deployment

- [ ] Changes committed to Git
- [ ] Pushed to GitHub/repository
- [ ] Vercel deployment started
- [ ] Build successful (no errors)
- [ ] Deployment complete

---

## 🌐 Verification

- [ ] Full website accessible at `/`
- [ ] Customer app accessible at `/app`
- [ ] Manifest accessible: `/manifest-customer.json`
- [ ] All icons load (no 404s)
- [ ] Service worker registered
- [ ] Customer app works (can browse restaurants)
- [ ] No landing page shows when visiting `/app`

---

## 📱 PWABuilder Setup

- [ ] Visited https://www.pwabuilder.com/
- [ ] Entered customer URL: `/app` (not `/`)
- [ ] PWA score analyzed
- [ ] All scores green ✅
- [ ] Clicked "Package for Stores"
- [ ] Selected Android
- [ ] Filled configuration:
  - [ ] Package ID: `com.myvibes.app`
  - [ ] App name: `MYVIBES`
  - [ ] Start URL: `/app`
  - [ ] Version: `1.0.0`
- [ ] Generated package
- [ ] Download started

---

## 📦 APK Download

- [ ] ZIP file downloaded
- [ ] Extracted ZIP contents
- [ ] Found `app-release-signed.apk`
- [ ] Found `app-release-bundle.aab`
- [ ] Found `assetlinks.json`
- [ ] Found signing key files
- [ ] Backed up signing keys to safe location

---

## 🔐 Digital Asset Links

- [ ] Created `/public/.well-known/` folder
- [ ] Copied `assetlinks.json` to folder
- [ ] Committed and pushed to Git
- [ ] Vercel deployed changes
- [ ] Verified accessible at: `/.well-known/assetlinks.json`
- [ ] JSON displays correctly (not 404)

---

## 📲 APK Testing

- [ ] Copied APK to Android device
- [ ] Opened APK file
- [ ] Enabled "Install unknown apps" (if needed)
- [ ] Installed successfully
- [ ] App icon appears in launcher
- [ ] Launched app
- [ ] **Verification:**
  - [ ] Opens directly to customer app (no landing page)
  - [ ] Full screen (no browser address bar)
  - [ ] Status bar color correct (#06b6d4)
  - [ ] Can see restaurant list
  - [ ] Can view restaurant details
  - [ ] Check-in button works
  - [ ] Loyalty points display
  - [ ] Leaderboard accessible
  - [ ] Profile page works
  - [ ] No business/admin features visible
  - [ ] Offline mode works
  - [ ] Icons load correctly

---

## 🎯 (Optional) Google Play Store

### Setup
- [ ] Created Google Play Developer account ($25)
- [ ] Account verified
- [ ] Created new app entry

### Store Listing
- [ ] App name: MYVIBES
- [ ] Short description written (80 chars)
- [ ] Full description written (4000 chars)
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic created (1024x500)
- [ ] Screenshots captured (min 2, max 8)
- [ ] Category selected: Food & Drink

### Requirements
- [ ] Privacy policy created
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Pricing set (Free)

### Upload
- [ ] Production release created
- [ ] AAB file uploaded
- [ ] Release notes written
- [ ] Rollout percentage set (or 100%)

### Review
- [ ] All checklists completed
- [ ] Submitted for review
- [ ] Approval received (1-7 days)
- [ ] App published 🎉

---

## 📝 Post-Launch

- [ ] Shared APK with team
- [ ] Shared with beta testers
- [ ] Collected initial feedback
- [ ] Fixed any critical bugs
- [ ] Monitored crash reports (if any)
- [ ] Checked analytics
- [ ] Promoted to users

---

## 🔄 For Future Updates

### Content Updates (No APK needed)
- [ ] Updated website content
- [ ] Pushed to Vercel
- [ ] Users get auto-update

### APK Updates (Version bump needed)
- [ ] Updated version in manifest-customer.json
- [ ] Regenerated APK on PWABuilder
- [ ] Uploaded new AAB to Play Store
- [ ] Submitted new version for review

---

## ✅ Success Criteria

Your APK is successful when:

- ✅ Installs without errors
- ✅ Opens directly to customer app
- ✅ No landing page visible
- ✅ Full screen (no browser UI)
- ✅ All features work
- ✅ Offline mode functional
- ✅ Icons display correctly
- ✅ Check-ins work
- ✅ Points are earned
- ✅ Leaderboard updates

---

## 🎉 Completion

**Date APK Generated:** _________________

**APK Version:** 1.0.0

**Package Name:** com.myvibes.app

**Deployed URL:** _________________

**Play Store Status:** ☐ Not Submitted  ☐ Under Review  ☐ Published

**Notes:**
_________________________________________
_________________________________________
_________________________________________

---

**🚀 You're ready to launch! Good luck!**
