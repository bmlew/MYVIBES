# 📍 Distance Filter - User Guide

## **Where Users Set Distance for Establishments**

### **🎯 Access Point:**

**Location:** Customer App Home Screen → Filter Button

1. **Home Screen Search Bar**
   - At the top of the home screen
   - Click the **🎛️ Filter Icon** (slider icon) next to the search bar

2. **Filter Modal Opens**
   - Full modal with all filter options
   - Distance slider is prominently displayed

---

## **📊 Current Distance Filter Settings**

### **Default Configuration:**
```javascript
distance: 5 km (default on first load)
```

### **Range Available:**
- **Minimum:** 1 km
- **Maximum:** 20 km
- **Step:** 1 km increments
- **Default:** 5 km

### **Visual Display:**
```
Distance: 5 km
├─────●──────────────────┤
1 km                  20 km
```

---

## **🎨 User Experience Flow**

### **Step 1: Home Screen**
```
┌─────────────────────────────────────┐
│  🔍 Search...        [🎛️ Filters]   │ ← Click here
└─────────────────────────────────────┘
```

### **Step 2: Filters Modal**
```
╔════════════════════════════════════╗
║  Filters                        [X] ║
╠════════════════════════════════════╣
║                                    ║
║  ☑️ Open Now                       ║
║                                    ║
║  📍 Distance: 5 km                 ║
║  ├─────●──────────────┤            ║
║  1 km              20 km           ║
║                                    ║
║  💰 Price Range: R0 - R500         ║
║  ├─────●──────────────┤            ║
║                                    ║
║  🍽️ Cuisines                       ║
║  [Italian] [Sushi] [Burgers]...    ║
║                                    ║
║  🎉 Event Types                    ║
║  [Live Music] [Happy Hour]...      ║
║                                    ║
╠════════════════════════════════════╣
║  [Reset]           [Apply Filters] ║
╚════════════════════════════════════╝
```

### **Step 3: Results Filtered**
- All businesses beyond the selected distance are hidden
- Only venues within the radius are shown

---

## **💡 How It Works (Technical)**

### **Filter Logic:**
```javascript
// Distance calculation using Haversine formula
const distance = calculateDistance(
  userLocation.latitude,   // User's location
  userLocation.longitude,
  business.latitude,       // Venue location
  business.longitude
);

// Filter out venues beyond selected distance
if (distance <= appliedFilters.distance) {
  // Show this venue
} else {
  // Hide this venue
}
```

### **Distance Calculation:**
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

---

## **🔧 Current Implementation Details**

### **Component:** `SearchFilters.tsx`

```typescript
// Default filter state
const [filters, setFilters] = useState<FilterState>({
  cuisines: [],
  priceRange: [0, 500],
  distance: 5,          // ← Default 5km
  eventTypes: [],
  openNow: false,
});

// Distance slider component
<Slider 
  value={[filters.distance]}
  onValueChange={(val) => setFilters({...filters, distance: val[0]})}
  min={1}
  max={20}
  step={1}
  className="w-full"
/>
```

### **Applied in:** `CustomerApp.tsx`

```typescript
const filteredBusinesses = useMemo(() => {
  let result = businesses;
  
  // ... other filters ...
  
  // Apply distance filter
  if (userLocation && appliedFilters.distance) {
    result = result.filter(b => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.latitude,
        b.longitude
      );
      return distance <= appliedFilters.distance;
    });
  }
  
  return result;
}, [businesses, appliedFilters, userLocation]);
```

---

## **📱 User Location Handling**

### **Default Location:**
```javascript
// Cape Town, South Africa (if geolocation unavailable)
latitude: -33.9249
longitude: 18.4241
```

### **Location Permission Flow:**
1. App loads → Sets default location (Cape Town)
2. Requests browser geolocation permission
3. If granted → Updates to user's actual location
4. Distance filter recalculates from new location
5. Venues re-sort by distance

---

## **🎯 Recommended Improvements**

### **1. Show Distance on Venue Cards**
Currently, distance is calculated but not displayed to users.

**Suggestion:**
```javascript
// Add to venue card display
<div className="text-xs text-gray-500">
  📍 {distance.toFixed(1)} km away
</div>
```

### **2. Sort by Distance Option**
Add sorting option in the filter modal:

```javascript
sortBy: 'distance' | 'rating' | 'popular'
```

### **3. Save Filter Preferences**
Store user's preferred distance in localStorage:

```javascript
localStorage.setItem('preferred_distance', filters.distance);
```

### **4. Quick Distance Presets**
Add quick buttons in the filter modal:

```
[1km]  [5km]  [10km]  [20km]  [Custom: ___]
```

### **5. Map View with Radius**
Show a circular radius on a map view:

```
   User
    🔴
   /   \
  /  5km \
 /         \
🏪         🏪
```

---

## **📊 Usage Statistics (Suggested Analytics)**

Track how users interact with distance filter:

```javascript
// Analytics to add:
- Average distance selected
- % of users who change from default 5km
- Most common distance selections
- Correlation: distance vs booking rate
```

---

## **🚀 Quick Reference**

| Feature | Value |
|---------|-------|
| **Access** | Home Screen → Filter Button (🎛️) |
| **Default** | 5 km |
| **Range** | 1-20 km |
| **Step** | 1 km |
| **Calculation** | Haversine formula (accurate) |
| **User Location** | Geolocation or default Cape Town |
| **Persistence** | Session only (resets on refresh) |

---

## **💬 User Journey Example**

**Scenario:** User in Camps Bay wants dinner nearby

1. Opens MYVIBE app
2. Location detected: Camps Bay, Cape Town
3. Searches for "seafood"
4. Clicks filter button 🎛️
5. Adjusts distance slider: **5km → 2km**
6. Clicks "Apply Filters"
7. Results show only seafood restaurants within 2km
8. User sees: The Codfather (1.2km), Paranga (1.8km)
9. Hidden: Restaurant in Constantia (15km away)

✅ **Result:** Relevant, nearby options only!

---

## **🔍 Related Features**

- **Search Bar** - Text-based filtering
- **Cuisine Filter** - Filter by food type
- **Price Range** - Budget filtering (R0-R1000)
- **Open Now** - Show only currently open venues
- **Event Types** - Filter by event categories

All filters work together in AND logic:
```
Results = Distance ∩ Cuisine ∩ Price ∩ OpenNow ∩ Search
```

---

## **🎨 Design Specs**

### **Filter Button (Home Screen)**
- Icon: `<SlidersHorizontal />` from lucide-react
- Color: Gradient (orange to purple)
- Size: 5x5 (20px × 20px)
- Position: Top right of search bar

### **Distance Slider (Modal)**
- Component: Custom Slider (shadcn/ui)
- Track color: Gray
- Thumb color: Purple gradient
- Label: "Distance: X km"
- Range labels: "1 km" ↔ "20 km"

---

## **✅ Summary**

**Answer:** Users set the distance filter by:
1. **Clicking the filter icon** (🎛️) next to the search bar on the home screen
2. **Adjusting the distance slider** in the filters modal
3. **Clicking "Apply Filters"** to update results

**Default:** 5 km radius from user's location
**Range:** 1-20 km in 1 km increments
**Effect:** Hides all venues beyond selected distance

The feature is **fully functional** and provides accurate distance-based filtering using geolocation! 🚀
