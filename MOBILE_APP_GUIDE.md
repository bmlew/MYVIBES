# 📱 VIBESPOT Mobile Apps (iOS & Android)

## Quick Start Guide - React Native

### **Why React Native?**
- ✅ **Single Codebase:** 95% code sharing between iOS & Android
- ✅ **Same Stack:** React + TypeScript (your existing team)
- ✅ **Fast Development:** Reuse 70% of web components
- ✅ **Native Performance:** Hermes JavaScript engine
- ✅ **Cost Effective:** 1 dev team instead of 2 (iOS + Android)

---

## 🚀 **Setup (30 minutes)**

### **1. Install Prerequisites**
```bash
# Install Node.js (if not already)
brew install node

# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (for building)
npm install -g eas-cli
```

### **2. Create React Native Project**
```bash
# Create new Expo project
npx create-expo-app vibespot-mobile --template

# Navigate to project
cd vibespot-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @supabase/supabase-js
npm install react-native-maps
npm install @react-native-async-storage/async-storage
npm install expo-location
npm install @tanstack/react-query
```

### **3. Project Structure**
```
vibespot-mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Discover tab
│   │   ├── SpecialsScreen.tsx # Today's Specials
│   │   ├── EventsScreen.tsx   # Upcoming Events
│   │   ├── FavoritesScreen.tsx # Saved venues
│   │   └── VenueDetailScreen.tsx
│   ├── components/
│   │   ├── VenueCard.tsx      (copy from web)
│   │   ├── SpecialCard.tsx    (copy from web)
│   │   └── EventCard.tsx      (copy from web)
│   ├── api/
│   │   └── client.ts          # API client
│   ├── utils/
│   │   └── distance.ts        (copy from web)
│   └── hooks/
│       ├── useLocation.ts
│       └── useBusinesses.ts
└── assets/
```

---

## 📝 **Core Files**

### **`App.tsx`** - Main Entry Point
```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home, Star, Calendar, Heart } from 'lucide-react-native';

import HomeScreen from './src/screens/HomeScreen';
import SpecialsScreen from './src/screens/SpecialsScreen';
import EventsScreen from './src/screens/EventsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#8B5CF6',
            tabBarInactiveTintColor: '#94A3B8',
          }}
        >
          <Tab.Screen
            name="Discover"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            }}
          />
          <Tab.Screen
            name="Specials"
            component={SpecialsScreen}
            options={{
              tabBarIcon: ({ color }) => <Star size={24} color={color} />,
            }}
          />
          <Tab.Screen
            name="Events"
            component={EventsScreen}
            options={{
              tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

### **`src/api/client.ts`** - API Client
```tsx
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://skpkuhhvcslzdopfccxo.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_URL = `${SUPABASE_URL}/functions/v1/make-server-175b2872`;

export const api = {
  async fetchNearbyBusinesses(lat: number, lng: number, radius = 10) {
    const response = await fetch(
      `${API_URL}/businesses?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      }
    );
    return response.json();
  },
  
  async fetchSpecials() {
    const response = await fetch(`${API_URL}/specials`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    return response.json();
  },
  
  async fetchEvents() {
    const response = await fetch(`${API_URL}/events`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    return response.json();
  },
};
```

### **`src/hooks/useLocation.ts`** - Location Hook
```tsx
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission denied');
        // Fallback to Sandton
        setLocation({ latitude: -26.107168, longitude: 28.055836 });
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    })();
  }, []);

  return { location, error };
}
```

### **`src/screens/HomeScreen.tsx`** - Main Screen
```tsx
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '../hooks/useLocation';
import { api } from '../api/client';
import VenueCard from '../components/VenueCard';

export default function HomeScreen({ navigation }) {
  const { location } = useLocation();
  
  const { data, isLoading } = useQuery({
    queryKey: ['businesses', location],
    queryFn: () => {
      if (!location) return [];
      return api.fetchNearbyBusinesses(location.latitude, location.longitude);
    },
    enabled: !!location,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            onPress={() => navigation.navigate('VenueDetail', { venue: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
```

### **`src/components/VenueCard.tsx`** - Venue Card
```tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

export default function VenueCard({ venue, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: venue.logo_url || 'https://via.placeholder.com/300' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.cuisine}>{venue.cuisine_types?.join(' • ')}</Text>
        <View style={styles.footer}>
          <View style={styles.location}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.distance}>{venue.distance_km}km away</Text>
          </View>
          <Text style={styles.price}>{'$'.repeat(venue.price_range)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#64748B',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
});
```

---

## 🏗️ **Build & Deploy**

### **1. Configure app.json**
```json
{
  "expo": {
    "name": "VIBESPOT",
    "slug": "vibespot",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vibespot.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.vibespot.app"
    }
  }
}
```

### **2. Build for iOS**
```bash
# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### **3. Build for Android**
```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

---

## 📦 **App Store Assets**

### **Required Assets:**

**iOS:**
- App Icon: 1024×1024 PNG
- Screenshots: 6.5" iPhone (1284×2778), 5.5" iPhone (1242×2208)
- iPad Screenshots: 12.9" (2048×2732)

**Android:**
- App Icon: 512×512 PNG
- Feature Graphic: 1024×500 PNG
- Screenshots: At least 2 (720×1280 min)

### **App Store Listing:**

**Name:** VIBESPOT - Find Dining & Events

**Subtitle:** Discover nearby restaurants, specials, and events in real-time

**Description:**
```
VIBESPOT connects you with the best dining and entertainment experiences near you.

✨ FEATURES:
• Real-time distance to venues
• Today's specials with countdown timers
• Upcoming events calendar
• Save your favorite places
• Get directions instantly
• Browse menus and photos

🍽️ PERFECT FOR:
• Finding tonight's dinner spot
• Discovering happy hour specials
• Planning weekend activities
• Exploring new restaurants

📍 SOUTH AFRICA:
Currently available in Sandton, Johannesburg with plans to expand nationwide.

Download now and never miss out on great food and events again!
```

**Keywords:** restaurant, dining, food, events, specials, nightlife, Johannesburg, Sandton

---

## 🧪 **Testing**

### **1. Test on Simulator**
```bash
# iOS
npm run ios

# Android
npm run android
```

### **2. Test on Real Device (Expo Go)**
```bash
npm start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app
```

### **3. Production Build Testing**
```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

---

## 💰 **Costs**

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Account | $99 | Annual |
| Google Play Console | $25 | One-time |
| Expo EAS Build (optional) | $29-99 | Monthly |
| **Total Minimum** | **$124** | First year |

**Note:** You can build locally for free instead of using EAS Build.

---

## 📈 **Timeline**

| Week | Task | Hours |
|------|------|-------|
| 1 | Setup project, navigation, API integration | 20 |
| 2 | Build core screens (Home, Specials, Events) | 20 |
| 3 | Geolocation, maps, favorites | 20 |
| 4 | UI polish, animations, testing | 20 |
| 5 | iOS build & App Store submission | 10 |
| 6 | Android build & Play Store submission | 10 |
| **Total** | **6 weeks** | **100 hours** |

**⏰ Why 6-8 weeks?** See `/MOBILE_APP_TIMELINE_BREAKDOWN.md` for detailed explanation.

**Key Insight:** The 6-8 week timeline includes:
- ✅ 100 hours of active development (12.5 days)
- ⏳ 7-14 days of mandatory waiting (store reviews, build times, account approvals)
- 🔄 Buffer for rejections & bug fixes

**You cannot skip the waiting period - Apple/Google review times are beyond your control!**

---

## ✅ **Checklist**

**Setup:**
- [ ] Install Expo CLI
- [ ] Create React Native project
- [ ] Install dependencies
- [ ] Configure app.json

**Development:**
- [ ] Implement navigation
- [ ] Build Home screen with geolocation
- [ ] Build Specials screen
- [ ] Build Events screen
- [ ] Build Favorites screen
- [ ] Implement offline caching

**iOS:**
- [ ] Create app icon & splash screen
- [ ] Test on iOS simulator
- [ ] Create Apple Developer account
- [ ] Build for iOS
- [ ] Submit to App Store

**Android:**
- [ ] Create app icon & assets
- [ ] Test on Android emulator
- [ ] Create Google Play account
- [ ] Build for Android
- [ ] Submit to Google Play

---

**You can reuse 70% of your existing web code! 🚀**

Most components (VenueCard, SpecialCard, EventCard, distance utils) work with minimal changes.