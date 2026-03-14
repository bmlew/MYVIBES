# 🚀 MYVIBES PWA Update Guide

## Complete Guide to Pushing Updates Seamlessly

This guide explains how to push updates to your MYVIBES PWA in a controlled, professional manner without disrupting users.

---

## 📋 Quick Update Checklist

When you're ready to push a new version:

- [ ] **Step 1:** Update version numbers in all files
- [ ] **Step 2:** Test locally
- [ ] **Step 3:** Commit and push to production
- [ ] **Step 4:** Verify deployment
- [ ] **Step 5:** Monitor user updates

---

## 📝 Step 1: Update Version Numbers

### Files to Update

Update the version number in these **4 files**:

#### 1. `/index.html`
```html
<!-- App Version -->
<meta name="app-version" content="2.1.4" />
<meta name="build-timestamp" content="2025-03-14T12:00:00Z" />
<meta name="build-id" content="v2.1.4-build-214" />

<!-- Service Worker Registration -->
<script>
  navigator.serviceWorker.register('/service-worker.js?v=2.1.4')
</script>
```

#### 2. `/public/manifest.json`
```json
{
  "name": "MYVIBES - Hospitality Platform",
  "short_name": "MYVIBES",
  "version": "2.1.4",
  "description": "Connect with restaurants and hotels...",
}
```

#### 3. `/public/service-worker.js`
```javascript
// MYVIBES Service Worker - v2.1.4
const CACHE_VERSION = 'myvibes-v2.1.4';
const CACHE_NAME = CACHE_VERSION;
```

#### 4. `/src/app/CustomerApp.tsx` (version badge)
```tsx
<span className="text-[8px] opacity-50 font-mono">v2.1.4</span>
```

### Version Numbering Convention

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (2.x.x): Breaking changes, major redesigns
- **MINOR** (x.1.x): New features, significant updates
- **PATCH** (x.x.4): Bug fixes, minor improvements

**Examples:**
- Bug fix: `2.1.3` → `2.1.4`
- New feature: `2.1.4` → `2.2.0`
- Major redesign: `2.2.0` → `3.0.0`

---

## 🧪 Step 2: Test Locally

Before pushing to production:

```bash
# 1. Build the app
npm run build

# 2. Preview the production build
npm run preview

# 3. Test in browser
# - Open http://localhost:4173
# - Check console for version number
# - Verify new features work
# - Test on mobile device (optional)
```

**What to verify:**
- ✅ Console shows: `✅ [PWA] Service Worker registered v2.1.4`
- ✅ Version badge shows correct version
- ✅ New features/fixes work as expected
- ✅ No console errors

---

## 🚀 Step 3: Deploy to Production

### Option A: Manual Deployment

```bash
# 1. Commit changes
git add .
git commit -m "Release v2.1.4: [brief description]"

# 2. Tag the release
git tag v2.1.4

# 3. Push to production
git push origin main
git push origin v2.1.4

# 4. Your hosting platform will auto-deploy
# (Vercel, Netlify, etc.)
```

### Option B: Using CI/CD

Your hosting platform (Vercel, Netlify, etc.) will automatically:
1. Detect the push
2. Build the new version
3. Deploy to production
4. Users get the update on their next visit

---

## ✅ Step 4: Verify Deployment

After deployment completes:

### Check 1: Service Worker Version
```
1. Open your production URL in incognito/private window
2. Open DevTools → Console
3. Look for: "✅ [PWA] Service Worker registered v2.1.4"
4. Verify version matches what you deployed
```

### Check 2: Manifest Version
```
1. Open DevTools → Application tab
2. Click "Manifest" in sidebar
3. Verify version shows "2.1.4"
```

### Check 3: Cache Name
```
1. Open DevTools → Application tab
2. Click "Cache Storage" in sidebar
3. Verify you see "myvibes-v2.1.4"
```

---

## 📱 Step 5: Monitor User Updates

### How Users Get the Update

**For users with the PWA installed:**
1. Next time they open the app, the browser checks for updates
2. Browser downloads new service worker in background
3. New version activates when they close and reopen app
4. Old cache automatically cleaned up

**Timeline:**
- **Immediate**: Users opening app for first time
- **Within 24 hours**: Most active users (who reopen app)
- **Within 7 days**: Occasional users
- **Manual refresh**: Users can force update anytime

### Force Update (Optional)

Users can manually force an update using the Debug Panel:

```
1. Open app
2. Go to Profile tab
3. Scroll to bottom → "Debug Panel"
4. Click "Clear Cache & Reload"
5. App reloads with new version
```

---

## 🔧 Advanced: Update Notifications

### Option 1: Silent Updates (Current Setup)
✅ **Recommended for most updates**
- No interruption to users
- Updates happen in background
- Activates on next app open
- Professional, non-intrusive

### Option 2: Update Badge (Optional)
Add a small badge in the UI:
- Shows "Update Available" in profile settings
- User clicks to reload when convenient
- Non-blocking, gentle reminder

### Option 3: Update Banner (For Critical Updates)
For security patches or critical fixes:
- Show dismissible banner: "New version available"
- User can click "Update Now" or "Later"
- Only use for important updates

---

## 🛠️ Troubleshooting

### Problem: Users Still Seeing Old Version

**Solution 1: Clear Browser Cache**
```
1. DevTools → Application → Storage
2. Click "Clear site data"
3. Reload page
```

**Solution 2: Hard Refresh**
```
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R
```

**Solution 3: Unregister Service Worker**
```
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Reload page
```

### Problem: Service Worker Not Updating

**Check:**
1. Did you change the cache version in service-worker.js?
2. Did you update the ?v= query parameter in index.html?
3. Is the file cached by your CDN? (Clear CDN cache)

**Force Clear:**
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
location.reload();
```

---

## 📊 Version History Tracking

### Keep a CHANGELOG.md

```markdown
# Changelog

## [2.1.4] - 2025-03-14

### Added
- New feature X
- New component Y

### Fixed
- Bug in check-in flow
- Menu loading issue

### Changed
- Updated theme colors
- Improved performance

## [2.1.3] - 2025-03-13

### Fixed
- Infinite reload loop issue
- Service worker auto-update
```

---

## 🎯 Best Practices

### DO ✅
- Test updates locally before deploying
- Use semantic versioning
- Update all 4 files consistently
- Keep a changelog
- Deploy during low-traffic hours
- Monitor error logs after deployment

### DON'T ❌
- Skip version number updates
- Deploy without testing
- Use same version for different releases
- Enable auto-reload (causes loops)
- Deploy during peak hours without testing

---

## 🚨 Emergency Rollback

If you need to rollback to a previous version:

```bash
# 1. Find the previous version tag
git tag -l

# 2. Checkout that version
git checkout v2.1.3

# 3. Create a new branch
git checkout -b rollback-to-2.1.3

# 4. Update version to 2.1.3.1 (or next patch)
# (Update the 4 files)

# 5. Commit and push
git add .
git commit -m "Rollback to v2.1.3"
git push origin rollback-to-2.1.3

# 6. Deploy from this branch
```

---

## 📞 Support

If users report issues after an update:

1. **Check the version**: Ask them to go to Profile → Debug Panel
2. **Clear cache**: Guide them through clearing cache
3. **Force reload**: Use Debug Panel → "Clear Cache & Reload"
4. **Reinstall**: Uninstall and reinstall PWA from browser

---

## 🎉 Summary

**Your current setup is perfect for seamless updates:**

1. **No interruptions**: Users aren't forced to reload
2. **Automatic**: Updates happen in background
3. **Controlled**: You push updates when ready
4. **Professional**: No annoying popups or dialogs

**When you deploy a new version:**
- Active users get it within 24 hours
- Inactive users get it when they return
- Everyone gets it smoothly, no disruptions

**Your users will love this update experience!** 🚀
