# MYVIBES - CHANGELOG

## Version 2.1.1 (March 13, 2025)

### 🎯 Main Change
- **Location Specificity**: Updated default location fallback from "Johannesburg, South Africa" to "**Sandton, Johannesburg**" for more precise location display

### 📝 Changed Files
- `/src/app/CustomerApp.tsx` - Updated all location fallback references (8 occurrences)
- `/public/manifest.json` - Version bumped to 2.1.1, version_code 211
- `/public/manifest-customer.json` - Version bumped to 2.1.1, version_code 211
- `/index.html` - Updated meta tags to v2.1.1
- `/vercel.json` - Updated X-Version headers to 2.1.1
- `/public/VERSION.txt` - Updated to v2.1.1
- `/public/version-check.html` - Updated expected version checks

### 🚀 Deployment Instructions
```bash
git add .
git commit -m "v2.1.1: Updated location to Sandton, Johannesburg"
git push
```

Then verify at: `https://your-domain.vercel.app/version-check.html`

---

## Version 2.1.0 (March 13, 2025)

### 🎯 Major Changes
- **Extreme Cache-Busting System**: Implemented comprehensive cache prevention for APK generation
- **Version Tracking**: Added version fields to manifests for PWABuilder compatibility
- **Production UI Cleanup**: Removed debug gear icon from production builds
- **Location System**: Changed default fallback to "Johannesburg, South Africa"

### ✨ New Features
- Service Worker v2.1.0 with timestamp-based cache names
- Automatic service worker updates every 30 seconds
- Version verification page (`/version-check.html`)
- VERSION.txt file for quick deployment verification
- Comprehensive deployment checklist and documentation

### 📝 Technical Improvements
- No-cache HTTP headers for all critical files
- Cache-busting query parameters on all URLs
- Version badges (v2.1) next to logo
- Auto-reload on service worker updates
- Console logging for version verification

### 🐛 Fixes
- Fixed bottom navigation visibility issues
- Resolved PWABuilder showing old manifest versions
- Fixed service worker caching issues in APK builds
- Improved Android APK deployment reliability

### 📦 New Files Created
- `/public/VERSION.txt` - Version verification file
- `/public/version-check.html` - Interactive deployment checker
- `/public/service-worker.js` - New service worker with v2.1.0
- `/DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- `/PWA_BUILDER_LINKS.md` - Cache-busting PWABuilder links

### 🔧 Modified Files
- `/public/manifest.json` - Added version, version_code, version_name fields
- `/public/manifest-customer.json` - Added version tracking
- `/index.html` - No-cache meta tags, version headers
- `/vercel.json` - Aggressive no-cache headers
- `/src/app/CustomerApp.tsx` - Location fallback updates, version logs

---

## Previous Versions

### Version 2.0.x
- Integrated Leaderboard into BusinessDashboard
- Added InvestorDeck to navigation
- Enhanced CustomerProfile with loyalty points display
- Added Achievements and RewardsRedemption tabs
- Dark theme with animated gradients
- Floating particle effects
- Custom animated MYVIBES logo with sound waves
- Customer-only PWA preparation

### Version 1.x
- Initial hospitality platform implementation
- Dual-session authentication system
- Gamification with 10 points per check-in
- Real-time check-ins on business dashboard
- Consolidated profile creation
- Database persistence with Supabase

---

## Upgrade Notes

### From v2.1.0 to v2.1.1
- No breaking changes
- Only location display text updated
- No code refactoring required
- Compatible with existing APK installations

### From v2.0.x to v2.1.x
- **BREAKING**: Old APKs must be uninstalled before installing v2.1.x
- Service worker completely rewritten - requires cache clear
- Manifest structure changed - PWABuilder will see new version
- Android device restart recommended after installation

---

## Testing Checklist

After deploying v2.1.1, verify:

- [ ] Location shows "**Sandton, Johannesburg**" when GPS fails
- [ ] `/version-check.html` shows all green checkmarks
- [ ] `/VERSION.txt` displays v2.1.1
- [ ] Manifest JSON files contain `"version": "2.1.1"`
- [ ] Console logs show correct version on app load
- [ ] PWABuilder detects version 2.1.1
- [ ] APK installs and runs correctly
- [ ] Check-in functionality works
- [ ] Table reservations work
- [ ] Bottom navigation visible

---

## Known Issues

### None reported for v2.1.1

---

## Future Roadmap

- [ ] Enhanced geolocation with area suggestions
- [ ] Multiple city support beyond Johannesburg
- [ ] Custom location picker with map interface
- [ ] Neighborhood-based business recommendations
- [ ] Distance calculations from Sandton central point

---

## Contributors

- Development Team: MYVIBES Platform
- PWA Optimization: Cache-busting implementation
- Location Services: Google Maps API integration
