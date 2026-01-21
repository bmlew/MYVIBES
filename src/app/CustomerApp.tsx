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
import { DebugPanel } from './components/DebugPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { CustomerProfile } from './components/CustomerProfile';
import { CustomerProfileSetup } from './components/CustomerProfileSetup';
import { Input } from './components/ui/input';
import { calculateDistance } from './utils/distance';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDebounce } from '@/hooks/useDebounce';
import * as api from '@/utils/api';
import { projectId, publicAnonKey } from '/utils/supabase/info';

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

type View = 'home' | 'search' | 'events' | 'favorites' | 'profile' | 'venue-detail' | 'notifications' | 'reservations';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  notificationPreference?: 'email' | 'whatsapp';
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
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

  // User profile states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Notification states
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

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.cuisine_types?.some(c => c.toLowerCase().includes(query))
      );
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
    const businessId = item.business?.id || item.business_id;
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
  const requestLocation = useCallback((source = 'unknown') => {
    console.log('🔴 requestLocation() CALLED - This should only happen when user clicks button!');
    console.log('🔴 SOURCE:', source);
    console.trace('🔍 Call stack trace:');
    
    // GUARD: Prevent auto-calls by checking if this is a genuine user interaction
    // If the initial location was already set, this should only run on explicit user action
    console.log('🛡️ GUARD CHECK:', {
      locationNameSetRef: locationNameSetRef.current,
      activeElement: document.activeElement?.tagName,
      activeElementText: document.activeElement?.textContent?.substring(0, 50),
      closestButton: document.activeElement?.closest('button') ? 'YES' : 'NO'
    });
    
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
        setLocationName('Your location');
        isRequestingLocationRef.current = false;
        console.log('📍 Location found:', position.coords.latitude, position.coords.longitude);
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
          // Only set location name if it hasn't been set yet (prevent resets)
          if (!locationNameSetRef.current) {
            setLocationName('Your location');
            locationNameSetRef.current = true;
          }
          isRequestingLocationRef.current = false;
          console.log('📍 State updated: locationName = "Your location"');
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

  // Debug: Track locationName changes
  useEffect(() => {
    console.log('🏷️ locationName changed to:', locationName);
  }, [locationName]);

  // Seed database and fetch data on mount - OPTIMIZED FOR FAST LOADING
  useEffect(() => {
    async function initializeData() {
      try {
        // Show UI immediately, load data in background
        setLoading(false);
        setHasInitialized(true);
        
        // Fetch businesses (non-blocking)
        const businessesData = await api.getBusinesses(userLocation?.latitude, userLocation?.longitude);
        
        // Deduplicate and filter businesses
        const uniqueBusinesses = Array.from(
          new Map(businessesData.map((b: Business) => [b.id, b])).values()
        );
        
        // Filter: Only show ACTIVE businesses
        const validBusinesses = uniqueBusinesses.filter((b: Business) => {
          const isActive = b.is_active !== false; // Default to true if not specified
          return isActive;
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
    if (userLocation && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeData();
    }
  }, [userLocation]);

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
  const memoizedAILocation = useMemo(() => {
    if (!userLocation) return undefined;
    return { lat: userLocation.latitude, lng: userLocation.longitude };
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Function to manually refresh data
  const handleRefresh = async () => {
    if (userLocation) {
      setLoading(true);
      try {
        const [businessesData, specialsData, eventsData] = await Promise.allSettled([
          api.getBusinesses(userLocation.latitude, userLocation.longitude),
          api.getSpecials(),
          api.getEvents(),
        ]).then(results => [
          results[0].status === 'fulfilled' ? results[0].value : [],
          results[1].status === 'fulfilled' ? results[1].value : [],
          results[2].status === 'fulfilled' ? results[2].value : [],
        ]);
        
        // Deduplicate businesses by ID to prevent React key warnings
        const uniqueBusinesses = Array.from(
          new Map(businessesData.map((b: Business) => [b.id, b])).values()
        );
        
        if (uniqueBusinesses.length !== businessesData.length) {
          console.warn(`⚠️ Removed ${businessesData.length - uniqueBusinesses.length} duplicate businesses on refresh`);
        }
        
        setBusinesses(uniqueBusinesses);
        setSpecials(specialsData);
        setEvents(eventsData);
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
    const topSpecials = [...specials]
      .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      .slice(0, 3)
      .map(special => ({
        id: special.id || `special-${special.business_id}-${special.title}`,
        business_id: special.business_id,
        title: special.title,
        description: special.description,
        image_url: special.image_url,
        type: 'special' as const,
        business: special.business,
        discount_percentage: special.discount_percentage,
        time_end: special.time_end,
        days_of_week: special.days_of_week,
      }));

    // Add top 2 upcoming events (string comparison to avoid loops)
    const topEvents = [...events]
      .filter(event => event.event_date >= todayString)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, 2)
      .map(event => ({
        id: event.id || `event-${event.business_id}-${event.title}`,
        business_id: event.business_id,
        title: event.title,
        description: event.description,
        image_url: undefined, // Events don't have images in current schema, but could be added
        type: 'event' as const,
        business: event.business,
        event_date: event.event_date,
        start_time: event.start_time,
      }));

    // Combine specials and events (don't shuffle to prevent infinite loops)
    items.push(...topSpecials, ...topEvents);

    return items;
  }, [specials, events, todayString]);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('vibespot_customer_profile');
    const isLoggedIn = localStorage.getItem('vibespot_customer_logged_in');
    const notifEnabled = localStorage.getItem('vibespot_notifications_enabled');
    
    // Load notification preference
    if (notifEnabled !== null) {
      setNotificationsEnabled(notifEnabled === 'true');
    }
    
    if (storedProfile && isLoggedIn === 'true') {
      setUserProfile(JSON.parse(storedProfile));
      console.log('✅ User profile loaded from localStorage:', JSON.parse(storedProfile));
    } else {
      // Show profile modal after a short delay if no profile exists
      const timer = setTimeout(() => {
        setShowProfileSetup(true);
      }, 2000);
      return () => clearTimeout(timer);
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

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('vibespot_customer_profile', JSON.stringify(profile));
    localStorage.setItem('vibespot_customer_logged_in', 'true');
    console.log('✅ User profile saved:', profile);
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
  };

  const handleClearProfile = () => {
    setUserProfile(null);
    localStorage.removeItem('vibespot_customer_profile');
    localStorage.removeItem('vibespot_customer_logged_in');
    console.log('🗑️ User profile cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '812px' }}>
        
        {/* Venue Detail View - Full Screen */}
        {currentView === 'venue-detail' ? (
          <VenueDetail 
            venueId={selectedVenueId}
            onBack={() => setCurrentView('home')}
            onReserve={() => setShowReservationModal(true)}
            onGetDirections={() => setShowDirectionsModal(true)}
            onVenueDataLoaded={(business) => setSelectedVenueData(business)}
            isFavorite={favorites[selectedVenueId]}
            onToggleFavorite={() => toggleFavorite(selectedVenueId)}
          />
        ) : (
          <>
            {/* Status Bar */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 flex items-center justify-between text-xs flex-shrink-0">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-3 border border-white rounded-sm" />
                <div className="w-4 h-3 border border-white rounded-sm opacity-70" />
                <div className="w-4 h-3 border border-white rounded-sm opacity-40" />
              </div>
            </div>

            {/* App Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="w-5 h-5" />
                    <h1 className="text-xl font-bold">MYVIBES</h1>
                  </div>
                  <p className="text-xs opacity-90">{greeting}</p>
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

              {/* Location */}
              <button 
                onClick={(e) => {
                  console.log('🔵 HEADER BUTTON CLICKED - onClick handler fired');
                  console.log('📊 Event details:', {
                    isTrusted: e.isTrusted,
                    type: e.type,
                    eventPhase: e.eventPhase,
                    timeStamp: e.timeStamp,
                    detail: e.detail
                  });
                  
                  // BLOCK if not a trusted user event
                  if (!e.isTrusted) {
                    console.log('⛔ BLOCKED: Not a trusted user event!');
                    return;
                  }
                  
                  requestLocation('header-button');
                }}
                className={`flex items-center gap-2 text-sm mb-4 px-3 py-1.5 rounded-full transition-colors ${
                  locationError === 'PERMISSION_DENIED' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>{locationName || 'Detecting location...'}</span>
                {locationError === 'PERMISSION_DENIED' && (
                  <span className="text-xs ml-1">(tap to enable)</span>
                )}
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Home View */}
              {currentView === 'home' && (
                <div className="p-4">
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
                      {todaysSpecials.map(special => {
                        // Use the business object's ID if available, fallback to business_id
                        const businessId = special.business?.id || special.business_id;
                        
                        return (
                          <div 
                            key={special.id || `special-${special.business_id}-${special.title}`} 
                            onClick={() => {
                              if (businessId) {
                                // Increment view count if special has a real ID (not a placeholder)
                                if (special.id && !special.id.startsWith('special-') && !special.id.startsWith('special:')) {
                                  incrementSpecialViewCount(special.id);
                                }
                                openVenueDetail(businessId);
                              } else {
                                console.error('No valid business ID found for special:', special);
                              }
                            }} 
                            className="cursor-pointer flex-shrink-0 w-40"
                          >
                            <SpecialCard 
                              image={special.image_url || 'https://via.placeholder.com/150'}
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
                    <div className="flex gap-3 overflow-x-auto mb-6 pb-2 scrollbar-hide">
                      {nearbyBusinesses.map(business => {
                        return (
                          <div key={business.id} onClick={async () => {
                            await api.trackAdClick(business.id, 'nearby_list', userProfile?.email, 'home');
                            openVenueDetail(business.id);
                          }} className="cursor-pointer flex-shrink-0 w-24">
                            <VenueCard 
                              image={business.cover_image_url || 'https://via.placeholder.com/150'}
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
                  <div className="mb-4">
                    <AIRecommendations 
                      userLocation={memoizedAILocation}
                      onVenueClick={openVenueDetail}
                    />
                  </div>
                </div>
              )}

              {/* Search View */}
              {currentView === 'search' && (
                <div className="p-4">
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
                                  src={business.logo_url || business.cover_image_url || 'https://via.placeholder.com/50'} 
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
                              const businessId = special.business?.id || special.business_id;
                              return (
                                <div
                                  key={special.id || `special-${special.business_id}-${special.title}`}
                                  onClick={() => {
                                    if (businessId) {
                                      // Increment view count if special has a real ID (not a placeholder)
                                      if (special.id && !special.id.startsWith('special-') && !special.id.startsWith('special:')) {
                                        incrementSpecialViewCount(special.id);
                                      }
                                      openVenueDetail(businessId);
                                    }
                                  }}
                                  className="bg-white rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                                >
                                  <img 
                                    src={special.image_url || 'https://via.placeholder.com/50'} 
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
                <div className="p-4">
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
                      upcomingEvents.map(event => {
                        const eventDate = new Date(event.event_date);
                        const day = eventDate.getDate().toString();
                        const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                        
                        return (
                        <EventListItem 
                          key={event.id || event.business_id}
                          day={day}
                          month={month}
                          title={event.title}
                          venue={event.business?.name || 'Unknown Venue'}
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
                <div className="p-4">
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
                <div className="p-4">
                  {userProfile ? (
                    <>
                      {/* User Profile Card */}
                      <div className="bg-white rounded-lg p-6 text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                          {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-bold text-lg mb-1">{userProfile.name}</h2>
                        <p className="text-sm text-gray-600 mb-1">{userProfile.email}</p>
                        <p className="text-sm text-gray-600 mb-4">{userProfile.mobile}</p>
                        <button 
                          onClick={handleEditProfile}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold mb-2 hover:from-cyan-600 hover:to-blue-700"
                        >
                          Edit Profile
                        </button>
                      </div>

                      {/* Profile Options */}
                      <div className="space-y-2">
                        <button 
                          onClick={() => setCurrentView('reservations')}
                          className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium">My Reservations</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          onClick={() => setCurrentView('notifications')}
                          className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors relative"
                        >
                          <span className="text-sm font-medium">Notifications</span>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                        <button 
                          onClick={() => alert('💬 Help & Support\n\n📧 Email: support@vibespot.co.za\n📱 WhatsApp: +27 82 123 4567\n🕐 Hours: Mon-Fri 9AM-5PM SAST\n\nWe\'re here to help!')}
                          className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium">Help & Support</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          onClick={() => alert('🎉 VIBESPOT\n\nVersion 1.0.0\n\nDiscover dining and entertainment in real-time. Connect with the best restaurants and hotels in South Africa.\n\n© 2026 VIBESPOT. All rights reserved.\n\nMade with ❤️ in South Africa')}
                          className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium">About VIBESPOT</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          onClick={handleClearProfile}
                          className="w-full bg-white rounded-lg p-4 flex items-center justify-between text-left text-red-600"
                        >
                          <span className="text-sm font-medium">Clear Profile</span>
                          <ChevronRight className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
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
                        <button className="w-full border-2 border-gray-300 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50">
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
                    </>
                  )}
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
            <div className="bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around flex-shrink-0">
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


      
      {/* Debug Panel */}
      <DebugPanel 
        businessCount={businesses.length} 
        onRefresh={handleRefresh} 
      />
    </div>
  );
}