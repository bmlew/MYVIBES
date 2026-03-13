# MYVIBES Customer PWA Setup Guide 🎯

## Overview

Your PWA now has **TWO separate entry points**:

1. **`/` (index.html)** - Full website with Landing, Business, Admin, etc.
2. **`/app` (app.html)** - Customer-only PWA app ⭐ **USE THIS FOR PWA/APK**

---

## 🎯 Why Two Entry Points?

**Problem:** You don't want the landing page, business dashboard, or admin panels in your customer PWA/APK.

**Solution:** Separate entry points!

### **`/` - Full Website (index.html)**
- Landing page
- Business registration
- Business dashboard
- Admin dashboard
- ROI calculator
- Investor deck
- Affiliate portal

### **`/app` - Customer PWA Only (app.html)** ⭐
- **ONLY** the CustomerApp
- Restaurant discovery
- Check-ins
- Loyalty points
- Leaderboard
- Profile
- No landing page or business features

---

## 📦 File Structure

```
MYVIBES/
├── index.html                    # Full website entry point
├── app.html                      # Customer PWA entry point ⭐
├── public/
│   ├── manifest.json             # Full website manifest
│   ├── manifest-customer.json    # Customer PWA manifest ⭐
│   └── icons/                    # Shared icons
├── src/
│   ├── main.tsx                  # Full website main
│   ├── main-customer.tsx         # Customer PWA main ⭐
│   ├── app/
│   │   ├── App.tsx               # Full app with routing
│   │   ├── CustomerApp.tsx       # Customer app component
│   │   └── CustomerAppPWA.tsx    # Customer PWA wrapper ⭐
```

---

## 🚀 Deployment URLs

After deployment, you'll have:

### **Full Website:**
```
https://your-app.vercel.app/
```
- Shows landing page
- Users can navigate to business/admin sections
- Uses `/manifest.json`

### **Customer PWA:** ⭐
```
https://your-app.vercel.app/app
```
- Goes directly to customer app
- No landing page
- Uses `/manifest-customer.json`
- **Perfect for APK generation!**

---

## 🎨 Generating APK for Customer App

### **Step 1: Deploy Your App**
```bash
git add .
git commit -m "Add customer-only PWA entry point"
git push
```

### **Step 2: Wait for Deployment**
Vercel will build both entry points.

### **Step 3: Generate APK Using Customer URL**

Go to: **https://www.pwabuilder.com/**

**IMPORTANT:** Use the `/app` URL:
```
https://your-app.vercel.app/app
```

**NOT** the root URL!

### **Step 4: Configure PWABuilder**

- **Package ID:** `com.myvibes.app`
- **App name:** `MYVIBES`
- **Start URL:** `/app` ⭐ (Important!)
- **Scope:** `/app` ⭐
- **Manifest:** Will use `/manifest-customer.json`

### **Step 5: Download APK**

PWABuilder will generate:
- `app-release-signed.apk` - Install on Android
- `app-release-bundle.aab` - Upload to Play Store

### **Step 6: Upload Asset Links**

From the downloaded ZIP, extract `assetlinks.json` and upload to:
```
public/.well-known/assetlinks.json
```

---

## 📱 What Users See

### **When Installing PWA from `/app`:**

**App Name:** MYVIBES  
**Description:** Discover the best restaurants, bars, and events near you  
**Start URL:** `/app`  
**Scope:** `/app` (stays within customer app)

**Features:**
- ✅ Restaurant discovery
- ✅ Check-ins
- ✅ Loyalty points (10 per check-in)
- ✅ Leaderboard
- ✅ Profile & achievements
- ✅ Offline mode
- ❌ No landing page
- ❌ No business dashboard
- ❌ No admin panel

### **Shortcuts Available:**

1. **Find Restaurants** → `/app`
2. **Events Near Me** → `/app?tab=events`
3. **My Points** → `/app?tab=profile`

---

## 🔧 Manifest Differences

### **`manifest.json` (Full Website)**
```json
{
  "name": "MYVIBES - Hospitality Platform",
  "start_url": "/",
  "scope": "/",
  "shortcuts": [
    { "url": "/?view=restaurants" },
    { "url": "/?mode=business" }  ← Business shortcut
  ]
}
```

### **`manifest-customer.json` (Customer PWA)** ⭐
```json
{
  "name": "MYVIBES - Discover Restaurants & Events",
  "start_url": "/app",
  "scope": "/app",
  "shortcuts": [
    { "url": "/app" },
    { "url": "/app?tab=events" },
    { "url": "/app?tab=profile" }  ← Customer shortcuts only
  ]
}
```

---

## ✅ Testing Checklist

### **Test Full Website (`/`):**
- [ ] Landing page loads
- [ ] Can navigate to business registration
- [ ] Can access admin login
- [ ] Can view investor deck
- [ ] Manifest at `/manifest.json` is accessible

### **Test Customer PWA (`/app`):** ⭐
- [ ] Goes directly to CustomerApp (no landing page)
- [ ] Restaurant discovery works
- [ ] Check-in flow works
- [ ] Loyalty points display correctly
- [ ] Leaderboard shows data
- [ ] Profile page accessible
- [ ] Manifest at `/manifest-customer.json` is accessible
- [ ] Can install as PWA
- [ ] Works offline
- [ ] No business/admin features visible

---

## 🌐 Vercel Configuration

Your build will automatically create both entry points.

**Build output:**
```
dist/
├── index.html              # Full website
├── app.html                # Customer PWA ⭐
├── manifest.json           # Full manifest
├── manifest-customer.json  # Customer manifest ⭐
├── assets/                 # Shared assets
└── icons/                  # Shared icons
```

**Vercel routes both automatically:**
- `https://your-app.vercel.app/` → `dist/index.html`
- `https://your-app.vercel.app/app` → `dist/app.html` ⭐

---

## 📲 APK Generation - Complete Flow

### **1. Deploy**
```bash
git push
```

### **2. Get Customer App URL**
```
https://your-app.vercel.app/app
```

### **3. Generate APK**
Use PWABuilder with customer URL.

### **4. Configure**
- Start URL: `/app`
- Scope: `/app`

### **5. Download**
Get APK and AAB files.

### **6. Upload Asset Links**
```bash
mkdir -p public/.well-known
# Copy assetlinks.json to public/.well-known/
git add .
git commit -m "Add digital asset links"
git push
```

### **7. Test APK**
Install on Android device.

### **8. Verify**
- ✅ Opens directly to customer app
- ✅ No landing page shown
- ✅ No browser UI (full screen)
- ✅ Can check in
- ✅ Can earn points
- ✅ Offline mode works

---

## 🎯 Publishing to Google Play Store

### **Use the Customer AAB File**

Upload: `app-release-bundle.aab`

**Store Listing:**

**App Name:** MYVIBES

**Short Description (80 chars):**
```
Discover restaurants, bars & events. Real-time deals & rewards.
```

**Full Description:**
```
MYVIBES - Find Your Next Vibe

Discover the best restaurants, bars, and events in South Africa.

✨ FEATURES:
• Discover nearby restaurants & bars
• Live events and entertainment
• Earn 10 loyalty points per check-in
• Climb the leaderboard
• Get exclusive deals and specials
• Offline mode support

📍 Available in Johannesburg, Cape Town, Durban

Download now and find your next vibe!
```

**Category:** Food & Drink

**Screenshots:** Show ONLY customer app features
- Restaurant discovery
- Check-in screen
- Loyalty points
- Leaderboard
- Profile

**DO NOT show:**
- Landing page
- Business dashboard
- Admin panels

---

## 🔒 Important Security Note

The customer PWA is **scoped to `/app`**, which means:

✅ **Users CAN access:**
- `/app` (customer app)
- `/app?tab=events`
- `/app?tab=profile`

❌ **Users CANNOT access from PWA:**
- `/` (landing page) - outside scope
- `/business` - outside scope
- `/admin` - outside scope

**This is perfect!** Your customer APK is isolated to customer features only.

---

## 🐛 Troubleshooting

### **APK shows landing page instead of customer app**
→ Make sure you used `/app` URL in PWABuilder
→ Check start_url in manifest-customer.json is `/app`

### **Can still navigate to business features**
→ This is expected if you use root URL
→ Use `/app` URL for customer-only experience

### **Icons not showing**
→ Both manifests use same icons from `/icons/`
→ Ensure all 8 icon sizes exist

### **Offline mode doesn't work**
→ Service worker is shared between both entry points
→ Check service-worker.js is caching correctly

### **PWABuilder says "Invalid manifest"**
→ Verify manifest-customer.json is valid JSON
→ Check it's accessible at `/manifest-customer.json`

---

## 📊 Two Apps, One Codebase

**Advantages:**

1. **Marketing Website** - Use `/` for SEO, business sign-ups
2. **Customer PWA** - Use `/app` for app users, APK generation
3. **Single Codebase** - Both share same CustomerApp component
4. **Easy Updates** - Update once, both benefit
5. **Flexible Distribution:**
   - Link to `/app` in emails/ads → Direct to app
   - Link to `/` in search results → See full website first

---

## ✨ Next Steps

### **1. Push Your Changes:**
```bash
git add .
git commit -m "Add customer-only PWA entry point"
git push
```

### **2. Test Both Entry Points:**

**Full Website:**
```
https://your-app.vercel.app/
```

**Customer PWA:**
```
https://your-app.vercel.app/app
```

### **3. Generate APK:**

Use **ONLY** the `/app` URL in PWABuilder!

### **4. Publish:**

Upload AAB to Google Play Store.

---

## 🎉 You're All Set!

Your MYVIBES app now has:

✅ Marketing website at `/`  
✅ Customer PWA at `/app` ⭐  
✅ Separate manifests for each  
✅ Ready for APK generation  
✅ Ready for Google Play Store  

**Use `/app` for all customer-facing PWA/APK needs!** 🚀
