# 📦 Capacitor Package Installation Guide

## 🚀 Quick Install (All Packages)

Run this single command to install ALL Capacitor packages:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/geolocation @capacitor/camera @capacitor/push-notifications @capacitor/haptics @capacitor/share @capacitor/status-bar @capacitor/splash-screen
```

---

## 📋 Individual Package Details

### **Core Packages (Required)**

```bash
npm install @capacitor/core @capacitor/cli
```

- **@capacitor/core** - Main Capacitor runtime
- **@capacitor/cli** - Command line tools (build, sync, open)

---

### **Platform Packages (Required)**

```bash
npm install @capacitor/ios @capacitor/android
```

- **@capacitor/ios** - iOS platform support
- **@capacitor/android** - Android platform support

**Note:** You need both even if you only build for one platform initially.

---

### **Feature Plugins (Recommended)**

```bash
npm install @capacitor/geolocation
```
**Purpose:** Enhanced GPS location (more accurate than browser)  
**Used for:** "Near Me" feature, distance calculations

```bash
npm install @capacitor/camera
```
**Purpose:** Access device camera and photo gallery  
**Used for:** Business logo uploads (future feature)

```bash
npm install @capacitor/push-notifications
```
**Purpose:** Native push notifications  
**Used for:** Special alerts, event reminders (future feature)

```bash
npm install @capacitor/haptics
```
**Purpose:** Vibration/haptic feedback  
**Used for:** Button presses, confirmations (nice UX touch)

```bash
npm install @capacitor/share
```
**Purpose:** Native share dialog  
**Used for:** Share venues, events with friends

```bash
npm install @capacitor/status-bar
```
**Purpose:** Control status bar appearance  
**Used for:** Match app colors, hide on full screen

```bash
npm install @capacitor/splash-screen
```
**Purpose:** Show splash screen while app loads  
**Used for:** Professional app launch experience

---

## ✅ Verify Installation

After installation, check `package.json`:

```json
{
  "dependencies": {
    "@capacitor/android": "^6.1.2",
    "@capacitor/camera": "^6.0.2",
    "@capacitor/cli": "^6.1.2",
    "@capacitor/core": "^6.1.2",
    "@capacitor/geolocation": "^6.0.1",
    "@capacitor/haptics": "^6.0.1",
    "@capacitor/ios": "^6.1.2",
    "@capacitor/push-notifications": "^6.0.2",
    "@capacitor/share": "^6.0.2",
    "@capacitor/splash-screen": "^6.0.2",
    "@capacitor/status-bar": "^6.0.1"
  }
}
```

**Version 6.x is current as of January 2026**

---

## 🔧 Package Sizes

| Package | Size | Purpose |
|---------|------|---------|
| @capacitor/core | ~100KB | Runtime |
| @capacitor/cli | ~500KB | Dev tools |
| @capacitor/ios | ~50KB | iOS config |
| @capacitor/android | ~50KB | Android config |
| @capacitor/geolocation | ~20KB | GPS |
| @capacitor/camera | ~30KB | Camera |
| @capacitor/push-notifications | ~40KB | Push |
| @capacitor/haptics | ~10KB | Vibration |
| @capacitor/share | ~10KB | Share |
| @capacitor/status-bar | ~10KB | Status bar |
| @capacitor/splash-screen | ~15KB | Splash |

**Total:** ~835KB (very lightweight!)

---

## 🎯 What Each Package Does for VIBESPOT

### **Geolocation** 📍
```typescript
// Before (browser geolocation)
navigator.geolocation.getCurrentPosition(...)

// After (native GPS - more accurate!)
import { Geolocation } from '@capacitor/geolocation';
const position = await Geolocation.getCurrentPosition();
```

**Benefits:**
- ✅ 2-3x more accurate
- ✅ Works in background
- ✅ Faster fix time
- ✅ Better battery optimization

---

### **Camera** 📷
```typescript
import { Camera } from '@capacitor/camera';

// Take photo
const photo = await Camera.getPhoto({
  quality: 90,
  source: CameraSource.Camera,
});

// Or pick from gallery
const photo = await Camera.getPhoto({
  source: CameraSource.Photos,
});
```

**Use cases:**
- Business owners upload logo
- Upload venue photos
- Profile pictures

---

### **Push Notifications** 🔔
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Request permission
await PushNotifications.requestPermissions();

// Register for push
await PushNotifications.register();

// Listen for notifications
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Notification:', notification);
});
```

**Use cases:**
- "New special near you!"
- "Event starting in 1 hour"
- "Your subscription expires tomorrow"

---

### **Haptics** 📳
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light tap (button press)
await Haptics.impact({ style: ImpactStyle.Light });

// Medium tap (confirm action)
await Haptics.impact({ style: ImpactStyle.Medium });

// Heavy tap (error/warning)
await Haptics.impact({ style: ImpactStyle.Heavy });
```

**Use cases:**
- Button feedback
- Pull-to-refresh
- Toggle switches
- Confirmations

---

### **Share** 🔗
```typescript
import { Share } from '@capacitor/share';

// Share venue
await Share.share({
  title: 'Check out this restaurant!',
  text: 'The Grillhouse has a special today',
  url: 'https://vibespot.app/venue/123',
});
```

**Use cases:**
- Share venue with friends
- Share special deals
- Share events
- Invite friends to app

---

### **Status Bar** 📱
```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Dark text (light background)
await StatusBar.setStyle({ style: Style.Light });

// Light text (dark background)
await StatusBar.setStyle({ style: Style.Dark });

// Hide status bar
await StatusBar.hide();

// Set background color
await StatusBar.setBackgroundColor({ color: '#8B5CF6' });
```

**Use cases:**
- Match brand colors (purple!)
- Full screen mode
- Consistent look across screens

---

### **Splash Screen** 🎨
```typescript
import { SplashScreen } from '@capacitor/splash-screen';

// Show splash
await SplashScreen.show();

// Hide after data loaded
await SplashScreen.hide();
```

**Configured in `capacitor.config.ts`:**
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  backgroundColor: '#8B5CF6',
  showSpinner: false,
}
```

**Result:** Professional app launch with your branding!

---

## 🔄 Keep Packages Updated

### **Check for updates:**
```bash
npm outdated
```

### **Update all Capacitor packages:**
```bash
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/ios@latest @capacitor/android@latest
npm install @capacitor/geolocation@latest @capacitor/camera@latest
npm install @capacitor/push-notifications@latest @capacitor/haptics@latest
npm install @capacitor/share@latest @capacitor/status-bar@latest
npm install @capacitor/splash-screen@latest
```

### **Or update all at once:**
```bash
npm update
```

### **After updating, sync native projects:**
```bash
npx cap sync
```

---

## ❓ Troubleshooting

### **"Cannot find module '@capacitor/core'"**
**Fix:**
```bash
npm install @capacitor/core @capacitor/cli
```

### **"capacitor command not found"**
**Fix:**
```bash
npx cap --version  # Use npx instead of global install
```

### **"Plugin not available on this platform"**
**Fix:** This is normal! Check platform before using:
```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Use native feature
} else {
  // Web fallback
}
```

### **Version conflicts**
**Fix:** Use exact versions:
```bash
npm install @capacitor/core@6.1.2 --save-exact
```

---

## 📊 Installation Checklist

### **Before starting:**
- [ ] Node.js 18+ installed
- [ ] npm working
- [ ] Web app builds successfully (`npm run build`)

### **Install packages:**
- [ ] Core packages installed
- [ ] Platform packages installed
- [ ] Feature plugins installed
- [ ] `package.json` updated

### **Verify installation:**
- [ ] Run `npx cap --version` (should show version)
- [ ] Check `node_modules/@capacitor` exists
- [ ] No errors in `npm install` output

### **Next steps:**
- [ ] Create `capacitor.config.ts` (already done!)
- [ ] Add iOS platform: `npx cap add ios`
- [ ] Add Android platform: `npx cap add android`
- [ ] Sync: `npx cap sync`

---

## 🎯 Ready?

All packages are defined in the setup guide. Just run:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/geolocation @capacitor/camera @capacitor/push-notifications @capacitor/haptics @capacitor/share @capacitor/status-bar @capacitor/splash-screen
```

**Then proceed to:** `/CAPACITOR_SETUP_GUIDE.md` Step 2!

**Your packages will be ready in ~2 minutes! 🚀**
