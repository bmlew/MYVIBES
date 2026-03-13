# MYVIBES PWA Architecture 🏗️

## 📊 Dual Entry Point Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MYVIBES Platform                          │
│                  (One Codebase, Two Apps)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   Full Website (/)    │   │  Customer PWA (/app)  │
    │   ================    │   │  ===================  │
    │   index.html          │   │  app.html            │
    │   main.tsx            │   │  main-customer.tsx    │
    │   manifest.json       │   │  manifest-customer.json│
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │  App.tsx (Router)     │   │  CustomerAppPWA.tsx   │
    │  ─────────────────    │   │  ──────────────────   │
    │  • Landing Page       │   │  • CustomerApp ONLY   │
    │  • Business Dashboard │   │  • InstallPrompt      │
    │  • Admin Dashboard    │   │  • OfflineBanner      │
    │  • Customer App       │   │  • No other pages     │
    │  • Investor Deck      │   │                       │
    │  • Affiliate Portal   │   │                       │
    │  • Everything!        │   │                       │
    └───────────────────────┘   └───────────────────────┘
```

---

## 🌐 URL Structure

```
your-app.vercel.app
│
├── / ──────────────────────────► Full Website
│   │
│   ├── /landing ──────────────► Landing Page
│   ├── /business ─────────────► Business Dashboard
│   ├── /admin ────────────────► Admin Panel
│   ├── /investor-deck ────────► Investor Deck
│   ├── /affiliate-portal ─────► Affiliate Portal
│   └── /customer ─────────────► Customer App (from website)
│
└── /app ───────────────────────► Customer PWA Only ⭐
    │                             (Perfect for APK!)
    ├── / ────────────────────► Customer App (home)
    ├── ?tab=events ───────────► Events Tab
    └── ?tab=profile ──────────► Profile Tab
```

---

## 📱 User Flow Comparison

### **Full Website Flow (`/`)**

```
User visits site
       │
       ▼
Landing Page
       │
   ┌───┴───┐
   │       │
   ▼       ▼
Customer  Business
  App    Dashboard
   │
   ▼
Can navigate
everywhere
```

### **Customer PWA Flow (`/app`)** ⭐

```
User opens PWA/APK
       │
       ▼
Customer App
   (Direct!)
       │
   ┌───┴───┐
   │       │
   ▼       ▼
Check-in  Profile
   │
   ▼
Stays in
customer
features
```

---

## 🗂️ File Mapping

### **Shared Files** (Used by both)
```
src/
├── app/
│   ├── CustomerApp.tsx ◄─────── Both use this!
│   ├── components/
│   │   ├── InstallPrompt.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── VenueCard.tsx
│   └── ...
├── styles/
│   ├── fonts.css
│   ├── theme.css
│   └── ...
public/
├── icons/ ◄──────────────────── Both use same icons!
└── service-worker.js ◄────────── Shared service worker
```

### **Full Website Files**
```
index.html ──────────► Entry point
src/
├── main.tsx ────────► Bootstraps full app
└── app/
    ├── App.tsx ─────► Router with all pages
    ├── LandingPage.tsx
    ├── BusinessDashboard.tsx
    └── AdminDashboard.tsx
public/
└── manifest.json ───► Full manifest
```

### **Customer PWA Files** ⭐
```
app.html ────────────────► Entry point
src/
├── main-customer.tsx ───► Bootstraps customer app
└── app/
    └── CustomerAppPWA.tsx ──► Wrapper for customer app
public/
└── manifest-customer.json ──► Customer manifest
```

---

## 🎯 Scope & Boundaries

### **Full Website Scope**
```json
{
  "start_url": "/",
  "scope": "/"
}
```
**Can access:** EVERYTHING

### **Customer PWA Scope** ⭐
```json
{
  "start_url": "/app",
  "scope": "/app"
}
```
**Can access:** Only `/app` and `/app?params`

**Isolated from:**
- `/` (landing)
- `/business`
- `/admin`
- Other sections

---

## 🔄 Build Process

```
npm run build
     │
     ▼
  Vite Build
     │
┌────┴────┐
│         │
▼         ▼
index.html   app.html
(Full)      (Customer)
│         │
└────┬────┘
     │
     ▼
  dist/
  ├── index.html
  ├── app.html
  ├── assets/
  │   ├── index-[hash].js    ◄── Full website bundle
  │   ├── app-[hash].js      ◄── Customer PWA bundle
  │   └── shared-[hash].js   ◄── Shared code
  ├── manifest.json
  ├── manifest-customer.json
  └── icons/
```

---

## 📦 APK Generation Flow

```
┌──────────────────────────────────────────┐
│  Step 1: Deploy                          │
│  git push → Vercel builds both apps      │
└──────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Step 2: Access Customer URL             │
│  https://your-app.vercel.app/app         │
└──────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Step 3: PWABuilder                      │
│  • Analyzes /manifest-customer.json      │
│  • Packages CustomerAppPWA.tsx           │
│  • Creates APK with scope: /app          │
└──────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│  Step 4: APK Generated                   │
│  • app-release-signed.apk (install)      │
│  • app-release-bundle.aab (Play Store)   │
│  • Loads ONLY customer app               │
└──────────────────────────────────────────┘
```

---

## 🧩 Component Reuse

```
                CustomerApp.tsx
                       │
          ┌────────────┼────────────┐
          │                         │
          ▼                         ▼
    Full Website              Customer PWA
    (via App.tsx)          (via CustomerAppPWA.tsx)
          │                         │
          │                         │
    [All features]            [Customer only]
```

**Benefits:**
- ✅ Write once, use twice
- ✅ Single source of truth
- ✅ Easy to update
- ✅ Consistent experience

---

## 🎨 Manifest Comparison

### **manifest.json** (Full Website)
```json
{
  "name": "MYVIBES - Hospitality Platform",
  "start_url": "/",
  "scope": "/",
  "shortcuts": [
    { "url": "/?view=restaurants" },
    { "url": "/?view=events" },
    { "url": "/?mode=business" }    ◄── Business shortcut
  ]
}
```

### **manifest-customer.json** (Customer PWA) ⭐
```json
{
  "name": "MYVIBES - Discover Restaurants",
  "start_url": "/app",
  "scope": "/app",
  "shortcuts": [
    { "url": "/app" },
    { "url": "/app?tab=events" },
    { "url": "/app?tab=profile" }   ◄── Customer shortcuts
  ]
}
```

---

## 🚀 Deployment Strategy

```
              Git Push
                 │
                 ▼
          Vercel Deployment
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Build index.html   Build app.html
        │                 │
        └────────┬────────┘
                 │
                 ▼
           Single Deploy
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    / serves         /app serves
    Full Website     Customer PWA
```

**Result:**
- One deployment
- Two entry points
- Same domain
- Different experiences

---

## 🎯 Use Cases

### **When to use Full Website (`/`)**
- Marketing campaigns
- SEO/Google indexing
- Business sign-ups
- Investor presentations
- General browsing
- First-time visitors

### **When to use Customer PWA (`/app`)** ⭐
- App users
- APK generation
- Play Store listing
- Direct customer access
- Install prompt
- Push notifications
- Returning customers

---

## 📊 Traffic Distribution

```
                  Users
                    │
        ┌───────────┼───────────┐
        │                       │
        ▼                       ▼
  New Visitors            App Users
  (Search/Ads)          (Installed PWA)
        │                       │
        ▼                       ▼
    / (Full Site)          /app (PWA)
        │                       │
        │                       │
  See landing page      Direct to app
  Learn about MYVIBES   Start using
        │                       │
        ▼                       │
  Install PWA/APK ──────────────┘
```

---

## 🔒 Security & Isolation

### **Service Worker Scope**
```javascript
// Caches both entry points but serves correctly
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // /app requests get /app resources
  // / requests get / resources
  
  // Both work independently!
});
```

### **Manifest Scope**
- Full Website: Can navigate anywhere
- Customer PWA: Locked to `/app/*`

**Users in Customer PWA/APK cannot accidentally navigate to:**
- Landing page
- Business dashboard
- Admin panel

**Perfect isolation!** 🔒

---

## ✨ Benefits of This Architecture

### **For Development:**
1. ✅ Single codebase
2. ✅ Shared components
3. ✅ Easy updates
4. ✅ One deployment

### **For Marketing:**
1. ✅ Full website for SEO
2. ✅ Business features separate
3. ✅ Professional landing page
4. ✅ Multiple entry points

### **For Users:**
1. ✅ Clean customer app
2. ✅ No confusion
3. ✅ Fast loading
4. ✅ Focused experience

### **For APK:**
1. ✅ Customer features only
2. ✅ Small bundle size
3. ✅ Proper scoping
4. ✅ Play Store ready

---

## 🎉 Summary

```
One Platform, Two Experiences:

1. Full Website (/)
   → Everything for everyone
   → Marketing, business, customer

2. Customer PWA (/app) ⭐
   → Customer features only
   → Perfect for APK
   → Focused experience

Same code, different entry points!
```

---

**This is a clean, professional architecture that scales! 🚀**
