# ✅ MYVIBES PWA Testing Checklist

## 🎉 Icons Done! Now Let's Test

---

## STEP 1: Verify Icons Are In Place

### **Check the files exist:**

Open your file explorer and navigate to:
```
/public/icons/
```

**You should see these 8 files:**
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

**If they're there:** ✅ Continue to Step 2  
**If they're missing:** ❌ Go back and place PNG files in `/public/icons/`

---

## STEP 2: Restart Your Dev Server

The dev server needs to pick up the new icon files.

### **Stop and restart:**

**Mac/Linux:**
```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

**Or just refresh** if using a platform that auto-reloads.

---

## STEP 3: Clear Browser Cache

Important! Old cached data can prevent icons from loading.

### **Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select **"Cached images and files"**
3. Select **"All time"**
4. Click **"Clear data"**

### **Or do a hard refresh:**
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

---

## STEP 4: Check Manifest in DevTools

### **Open Developer Tools:**
1. Press `F12` or right-click → Inspect
2. Click the **"Application"** tab (Chrome/Edge) or **"Storage"** (Firefox)
3. In the sidebar, click **"Manifest"**

### **What to check:**
- ✅ **App Name:** "MYVIBES - Hospitality Platform"
- ✅ **Short Name:** "MYVIBES"
- ✅ **Start URL:** "/"
- ✅ **Theme Color:** #06b6d4 (cyan)
- ✅ **Background Color:** #0f172a (dark slate)
- ✅ **Icons:** All 8 icons should show thumbnails (not broken images)

**If you see broken image icons:** ❌ Check file names match exactly  
**If all icons show:** ✅ Continue to Step 5

---

## STEP 5: Run Lighthouse PWA Audit

This will tell you if your PWA is installable.

### **Run the audit:**
1. Open DevTools (F12)
2. Click **"Lighthouse"** tab
3. Select **"Progressive Web App"** checkbox
4. Select **"Desktop"** or **"Mobile"**
5. Click **"Generate report"**

### **Target Score:**
- 🎯 **Installable:** Should show ✅
- 🎯 **PWA Optimized:** Should show ✅
- 🎯 **Score:** Aim for 90-100

### **Common issues:**
- ❌ "Icons missing" → Check PNG files are in `/public/icons/`
- ❌ "Not served over HTTPS" → Normal for localhost
- ❌ "Service worker not found" → Check `/public/service-worker.js` exists

---

## STEP 6: Test Install Prompt

The auto-install prompt should appear after visiting a few times.

### **Trigger the install prompt:**

**Method 1 - Wait for auto-prompt:**
1. Close all MYVIBES tabs
2. Open MYVIBES again
3. Browse around for 30 seconds
4. Visit 2-3 different pages
5. **Install banner should appear** at the bottom

**Method 2 - Manual install:**
1. Look for **install icon (⊕)** in the address bar
2. Click it
3. Click **"Install"**

**If no install option appears:**
- Run Lighthouse audit to check for issues
- Make sure all 8 icons are present
- Clear cache and try again
- Check you're not in incognito mode

---

## STEP 7: Install the PWA

### **On Desktop (Chrome/Edge):**

**Option A - Address Bar:**
1. Click the **install icon (⊕)** in the address bar (right side)
2. Click **"Install"** in the popup
3. App opens in its own window

**Option B - Browser Menu:**
1. Click **three-dot menu (⋮)**
2. Hover over **"Apps"** or **"More tools"**
3. Click **"Install MYVIBES"**

### **On Android (Chrome/Edge):**

**Option A - Banner:**
1. Wait for install banner to appear at bottom
2. Tap **"Install App"**
3. Confirm installation

**Option B - Menu:**
1. Tap **three-dot menu (⋮)**
2. Tap **"Install app"** or **"Add to Home screen"**
3. Confirm installation

### **On iPhone/iPad (Safari):**
1. Tap **Share button** (square with arrow)
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"**

---

## STEP 8: Verify Installation

### **Desktop:**
- ✅ App opens in **separate window** (no browser UI)
- ✅ No address bar or tabs visible
- ✅ MYVIBES appears in your **Applications folder** (Mac) or **Start Menu** (Windows)
- ✅ Can find it by searching "MYVIBES" in your OS

### **Mobile:**
- ✅ Icon appears on **home screen**
- ✅ Icon shows MYVIBES logo (sound wave bars)
- ✅ Tapping opens app in **full screen**
- ✅ No browser UI visible
- ✅ Looks like a native app

---

## STEP 9: Test PWA Features

### **Test Offline Mode:**
1. Open the installed MYVIBES app
2. Browse around while online
3. Open DevTools → Network tab
4. Select **"Offline"** in the throttling dropdown
5. Try navigating the app
6. **Offline banner should appear** at top
7. Previously visited pages should still work

### **Test Standalone Mode:**
1. Open the installed app
2. Check there's **no browser UI** (address bar, tabs)
3. App should fill the entire screen
4. Window title should say "MYVIBES"

### **Test App Shortcuts (Android only):**
1. Long-press the MYVIBES icon
2. Shortcuts menu should appear:
   - Find Restaurants
   - Events Near Me
   - Business Dashboard
3. Tap a shortcut to test

---

## STEP 10: Test on Multiple Devices

### **Recommended testing:**
- ✅ Desktop Chrome (Windows/Mac/Linux)
- ✅ Desktop Edge (Windows/Mac)
- ✅ Android Chrome
- ✅ iPhone Safari
- ✅ iPad Safari

### **For each device:**
1. Install the PWA
2. Check icon appears correctly
3. Test offline mode
4. Verify standalone mode
5. Test core functionality (check-in, leaderboard, etc.)

---

## 🎯 Success Criteria

Your PWA is ready when:

- ✅ All 8 icon files exist in `/public/icons/`
- ✅ Manifest loads without errors in DevTools
- ✅ Lighthouse PWA audit shows "Installable"
- ✅ Install prompt appears or manual install works
- ✅ App installs successfully on desktop
- ✅ App installs successfully on mobile
- ✅ Home screen icon shows MYVIBES logo
- ✅ App opens in standalone mode (no browser UI)
- ✅ Offline mode works
- ✅ Service worker is registered and active

---

## 🐛 Troubleshooting

### **Icons not loading in manifest?**
```bash
# Check files exist
ls -la public/icons/icon-*.png

# Verify file names match exactly:
# icon-72x72.png (NOT Icon-72x72.png or icon_72x72.png)
```

### **Install button not appearing?**
- Clear browser cache (Ctrl+Shift+Delete)
- Make sure you're not in incognito/private mode
- Check Lighthouse audit for specific issues
- Try different browser (Chrome works best)

### **Service worker errors?**
1. DevTools (F12) → Application → Service Workers
2. Click **"Unregister"** if one is listed
3. Hard refresh (Ctrl+Shift+R)
4. Check Console for error messages

### **App not opening in standalone mode?**
- Make sure you installed it (not just bookmarked)
- Uninstall and reinstall
- Check manifest.json has `"display": "standalone"`

---

## 📊 DevTools Checklist

### **Application Tab:**
- ✅ Manifest: Shows all 8 icons
- ✅ Service Workers: Status = "activated and running"
- ✅ Cache Storage: Shows cached resources
- ✅ Storage: Shows app data

### **Console Tab:**
- ✅ No errors related to manifest
- ✅ No errors related to service worker
- ✅ Should see: "✅ Service Worker registered"

### **Network Tab:**
- ✅ `/manifest.json` loads (status 200)
- ✅ All icon files load (status 200)
- ✅ `/service-worker.js` loads (status 200)

---

## 🚀 Next Steps After Testing

### **If everything works:**
1. ✅ Your PWA is ready for production!
2. Deploy to your live URL
3. Test on the live site
4. Share with users
5. Monitor installation rates

### **Enable additional features:**

**Push Notifications:**
```typescript
import { requestNotificationPermission } from '@/utils/pwa';

const permission = await requestNotificationPermission();
if (permission === 'granted') {
  // Enable push notifications
}
```

**Background Sync:**
- Implement in service worker
- Sync check-ins when user comes back online

**App Shortcuts:**
- Already configured in manifest.json
- Test on Android by long-pressing icon

---

## 📱 Share Installation Instructions

Once tested, share this with your users:

**Desktop:**
> "Click the install icon (⊕) in the address bar, or go to browser menu → Install MYVIBES"

**Android:**
> "Tap the install banner at the bottom, or tap menu → Install app"

**iPhone:**
> "Tap Share → Add to Home Screen"

---

## ✨ You're Done!

Your MYVIBES PWA is now:
- ✅ Installable on all devices
- ✅ Works offline
- ✅ Looks like a native app
- ✅ Auto-updates
- ✅ Fully branded

**Enjoy your Progressive Web App! 🎉**

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Run Lighthouse audit for specific errors
3. Check browser console for error messages
4. Verify all files are in correct locations
5. Review `/PWA_INSTALLATION_GUIDE.md` for user instructions

