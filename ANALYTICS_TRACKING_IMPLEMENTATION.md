# Analytics Tracking Implementation Guide

## Overview
Comprehensive analytics system to track ad clicks, CTR, reservations, and platform value.

---

## 🎯 Features to Implement:

### 1. **Ad Click Tracking**
- Track when customer clicks on carousel/premium ads
- Record business_id, timestamp, user info
- Calculate CTR (Click-Through Rate)

### 2. **Reservation Tracking**
- Track when customers make reservations
- Record business_id, customer info, reservation details
- Show conversion funnel: Views → Clicks → Reservations

### 3. **Business Analytics Dashboard**
- Show each business their own CTR
- Show their reservations
- Show platform value (revenue from clicks/reservations)

### 4. **Admin Analytics Dashboard**
- Aggregate all clicks across all businesses
- Total reservations platform-wide
- Revenue attribution
- Top performing businesses

---

## 📊 Data Structure

### Click Tracking Record:
```typescript
{
  id: string;
  business_id: string;
  business_name: string;
  click_type: 'carousel' | 'premium_ad' | 'search_result' | 'featured';
  timestamp: string;
  user_id?: string;
  user_email?: string;
  source_page: string; // 'home', 'specials', 'events'
  created_at: string;
}
```

### Reservation Record:
```typescript
{
  id: string;
  business_id: string;
  business_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  estimated_value: number; // Avg spend per person
  created_at: string;
}
```

---

## 🔧 Implementation Steps

### STEP 1: Add Backend API Endpoints

Add to `/supabase/functions/server/index.tsx`:

```typescript
// ============================================
// ANALYTICS TRACKING ENDPOINTS
// ============================================

// Track ad/carousel click
app.post("/make-server-175b2872/analytics/track-click", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, click_type, user_email, source_page } = body;
    
    console.log(`📊 Tracking click: ${business_id} - ${click_type}`);
    
    // Get business details
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Create click record
    const clickRecord = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      business_id,
      business_name: business.name,
      click_type: click_type || 'carousel',
      timestamp: new Date().toISOString(),
      user_email: user_email || 'anonymous',
      source_page: source_page || 'home',
      created_at: new Date().toISOString()
    };
    
    // Store click record
    await kv.set(`click:${clickRecord.id}`, clickRecord);
    
    // Update business click count
    const updatedBusiness = {
      ...business,
      total_clicks: (business.total_clicks || 0) + 1,
      last_click_at: new Date().toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log(`✅ Click tracked for ${business.name}`);
    return c.json({ success: true, click: clickRecord });
  } catch (error) {
    console.error('❌ Error tracking click:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Track reservation
app.post("/make-server-175b2872/analytics/track-reservation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      business_id, 
      customer_name, 
      customer_email, 
      customer_phone,
      party_size,
      reservation_date,
      reservation_time,
      special_requests
    } = body;
    
    console.log(`📅 Tracking reservation: ${business_id} - ${customer_name}`);
    
    // Get business details
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Create reservation record
    const reservationRecord = {
      id: `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      business_id,
      business_name: business.name,
      customer_name,
      customer_email,
      customer_phone,
      party_size: parseInt(party_size) || 2,
      reservation_date,
      reservation_time,
      special_requests: special_requests || '',
      status: 'pending',
      estimated_value: (parseInt(party_size) || 2) * 350, // R350 avg per person
      created_at: new Date().toISOString()
    };
    
    // Store reservation record
    await kv.set(`reservation:${reservationRecord.id}`, reservationRecord);
    
    // Update business reservation count
    const updatedBusiness = {
      ...business,
      total_reservations: (business.total_reservations || 0) + 1,
      last_reservation_at: new Date().toISOString()
    };
    await kv.set(`business:${business_id}`, updatedBusiness);
    
    console.log(`✅ Reservation tracked for ${business.name}`);
    return c.json({ success: true, reservation: reservationRecord });
  } catch (error) {
    console.error('❌ Error tracking reservation:', error);
    return c.json({ error: 'Failed to track reservation' }, 500);
  }
});

// Get business analytics
app.get("/make-server-175b2872/analytics/business/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    
    // Get all clicks for this business
    const allClicks = await kv.getByPrefix('click:');
    const businessClicks = allClicks.filter((click: any) => click.business_id === businessId);
    
    // Get all reservations for this business
    const allReservations = await kv.getByPrefix('reservation:');
    const businessReservations = allReservations.filter((res: any) => res.business_id === businessId);
    
    // Get business data
    const business = await kv.get(`business:${businessId}`);
    
    // Calculate metrics
    const total_clicks = businessClicks.length;
    const total_reservations = businessReservations.length;
    const total_views = business?.total_views || 0;
    const ctr = total_views > 0 ? (total_clicks / total_views * 100).toFixed(2) : 0;
    const conversion_rate = total_clicks > 0 ? (total_reservations / total_clicks * 100).toFixed(2) : 0;
    const estimated_revenue = businessReservations.reduce((sum: number, res: any) => sum + (res.estimated_value || 0), 0);
    
    return c.json({
      business_id: businessId,
      business_name: business?.name || 'Unknown',
      metrics: {
        total_views,
        total_clicks,
        total_reservations,
        ctr: parseFloat(ctr),
        conversion_rate: parseFloat(conversion_rate),
        estimated_revenue
      },
      recent_clicks: businessClicks.slice(-10).reverse(),
      recent_reservations: businessReservations.slice(-10).reverse()
    });
  } catch (error) {
    console.error('❌ Error fetching business analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get platform-wide analytics for admin
app.get("/make-server-175b2872/analytics/platform", async (c) => {
  try {
    // Get all data
    const allClicks = await kv.getByPrefix('click:');
    const allReservations = await kv.getByPrefix('reservation:');
    const allBusinesses = await kv.getByPrefix('business:');
    
    // Calculate totals
    const total_clicks = allClicks.length;
    const total_reservations = allReservations.length;
    const total_views = allBusinesses.reduce((sum: number, b: any) => sum + (b.total_views || 0), 0);
    const platform_ctr = total_views > 0 ? (total_clicks / total_views * 100).toFixed(2) : 0;
    const reservation_conversion = total_clicks > 0 ? (total_reservations / total_clicks * 100).toFixed(2) : 0;
    const total_estimated_revenue = allReservations.reduce((sum: number, res: any) => sum + (res.estimated_value || 0), 0);
    
    // Top performing businesses
    const businessPerformance = allBusinesses.map((business: any) => {
      const businessClicks = allClicks.filter((c: any) => c.business_id === business.id);
      const businessReservations = allReservations.filter((r: any) => r.business_id === business.id);
      return {
        id: business.id,
        name: business.name,
        clicks: businessClicks.length,
        reservations: businessReservations.length,
        revenue: businessReservations.reduce((sum: number, r: any) => sum + (r.estimated_value || 0), 0)
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);
    
    return c.json({
      platform_metrics: {
        total_views,
        total_clicks,
        total_reservations,
        platform_ctr: parseFloat(platform_ctr),
        reservation_conversion: parseFloat(reservation_conversion),
        total_estimated_revenue
      },
      top_businesses: businessPerformance.slice(0, 10),
      recent_clicks: allClicks.slice(-20).reverse(),
      recent_reservations: allReservations.slice(-20).reverse()
    });
  } catch (error) {
    console.error('❌ Error fetching platform analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get all reservations for admin
app.get("/make-server-175b2872/analytics/reservations", async (c) => {
  try {
    const allReservations = await kv.getByPrefix('reservation:');
    
    // Sort by date (most recent first)
    const sortedReservations = allReservations.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({
      reservations: sortedReservations,
      total_count: sortedReservations.length,
      total_value: sortedReservations.reduce((sum: number, r: any) => sum + (r.estimated_value || 0), 0)
    });
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});
```

---

### STEP 2: Update Frontend API Utils

Add to `/src/utils/api.ts`:

```typescript
// Track ad click
export async function trackAdClick(businessId: string, clickType: string, userEmail?: string, sourcePage?: string) {
  try {
    await apiCall('/analytics/track-click', {
      method: 'POST',
      body: JSON.stringify({
        business_id: businessId,
        click_type: clickType,
        user_email: userEmail,
        source_page: sourcePage
      })
    });
    console.log('✅ Click tracked:', businessId);
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}

// Track reservation
export async function trackReservation(reservationData: {
  business_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
}) {
  try {
    const response = await apiCall('/analytics/track-reservation', {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
    console.log('✅ Reservation tracked:', response);
    return response;
  } catch (error) {
    console.error('Failed to track reservation:', error);
    throw error;
  }
}

// Get business analytics
export async function getBusinessAnalytics(businessId: string) {
  try {
    return await apiCall(`/analytics/business/${businessId}`);
  } catch (error) {
    console.error('Failed to fetch business analytics:', error);
    return null;
  }
}

// Get platform analytics
export async function getPlatformAnalytics() {
  try {
    return await apiCall('/analytics/platform');
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error);
    return null;
  }
}

// Get all reservations
export async function getAllReservations() {
  try {
    return await apiCall('/analytics/reservations');
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    return null;
  }
}
```

---

### STEP 3: Update Customer App - Track Carousel Clicks

In `/src/app/CustomerApp.tsx`, update carousel click handler:

```typescript
const handleCarouselItemClick = async (item: any) => {
  // Track the click
  await api.trackAdClick(
    item.business_id,
    'carousel',
    userProfile?.email,
    'home'
  );
  
  // Navigate to venue detail
  setSelectedVenueId(item.business_id);
  setCurrentView('detail');
};
```

---

### STEP 4: Add Reservation Modal to Customer App

Create `/src/app/components/ReservationModal.tsx`:

```typescript
import { useState } from 'react';
import { X, Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import * as api from '@/utils/api';

interface ReservationModalProps {
  business: any;
  onClose: () => void;
  userProfile?: any;
}

export function ReservationModal({ business, onClose, userProfile }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: userProfile?.name || '',
    customer_email: userProfile?.email || '',
    customer_phone: userProfile?.phone || '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    special_requests: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.trackReservation({
        business_id: business.id,
        ...formData
      });
      
      alert(`✅ Reservation request sent to ${business.name}!\\n\\nYou'll receive a confirmation shortly.`);
      onClose();
    } catch (error) {
      alert('Failed to make reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Make a Reservation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 p-4 rounded-lg">
            <p className="font-semibold text-lg">{business.name}</p>
            <p className="text-sm text-gray-600">{business.cuisine_types?.join(', ')}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your Name
            </label>
            <Input
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <Input
              type="email"
              required
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </label>
            <Input
              type="tel"
              required
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              placeholder="+27 82 123 4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Party Size
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.party_size}
              onChange={(e) => setFormData({...formData, party_size: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <Input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.reservation_date}
              onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Time
            </label>
            <Input
              type="time"
              required
              value={formData.reservation_time}
              onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={formData.special_requests}
              onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              placeholder="Dietary requirements, seating preferences, etc."
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-500 to-purple-600"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Confirm Reservation'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

### STEP 5: Display Analytics in Admin Dashboard

Update Admin Analytics section to show:

```typescript
// In AdminDashboard.tsx
const [platformAnalytics, setPlatformAnalytics] = useState(null);
const [reservations, setReservations] = useState([]);

useEffect(() => {
  fetchAnalytics();
}, []);

const fetchAnalytics = async () => {
  const analytics = await api.getPlatformAnalytics();
  const reservationsData = await api.getAllReservations();
  
  setPlatformAnalytics(analytics);
  setReservations(reservationsData?.reservations || []);
};

// Display cards showing:
- Total Clicks: {platform_metrics.total_clicks}
- Total Reservations: {platform_metrics.total_reservations}
- Platform CTR: {platform_metrics.platform_ctr}%
- Total Value Created: R{platform_metrics.total_estimated_revenue}
```

---

## 📈 Metrics Calculated:

### For Each Business:
- **Total Views**: How many times their profile was viewed
- **Total Clicks**: How many times their ad/listing was clicked
- **CTR**: (Clicks / Views) × 100
- **Total Reservations**: Number of bookings made
- **Conversion Rate**: (Reservations / Clicks) × 100
- **Estimated Revenue**: Sum of all reservation values

### For Platform (Admin):
- **Platform-wide CTR**: Total clicks / Total views
- **Total Reservations**: All reservations across all businesses
- **Total Value Created**: Sum of all estimated reservation values
- **Top Performing Businesses**: Ranked by revenue generated
- **Conversion Funnel**: Views → Clicks → Reservations

---

## 🎯 Value Metrics:

### Platform Value Dashboard:
```
Total Value Delivered to Businesses: R1,245,000
├─ From Clicks: 8,450 clicks
├─ From Reservations: 3,250 bookings
└─ Avg Value Per Business: R12,450

Conversion Funnel:
View → Click: 5.2% CTR
Click → Reservation: 38.5% conversion
Overall: 2.0% view-to-reservation rate
```

---

## ✅ Testing Checklist:

- [ ] Customer clicks carousel ad → Tracked in analytics
- [ ] Business can see their own CTR in dashboard
- [ ] Admin can see platform-wide CTR
- [ ] Reservation form works
- [ ] Reservation tracked in database
- [ ] Admin can see all reservations
- [ ] Revenue calculations accurate
- [ ] Top performers list works

---

**Status**: Implementation Guide Complete
**Next**: Add these endpoints to server, update frontend components
