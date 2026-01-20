# Global Color Scheme Update Script

## Replace All Orange-Purple Gradients with Cyan-Blue

### Find and Replace Patterns:

```bash
# Gradient backgrounds
from-orange-400 to-purple-600  →  from-cyan-400 to-blue-600
from-orange-500 to-purple-600  →  from-cyan-500 to-blue-600  
from-orange-500 to-purple-500  →  from-cyan-500 to-blue-500
from-purple-50 to-orange-50    →  from-cyan-50 to-blue-50
from-orange-50 to-purple-50    →  from-cyan-50 to-blue-50
from-orange-100 to-purple-100  →  from-cyan-100 to-blue-100

# Hover states
hover:from-orange-600 hover:to-purple-700  →  hover:from-cyan-600 hover:to-blue-700

# Borders
border-orange-200  →  border-cyan-200
border-orange-500  →  border-cyan-500
border-purple-200  →  border-blue-200

# Text colors
text-purple-600  →  text-blue-600
text-purple-700  →  text-blue-700
text-orange-600  →  text-cyan-600

# Backgrounds
bg-orange-50  →  bg-cyan-50
bg-purple-50  →  bg-blue-50
bg-orange-100 →  bg-cyan-100
```

### Files to Update (24 files):

1. VenueCard.tsx
2. VenueDetail.tsx
3. FilterChip.tsx
4. SpecialCard.tsx
5. ReservationModal.tsx
6. RatingReview.tsx
7. AIRecommendations.tsx
8. BusinessAIInsights.tsx
9. AIInsights.tsx
10. CustomerProfile.tsx
11. NotificationCenter.tsx
12. UserProfileModal.tsx
13. POPIAPage.tsx
14. DisclaimersPage.tsx
15. PriceRecommendations.tsx
16. DebugPanel.tsx
17. PhoneModal.tsx
18. SocialMediaAdsGallery.tsx (already cyan-blue)
19. CustomerProfileSetup.tsx
20. WhatsAppReviewPage.tsx
21. AdvancedInsights.tsx
22. FAQPage.tsx
23. BusinessProfileChecklist.tsx
24. PitchDeck.tsx

### Quick Update Command (if using VSCode):

1. Open "Find in Files" (Ctrl+Shift+F)
2. Enable Regex mode
3. Search: `from-orange-(\d+) to-purple-(\d+)`
4. Replace: `from-cyan-$1 to-blue-$2`
5. Replace All

### Manual Priority List (Most Visible):

**HIGH PRIORITY:**
- ✅ VenueDetail.tsx - Reserve Table button (DONE)
- VenueCard.tsx - Logo badge
- FilterChip.tsx - Active filters
- SpecialCard.tsx - Discount badges
- ReservationModal.tsx - Submit button

**MEDIUM PRIORITY:**
- RatingReview.tsx - Rating UI
- VenueDetail.tsx - Event badges
- AIRecommendations.tsx - AI badges

**LOW PRIORITY:**
- Various page components (FAQ, POPIA, etc.)
