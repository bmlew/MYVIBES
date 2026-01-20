# 🎨 MYVIBE Color Scheme Update Guide

## New Brand Colors

### Primary Palette:
- **Cyan/Turquoise:** `#00D9C0` → Tailwind: `cyan-500`, `teal-400`
- **Dark Navy Blue:** `#0A2540` → Tailwind: `blue-900`, `slate-900`  
- **White:** `#ffffff` → For text on colored backgrounds

### Gradient Replacements:

**OLD (Orange-Purple):**
```
from-orange-500 to-purple-600
from-orange-400 to-purple-500  
from-orange-600 to-purple-700
bg-gradient-to-br from-orange-500 to-purple-600
bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600
```

**NEW (Cyan-Blue):**
```
from-cyan-500 to-blue-600
from-cyan-400 to-teal-500
from-cyan-600 to-blue-700
bg-gradient-to-br from-cyan-500 to-blue-600
bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-900
```

---

## ✅ Files UPDATED:

1. **`/src/styles/theme.css`** ✅ - Theme variables updated
2. **`/src/app/App.tsx`** ✅ - Mode switcher buttons & loading fallback

---

## 📋 Files TO UPDATE (Auto-replace patterns):

### Replace Patterns:

1. **`from-orange-500 to-purple-600`** → **`from-cyan-500 to-blue-600`**
2. **`from-orange-600 to-purple-700`** → **`from-cyan-600 to-blue-700`**  
3. **`from-orange-400 to-purple-500`** → **`from-cyan-400 to-teal-500`**
4. **`bg-orange-500`** → **`bg-cyan-500`**
5. **`text-orange-500`** → **`text-cyan-500`**
6. **`border-orange-500`** → **`border-cyan-500`**
7. **`text-purple-600`** → **`text-blue-900`**
8. **`bg-purple-600`** → **`bg-blue-600`**

### Files Needing Updates (51 instances):

1. `/src/app/components/SpecialCard.tsx` (2 instances)
2. `/src/app/components/EventListItem.tsx` (1 instance)
3. `/src/app/components/FilterChip.tsx` (1 instance)
4. `/src/app/components/VenueDetail.tsx` (4 instances)
5. `/src/app/components/ReservationModal.tsx` (3 instances)
6. `/src/app/components/RatingReview.tsx` (2 instances)
7. `/src/app/components/AIInsights.tsx` (3 instances)
8. `/src/app/components/BusinessAuth.tsx` (5 instances)
9. `/src/app/components/DebugPanel.tsx` (1 instance)
10. `/src/app/components/BusinessProfileChecklist.tsx` (2 instances)
11. `/src/app/components/UserProfileModal.tsx` (2 instances)
12. `/src/app/components/WhatsAppReviewPage.tsx` (2 instances)
13. `/src/app/components/CustomerProfile.tsx` (4 instances)
14. `/src/app/components/CustomerProfileSetup.tsx` (2 instances)
15. `/src/app/components/PhoneModal.tsx` (1 instance)
16. `/src/app/components/FAQPage.tsx` (3 instances)
17. `/src/app/components/POPIAPage.tsx` (2 instances)
18. `/src/app/components/DisclaimersPage.tsx` (2 instances)
19. `/src/app/components/PriceRecommendations.tsx` (2 instances)
20. `/src/app/components/AffiliatePortal.tsx` (~5 instances)
21. `/src/app/components/PitchDeck.tsx` (~10 instances)
22. `/src/app/LandingPage.tsx` (~15 instances)
23. `/src/app/AdminDashboard.tsx` (~5 instances)
24. `/src/app/BusinessDashboard.tsx` (~8 instances)
25. `/src/app/CustomerApp.tsx` (~5 instances)

---

## 🚀 Quick Implementation:

The theme.css has been updated with the new colors, so **components using CSS variables will automatically update**.

Components using **Tailwind utility classes** need manual find-replace using the patterns above.

---

## Color Usage Guidelines:

### Primary Actions (Buttons, CTAs):
```tsx
className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
```

### Headers & Hero Sections:
```tsx
className="bg-gradient-to-br from-blue-900 to-cyan-500"
```

### Accents & Badges:
```tsx
className="bg-cyan-500 text-white"
```

### Focus States:
```tsx
className="ring-cyan-500 border-cyan-500"
```

---

## Implementation Status:

- ✅ Theme variables updated
- ✅ App.tsx navigation updated  
- ⏳ Component gradients (bulk find-replace recommended)
- ⏳ Landing page
- ⏳ Pitch deck
- ⏳ Business/Customer apps

**Estimated remaining: ~100 gradient instances across 25 files**
