# 🎉 VIBESPOT - Find Your Vibe Tonight

A mobile + web platform connecting restaurants and hotels with customers through menus, specials, and events.

## 🎯 Overview

**VIBESPOT** is a dual-platform solution:
1. **Customer Mobile App** - Discover dining & entertainment options
2. **Business Dashboard** - Manage menus, specials, and events

---

## 📱 Customer App Features

### Core Functionality
- **Home Feed** - Browse today's specials and nearby venues
- **Search & Filters** - Find exactly what you're craving
  - Cuisine types (Italian, Sushi, Burgers, etc.)
  - Price range slider
  - Distance radius
  - Event types
  - Open now toggle
- **Events Calendar** - Discover upcoming events (live music, wine tastings, themed nights)
- **Favorites** - Save venues and get notifications for new specials
- **Venue Details** - Full menu display with tabs (Starters, Mains, Drinks, Desserts)

### User Actions
- **Reserve Table** - Book directly from the app
- **Get Directions** - Integrated Google Maps & Waze links
- **Filter & Search** - Advanced filtering modal
- **Notifications** - Toggle alerts for favorite venues

### In-App Marketing (Subtle)
- Featured promotion banner on home page
- Event notification prompt in Events section
- Premium venue highlighting

---

## 💼 Business Dashboard Features

### Navigation Sections
1. **Overview** - Quick stats and recent activity
2. **Menu Management** - Upload and organize menu items
3. **Specials & Deals** - Post time-limited promotions
4. **Events Calendar** - Create and manage events
5. **Analytics** - View performance metrics
6. **Settings** - Business profile and subscription

### Key Capabilities
- **Real-time Updates** - Post specials that appear instantly in customer app
- **Analytics Dashboard** 
  - Total profile views
  - Menu views
  - Special clicks
  - Engagement metrics
- **Subscription Management** - Pro and Premium plans
- **Menu Builder** - Organize by categories with photos and prices

---

## 🎨 Design System

### Color Palette
- **Primary**: `#3B5166` (Navy Blue)
- **Accent**: Orange to Pink gradient (promotions)
- **Background**: `#F9FAFB` (Light Gray)
- **Text**: Black / Gray hierarchy

### Typography
- Clean, modern sans-serif
- Bold headings for impact
- Small labels for metadata

---

## 🚀 How to Use the Demo

### Toggle Between Apps
Use the switcher in the top-right corner:
- **📱 Customer App** - Mobile view (375x812px iPhone frame)
- **💼 Business Dashboard** - Desktop admin panel

### Customer App Navigation
1. **Home** - See specials and nearby venues
2. **Search** - Open filters modal with slider button
3. **Events** - Browse upcoming happenings
4. **Favorites** - Manage saved venues
5. **Profile** - Sign in / settings

### Try These Interactions
- Click any special card → Opens venue detail page
- Click venue card → Opens venue detail page
- In venue detail:
  - "Reserve Table" → Reservation form modal
  - "Directions" → Google Maps / Waze options
  - Browse menu tabs (Starters, Mains, Drinks, Desserts)
- Search page → Click filter icon → Advanced filters modal

---

## 📊 Business Model

### Revenue Streams
1. **Subscription Plans**
   - Free: Basic profile, limited specials
   - Pro (R399/month): Unlimited specials/events, analytics
   - Premium (R999/month): Featured placement, priority listing
2. **Advertising** - Sponsored specials, banner ads
3. **Future**: Reservation/order commissions

---

## 🛠 Technical Implementation

### Customer App Components
- `CustomerApp.tsx` - Main mobile app container
- `VenueDetail.tsx` - Full venue page with menu tabs
- `ReservationModal.tsx` - Table booking form
- `DirectionsModal.tsx` - Google Maps/Waze integration
- `SearchFilters.tsx` - Advanced filter modal with sliders
- `SpecialCard.tsx`, `VenueCard.tsx`, `EventListItem.tsx` - Reusable cards
- `FilterChip.tsx` - Quick filter buttons

### Business Dashboard Components
- `BusinessDashboard.tsx` - Complete admin panel
- Sidebar navigation
- Overview stats cards
- Menu management with tabs
- Specials posting form
- Analytics charts
- Settings forms

### State Management
- React `useState` hooks for local state
- Filter state object passed between components
- Modal visibility toggles
- View routing (home, search, events, favorites, profile, venue-detail)

---

## 🌍 Target Market

### Primary Launch: South Africa
- Johannesburg (Sandton, Rosebank)
- Cape Town
- Durban

### Target Users (B2C)
- Foodies
- Tourists
- Young professionals
- Students
- Event-goers

### Target Businesses (B2B)
- Restaurants
- Hotels
- Cafés
- Bars & Lounges
- Nightclubs

---

## 📈 Growth Strategy

1. **Phase 1 (MVP)** - Current features
2. **Phase 2** - Push notifications, advanced analytics
3. **Phase 3** - Reservations, online ordering, AI recommendations

---

## 🎯 Unique Value Proposition

Unlike competitors (Zomato, Uber Eats, TripAdvisor), VIBESPOT specializes in:
- **Real-time specials** (not just delivery or reviews)
- **Events discovery** (live music, themed nights, tastings)
- **Location-based deals** ("What's on special near me RIGHT NOW")
- **Direct venue-customer connection** (not delivery-focused)

---

## 💡 Future Enhancements

- Push notifications (Firebase)
- In-app payments (Stripe/Paystack)
- Reservation confirmations via SMS/email
- AR menu preview
- AI-driven recommendations
- Social sharing features
- Loyalty programs
- QR code menu scanning

---

## 🎬 Demo Flow

### Customer Journey
1. Open app → See "Happy Hour Hotspots" banner
2. Browse today's specials
3. Click "2-for-1 Cocktails" → Venue detail opens
4. Browse menu (Starters, Mains, Drinks, Desserts)
5. Click "Reserve Table" → Fill form → Submit
6. Click "Directions" → Choose Google Maps or Waze
7. Navigate to Search → Apply filters (cuisine, price, distance)
8. Navigate to Events → See wine tastings, live music
9. Add venue to Favorites → Enable notifications

### Business Journey
1. Switch to Business Dashboard
2. View Overview stats (views, favorites, engagement)
3. Navigate to Specials → Click "Post New Special"
4. Fill form (title, description, price, end time, image)
5. Publish → Appears in customer app instantly
6. Navigate to Analytics → View performance charts
7. Navigate to Menu → Add/edit menu items by category
8. Navigate to Settings → Update business profile

---

## 📄 File Structure

```
/src/app/
  ├── App.tsx                    # Main switcher component
  ├── CustomerApp.tsx            # Mobile customer app
  ├── BusinessDashboard.tsx      # Business admin panel
  └── components/
      ├── VenueDetail.tsx        # Venue page with menu
      ├── ReservationModal.tsx   # Booking form
      ├── DirectionsModal.tsx    # Maps integration
      ├── SearchFilters.tsx      # Advanced filters
      ├── SpecialCard.tsx        # Special offer card
      ├── VenueCard.tsx          # Venue thumbnail
      ├── EventListItem.tsx      # Event row
      ├── FavoriteToggle.tsx     # Favorite switch
      └── FilterChip.tsx         # Quick filter button
```

---

## 🎨 Design Inspiration

Clean, modern UI inspired by:
- Instagram (stories-style specials feed)
- Airbnb (location-based discovery)
- Spotify (event browsing)
- LinkedIn (professional dashboard for businesses)

---

## 🚀 Next Steps for Development

1. Backend API (Node.js + PostgreSQL)
2. User authentication (Firebase Auth)
3. Real-time updates (WebSockets)
4. Push notifications (Firebase Cloud Messaging)
5. Payment integration (Stripe/Paystack)
6. Google Maps API integration
7. Image upload and storage (AWS S3)
8. Email/SMS confirmations (Twilio, SendGrid)

---

**Built with React, TypeScript, Tailwind CSS, and Lucide Icons**

Find your vibe. Find your spot. 🎉
