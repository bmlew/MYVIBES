import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Utensils, 
  Bell, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  Home, 
  Calendar, 
  Heart, 
  User 
} from 'lucide-react';
import { CustomerAuthScreen } from './components/CustomerAuthScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { CustomerProfile } from './components/CustomerProfile';
import { CustomerProfileSetup } from './components/CustomerProfileSetup';
import { Input } from './components/ui/input';
import { calculateDistance } from './utils/distance';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDebounce } from '@/hooks/useDebounce';
import * as api from '@/utils/api';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { MyVibesLogo } from './components/MyVibesLogo';

// Import customer app components
import { FilterChip } from './components/FilterChip';
import { SpecialCard } from './components/SpecialCard';
import { VenueCard } from './components/VenueCard';
import { AIRecommendations } from './components/AIRecommendations';
import { VenueDetail } from './components/VenueDetail';
import { OnlineStatusBadge } from './components/OfflineIndicator';
import { SearchFilters } from './components/SearchFilters';
import { ReservationModal } from './components/ReservationModal';
import { DirectionsModal } from './components/DirectionsModal';
import { EventListItem } from './components/EventListItem';
import { FavoriteToggle } from './components/FavoriteToggle';
import { PremiumCarousel } from './components/PremiumCarousel';
import { NotificationCenter } from './components/NotificationCenter';
import { MyReservations } from './components/MyReservations';

import { AffiliatePortal } from './components/AffiliatePortal';

// Constants
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e5e7eb"/%3E%3C/svg%3E';

type View = 'home' | 'search' | 'events' | 'favorites' | 'profile' | 'venue-detail' | 'notifications' | 'reservations' | 'affiliate';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  city?: string;
  notificationPreference?: 'email' | 'whatsapp';
  birthday?: string;
  preferences?: string[];
}

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  cuisine_types?: string[];
  business_type?: string;
  price_range: string;
  logo_url?: string;
  cover_image_url?: string;
  average_rating?: number;
  total_reviews?: number;
  distance?: number;
  is_active?: boolean;
}

interface Special {
  id?: string;
  business_id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  time_end?: string;
  image_url?: string;
  days_of_week?: number[];
  business?: Business;
}

interface Event {
  id?: string;
  business_id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  location?: string;
  business?: Business;
}

export function CustomerApp() {
  console.log('🔵 CustomerApp component rendered');
  
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Check for referral code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      console.log('🔗 Referral code detected:', refCode);
      localStorage.setItem('myvibes_referral_code', refCode);
      // Optional: Track app open with referral
      // api.trackReferralOpen(refCode);
    }
  }, []);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Johannesburg, South Africa');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('palms');
  const [selectedVenueData, setSelectedVenueData] = useState<Business | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    cuisines: [],
    priceRange: [0, 500],
    distance: 5,
    eventTypes: [],
    openNow: false,
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Real data states
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false); // ✅ Start false for instant UI
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const hasInitializedRef = useRef(false); // Prevent double initialization
  const isRequestingLocationRef = useRef(false); // Prevent multiple location requests
  const hasRequestedInitialLocationRef = useRef(false); // Prevent initial location request loop
  const locationNameSetRef = useRef(false); // Track if location name has been successfully set
  const lastLocationSuccessTime = useRef<number>(0); // Track when location last succeeded
  const [reservationInitialData, setReservationInitialData] = useState<{date?: string, time?: string, notes?: string} | undefined>(undefined);

  // User profile states
  // Initialize from localStorage for instant ("Optimistic") auth
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vibespot_customer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // Only show loading if we DON'T have a local profile
  const [authLoading, setAuthLoading] = useState(() => {
    return !localStorage.getItem('vibespot_customer_profile');
  });

  // Authentication Effect
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 Checking authentication state...');
      
      const token = localStorage.getItem('vibespot_session_token');
      const localProfileStr = localStorage.getItem('vibespot_customer_profile');
      
      console.log('📊 Auth Check Results:');
      console.log('  - Session Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
      console.log('  - Local Profile:', localProfileStr ? 'EXISTS' : 'NONE');
      
      // If no token...
      if (!token) {
        // But if we have a local profile, keep the user logged in (Guest/Offline Mode)
        if (localProfileStr) {
          console.log('⚠️ No token found, but profile exists. Maintaining session in offline mode.');
          try {
             // Ensure state matches local storage
             const profile = JSON.parse(localProfileStr);
             setUserProfile(profile);
             console.log('✅ Restored session from localStorage:', profile.username || profile.name);
          } catch (e) {
             // If parse fails, then we must logout
             console.error('❌ Corrupt local profile, logging out.');
             setUserProfile(null);
             localStorage.removeItem('vibespot_customer_profile');
          }
        } else {
          // No token and no profile -> Logout
          console.log('ℹ️ No session found - user needs to log in');
          setUserProfile(null);
        }
        setAuthLoading(false);
        return;
      }

      try {
        console.log('🌐 Validating session with server...');
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/customer/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update profile with latest from server
          setUserProfile(data.customer);
          // Update local storage to keep it fresh
          localStorage.setItem('vibespot_customer_profile', JSON.stringify(data.customer));
          console.log('✅ Auto-logged in as:', data.customer.username);
          console.log('✅ Session validated and refreshed');
        } else {
          // Only log out if specifically unauthorized (401)
          if (response.status === 401) {
            console.log('ℹ️ Session expired, clearing local session');
            localStorage.removeItem('vibespot_session_token');
            localStorage.removeItem('vibespot_customer_profile'); 
            setUserProfile(null);
          } else {
            // Server error or other issue - keep user logged in (offline mode)
            console.warn('⚠️ Server validation failed but keeping local session:', response.status);
            // Use local profile if available
            if (localProfileStr) {
              try {
                const profile = JSON.parse(localProfileStr);
                setUserProfile(profile);
                console.log('✅ Using cached profile in offline mode:', profile.username || profile.name);
              } catch (e) {
                console.error('❌ Failed to parse local profile');
              }
            }
          }
        }
      } catch (err) {
        // Network error - keep user logged in (offline mode)
        console.error('⚠️ Auth check failed (network), working offline:', err);
        // Use local profile if available
        if (localProfileStr) {
          try {
            const profile = JSON.parse(localProfileStr);
            setUserProfile(profile);
            console.log('✅ Using cached profile due to network error:', profile.username || profile.name);
          } catch (e) {
            console.error('❌ Failed to parse local profile');
          }
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    console.log('🔓 Login successful, saving session...');
    console.log('  - User:', user.username || user.name);
    console.log('  - Token:', token.substring(0, 20) + '...');
    
    setUserProfile(user);
    // CRITICAL: Save both token and profile to localStorage for persistence
    localStorage.setItem('vibespot_session_token', token);
    localStorage.setItem('vibespot_customer_profile', JSON.stringify(user));
    
    // Verify it was saved
    const savedToken = localStorage.getItem('vibespot_session_token');
    const savedProfile = localStorage.getItem('vibespot_customer_profile');
    console.log('✅ Session saved to localStorage:');
    console.log('  - Token saved:', !!savedToken);
    console.log('  - Profile saved:', !!savedProfile);
    
    setAuthLoading(false);
    
    // Background sync to ensure admin visibility (legacy support)
    if (user.email) {
      api.saveCustomerProfile({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city || 'Johannesburg'
      }).catch(console.error);
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem('vibespot_session_token');
    localStorage.removeItem('vibespot_customer_profile'); // Ensure complete cleanup
    setCurrentView('home');
  };
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const previousCountRef = useRef(0);

  // Debug: Track component mount/unmount
  useEffect(() => {
    console.log('🟢 CustomerApp MOUNTED');
    return () => {
      console.log('🔴 CustomerApp UNMOUNTED');
    };
  }, []);

  // Live date/time state
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered businesses based on search and filters
  const filteredBusinesses = useMemo(() => {
    let result = businesses;

    // Debug logging
    console.log('🔍 DEBUG - Total businesses loaded:', businesses.length);
    console.log('🔍 DEBUG - All business names:', businesses.map(b => b.name));

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      console.log('🔍 DEBUG - Searching for:', query);
      
      result = result.filter(b => {
        // Debug: Log business data for first result
        if (businesses.indexOf(b) === 0) {
          console.log('🔍 DEBUG - Sample business data:', {
            name: b.name,
            description: b.description,
            cuisine_types: b.cuisine_types,
            city: b.city,
            business_type: b.business_type
          });
        }
        
        const nameMatch = (b.name || '').toLowerCase().includes(query);
        const descMatch = (b.description || '').toLowerCase().includes(query);
        const cuisineMatch = b.cuisine_types?.some(c => c.toLowerCase().includes(query));
        const cityMatch = (b.city || '').toLowerCase().includes(query);
        const typeMatch = (b.business_type || '').toLowerCase().includes(query);
        
        if (nameMatch || descMatch || cuisineMatch || cityMatch || typeMatch) {
          console.log('✅ Match found:', b.name, '- Matched on:', {
            name: nameMatch,
            desc: descMatch,
            cuisine: cuisineMatch,
            city: cityMatch,
            type: typeMatch
          });
        }
        
        return nameMatch || descMatch || cuisineMatch || cityMatch || typeMatch;
      });
      
      console.log('🔍 DEBUG - Search results count:', result.length);
      console.log('🔍 DEBUG - Search results:', result.map(b => b.name));
      
      // When searching, don't apply distance filter to show all matching results
      return result;
    }

    // Apply cuisine filter
    if (appliedFilters.cuisines.length > 0) {
      result = result.filter(b => 
        b.cuisine_types?.some(c => appliedFilters.cuisines.includes(c))
      );
    }

    // Apply price range filter
    const [minPrice, maxPrice] = appliedFilters.priceRange;
    result = result.filter(b => {
      // Convert price range to numeric value for comparison
      const priceValue = b.price_range === '$' ? 50 : 
                        b.price_range === '$$' ? 150 : 
                        b.price_range === '$$$' ? 300 : 450;
      return priceValue >= minPrice && priceValue <= maxPrice;
    });

    // Apply distance filter only when not searching
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
  }, [businesses, debouncedSearchQuery, appliedFilters, userLocation?.latitude, userLocation?.longitude]);

  // Memoized filtered specials
  const filteredSpecials = useMemo(() => {
    if (!debouncedSearchQuery) return specials;
    
    const query = debouncedSearchQuery.toLowerCase();
    return specials.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    );
  }, [specials, debouncedSearchQuery]);

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery) return events;
    
    const query = debouncedSearchQuery.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query)
    );
  }, [events, debouncedSearchQuery]);

  // Memoized callbacks
  const toggleFilter = useCallback((filter: string) => {
    if (filter === 'Cuisine' || filter === 'Price Range' || filter === 'Event Type' || filter === 'Drinks') {
      // Open the filters modal instead of just toggling state
      setShowFiltersModal(true);
    } else {
      setActiveFilters(prev => 
        prev.includes(filter) 
          ? prev.filter(f => f !== filter)
          : [...prev.filter(f => f !== 'All'), filter]
      );
    }
  }, []);

  const toggleFavorite = useCallback((key: string) => {
    setFavorites(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setAppliedFilters(filters);
  }, []);

  const openVenueDetail = useCallback((venueId: string) => {
    // Validate venueId before navigating
    if (!venueId || venueId === 'undefined' || venueId === 'null') {
      console.error('❌ Invalid venueId:', venueId);
      return;
    }
    
    // Handle special IDs - attempt to extract business ID
    if (venueId.startsWith('special-') || venueId.startsWith('special:')) {
      console.warn('⚠️ Special ID detected in navigation:', venueId);
      
      // Try to extract business ID (format: special:business-ID:timestamp)
      // Look for the part that is "business-..."
      // Some IDs might be like business-123 or business-1770649105228
      const businessIdMatch = venueId.match(/(business-[\w-]+)/);
      
      if (businessIdMatch && businessIdMatch[1]) {
        console.log(`✅ Recovered business ID from special ID: ${businessIdMatch[1]}`);
        venueId = businessIdMatch[1];
      } else {
        console.error('❌ Could not recover valid business ID from:', venueId);
        return;
      }
    }
    
    console.log(`📍 Opening venue detail for: ${venueId}`);
    setSelectedVenueId(venueId);
    setCurrentView('venue-detail');
  }, []);

  // Increment special view count
  const incrementSpecialViewCount = useCallback(async (specialId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials/${specialId}/increment-view`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // Silently fail - special might not exist yet or be a placeholder
        const errorText = await response.text();
        if (!errorText.includes('Special not found')) {
          console.warn('Could not increment view count:', errorText);
        }
      } else {
        console.log('✅ View count incremented for special:', specialId);
      }
    } catch (error) {
      // Silently fail - not critical
      console.debug('View count increment skipped:', error);
    }
  }, []);

  // Handle carousel item click (memoized to prevent infinite loops)
  const handleCarouselItemClick = useCallback(async (item: any) => {
    // ALWAYS prioritize item.business_id over item.business?.id to avoid special ID issues
    let businessId = item.business_id || item.business?.id;
    
    // Validate businessId before proceeding
    if (!businessId) {
      console.error('❌ No business ID found in carousel item:', item);
      return;
    }
    
    // Check for special IDs and attempt to recover
    if (businessId.startsWith('special-') || businessId.startsWith('special:')) {
      console.warn('⚠️ Special ID detected in carousel item:', businessId);
      const businessIdMatch = businessId.match(/(business-[\w-]+)/);
      
      if (businessIdMatch && businessIdMatch[1]) {
        console.log(`✅ Recovered business ID: ${businessIdMatch[1]}`);
        businessId = businessIdMatch[1];
      } else {
        console.error('❌ Invalid business ID in carousel (special ID detected):', businessId);
        console.warn('⚠️ Item data:', item);
        return;
      }
    }
    
    if (businessId) {
      // Track the click for analytics
      await api.trackAdClick(
        businessId,
        'carousel',
        userProfile?.email,
        'home'
      );
      
      // Increment view count for specials (only if it's a real special ID, not a placeholder)
      if (item.type === 'special' && item.id && !item.id.startsWith('special-') && !item.id.startsWith('special:')) {
        await incrementSpecialViewCount(item.id);
      }
      openVenueDetail(businessId);
    }
  }, [openVenueDetail, incrementSpecialViewCount]);

  // Function to request location permission
  const requestLocation = useCallback((source = 'unknown', event?: any) => {
    console.log('🔴 requestLocation() CALLED - This should only happen when user clicks button!');
    console.log('🔴 SOURCE:', source);
    console.trace('🔍 Call stack trace:');
    
    // ENHANCED GUARD: Check time since last location success
    const timeSinceLastSuccess = Date.now() - lastLocationSuccessTime.current;
    const hasRecentSuccess = timeSinceLastSuccess < 15000; // Within 15 seconds
    
    // Check pointer coordinates (synthetic clicks often have 0,0)
    const hasValidPointer = event && (
      (event.clientX !== undefined && event.clientX !== 0) || 
      (event.clientY !== undefined && event.clientY !== 0) ||
      event.pointerType === 'mouse' ||
      event.pointerType === 'touch'
    );
    
    console.log('🛡️ ENHANCED GUARD CHECK:', {
      locationNameSetRef: locationNameSetRef.current,
      timeSinceLastSuccess: `${timeSinceLastSuccess}ms`,
      hasRecentSuccess,
      hasValidPointer,
      pointerCoords: event ? `(${event.clientX}, ${event.clientY})` : 'no event',
      pointerType: event?.pointerType || 'unknown',
      activeElement: document.activeElement?.tagName,
      activeElementText: document.activeElement?.textContent?.substring(0, 50),
      closestButton: document.activeElement?.closest('button') ? 'YES' : 'NO'
    });
    
    // Block if location was just set recently AND (no valid pointer OR suspicious activity)
    if (hasRecentSuccess && locationNameSetRef.current) {
      console.log('⚠️ BLOCKED: Suspicious click detected within 15s of location success');
      console.log('⚠️ This appears to be an auto-triggered event, not a real user click');
      return;
    }
    
    // Secondary guard: no button context
    if (locationNameSetRef.current && !document.activeElement?.closest('button')) {
      console.log('⚠️ BLOCKED: requestLocation called without button click after initial location was set');
      return;
    }
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isRequestingLocationRef.current) {
      console.log('⏳ Location request already in progress');
      return;
    }

    isRequestingLocationRef.current = true;
    setLocationName('Detecting location...');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude 
        });
        setLocationError(null);
        isRequestingLocationRef.current = false;
        lastLocationSuccessTime.current = Date.now(); // Record timestamp
        console.log('📍 Location found:', position.coords.latitude, position.coords.longitude);
        
        // Get human-readable location name
        (async () => {
          try {
            const apiKey = 'AIzaSyBvAB6TR_zE_iWF4GG6kF0-T-lnEXNZQj8';
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}`
            );
            const data = await response.json();
            
            console.log('🗺️ Geocoding response:', data);
            
            if (data.status === 'OK' && data.results.length > 0) {
              const result = data.results[0];
              
              // Try to get suburb/locality first
              const locality = result.address_components.find((comp: any) => 
                comp.types.includes('sublocality') || comp.types.includes('locality')
              );
              
              if (locality) {
                setLocationName(locality.long_name);
                console.log('📍 Location name set to:', locality.long_name);
              } else {
                // Fallback to first part of address
                const parts = result.formatted_address.split(',');
                setLocationName(parts[0] || 'Your location');
                console.log('📍 Location name set to:', parts[0] || 'Your location');
              }
            } else {
              setLocationName('Your location');
              console.log('📍 Location name fallback: Your location');
            }
          } catch (error) {
            console.error('🚨 Reverse geocoding error:', error);
            setLocationName('Your location');
          }
        })();
      },
      (error) => {
        const isPolicyError = error.message.includes('permissions policy');
        
        setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
        setLocationName('Johannesburg');
        setLocationError('PERMISSION_DENIED');
        isRequestingLocationRef.current = false;
        
        // Show user-friendly error message
        if (error.code === 1) { // PERMISSION_DENIED
          alert('📍 Location access denied. Please enable location in your browser settings to see nearby venues.');
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          alert('📍 Location unavailable. Please check your device settings.');
        } else if (error.code === 3) { // TIMEOUT
          alert('📍 Location request timed out. Please try again.');
        }
        
        console.log('🚨 LOCATION ERROR:', {
          code: error.code,
          message: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []); // Empty dependencies - stable function

  // Fetch user location once (no live tracking to prevent loops)
  useEffect(() => {
    console.log('🟣 INITIAL LOCATION EFFECT TRIGGERED');
    console.log('🟣 hasRequestedInitialLocationRef.current =', hasRequestedInitialLocationRef.current);
    
    // Prevent running this effect multiple times
    if (hasRequestedInitialLocationRef.current) {
      console.log('⏭️ Skipping duplicate location request');
      return;
    }
    
    hasRequestedInitialLocationRef.current = true;
    isRequestingLocationRef.current = true;
    console.log('📍 Requesting initial location...');
    
    if (navigator.geolocation) {
      // Request location once using WiFi/cellular
      console.log('🌐 navigator.geolocation is available, calling getCurrentPosition...');
      console.log('⏱️ Timeout set to 15000ms (15 seconds)');
      
      // Manual safety timeout in case browser doesn't respect timeout parameter
      const safetyTimeout = setTimeout(() => {
        if (isRequestingLocationRef.current) {
          console.log('⏰ SAFETY TIMEOUT: Geolocation took too long (16s), using fallback');
          setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
          setLocationName('Johannesburg');
          setLocationError('TIMEOUT');
          isRequestingLocationRef.current = false;
          if (!locationNameSetRef.current) {
            locationNameSetRef.current = true;
          }
        }
      }, 16000); // 16 seconds - slightly longer than the 15s timeout
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear safety timeout
          clearTimeout(safetyTimeout);
          
          // Guard against multiple callbacks
          if (!isRequestingLocationRef.current && locationNameSetRef.current) {
            console.log('⚠️ DUPLICATE geolocation callback detected - ignoring');
            return;
          }
          
          // Batch all state updates
          console.log('✅ SUCCESS: Location found:', position.coords.latitude, position.coords.longitude);
          setUserLocation({ 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          });
          setLocationError(null);
          lastLocationSuccessTime.current = Date.now(); // Record timestamp
          // Only set location name if it hasn't been set yet (prevent resets)
          if (!locationNameSetRef.current) {
            locationNameSetRef.current = true;
            
            // Get human-readable location name
            (async () => {
              try {
                const apiKey = 'AIzaSyBvAB6TR_zE_iWF4GG6kF0-T-lnEXNZQj8';
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}`
                );
                const data = await response.json();
                
                console.log('🗺️ Geocoding response:', data);
                
                if (data.status === 'OK' && data.results.length > 0) {
                  const result = data.results[0];
                  
                  // Try to get suburb/locality first
                  const locality = result.address_components.find((comp: any) => 
                    comp.types.includes('sublocality') || comp.types.includes('locality')
                  );
                  
                  if (locality) {
                    setLocationName(locality.long_name);
                    console.log('📍 State updated: locationName =', locality.long_name);
                  } else {
                    // Fallback to first part of address
                    const parts = result.formatted_address.split(',');
                    setLocationName(parts[0] || 'Your location');
                    console.log('📍 State updated: locationName =', parts[0] || 'Your location');
                  }
                } else {
                  setLocationName('Your location');
                  console.log('📍 State updated: locationName = "Your location"');
                }
              } catch (error) {
                console.error('🚨 Reverse geocoding error:', error);
                setLocationName('Your location');
                console.log('📍 State updated: locationName = "Your location"');
              }
            })();
          }
          isRequestingLocationRef.current = false;
        },
        (error) => {
          // Clear safety timeout
          clearTimeout(safetyTimeout);
          
          // Use Johannesburg as fallback
          console.log('❌ ERROR: Location failed', error);
          console.log('❌ ERROR CODE:', error.code, '| MESSAGE:', error.message);
          console.log('❌ ERROR CODES: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT');
          const isPolicyError = error.message.includes('permissions policy');
          
          setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
          setLocationName(isPolicyError ? 'Johannesburg (iframe)' : 'Johannesburg');
          setLocationError(isPolicyError ? null : 'PERMISSION_DENIED');
          isRequestingLocationRef.current = false;
          
          console.log('🚨 LOCATION BLOCKED:', {
            reason: isPolicyError ? 'Iframe/Permissions Policy' : 'User Denied',
            message: error.message,
            code: error.code,
            solution: isPolicyError 
              ? 'Deploy app and access directly (not in iframe)' 
              : 'Grant browser permission in address bar'
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 15000, // 15 seconds - increased to handle slow GPS/network
          maximumAge: 0
        }
      );
    } else {
      console.log('⚠️ Geolocation not supported');
      setUserLocation({ latitude: -26.2041, longitude: 28.0473 });
      setLocationName('Johannesburg');
      setLocationError(null);
      isRequestingLocationRef.current = false;
    }
  }, []);

  // Debug: Track location state changes
  useEffect(() => {
    console.log('📍 Location State Update:');
    console.log('  - locationName:', locationName);
    console.log('  - userLocation:', userLocation);
    console.log('  - locationError:', locationError);
    console.log('  - locationNameSetRef:', locationNameSetRef.current);
  }, [locationName, userLocation, locationError]);

  // Seed database and fetch data on mount - OPTIMIZED FOR FAST LOADING
  useEffect(() => {
    async function initializeData() {
      try {
        // Show UI immediately, load data in background
        setLoading(false);
        setHasInitialized(true);
        
        // Fetch businesses (non-blocking) - Force refresh to ensure suspended businesses are removed
        // Fetch with 50km radius and limit 100 to improve performance (pagination support)
        const businessesData = await api.getBusinesses(userLocation?.latitude, userLocation?.longitude, true, 50, 100);
        
        // Ensure we have an array
        const businessesArray = Array.isArray(businessesData) ? businessesData : [];
        
        // Deduplicate and filter businesses
        const uniqueBusinesses = Array.from(
          new Map(businessesArray.map((b: Business) => [b.id, b])).values()
        );
        
        // Filter: Only show ACTIVE businesses
        const validBusinesses = uniqueBusinesses.filter((b: Business) => {
          // Explicitly exclude "Mr Restaurant" as it is an unapproved test business
          if (b.name === 'Mr Restaurant') return false;
          // Strict check: Must be explicitly active. New businesses default to false.
          return b.is_active === true;
        });
        
        setBusinesses(validBusinesses);
        
        // Initialize favorites - only once from localStorage to prevent loops
        const savedFavorites = localStorage.getItem('myvibe_favorites');
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites));
          } catch (e) {
            console.error('Failed to parse favorites:', e);
          }
        }
        
        // Load specials and events in background (non-blocking)
        Promise.all([
          api.getSpecials(),
          api.getEvents(),
        ]).then(([specialsData, eventsData]) => {
          // Filter specials and events to only show those from ACTIVE businesses
          const activeBusinessIds = new Set(validBusinesses.map(b => b.id));
          
          const activeSpecials = specialsData.filter((s: any) => 
            activeBusinessIds.has(s.business_id)
          );
          
          const activeEvents = eventsData.filter((e: any) => 
            activeBusinessIds.has(e.business_id)
          );
          
          setSpecials(activeSpecials);
          setEvents(activeEvents);
        }).catch(err => {
          console.error('Background load error:', err);
        });
        
        setError(null);
        setHasInitialized(true);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to load venues. Please refresh.');
        setLoading(false);
      }
    }
    
    // Only initialize once when userLocation is available
    // Use latitude/longitude values instead of object reference to prevent re-runs
    if (userLocation && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeData();
    }
  }, [userLocation?.latitude, userLocation?.longitude]); // Depend on values, not object reference

  // Calculate distance to a venue
  const getVenueDistance = (venueId: string): number | undefined => {
    if (!userLocation) return undefined;
    const venue = businesses.find(b => b.id === venueId);
    if (!venue) return undefined;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      venue.latitude,
      venue.longitude
    );
  };

  // Memoize userLocation for AIRecommendations to prevent loops
  // Round coordinates to prevent GPS jitter from triggering re-fetches
  const memoizedAILocation = useMemo(() => {
    if (!userLocation) return undefined;
    const lat = Math.round(userLocation.latitude * 1000) / 1000;
    const lng = Math.round(userLocation.longitude * 1000) / 1000;
    return { lat, lng };
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Function to manually refresh data
  const handleRefresh = async () => {
    if (userLocation) {
      setLoading(true);
      try {
        const [businessesData, specialsData, eventsData] = await Promise.allSettled([
          api.getBusinesses(userLocation.latitude, userLocation.longitude, true, 50, 100),
          api.getSpecials(),
          api.getEvents(),
        ]).then(results => [
          results[0].status === 'fulfilled' ? results[0].value : [],
          results[1].status === 'fulfilled' ? results[1].value : [],
          results[2].status === 'fulfilled' ? results[2].value : [],
        ]);
        
        // Ensure we have arrays
        const businessesArray = Array.isArray(businessesData) ? businessesData : [];
        const specialsArray = Array.isArray(specialsData) ? specialsData : [];
        const eventsArray = Array.isArray(eventsData) ? eventsData : [];
        
        // Deduplicate and filter businesses
        const uniqueBusinesses = Array.from(
          new Map(businessesArray.map((b: Business) => [b.id, b])).values()
        );
        
        // Filter: Only show ACTIVE businesses
        const validBusinesses = uniqueBusinesses.filter((b: Business) => {
          // Explicitly exclude "Mr Restaurant"
          if (b.name === 'Mr Restaurant') return false;
          return b.is_active === true;
        });
        
        if (validBusinesses.length !== businessesArray.length) {
          console.log(`ℹ️ Filtered out ${businessesArray.length - validBusinesses.length} inactive businesses`);
        }
        
        // Filter specials and events to only show those from ACTIVE businesses
        const activeBusinessIds = new Set(validBusinesses.map(b => b.id));
        
        const activeSpecials = specialsArray.filter((s: any) => 
          activeBusinessIds.has(s.business_id)
        );
        
        const activeEvents = eventsArray.filter((e: any) => 
          activeBusinessIds.has(e.business_id)
        );
        
        setBusinesses(validBusinesses);
        setSpecials(activeSpecials);
        setEvents(activeEvents);
        console.log('Data refreshed. Businesses loaded:', uniqueBusinesses.length);
      } catch (err) {
        console.error('Error refreshing data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get nearby businesses (top 3)
  const nearbyBusinesses = businesses;

  // Get today's specials (top 4)
  const todaysSpecials = specials;

  // Get greeting based on time of day (memoized)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Find your vibe this morning';
    if (hour < 17) return 'Find your vibe today';
    return 'Find your vibe tonight';
  }, []); // Only calculate once per session

  // Calculate today's date ONCE (outside useMemo to prevent loops)
  const todayString = useMemo(() => {
    const now = new Date();
    // Format as YYYY-MM-DD for string comparison
    return now.toISOString().split('T')[0];
  }, []); // Only calculate once per session

  // Get upcoming events (top 4) - filter out past events
  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => {
        // Simple string comparison (works because ISO format YYYY-MM-DD)
        return event.event_date >= todayString;
      })
      .slice(0, 4);
  }, [events, todayString]);

  // Memoized premium carousel items - combines top specials and events
  const premiumCarouselItems = useMemo(() => {
    const items: Array<{
      id: string;
      business_id: string;
      title: string;
      description: string;
      image_url?: string;
      type: 'special' | 'event';
      business?: Business;
      discount_percentage?: number;
      time_end?: string;
      days_of_week?: number[];
      event_date?: string;
      start_time?: string;
    }> = [];

    // Add top 3 specials with highest discount or view count
    // Filter out specials with invalid business IDs
    const topSpecials = [...specials]
      .filter(special => {
        const businessId = special.business_id || special.business?.id;
        const isValid = businessId && 
                       !businessId.startsWith('special-') && 
                       !businessId.startsWith('special:');
        if (!isValid) {
          console.warn('⚠️ Skipping special with invalid business_id:', businessId, special);
        }
        return isValid;
      })
      .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      .slice(0, 3)
      .map((special, index) => ({
        id: special.id || `special-temp-${special.business_id}-${index}`,
        business_id: special.business_id,
        title: special.title,
        description: special.description,
        image_url: special.image_url || 'https://images.unsplash.com/photo-1759239938567-3f300909c963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        type: 'special' as const,
        business: special.business,
        discount_percentage: special.discount_percentage,
        time_end: special.time_end,
        days_of_week: special.days_of_week,
      }));

    // Add top 2 upcoming events (string comparison to avoid loops)
    // Filter out events with invalid business IDs
    const topEvents = [...events]
      .filter(event => {
        const businessId = event.business_id || event.business?.id;
        const isValid = businessId && 
                       !businessId.startsWith('special-') && 
                       !businessId.startsWith('special:');
        if (!isValid) {
          console.warn('⚠️ Skipping event with invalid business_id:', businessId, event);
        }
        return isValid && event.event_date && event.event_date >= todayString;
      })
      .sort((a, b) => (a.event_date || '').localeCompare(b.event_date || ''))
      .slice(0, 2)
      .map(event => ({
        id: event.id || `event-${event.business_id}-${event.title}`,
        business_id: event.business_id,
        title: event.title,
        description: event.description,
        image_url: 'https://images.unsplash.com/photo-1761959165302-f75021053512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        type: 'event' as const,
        business: event.business,
        event_date: event.event_date,
        start_time: event.start_time,
      }));

    // Combine specials and events (don't shuffle to prevent infinite loops)
    items.push(...topSpecials, ...topEvents);

    console.log('🎪 Premium Carousel Items:', items);
    
    return items;
  }, [specials, events, todayString]);

  // Load notification preference
  useEffect(() => {
    const notifEnabled = localStorage.getItem('vibespot_notifications_enabled');
    if (notifEnabled !== null) {
      setNotificationsEnabled(notifEnabled === 'true');
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(favorites).length > 0) {
      localStorage.setItem('myvibe_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(timer);
  }, []);

  // Poll for unread notifications and check for sound notifications
  useEffect(() => {
    // Temporarily disabled to debug infinite loop
    // TODO: Re-enable after fixing loop
    return;
    
    /* if (!userProfile?.email || !notificationsEnabled) {
      return;
    }

    let isActive = true;

    const fetchUnreadCount = async () => {
      if (!isActive) return;
      
      try {
        const count = await api.getUnreadNotificationCount(userProfile.email);
        
        if (!isActive) return;
        
        // If count increased, check for new notifications with sound
        if (count > previousCountRef.current && previousCountRef.current > 0) {
          const { notifications } = await api.getNotifications(userProfile.email);
          
          if (!isActive) return;
          
          const soundNotifications = notifications.filter((n: any) => !n.read && n.play_sound);
          
          if (soundNotifications.length > 0) {
            // Dynamically import and play sound
            import('@/utils/notificationSound').then(({ playReminderSound }) => {
              if (isActive) playReminderSound();
            });
          }
        }
        
        previousCountRef.current = count;
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      isActive = false;
      clearInterval(interval);
    }; */
  }, [userProfile?.email, notificationsEnabled]);

  // Listen for notification refresh events
  useEffect(() => {
    const handleRefreshNotifications = async () => {
      if (userProfile?.email) {
        try {
          const count = await api.getUnreadNotificationCount(userProfile.email);
          setUnreadCount(count);
          console.log('🔔 Notifications refreshed, unread count:', count);
        } catch (error) {
          console.error('Failed to refresh notification count:', error);
        }
      }
    };

    // Load initial count
    handleRefreshNotifications();

    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, [userProfile?.email]);

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    // 1. Optimistic Update (Local) - Ensure UI updates immediately
    let currentProfile = userProfile;
    if (currentProfile) {
      currentProfile = { ...currentProfile, ...updatedData };
      setUserProfile(currentProfile);
      localStorage.setItem('vibespot_customer_profile', JSON.stringify(currentProfile));
    }

    try {
      let token = localStorage.getItem('vibespot_session_token');
      
      // 2. Auto-recover session if missing (Silent Auth)
      if (!token && currentProfile?.username) {
         try {
             console.log('🔄 Attempting session recovery...');
             const authUrl = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/customer`;
             
             const headers = {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${publicAnonKey}`
             };

             // Try Login first
             let authResp = await fetch(`${authUrl}/login`, {
                 method: 'POST',
                 headers,
                 body: JSON.stringify({ username: currentProfile.username })
             });

             // If not found, try Register (auto-create shadow account)
             if (authResp.status === 404 && currentProfile.name) {
                 console.log('👤 User not found, registering shadow account...');
                 authResp = await fetch(`${authUrl}/register`, {
                     method: 'POST',
                     headers,
                     body: JSON.stringify({ 
                         username: currentProfile.username,
                         name: currentProfile.name
                     })
                 });
             }

             if (authResp.ok) {
                 const authData = await authResp.json();
                 if (authData.token) {
                     token = authData.token;
                     localStorage.setItem('vibespot_session_token', token);
                     console.log('✅ Session established');
                 }
             }
         } catch (e) {
             console.warn('Session recovery failed:', e);
         }
      }

      // If still no token, we really can't sync.
      if (!token) {
        console.warn('⚠️ Offline mode: Profile saved locally.');
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/customer/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Session-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        // If 401, maybe token expired? 
        if (response.status === 401) {
             console.error('Session expired during update');
             // Don't log out immediately to preserve user data input
        }
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const { customer } = await response.json();
      
      // Confirm server update
      setUserProfile(customer);
      localStorage.setItem('vibespot_customer_profile', JSON.stringify(customer));
      
      // Sync legacy (email based) for admin
      if (customer.email) {
        api.saveCustomerProfile(customer).catch(console.error);
      }
    } catch (err) {
      console.error('Remote update failed:', err);
      // Suppress error to user since local update succeeded
    }
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
  };

  const handleClearProfile = () => {
    if (window.confirm('Are you sure you want to clear your profile? This cannot be undone.')) {
      setUserProfile(null);
      localStorage.removeItem('vibespot_session_token');
      // Also clear legacy items just in case
      localStorage.removeItem('vibespot_customer_profile');
      localStorage.removeItem('vibespot_customer_logged_in');
      setCurrentView('home');
    }
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    await handleUpdateProfile(updatedProfile);
    setShowProfileModal(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // Replaced with Profile Setup (Guest/Name-only flow) - REMOVED per user request for frictionless access
  // if (!userProfile) {
  //   return (
  //     <CustomerProfileSetup 
  //       onComplete={(profile) => handleLoginSuccess(profile, `guest-token-${Date.now()}`)} 
  //     />
  //   );
  // }

  return (
    <div className="h-screen bg-gray-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[812px]">
        
        {/* Venue Detail View - Full Screen */}
        {currentView === 'venue-detail' ? (
          <VenueDetail 
            venueId={selectedVenueId}
            onBack={() => setCurrentView('home')}
            onReserve={(event) => {
              if (event) {
                setReservationInitialData({
                  date: event.event_date,
                  time: event.start_time,
                  notes: `Booking for event: ${event.title}`
                });
              } else {
                setReservationInitialData(undefined);
              }
              setShowReservationModal(true);
            }}
            onGetDirections={() => setShowDirectionsModal(true)}
            onVenueDataLoaded={(business) => setSelectedVenueData(business)}
            isFavorite={favorites[selectedVenueId]}
            onToggleFavorite={() => toggleFavorite(selectedVenueId)}
            userProfile={userProfile}
            locationName={locationName}
          />
        ) : (
          <>
            {/* Status Bar - Hide on profile view */}
            {currentView !== 'profile' && (
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 flex items-center justify-between text-xs flex-shrink-0">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-3 border border-white rounded-sm" />
                  <div className="w-4 h-3 border border-white rounded-sm opacity-70" />
                  <div className="w-4 h-3 border border-white rounded-sm opacity-40" />
                </div>
              </div>
            )}

            {/* App Header - Hide on profile view */}
            {currentView !== 'profile' && (
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MyVibesLogo className="h-10" />
                  </div>
                  {/* Customer Name */}
                  {userProfile && (
                    <div className="text-sm font-medium mt-1 flex items-center gap-2">
                      <User className="w-4 h-4 opacity-80" />
                      <span>{userProfile.name || userProfile.username || 'Guest'}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-xs font-semibold">
                      {currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs opacity-75">
                      {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                  <OnlineStatusBadge />
                  <button 
                    onClick={() => setCurrentView('notifications')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  </div>
                </div>
              </div>

              {/* Location Display */}
              <div className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-full bg-white/20">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">
                    {locationName}
                  </span>
                </div>
                {(!userLocation || locationError === 'PERMISSION_DENIED') && (
                  <button
                    onClick={(e) => {
                      console.log('🔵 Location button clicked');
                      if (!e.isTrusted) {
                        console.log('⛔ BLOCKED: Not a trusted user event!');
                        return;
                      }
                      requestLocation('header-button', e);
                    }}
                    className="text-xs bg-white/30 hover:bg-white/40 px-2 py-1 rounded-full transition-colors flex-shrink-0"
                  >
                    {locationError === 'PERMISSION_DENIED' ? 'Enable' : 'Get Location'}
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-2">
              
              {/* Home View */}
              {currentView === 'home' && (
                <div className="p-4 pb-20">
                  {/* Location Permission Banner */}
                  {locationError === 'PERMISSION_DENIED' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Enable location for nearby venues
                        </p>
                        <p className="text-xs text-amber-700 mb-2">
                          We're showing results for Johannesburg. Enable location to see venues near you.
                        </p>
                        <button
                          onClick={() => {
                            console.log('🟡 ERROR BANNER BUTTON CLICKED - onClick handler fired');
                            requestLocation('error-banner-button');
                          }}
                          className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Enable Location
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter Chips */}
                  <div className="flex gap-2 overflow-x-auto mb-4 pb-2 scrollbar-hide">
                    <FilterChip label="All" active={activeFilters.includes('All')} onClick={() => setActiveFilters(['All'])} />
                    <FilterChip label="Cuisine" active={activeFilters.includes('Cuisine')} onClick={() => toggleFilter('Cuisine')} />
                    <FilterChip label="Drinks" active={activeFilters.includes('Drinks')} onClick={() => toggleFilter('Drinks')} />
                    <FilterChip label="Price Range" active={activeFilters.includes('Price Range')} onClick={() => toggleFilter('Price Range')} />
                    <FilterChip label="Event Type" active={activeFilters.includes('Event Type')} onClick={() => toggleFilter('Event Type')} />
                  </div>

                  {/* Active Filters Display */}
                  {(appliedFilters.distance !== 5 || appliedFilters.cuisines.length > 0) && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {appliedFilters.distance !== 5 && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-xs font-semibold flex items-center gap-2">
                          📍 Within {appliedFilters.distance}km
                          <button 
                            onClick={() => setAppliedFilters({...appliedFilters, distance: 5})}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      {appliedFilters.cuisines.map(cuisine => (
                        <div key={cuisine} className="px-3 py-1.5 bg-purple-100 text-purple-900 rounded-full text-xs font-semibold flex items-center gap-2">
                          {cuisine}
                          <button 
                            onClick={() => setAppliedFilters({
                              ...appliedFilters, 
                              cuisines: appliedFilters.cuisines.filter(c => c !== cuisine)
                            })}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Premium Carousel - Featured Specials & Events */}
                  {premiumCarouselItems.length > 0 && (
                    <div className="mb-4">
                      <PremiumCarousel 
                        items={premiumCarouselItems}
                        onItemClick={handleCarouselItemClick}
                        autoRotateInterval={15000}
                      />
                    </div>
                  )}

                  <h2 className="font-bold mb-3">Today's Specials</h2>
                  
                  {todaysSpecials.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center mb-6">
                      <p className="text-gray-500 text-sm">No specials available at the moment</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto mb-6 pb-2 scrollbar-hide">
                      {todaysSpecials.map((special, index) => {
                        // ALWAYS prioritize business_id field to avoid special ID issues
                        const businessId = special.business_id || special.business?.id;
                        
                        // Validate business ID
                        const isValidBusinessId = businessId && 
                          !businessId.startsWith('special-') && 
                          !businessId.startsWith('special:');
                        
                        // Generate a stable key
                        const stableKey = special.id || `special-today-${businessId || 'unknown'}-${index}`;

                        return (
                          <div 
                            key={stableKey} 
                            onClick={() => {
                              if (!isValidBusinessId) {
                                console.error('❌ Invalid business ID for special:', businessId);
                                console.warn('⚠️ Special data:', special);
                                return;
                              }
                              
                              // Increment view count if special has a real ID (not a placeholder)
                              if (special.id && !special.id.startsWith('special-') && !special.id.startsWith('special:')) {
                                incrementSpecialViewCount(special.id);
                              }
                              openVenueDetail(businessId);
                            }}
                            className="cursor-pointer flex-shrink-0 w-40"
                          >
                            <SpecialCard 
                              image={special.image_url || PLACEHOLDER_IMAGE}
                              title={special.title}
                              venue={special.business?.name || 'Unknown Venue'}
                              endTime={special.time_end || 'N/A'}
                              badge={special.discount_percentage ? `${special.discount_percentage}% OFF` : undefined}
                              distance={businessId ? getVenueDistance(businessId) : undefined}
                              daysOfWeek={special.days_of_week}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <h2 className="font-bold mb-3">Nearby Venues</h2>
                  
                  {nearbyBusinesses.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center mb-6">
                      <p className="text-gray-500 text-sm">No venues found nearby</p>
                    </div>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto mb-8 pb-4 scrollbar-hide">
                      {nearbyBusinesses.map(business => {
                        return (
                          <div key={business.id} onClick={async () => {
                            await api.trackAdClick(business.id, 'nearby_list', userProfile?.email, 'home');
                            openVenueDetail(business.id);
                          }} className="cursor-pointer flex-shrink-0 w-24">
                            <VenueCard 
                              image={business.cover_image_url || PLACEHOLDER_IMAGE}
                              name={business.name}
                              logo={business.logo_url || business.name.charAt(0).toUpperCase()}
                              distance={getVenueDistance(business.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* AI Recommendations Section - Moved to Bottom */}
                  <div className="mt-4 mb-6">
                    <AIRecommendations 
                      userLocation={memoizedAILocation}
                      onVenueClick={openVenueDetail}
                    />
                  </div>
                </div>
              )}

              {/* Search View */}
              {currentView === 'search' && (
                <div className="p-4 pb-20">
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Search menus, venues, events..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <button 
                      className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg" 
                      onClick={() => setShowFiltersModal(true)}
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Show Quick Filters and Popular Searches only when search is empty */}
                  {!searchQuery && (
                    <>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h3 className="font-semibold mb-3 text-sm">Quick Filters</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setSearchQuery('Italian')}
                            className="p-3 border border-gray-200 rounded-lg text-sm hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                          >
                            🍕 Italian
                          </button>
                          <button 
                            onClick={() => setSearchQuery('Sushi')}
                            className="p-3 border border-gray-200 rounded-lg text-sm hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                          >
                            🍣 Sushi
                          </button>
                          <button 
                            onClick={() => setSearchQuery('Burgers')}
                            className="p-3 border border-gray-200 rounded-lg text-sm hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                          >
                            🍔 Burgers
                          </button>
                          <button 
                            onClick={() => setSearchQuery('Cocktails')}
                            className="p-3 border border-gray-200 rounded-lg text-sm hover:border-cyan-500 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                          >
                            🍸 Cocktails
                          </button>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-3 text-sm">Popular Searches</h3>
                      <div className="space-y-2">
                        {['Happy Hour', 'Live Music Tonight', 'Sunday Brunch', 'Wine Tasting'].map(term => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="w-full bg-white rounded-lg p-3 flex items-center justify-between hover:bg-gray-50"
                          >
                            <span className="text-sm">{term}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Show Search Results when there's a query */}
                  {searchQuery && (
                    <div className="space-y-6">
                      {/* Clear Search Button */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                          Search results for "{searchQuery}"
                        </h3>
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-blue-600 font-medium"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Venues Results */}
                      {filteredBusinesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">
                            Venues ({filteredBusinesses.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredBusinesses.slice(0, 5).map(business => (
                              <div
                                key={business.id}
                                onClick={() => openVenueDetail(business.id)}
                                className="bg-white rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                              >
                                <img 
                                  src={business.logo_url || business.cover_image_url || PLACEHOLDER_IMAGE} 
                                  alt={business.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-sm truncate">{business.name}</h5>
                                  <p className="text-xs text-gray-500 truncate">{business.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600">{business.price_range}</span>
                                    {business.cuisine_types && business.cuisine_types.length > 0 && (
                                      <>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-600">{business.cuisine_types[0]}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specials Results */}
                      {filteredSpecials.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">
                            Specials ({filteredSpecials.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredSpecials.slice(0, 5).map(special => {
                              const businessId = special.business_id || special.business?.id;
                              
                              // Validate business ID
                              const isValidBusinessId = businessId && 
                                !businessId.startsWith('special-') && 
                                !businessId.startsWith('special:');
                              
                              return (
                                <div
                                  key={special.id || `special-browse-${special.business_id}-${special.title}-${Date.now()}`}
                                  onClick={() => {
                                    if (!isValidBusinessId) {
                                      console.error('❌ Invalid business ID for special:', businessId);
                                      console.warn('⚠️ Special data:', special);
                                      return;
                                    }
                                    
                                    // Increment view count if special has a real ID (not a placeholder)
                                    if (special.id && !special.id.startsWith('special-') && !special.id.startsWith('special:')) {
                                      incrementSpecialViewCount(special.id);
                                    }
                                    openVenueDetail(businessId);
                                  }}
                                  className="bg-white rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                                >
                                  <img 
                                    src={special.image_url || PLACEHOLDER_IMAGE} 
                                    alt={special.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm truncate">{special.title}</h5>
                                    <p className="text-xs text-gray-500 truncate">{special.business?.name || 'Unknown Venue'}</p>
                                    {special.discount_percentage && (
                                      <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                        {special.discount_percentage}% OFF
                                      </span>
                                    )}
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Events Results */}
                      {filteredEvents.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">
                            Events ({filteredEvents.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredEvents.slice(0, 5).map(event => {
                              const businessId = event.business?.id || event.business_id;
                              const eventDate = new Date(event.event_date);
                              return (
                                <div
                                  key={event.id || `event-${event.business_id}-${event.title}`}
                                  onClick={() => {
                                    if (businessId) {
                                      openVenueDetail(businessId);
                                    }
                                  }}
                                  className="bg-white rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                                >
                                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                                    <span className="text-xs font-semibold">{eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                                    <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm truncate">{event.title}</h5>
                                    <p className="text-xs text-gray-500 truncate">{event.business?.name || 'Unknown Venue'}</p>
                                    <p className="text-xs text-gray-400 mt-1">{event.start_time}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* No Results */}
                      {filteredBusinesses.length === 0 && filteredSpecials.length === 0 && filteredEvents.length === 0 && (
                        <div className="bg-white rounded-lg p-8 text-center">
                          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="font-semibold text-gray-700 mb-2">No results found</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            We couldn't find anything matching "{searchQuery}"
                          </p>
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="text-sm text-blue-600 font-medium"
                          >
                            Clear search
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Events View */}
              {currentView === 'events' && (
                <div className="p-4 pb-20">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold">Upcoming Events</h2>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const eventsData = await api.getEvents();
                          const activeBusinessIds = new Set(businesses.map(b => b.id));
                          const activeEvents = eventsData.filter((e: any) => 
                            activeBusinessIds.has(e.business_id)
                          );
                          setEvents(activeEvents);
                        } catch (err) {
                          console.error('Error refreshing events:', err);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">No upcoming events</p>
                        <p className="text-xs text-gray-400">Check back soon for exciting events!</p>
                      </div>
                    ) : (
                      upcomingEvents.map((event, index) => {
                        const eventDate = new Date(event.event_date);
                        const day = eventDate.getDate().toString();
                        const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                        
                        return (
                        <EventListItem 
                          key={event.id || `event-${event.business_id}-${event.title}-${index}`}
                          day={day}
                          month={month}
                          title={event.title}
                          venue={event.location || event.business?.name || 'Unknown Venue'}
                          eventId={event.id}
                          userId={userProfile?.email}
                          onClick={() => {
                            // Use the business object's ID if available, fallback to business_id
                            const businessId = event.business?.id || event.business_id;
                            if (businessId) {
                              openVenueDetail(businessId);
                            } else {
                              console.error('No valid business ID found for event:', event);
                            }
                          }}
                        />
                      );
                    }))}
                  </div>

                  {/* Subtle Marketing Space */}
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold mb-1">EVENTS NEAR YOU</p>
                    <h3 className="font-bold mb-1">Never Miss Out</h3>
                    <p className="text-xs opacity-90">Enable notifications for your favorite venues</p>
                    <button 
                      onClick={() => {
                        setNotificationsEnabled(true);
                        localStorage.setItem('vibespot_notifications_enabled', 'true');
                        alert('🔔 Notifications enabled! You\'ll be alerted when your favorite venues post new specials or events.');
                      }}
                      className="mt-3 bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50"
                    >
                      {notificationsEnabled ? '✓ Alerts Enabled' : 'Turn On Alerts'}
                    </button>
                  </div>

                  <h3 className="font-semibold mb-3 text-sm">Browse by Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setCurrentView('search');
                        setSearchQuery('Live Music');
                      }}
                      className="p-4 bg-white rounded-lg text-left border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl mb-1">🎵</div>
                      <div className="text-sm font-semibold">Live Music</div>
                      <div className="text-xs text-gray-500">{events.filter(e => e.title.toLowerCase().includes('music') || e.description?.toLowerCase().includes('music')).length} events</div>
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentView('search');
                        setSearchQuery('Wine Tasting');
                      }}
                      className="p-4 bg-white rounded-lg text-left border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl mb-1">🍷</div>
                      <div className="text-sm font-semibold">Wine Tasting</div>
                      <div className="text-xs text-gray-500">{events.filter(e => e.title.toLowerCase().includes('wine') || e.description?.toLowerCase().includes('wine')).length} events</div>
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentView('search');
                        setSearchQuery('Themed');
                      }}
                      className="p-4 bg-white rounded-lg text-left border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="text-sm font-semibold">Themed Nights</div>
                      <div className="text-xs text-gray-500">{events.filter(e => e.title.toLowerCase().includes('theme') || e.title.toLowerCase().includes('night')).length} events</div>
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentView('search');
                        setSearchQuery('Brunch');
                      }}
                      className="p-4 bg-white rounded-lg text-left border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl mb-1">🍳</div>
                      <div className="text-sm font-semibold">Brunch</div>
                      <div className="text-xs text-gray-500">{events.filter(e => e.title.toLowerCase().includes('brunch') || e.description?.toLowerCase().includes('brunch')).length} events</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Favorites View */}
              {currentView === 'favorites' && (
                <div className="p-4 pb-20">
                  <h2 className="font-bold mb-3">Your Favorites</h2>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    {Object.keys(favorites).map(key => (
                      <FavoriteToggle 
                        key={key}
                        name={businesses.find(b => b.id === key)?.name || 'Unknown Venue'} 
                        rating={businesses.find(b => b.id === key)?.average_rating?.toFixed(1) || 'N/A'} 
                        enabled={favorites[key]}
                        onToggle={() => toggleFavorite(key)}
                      />
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <Bell className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Get notified when your favorite venues post new specials
                    </p>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Notify me of new specials</span>
                      <input 
                        type="checkbox" 
                        className="toggle" 
                        checked={notificationsEnabled}
                        onChange={(e) => {
                          setNotificationsEnabled(e.target.checked);
                          localStorage.setItem('vibespot_notifications_enabled', e.target.checked.toString());
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Profile View */}
              {currentView === 'profile' && (
                <div className="p-4 pb-20">
                  {userProfile ? (
                    <CustomerProfile 
                      user={userProfile}
                      onBack={() => setCurrentView('home')}
                      onUpdate={handleUpdateProfile}
                      onLogout={handleLogout}
                      onOpenAffiliate={() => setCurrentView('affiliate')}
                    />
                  ) : (
                        <div className="p-4">
                          {/* Guest Profile Card */}
                          <div className="bg-white rounded-lg p-6 text-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                              ?
                            </div>
                            <h2 className="font-bold mb-1">Welcome to MYVIBES</h2>
                            <p className="text-sm text-gray-600 mb-4">Set up your profile for personalized recommendations and exclusive deals</p>
                            <button 
                              onClick={() => setShowProfileSetup(true)}
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold mb-2 hover:from-cyan-600 hover:to-blue-700"
                            >
                              Set Up Profile
                            </button>
                            <button 
                              onClick={() => setCurrentView('home')}
                              className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50"
                            >
                              Continue as Guest
                            </button>
                          </div>

                          {/* Guest Options */}
                          <div className="space-y-2">
                            <button className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left">
                              <span className="text-sm font-medium">Settings</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <a 
                              href="https://wa.me/27821234567?text=Hi%20MYVIBES%20Support,%20I%20need%20help%20with..."
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white rounded-lg p-4 flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">WhatsApp Support</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </a>
                            <a 
                              href="mailto:help@myvibes.co.za"
                              className="w-full bg-white rounded-lg p-4 flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">Email Support</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </a>
                            <button className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left">
                              <span className="text-sm font-medium">About MYVIBES</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                </div>
              )}

              {/* Affiliate View */}
              {currentView === 'affiliate' && (
                <div className="min-h-screen bg-white">
                  <AffiliatePortal 
                    onBack={() => setCurrentView('profile')} 
                    user={userProfile ? {
                      name: userProfile.name || userProfile.username || 'Valued User',
                      email: userProfile.email,
                      phone: userProfile.mobile
                    } : undefined}
                  />
                </div>
              )}

              {/* Notifications View */}
              {currentView === 'notifications' && (
                <div className="h-full">
                  <NotificationCenter 
                    userId={userProfile?.email || 'guest'}
                    onClose={() => setCurrentView('home')}
                    onNotificationClick={(notification) => {
                      // Navigate to the business if it's a special/event notification
                      if (notification.business_id) {
                        openVenueDetail(notification.business_id);
                      }
                    }}
                  />
                </div>
              )}

              {/* My Reservations View */}
              {currentView === 'reservations' && (
                <div className="h-full">
                  <MyReservations 
                    userId={userProfile?.email || 'guest'}
                    onClose={() => setCurrentView('profile')}
                    onViewBusiness={(businessId) => {
                      openVenueDetail(businessId);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-gray-200 px-2 py-2 pb-safe flex items-center justify-around flex-shrink-0" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentView('home');
                }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs font-medium">Home</span>
              </button>
              <button 
                onClick={() => setCurrentView('search')}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${currentView === 'search' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Search className="w-5 h-5" />
                <span className="text-xs font-medium">Search</span>
              </button>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentView('events');
                }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${currentView === 'events' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-medium">Events</span>
              </button>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentView('favorites');
                }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${currentView === 'favorites' ? 'text-blue-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs font-medium">Favorites</span>
              </button>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentView('profile');
                }}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${currentView === 'profile' ? 'text-purple-600 font-semibold' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Profile</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showFiltersModal && (
        <SearchFilters 
          onClose={() => setShowFiltersModal(false)}
          onApply={handleApplyFilters}
        />
      )}

      {showReservationModal && selectedVenueData && (
        <ReservationModal 
          business={selectedVenueData}
          onClose={() => setShowReservationModal(false)}
          userProfile={userProfile}
          initialData={reservationInitialData}
        />
      )}

      {showDirectionsModal && (
        <DirectionsModal 
          onClose={() => setShowDirectionsModal(false)}
          venueName={selectedVenueData?.name || 'Restaurant'}
          address={selectedVenueData ? `${selectedVenueData.address}, ${selectedVenueData.city}` : 'Address not available'}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          initialProfile={userProfile || undefined}
        />
      )}
      
      {/* Customer Profile Setup - First Time */}
      {showProfileSetup && (
        <CustomerProfileSetup
          onComplete={() => {
            console.log('🎉 CustomerProfileSetup onComplete called');
            setShowProfileSetup(false);
            // Reload profile from localStorage
            const storedProfile = localStorage.getItem('vibespot_customer_profile');
            const isLoggedIn = localStorage.getItem('vibespot_customer_logged_in');
            console.log('📖 Reading from localStorage - Profile:', storedProfile, 'LoggedIn:', isLoggedIn);
            
            if (storedProfile) {
              const parsedProfile = JSON.parse(storedProfile);
              setUserProfile(parsedProfile);
              console.log('✅ User profile set in state:', parsedProfile);
            } else {
              console.warn('⚠️ No profile found in localStorage after setup');
            }
          }}
        />
      )}
    </div>
  );
}

export default CustomerApp;