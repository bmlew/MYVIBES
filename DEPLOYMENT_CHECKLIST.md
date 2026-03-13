# 🚀 MYVIBES v2.1.0 - DEPLOYMENT & APK GENERATION CHECKLIST

## ✅ PRE-DEPLOYMENT VERIFICATION

Before deploying, these files have been updated:
- [x] `/public/manifest.json` - Added version 2.1.0, version_code 210, timestamp
- [x] `/public/manifest-customer.json` - Added version 2.1.0, version_code 210, timestamp
- [x] `/public/service-worker.js` - New v2.1.0 with aggressive cache-busting
- [x] `/index.html` - No-cache meta tags, version headers, auto-update script
- [x] `/vercel.json` - No-cache headers for ALL critical files
- [x] `/src/app/CustomerApp.tsx` - Console logs show v2.1.0
- [x] `/public/VERSION.txt` - Version verification file

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Deploy to Vercel** 🚀

```bash
git add .
git commit -m "v2.1.0: Extreme cache-busting for APK generation"
git push
```

**⏳ WAIT:** Go to Vercel dashboard and wait for deployment to complete (green checkmark)

---

### **STEP 2: Verify Deployment is Live** ✅

Open these URLs in your browser (replace `your-domain.vercel.app` with your actual URL):

#### A. Check VERSION.txt
```
https://your-domain.vercel.app/VERSION.txt
```
**EXPECTED:** Should show "MYVIBES v2.1.0" and "Build: 210"

❌ **If you see old content or 404:** Deployment failed. Check Vercel logs.

#### B. Check Manifest
```
https://your-domain.vercel.app/manifest.json
```
**EXPECTED:** JSON with `"version": "2.1.0"` and `"version_code": 210`

❌ **If you see no version field:** Browser cache. Clear cache and try again.

#### C. Check Customer Manifest
```
https://your-domain.vercel.app/manifest-customer.json
```
**EXPECTED:** JSON with `"version": "2.1.0"` and `"version_code": 210`

#### D. Verify in DevTools
1. Open `https://your-domain.vercel.app` in Chrome
2. Press `F12` (DevTools)
3. Go to **Console** tab
4. Look for:
   ```
   ✅ [PWA] Service Worker registered v2.1.0
   🟢 CustomerApp MOUNTED
   📱 MYVIBES APP VERSION: v2.1.0
   ```

❌ **If you see old version or no logs:** Hard refresh with `Ctrl+Shift+R`

---

### **STEP 3: Clear ALL Caches** 🧹

**CRITICAL:** You MUST clear caches before generating APK!

#### On Desktop (Chrome):
1. Press `F12` (DevTools)
2. Click **Application** tab
3. In left sidebar, expand **Service Workers**
4. Click **Unregister** next to any service workers
5. In left sidebar, click **Clear storage**
6. Check ALL boxes (Cache, Local Storage, Session Storage, etc.)
7. Click **Clear site data**
8. Close Chrome completely
9. Reopen Chrome and visit your site

#### Verify Clear Was Successful:
- DevTools Console should show: `✅ [PWA] Service Worker registered v2.1.0`
- Check **Application** > **Manifest** - should show version "2.1.0"

---

### **STEP 4: Generate APK with PWABuilder** 📦

#### Option A: PWABuilder.com (Easiest)

1. **IMPORTANT:** Open PWABuilder in a PRIVATE/INCOGNITO window
   - This ensures no cached manifest

2. Go to: https://www.pwabuilder.com/

3. Enter your URL: `https://your-domain.vercel.app`

4. Click **Start** and wait for analysis

5. **VERIFY BEFORE PROCEEDING:**
   - Check "Manifest" section shows:
     - ✅ Name: "MYVIBES - Hospitality Platform"
     - ✅ Short Name: "MYVIBES"
     - ✅ **Version: "2.1.0"** ← CRITICAL CHECK!
   
   ❌ **If version is missing or wrong:**
   - Clear browser cache
   - Try in different browser (Firefox, Edge)
   - Wait 5 minutes for CDN cache to expire
   - Try again

6. Click **Package for Stores**

7. Select **Android**

8. Configure settings:
   ```
   App name: MYVIBES
   Package ID: com.myvibes.app  
   Version: 2.1.0
   Version Code: 210
   ```

9. Click **Generate**

10. Download the `.aab` or `.apk` file

#### Option B: Direct APK URL (Alternative)

If PWABuilder shows old version, try this URL directly:
```
https://www.pwabuilder.com/publish?site=https://your-domain.vercel.app&manifest=https://your-domain.vercel.app/manifest.json?ts=1710345600
```

The `?ts=` parameter forces cache bypass.

---

### **STEP 5: Install & Test APK** 📱

#### Before Installing:
1. **COMPLETELY UNINSTALL** old MYVIBES app from Android
2. **Clear Chrome app data:**
   - Settings → Apps → Chrome → Storage → Clear cache & data
3. **Restart** your Android device (very important!)

#### Install New APK:
1. Transfer `.apk` file to Android
2. Enable "Install from unknown sources"
3. Tap APK file to install
4. Open MYVIBES app

#### Verification Checklist:
| Check | Expected | Status |
|-------|----------|--------|
| Logo badge | Shows "**v2.1**" next to MYVIBES logo | [ ] |
| Header icons | Only **2 icons** (WiFi + Bell) - NO gear | [ ] |
| Location | Shows "**Johannesburg, South Africa**" | [ ] |
| Navigation | Bottom nav visible on all screens | [ ] |
| Check-in | Works without "Failed to Fetch" | [ ] |
| Reservations | Table booking works | [ ] |
| Profile | Customer name displays | [ ] |
| Points | Loyalty points visible | [ ] |

✅ **ALL CHECKS PASSED:** You have v2.1.0 installed!

❌ **ANY CHECK FAILED:** You have old APK. Go back to Step 3.

---

## 🐛 TROUBLESHOOTING

### Problem: PWABuilder Shows Old Version

**Causes:**
- Browser cache
- CDN cache (Vercel edge servers)
- PWABuilder cache

**Solutions:**

1. **Clear Browser Completely:**
   ```
   Chrome → Settings → Privacy → Clear browsing data
   Select: Cached images and files
   Time range: All time
   ```

2. **Try Different Browser:**
   - Firefox
   - Microsoft Edge
   - Safari

3. **Force Bypass Cache:**
   - Use this URL format:
     ```
     https://your-domain.vercel.app/manifest.json?v=2.1.0&ts=1710345600&nocache=true
     ```

4. **Wait for CDN:**
   - Vercel CDN cache can take 5-10 minutes to clear
   - Go get coffee ☕ and try again

5. **Check Response Headers:**
   ```bash
   curl -I https://your-domain.vercel.app/manifest.json
   ```
   Should show:
   ```
   Cache-Control: no-cache, no-store, must-revalidate
   X-Version: 2.1.0
   ```

### Problem: Vercel Deployment Failed

**Check:**
1. Go to Vercel Dashboard
2. Click on your project
3. Click **Deployments**
4. Look for red ❌ or yellow ⚠️ icons
5. Click to view build logs

**Common issues:**
- Build timeout (increase timeout in settings)
- Dependency installation failed (check package.json)
- TypeScript errors (check console)

### Problem: APK Installs But Shows Old Version

**This means you're installing a cached APK:**

1. Check APK file timestamp - should be recent
2. Re-download APK from PWABuilder
3. Make sure you're not installing from Downloads folder (old file)
4. Check APK properties on computer - verify file size and date

### Problem: Can't Find VERSION.txt

**Solutions:**
1. Check Vercel build output:
   - Files in `/public` folder should copy to `/dist`
   - Check if `VERSION.txt` is in `dist` folder after build

2. Manually verify in Vercel:
   - Go to deployment
   - Click **View source**
   - Check if `VERSION.txt` exists

---

## 🎯 QUICK VERIFICATION COMMANDS

Run these in your terminal to verify deployment:

```bash
# Check version file
curl https://your-domain.vercel.app/VERSION.txt

# Check manifest version
curl https://your-domain.vercel.app/manifest.json | grep version

# Check headers (should show no-cache)
curl -I https://your-domain.vercel.app/manifest.json
```

**Expected output:**
```
MYVIBES v2.1.0
Build: 210
...

"version": "2.1.0",
"version_name": "2.1.0",
"version_code": 210,

Cache-Control: no-cache, no-store, must-revalidate
```

---

## 📞 STILL NOT WORKING?

If you've tried everything above and PWABuilder STILL shows old version:

1. **Check your Vercel URL is correct**
   - Make sure you're using the production URL
   - Not a preview/staging URL

2. **Try alternative PWA builders:**
   - https://appmaker.xyz/pwa-to-apk
   - https://www.bubblewrap.dev/

3. **Use Bubblewrap CLI (Advanced):**
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest=https://your-domain.vercel.app/manifest.json
   bubblewrap build
   ```

4. **Contact me** with:
   - Your Vercel deployment URL
   - Screenshot of PWABuilder showing old version
   - Output of: `curl https://your-domain.vercel.app/VERSION.txt`

---

## ✅ SUCCESS CRITERIA

You know it worked when:

1. ✅ `VERSION.txt` shows "v2.1.0"
2. ✅ Manifest JSON contains `"version": "2.1.0"`
3. ✅ Console logs show "v2.1.0"
4. ✅ PWABuilder detects version "2.1.0"
5. ✅ APK shows "v2.1" badge next to logo
6. ✅ Only 2 icons in header (no gear)
7. ✅ Location shows "Johannesburg, South Africa"

**When all above pass → APK generation is SUCCESSFUL!** 🎉
