# 🚀 Quick Update Reference

## How to Push a New Version

### 1. Update Version Numbers (4 files)

```bash
# Update these version strings in all 4 files:
# From: 2.1.3
# To:   2.1.4 (or your new version)
```

**Files to edit:**

1. `/index.html` (lines 13, 15, 57)
2. `/public/manifest.json` (line with "version")
3. `/public/service-worker.js` (lines 1, 2)
4. `/src/app/CustomerApp.tsx` (look for version badge `v2.1`)

---

### 2. Deploy

```bash
git add .
git commit -m "Release v2.1.4: Brief description"
git push origin main
```

Your hosting platform will auto-deploy.

---

### 3. Verify

**Check console logs:**
```
✅ [PWA] Service Worker registered v2.1.4
```

**Check Debug Panel:**
- Open app → Profile → Debug Panel (top right bug icon)
- See "App Version: 2.1.4"
- If it says "Update Available" - perfect! That means updates work.

---

## How Users Get Updates

**Automatically:**
- Users get updates on their next app visit
- Happens in background, no interruption
- Typically within 24 hours for active users

**Manually:**
- Profile → Debug Panel → "Clear Cache & Refresh"
- Or Debug Panel → "Update Available - Click to Install" (if shown)

---

## Version Numbering

- **Bug fix:** `2.1.3` → `2.1.4`
- **New feature:** `2.1.4` → `2.2.0`
- **Major redesign:** `2.2.0` → `3.0.0`

---

## Troubleshooting

**Users still seeing old version?**
1. Ask them to go to Debug Panel
2. Click "Clear Cache & Refresh"
3. Or close and reopen the app

**Need to rollback?**
```bash
git checkout v2.1.3
# Update version numbers
git commit -m "Rollback to v2.1.3"
git push
```

---

## Optional: Show Update Notification

If you want users to see an update notification (optional):

**In `/src/app/CustomerApp.tsx`:**

```tsx
import { UpdateNotification } from './components/UpdateNotification';

// In your component render:
<UpdateNotification currentVersion="2.1.4" />
```

This shows a non-intrusive banner when an update is available. User can click "Update" or dismiss it.

---

## Need Help?

📖 Full details: See `/UPDATE_GUIDE.md`
🔧 Version utils: See `/src/utils/version.ts`
💬 Questions: Check the Update Guide

---

**Your current setup is perfect - updates are seamless and controlled!** 🎉
