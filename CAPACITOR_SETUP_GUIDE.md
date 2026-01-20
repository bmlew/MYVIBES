# 📱 VIBESPOT - Capacitor Mobile Apps Setup Guide

## 🎯 **What is This?**

This guide will help you wrap your existing VIBESPOT web app into native iOS and Android apps using Capacitor. Your web app becomes a native mobile app that can be submitted to the App Store and Play Store!

**Timeline:** 1-2 weeks (vs 6-8 weeks for React Native)  
**Cost:** R2,000 (store fees) + optional developer time  
**Platforms:** iOS + Android from one codebase  

---

## ✅ **What You Get**

✅ Native iOS app (App Store)  
✅ Native Android app (Play Store)  
✅ Uses your existing web app (no rebuilding!)  
✅ Native GPS/location access  
✅ Native camera access  
✅ Push notifications  
✅ Haptic feedback (vibrations)  
✅ Native share dialog  
✅ Offline support  

---

## 📋 **Prerequisites**

### **On Mac (for iOS + Android):**
```bash
- macOS 12.0 or later
- Xcode 14+ (from App Store, ~15GB)
- Android Studio (from android.com, ~10GB)
- Node.js 18+ (already have)
- CocoaPods (for iOS: sudo gem install cocoapods)
```

### **On Windows/Linux (for Android only):**
```bash
- Android Studio (from android.com, ~10GB)
- Node.js 18+ (already have)
- Java JDK 11+
```

---

## 🚀 **Step 1: Install Capacitor (5 minutes)**

### **1. Install Capacitor packages:**

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/geolocation
npm install @capacitor/camera
npm install @capacitor/push-notifications
npm install @capacitor/haptics
npm install @capacitor/share
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
```

### **2. Initialize Capacitor:**

The `capacitor.config.ts` file has already been created for you!

### **3. Build your web app:**

```bash
npm run build
```

This creates the `dist` folder that Capacitor will wrap.

---

## 📱 **Step 2: Add iOS Platform (10 minutes)**

### **1. Add iOS platform:**

```bash
npx cap add ios
```

This creates the `ios` folder with your Xcode project.

### **2. Open in Xcode:**

```bash
npx cap open ios
```

### **3. Configure iOS settings:**

In Xcode:
1. Click on "App" in the left sidebar
2. Select "Signing & Capabilities"
3. Choose your Team (Apple Developer account)
4. Change Bundle Identifier to your unique ID (e.g., `com.yourcompany.vibespot`)

### **4. Add privacy descriptions:**

Xcode → Info.plist → Add these keys:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>VIBESPOT needs your location to find nearby restaurants and events</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>VIBESPOT needs your location to show nearby venues even when the app is in background</string>

<key>NSCameraUsageDescription</key>
<string>VIBESPOT needs camera access to upload photos of your business</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>VIBESPOT needs photo library access to select images</string>
```

### **5. Test on iOS Simulator:**

In Xcode, select a simulator (iPhone 15 Pro) and click ▶️ Run.

Your app should launch! 🎉

---

## 🤖 **Step 3: Add Android Platform (10 minutes)**

### **1. Add Android platform:**

```bash
npx cap add android
```

This creates the `android` folder with your Android Studio project.

### **2. Open in Android Studio:**

```bash
npx cap open android
```

### **3. Configure Android settings:**

1. Wait for Gradle sync to complete
2. File → Project Structure → Project → Set Gradle JDK to Java 11+
3. Build → Clean Project
4. Build → Rebuild Project

### **4. Add permissions:**

Edit `android/app/src/main/AndroidManifest.xml` and add:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />
```

### **5. Test on Android Emulator:**

1. In Android Studio, Tools → Device Manager
2. Create a new device (Pixel 7)
3. Click ▶️ Run

Your app should launch! 🎉

---

## 🎨 **Step 4: Add App Icons & Splash Screens (30 minutes)**

### **Required Assets:**

**App Icon:**
- iOS: 1024×1024 PNG (no transparency)
- Android: 512×512 PNG

**Splash Screen:**
- 2732×2732 PNG (centered logo on purple background #8B5CF6)

### **Generate Assets Automatically:**

Use this free tool: **https://www.appicon.co/**

1. Upload your 1024×1024 icon
2. Download iOS and Android assets
3. Follow placement instructions below

### **iOS Icon Placement:**

Replace files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### **Android Icon Placement:**

Replace files in:
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

### **Splash Screen:**

Create `splash.png` (2732×2732) with:
- Purple background (#8B5CF6)
- White VIBESPOT logo in center
- Logo should be ~1024px wide

Place in:
- iOS: `ios/App/App/Assets.xcassets/Splash.imageset/`
- Android: `android/app/src/main/res/drawable/`

---

## 🔄 **Step 5: Update Workflow (Daily Development)**

### **After making web app changes:**

```bash
# 1. Build web app
npm run build

# 2. Copy to native projects
npx cap sync

# 3. Open in IDE and run
npx cap open ios    # or
npx cap open android
```

**Pro tip:** Run `npx cap sync` after every web app build!

---

## 📦 **Step 6: Build for Production**

### **iOS Production Build:**

1. In Xcode, select "Any iOS Device (arm64)"
2. Product → Archive
3. Wait 5-10 minutes for build
4. Window → Organizer
5. Click "Distribute App"
6. Choose "App Store Connect"
7. Follow prompts to upload

**Build time:** ~10 minutes per build

### **Android Production Build:**

1. Generate signing key (first time only):
```bash
keytool -genkey -v -keystore vibespot-release-key.keystore \
  -alias vibespot -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/key.properties`:
```
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=vibespot
storeFile=../vibespot-release-key.keystore
```

3. Build release APK:
```bash
cd android
./gradlew assembleRelease
```

4. Find APK at:
`android/app/build/outputs/apk/release/app-release.apk`

**Build time:** ~5 minutes per build

---

## 🍎 **Step 7: Submit to App Store (iOS)**

### **Prerequisites:**
- Apple Developer account ($99/year)
- App Store Connect account setup

### **Submission Steps:**

1. **Create app listing:**
   - Go to: https://appstoreconnect.apple.com
   - Click: My Apps → + → New App
   - Fill in:
     - Name: VIBESPOT
     - Primary Language: English
     - Bundle ID: com.vibespot.app (or your chosen ID)
     - SKU: vibespot001

2. **Add app information:**
   - Category: Food & Drink
   - Subtitle: Find Dining & Events Near You
   - Description: (See below)
   - Keywords: restaurant, dining, food, events, specials, nightlife, johannesburg
   - Support URL: Your website
   - Privacy Policy URL: Your website/privacy

3. **Upload screenshots:** (Use iPhone 15 Pro Max + iPad Pro)
   - 6.7" iPhone: 1290×2796 (at least 3 screenshots)
   - 12.9" iPad: 2048×2732 (at least 2 screenshots)

4. **Upload build:**
   - Already done in Step 6!
   - Select the archived build

5. **Submit for review:**
   - Click "Add for Review"
   - Answer questionnaire
   - Submit!

**Review time:** 1-3 days (usually 24-48 hours)

---

## 🤖 **Step 8: Submit to Play Store (Android)**

### **Prerequisites:**
- Google Play Developer account ($25 one-time)
- Play Console account setup

### **Submission Steps:**

1. **Create app:**
   - Go to: https://play.google.com/console
   - Click: Create App
   - Fill in:
     - App name: VIBESPOT
     - Default language: English
     - App or game: App
     - Free or paid: Free

2. **Add store listing:**
   - Short description: (50 chars) Find restaurants, specials & events nearby
   - Full description: (See below)
   - App icon: 512×512 PNG
   - Feature graphic: 1024×500 PNG
   - Screenshots:
     - Phone: 1080×1920 (at least 2)
     - Tablet: 1200×1920 (at least 1)

3. **Set content rating:**
   - Complete questionnaire
   - Category: Restaurant finder
   - No violence, adult content, etc.
   - Should get "Everyone" rating

4. **Upload APK:**
   - Production → Create new release
   - Upload the APK from Step 6
   - Add release notes

5. **Submit for review:**
   - Complete all required sections
   - Click "Submit for Review"

**Review time:** 1-7 days (varies widely)

---

## 📝 **App Store Descriptions**

### **Short Description (80 chars):**
```
Discover nearby restaurants, daily specials, and events in real-time.
```

### **Full Description:**

```
VIBESPOT connects you with the best dining and entertainment experiences near you.

✨ FEATURES:
• Real-time distance to venues
• Today's specials with countdown timers
• Upcoming events calendar
• Save your favorite places
• Get directions instantly
• Browse menus and photos
• Filter by cuisine, price, and distance

🍽️ PERFECT FOR:
• Finding tonight's dinner spot
• Discovering happy hour specials
• Planning weekend activities
• Exploring new restaurants
• Never missing great events

📍 SOUTH AFRICA:
Currently available in Sandton, Johannesburg with plans to expand nationwide.

Download now and never miss out on great food and events again!

═══════════════════════

CONTACT & SUPPORT:
• Website: [Your website]
• Email: [Your email]
• Privacy Policy: [Your privacy URL]
```

---

## 🔧 **Troubleshooting**

### **iOS Build Fails:**

**Error:** "Signing for 'App' requires a development team"
**Fix:** Select your team in Signing & Capabilities

**Error:** "No profiles for 'com.vibespot.app' were found"
**Fix:** Change bundle identifier to something unique

**Error:** "CocoaPods not installed"
**Fix:** `sudo gem install cocoapods`

### **Android Build Fails:**

**Error:** "SDK location not found"
**Fix:** Create `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Error:** "Gradle sync failed"
**Fix:** File → Invalidate Caches / Restart

**Error:** "Minimum supported Gradle version is 7.0"
**Fix:** Update `android/gradle/wrapper/gradle-wrapper.properties`

### **App Crashes on Launch:**

**Check:** Browser console in Safari/Chrome DevTools
**Fix:** Run `npx cap sync` after every build

### **Geolocation Not Working:**

**iOS:** Check Info.plist has NSLocationWhenInUseUsageDescription
**Android:** Check AndroidManifest.xml has location permissions

---

## ⚡ **Performance Tips**

### **1. Enable Production Mode:**

In `capacitor.config.ts`, remove the development server URL before building:

```typescript
server: {
  // url: 'http://localhost:5173', // REMOVE THIS
  androidScheme: 'https',
  iosScheme: 'https',
},
```

### **2. Optimize Images:**

- Use WebP format where possible
- Compress images before uploading
- Lazy load images off-screen

### **3. Enable Offline Support:**

Add service worker for caching (PWA features work in Capacitor!)

### **4. Reduce Bundle Size:**

```bash
npm run build -- --mode production
```

---

## 📊 **Timeline Summary**

| Task | Time | When |
|------|------|------|
| Install Capacitor | 5 min | Day 1 |
| Add iOS platform | 10 min | Day 1 |
| Add Android platform | 10 min | Day 1 |
| Create app icons | 30 min | Day 1-2 |
| Test on simulators | 1 hour | Day 2 |
| Create store listings | 2 hours | Day 3 |
| Take screenshots | 1 hour | Day 3 |
| iOS submission | 1 hour | Day 4 |
| Android submission | 1 hour | Day 5 |
| **Wait for reviews** | **1-7 days** | **Week 1-2** |
| **TOTAL ACTIVE WORK** | **~8 hours** | **5 days** |

**Total timeline:** 1-2 weeks (including store reviews)

---

## 🎯 **Quick Commands Reference**

```bash
# Build web app
npm run build

# Sync to native projects
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android

# Run on device
# (Use Xcode/Android Studio Run button)

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest
npx cap sync
```

---

## 💰 **Cost Breakdown**

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 (R1,700) | Annual |
| Google Play Console | $25 (R450) | One-time |
| **TOTAL** | **R2,150** | **First year** |

**Year 2+:** Only R1,700/year (Apple renewal)

---

## ✅ **Checklist**

### **Setup:**
- [ ] Install Xcode (Mac only)
- [ ] Install Android Studio
- [ ] Install Capacitor packages
- [ ] Run `npm run build`
- [ ] Add iOS platform
- [ ] Add Android platform

### **Configuration:**
- [ ] Add iOS privacy descriptions
- [ ] Add Android permissions
- [ ] Create app icons
- [ ] Create splash screens
- [ ] Test on iOS simulator
- [ ] Test on Android emulator

### **Store Submission:**
- [ ] Create Apple Developer account
- [ ] Create Google Play account
- [ ] Take app screenshots
- [ ] Write app descriptions
- [ ] Build iOS for production
- [ ] Build Android APK
- [ ] Submit to App Store
- [ ] Submit to Play Store

### **Post-Launch:**
- [ ] Monitor reviews
- [ ] Respond to user feedback
- [ ] Plan updates
- [ ] Track analytics

---

## 🚀 **Next Steps**

**Ready to start?**

1. **Today:** Install Capacitor and add platforms (30 min)
2. **Day 2-3:** Create assets and test (3 hours)
3. **Day 4-5:** Submit to stores (2 hours)
4. **Week 1-2:** Wait for approvals ⏳

**Your existing web app will become native iOS + Android apps in 1-2 weeks!**

---

## 📞 **Support Resources**

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Human Interface Guidelines:** https://developer.apple.com/design/
- **Android Design Guidelines:** https://developer.android.com/design
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies:** https://play.google.com/console/about/guides/

---

**You have everything you need to build native mobile apps! 🎉**

**Questions? Check `/CAPACITOR_FAQ.md` for common issues.**
