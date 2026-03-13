# 🚀 QUICK DEPLOY - MYVIBES v2.1.1

## 📍 What Changed?
Location fallback updated from "Johannesburg, South Africa" to **"Sandton, Johannesburg"**

---

## ⚡ DEPLOY IN 3 STEPS

### 1️⃣ Push to Vercel
```bash
git add .
git commit -m "v2.1.1: Updated location to Sandton, Johannesburg"
git push
```

⏳ **Wait for Vercel deployment** (usually 1-2 minutes)

---

### 2️⃣ Verify Deployment
Open this URL in your browser:
```
https://your-domain.vercel.app/version-check.html
```

**Expected result:** All green ✅ checkmarks

If you see any ❌ red errors:
- Wait 2-3 minutes for deployment to complete
- Click "🔄 Re-check" button
- Clear browser cache and retry

---

### 3️⃣ Generate New APK
**Open PWABuilder in INCOGNITO mode:**
```
https://www.pwabuilder.com/publish?site=https://YOUR-DOMAIN&manifest=https://YOUR-DOMAIN/manifest.json?v=2.1.1&ts=1710346800
```

**CRITICAL CHECKS:**
- ✅ Version shows: **2.1.1**
- ✅ Version code: **211**
- ✅ Name: "MYVIBES"

If version is correct → Click "Package for Stores" → Android → Generate

---

## 📱 Install on Android

### Before Installing New APK:
1. **Uninstall old MYVIBES app**
2. **Clear Chrome data** (Settings → Apps → Chrome → Storage → Clear)
3. **Restart device** (important!)

### After Installing:
Check that location shows: **"Sandton, Johannesburg"**

---

## ✅ Quick Verification Checklist

| Item | Expected | Status |
|------|----------|--------|
| Version badge | v2.1 | [ ] |
| Location text | "Sandton, Johannesburg" | [ ] |
| Header icons | WiFi + Bell only (no gear) | [ ] |
| Bottom nav | Visible on all screens | [ ] |
| Check-in | Works without errors | [ ] |

---

## 🐛 Troubleshooting

### "PWABuilder shows old version"
1. Wait 5 minutes for CDN cache to clear
2. Try different browser (Firefox, Edge)
3. Use alternative: https://appmaker.xyz/pwa-to-apk

### "Location still shows 'Johannesburg, South Africa'"
- You're running the old APK
- Completely uninstall and reinstall
- Check APK file timestamp is recent

### "version-check.html shows red errors"
- Deployment hasn't finished yet
- Check Vercel dashboard for errors
- Wait 2-3 more minutes and retry

---

## 📞 Need Help?

Run these commands and send me the output:

```bash
# Check if deployed
curl https://your-domain.vercel.app/VERSION.txt

# Check manifest version
curl https://your-domain.vercel.app/manifest.json | grep version

# Check headers
curl -I https://your-domain.vercel.app/manifest.json
```

**Expected output:**
```
MYVIBES v2.1.1
Build: 211
...

"version": "2.1.1",
"version_code": 211,

X-Version: 2.1.1
```

---

## 🎯 Summary

1. **Push** to Vercel ✅
2. **Verify** at `/version-check.html` ✅
3. **Generate** APK with PWABuilder ✅
4. **Install** on Android ✅
5. **Confirm** location shows "Sandton, Johannesburg" ✅

**Total time:** ~10 minutes

---

## 📋 Files Changed in v2.1.1

- `/src/app/CustomerApp.tsx` - Location fallbacks
- `/public/manifest.json` - Version 2.1.1
- `/public/manifest-customer.json` - Version 2.1.1
- `/index.html` - Meta tags
- `/vercel.json` - Headers
- `/public/VERSION.txt` - Version info
- `/public/version-check.html` - Version checks

**No breaking changes.** Existing functionality unchanged.
