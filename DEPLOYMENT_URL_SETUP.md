# 🚀 Deployment URL Setup Guide

## Problem Fixed

Your app was using `window.location.origin` which returns the Figma preview URL:
```
https://a12ce41a-d5eb-4245-a938-12e1b4a6b400-v2-figmaiframepreview.figma.site
```

This won't work when deployed to a real domain because:
- ❌ Affiliate links would point to Figma URLs
- ❌ Shared venue links would be invalid
- ❌ QR codes would break
- ❌ Deep links wouldn't work

## ✅ Solution Implemented

Created a centralized configuration system in `/src/config/app.ts` that:
1. Uses production URL when configured
2. Falls back to current origin for development
3. Provides helper functions for all URL generation

## 📝 Setup Instructions

### Option 1: Set Production URL (Recommended)

1. **Create `.env.local` file** in project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your production URL:**
   ```env
   VITE_APP_URL=https://myvibes.co.za
   ```

3. **Restart dev server** (Vite will pick up the change)

### Option 2: Update Config Directly

Edit `/src/config/app.ts` line 17:
```typescript
const PRODUCTION_URL = 'https://myvibes.co.za'; // Your domain
```

## 🎯 What Was Updated

### Files Modified:
1. **`/src/config/app.ts`** - New configuration system
2. **`/src/app/components/AffiliatePortal.tsx`** - Uses `getReferralLink()`
3. **`/src/app/components/VenueDetail.tsx`** - Uses `getVenueShareUrl()`

### Helper Functions Available:

```typescript
import { 
  getAppUrl,           // Base app URL
  getCustomerAppUrl,   // /app route
  getReferralLink,     // /?ref=CODE
  getVenueShareUrl     // /app?v=X&ts=Y&venue=Z
} from '@/config/app';

// Examples:
const appUrl = getAppUrl();                    // https://myvibes.co.za
const customerUrl = getCustomerAppUrl();       // https://myvibes.co.za/app
const referralUrl = getReferralLink('ABC123'); // https://myvibes.co.za/?ref=ABC123
const shareUrl = getVenueShareUrl('venue-123');// https://myvibes.co.za/app?v=2.1.1&ts=...&venue=venue-123
```

## 🧪 Testing

### Before Deploying:
1. **Set test URL:**
   ```env
   VITE_APP_URL=https://test.myvibes.co.za
   ```

2. **Test affiliate portal:**
   - Navigate to Affiliate Portal
   - Check "Customer Download Link" displays correct URL
   - Copy link and verify it's correct

3. **Test venue sharing:**
   - Open any venue detail
   - Click share button
   - Verify URL is correct

### After Deploying:
1. Visit your production domain
2. Open browser console
3. Check for any Figma URLs in logs
4. Test all sharing features

## 🌐 Deployment Platforms

### Netlify / Vercel:
Add environment variable in dashboard:
```
VITE_APP_URL = https://myvibes.co.za
```

### Custom Server:
Add to `.env.production`:
```env
VITE_APP_URL=https://myvibes.co.za
```

### Docker:
Pass as build arg:
```dockerfile
ARG VITE_APP_URL=https://myvibes.co.za
```

## 🔍 Verification Checklist

After deployment, verify these URLs:

- [ ] **Affiliate Customer Link**: `https://yourdomain.com/?ref=ABC123`
- [ ] **Venue Share Link**: `https://yourdomain.com/app?v=2.1.1&ts=...&venue=xyz`
- [ ] **Customer App**: `https://yourdomain.com/app`
- [ ] **QR Codes**: Generate new ones with production URL
- [ ] **Social Shares**: Test on Facebook, Twitter, WhatsApp

## 📱 Update QR Codes

If you've generated QR codes with Figma URLs:

1. **Generate new QR codes** with production URL:
   ```
   https://myvibes.co.za/?ref=PARTNER_CODE
   ```

2. **Update marketing materials**:
   - Social media posts
   - Printed materials
   - Partner communications

3. **Notify partners** to update their links

## 🚨 Common Issues

### Issue: Links still show Figma URL
**Solution:** Clear browser cache and rebuild:
```bash
rm -rf node_modules/.vite
npm run build
```

### Issue: Environment variable not working
**Solution:** Ensure Vite can access it (must start with `VITE_`):
```env
✅ VITE_APP_URL=...
❌ APP_URL=...
```

### Issue: Different URL in dev vs production
**Solution:** Use `.env.local` for dev, `.env.production` for prod:
```bash
# .env.local (dev)
VITE_APP_URL=http://localhost:5173

# .env.production (prod)
VITE_APP_URL=https://myvibes.co.za
```

## 📊 Impact

This fix affects:
- ✅ 100+ affiliate partner links
- ✅ All venue sharing functionality
- ✅ QR code campaigns
- ✅ Social media integration
- ✅ Deep linking for customer app
- ✅ SEO and analytics tracking

## 🎨 Custom Domains

### If using custom subdomain:
```env
VITE_APP_URL=https://app.myvibes.co.za
```

### If using path:
```env
VITE_APP_URL=https://mycompany.com/myvibes
```

### If using www:
```env
VITE_APP_URL=https://www.myvibes.co.za
```

## 🔐 Security Note

The production URL is PUBLIC and will be visible in:
- Browser developer tools
- Source code
- Shared links

This is OK - it's not sensitive information. Never add secrets here!

---

## ✅ You're Ready!

1. Set your production URL
2. Test locally
3. Deploy
4. Verify all links work
5. Update QR codes and marketing materials

Your app will now work correctly on your own domain! 🚀
