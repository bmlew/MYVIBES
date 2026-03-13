# Customer PWA Quick Start 🚀

## ⚡ The Setup

You now have **2 apps in 1 codebase**:

### 1. **Full Website** - `/`
Landing page, business, admin, everything

### 2. **Customer PWA** - `/app` ⭐
**ONLY customer features - use this for APK!**

---

## 🎯 Generate Customer APK (5 Steps)

### **Step 1: Deploy**
```bash
git add .
git commit -m "Customer PWA ready"
git push
```

### **Step 2: Get Your Customer URL**
```
https://your-app.vercel.app/app
```
⚠️ **Use `/app` not `/`** ⚠️

### **Step 3: PWABuilder**
1. Go to: https://www.pwabuilder.com/
2. Enter: `https://your-app.vercel.app/app` ⭐
3. Click "Package for Stores" → Android
4. Download APK

### **Step 4: Upload Asset Links**
```bash
mkdir -p public/.well-known
# Copy assetlinks.json from PWABuilder download
git add .
git commit -m "Add asset links"
git push
```

### **Step 5: Test**
Install `app-release-signed.apk` on Android

**Expected result:**
- ✅ Opens to customer app (no landing page)
- ✅ Shows restaurants/events
- ✅ Can check in
- ✅ No business/admin features

---

## 📱 What's in Each App?

### **Full Website (`/`)**
- ✅ Landing page
- ✅ Business registration
- ✅ Business dashboard
- ✅ Admin panel
- ✅ Investor deck
- ✅ Customer app

### **Customer PWA (`/app`)** ⭐
- ✅ Restaurant discovery
- ✅ Check-ins
- ✅ Loyalty points
- ✅ Leaderboard
- ✅ Profile
- ❌ No landing page
- ❌ No business features
- ❌ No admin panel

---

## 🔗 URLs to Remember

| Purpose | URL | Manifest |
|---------|-----|----------|
| Marketing Website | `/` | `/manifest.json` |
| **Customer PWA/APK** ⭐ | `/app` | `/manifest-customer.json` |

---

## ✅ Testing Checklist

### **Test `/app` URL:**
- [ ] Opens directly to customer app (no landing page)
- [ ] Manifest at `/manifest-customer.json` loads
- [ ] Can discover restaurants
- [ ] Check-in works
- [ ] Loyalty points display
- [ ] No business/admin sections visible

---

## 🎨 APK Configuration

When using PWABuilder:

| Field | Value |
|-------|-------|
| **URL** | `https://your-app.vercel.app/app` ⭐ |
| Package ID | `com.myvibes.app` |
| App Name | `MYVIBES` |
| Start URL | `/app` ⭐ |
| Scope | `/app` ⭐ |
| Display | `standalone` |

---

## 🐛 Common Issues

**Issue:** APK shows landing page  
**Fix:** Use `/app` URL, not `/`

**Issue:** Can navigate to business features  
**Fix:** That's OK - scope keeps PWA in `/app`

**Issue:** Icons missing  
**Fix:** Ensure 8 PNGs in `/public/icons/`

---

## 📦 Files Created

```
✅ /app.html                      # Customer entry point
✅ /src/main-customer.tsx          # Customer main
✅ /src/app/CustomerAppPWA.tsx     # Customer wrapper
✅ /public/manifest-customer.json  # Customer manifest
```

---

## 🚀 Next Steps

1. **Deploy:** `git push`
2. **Test:** Visit `/app` URL
3. **Generate APK:** Use `/app` in PWABuilder
4. **Publish:** Upload AAB to Play Store

---

## 💡 Pro Tip

**For customers:** Always use `/app`  
**For marketing:** Use `/` for SEO  

Both work perfectly, separate purposes! 🎯

---

**Full Guide:** See `/CUSTOMER_PWA_SETUP.md`
