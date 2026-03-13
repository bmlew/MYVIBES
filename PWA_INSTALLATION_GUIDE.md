# MYVIBES PWA Installation Guide

## 📱 What is a PWA (Progressive Web App)?

A Progressive Web App is a website that can be installed on your device like a native app. MYVIBES PWA provides:

- ✅ **Offline Access** - Works without internet connection
- ✅ **Home Screen Icon** - Quick access from your device
- ✅ **Full Screen Experience** - No browser UI, looks like a real app
- ✅ **Push Notifications** - Get updates about specials and events
- ✅ **Fast Loading** - Cached resources for instant startup
- ✅ **Auto Updates** - Always get the latest version

---

## 🚀 How to Install MYVIBES PWA

### **Method 1: Automatic Install Prompt (Easiest)**

1. **Open MYVIBES** in your browser (Chrome, Edge, or Safari)
2. **Wait for the install banner** to appear at the bottom of the screen
3. **Click "Install App"** button
4. **Confirm** the installation
5. **Done!** The app icon appears on your home screen

> **Note:** The install prompt appears automatically after you've used the site a few times. If you dismissed it, it will reappear after 7 days.

---

### **Method 2: Manual Installation**

#### **On Android (Chrome/Edge)**

1. Open **MYVIBES** in Chrome or Edge browser
2. Tap the **three-dot menu** (⋮) in the top right
3. Select **"Install app"** or **"Add to Home screen"**
4. Tap **"Install"** in the popup
5. The MYVIBES icon will appear on your home screen

**Alternative:**
- Look for the **install icon** (⊕) in the address bar
- Tap it and select **"Install"**

#### **On iPhone/iPad (Safari)**

1. Open **MYVIBES** in Safari browser
2. Tap the **Share button** (□ with arrow) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired (keep it as "MYVIBES")
5. Tap **"Add"** in the top right
6. The MYVIBES icon appears on your home screen

> **Note:** iOS doesn't support full PWA features like Android, but you'll still get a home screen icon and standalone mode.

#### **On Desktop (Chrome/Edge/Brave)**

1. Open **MYVIBES** in your browser
2. Look for the **install icon** (⊕) in the address bar (right side)
3. Click it and select **"Install"**
4. The app opens in its own window
5. MYVIBES is now in your applications folder

**Alternative:**
- Click the **three-dot menu** (⋮)
- Hover over **"More tools"** or **"Apps"**
- Select **"Install MYVIBES"**

---

## 🔍 How to Check if MYVIBES is Installed

### **On Mobile:**
- Look for the **MYVIBES icon** on your home screen
- The icon should have the MYVIBES logo with colorful sound wave bars

### **On Desktop:**
- Check your **Applications folder** (Mac) or **Start Menu** (Windows)
- Look for **MYVIBES** in your app launcher

### **When Opened:**
- The app opens in **full screen** without browser UI
- No address bar or browser tabs visible
- Looks and feels like a native app

---

## ⚙️ PWA Features in MYVIBES

### **1. Offline Mode**
- View cached business profiles and specials
- Check your loyalty points balance
- Browse previous check-in history
- See the **"Offline"** banner when disconnected

### **2. Push Notifications** (Coming Soon)
- Get notified about new daily specials
- Receive alerts when you're near a favorite venue
- Loyalty rewards and achievement unlocks
- Event reminders

### **3. App Shortcuts**
- Long-press the MYVIBES icon (Android)
- Quick access to:
  - Find Restaurants
  - Events Near Me
  - Business Dashboard

### **4. Share Target**
- Share venues and events directly to MYVIBES
- From other apps, select "Share to MYVIBES"

### **5. Background Sync**
- Check-ins sync when you come back online
- Data updates automatically in the background

---

## 🛠️ Troubleshooting

### **Install Prompt Not Showing?**

**Reasons:**
1. You've already installed the app
2. You dismissed the prompt recently (waits 7 days)
3. Your browser doesn't support PWA (use Chrome/Edge)
4. You're browsing in Incognito/Private mode

**Solutions:**
- Use **Manual Installation** (Method 2 above)
- Clear browser history and revisit the site
- Make sure you're using HTTPS (not HTTP)

### **Can't Find Install Button?**

- Make sure you're using a **supported browser**:
  - ✅ Chrome, Edge, Brave, Samsung Internet (Android)
  - ✅ Safari (iOS) - Use "Add to Home Screen"
  - ❌ Firefox (limited PWA support)

### **App Icon Not Appearing?**

The icons are generated from `/public/icons/icon.svg`. If you don't see them:

1. Check if icons exist in `/public/icons/` folder
2. Generate PNG icons in these sizes:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
3. Name them as: `icon-72x72.png`, `icon-96x96.png`, etc.

### **Service Worker Not Working?**

Open browser **Developer Tools** (F12):
1. Go to **Application** tab (Chrome) or **Storage** (Firefox)
2. Click **Service Workers**
3. Check if `service-worker.js` is registered
4. Click **"Update"** or **"Unregister"** and reload

### **App Not Updating?**

The app checks for updates every hour. To force an update:

1. Open the app
2. Open **Developer Tools** (F12)
3. Go to **Console**
4. Type: `await forceServiceWorkerUpdate()`
5. Press Enter

Or:
- Uninstall the app
- Clear browser cache
- Reinstall from the website

---

## 📊 PWA Requirements Checklist

MYVIBES meets all PWA criteria:

- ✅ **HTTPS** - Secure connection required
- ✅ **manifest.json** - App metadata configured
- ✅ **Service Worker** - Caching and offline support
- ✅ **Icons** - Multiple sizes (72px to 512px)
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Start URL** - Defined entry point
- ✅ **Display Mode** - Standalone (full screen)
- ✅ **Theme Color** - Cyan (#06b6d4)
- ✅ **Background Color** - Dark slate (#0f172a)

---

## 🎨 Customizing the PWA

### **Change App Name:**
Edit `/public/manifest.json`:
```json
{
  "name": "MYVIBES - Hospitality Platform",
  "short_name": "MYVIBES"
}
```

### **Change Theme Colors:**
Edit `/public/manifest.json`:
```json
{
  "theme_color": "#06b6d4",      // Address bar color
  "background_color": "#0f172a"  // Splash screen background
}
```

Also update `/index.html`:
```html
<meta name="theme-color" content="#06b6d4" />
```

### **Add New Icons:**
1. Create PNG images in required sizes
2. Place in `/public/icons/` folder
3. Update `manifest.json` icons array

### **Create App Shortcuts:**
Edit `/public/manifest.json` shortcuts array:
```json
{
  "shortcuts": [
    {
      "name": "Check In",
      "url": "/?action=checkin",
      "icons": [{ "src": "/icons/checkin-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 🔒 Security & Privacy

- **HTTPS Only** - All PWA features require secure connection
- **Service Worker Scope** - Limited to your domain
- **No Extra Permissions** - Uses same permissions as website
- **User Control** - Can uninstall anytime
- **Data Storage** - Cached locally, can be cleared

---

## 📱 Platform Support

| Platform | Browser | Install Support | Offline | Notifications |
|----------|---------|----------------|---------|---------------|
| **Android** | Chrome | ✅ Full | ✅ Yes | ✅ Yes |
| **Android** | Edge | ✅ Full | ✅ Yes | ✅ Yes |
| **Android** | Samsung | ✅ Full | ✅ Yes | ✅ Yes |
| **Android** | Firefox | ⚠️ Limited | ✅ Yes | ❌ No |
| **iOS** | Safari | ⚠️ Limited | ✅ Yes | ❌ No |
| **Windows** | Chrome | ✅ Full | ✅ Yes | ✅ Yes |
| **Windows** | Edge | ✅ Full | ✅ Yes | ✅ Yes |
| **macOS** | Chrome | ✅ Full | ✅ Yes | ✅ Yes |
| **macOS** | Safari | ⚠️ Limited | ✅ Yes | ❌ No |

---

## 🎯 Next Steps

After installing MYVIBES PWA:

1. **Create an account** or **sign in**
2. **Allow location access** to find nearby venues
3. **Enable notifications** for special alerts (optional)
4. **Check in** at venues to earn loyalty points
5. **Explore** the dashboard and leaderboard
6. **Invite friends** using your referral code

---

## 🆘 Support

Need help with the PWA installation?

- **Email:** support@myvibes.co.za
- **In-App:** Tap the menu and select "Help & Support"
- **FAQ:** Visit the FAQ page in the app

---

## 🔄 Updates

MYVIBES PWA automatically checks for updates:
- **Frequency:** Every hour
- **Notification:** Prompts you to reload for new version
- **Manual Update:** Refresh the app or clear cache

---

**Enjoy the full MYVIBES experience! 🎉**
