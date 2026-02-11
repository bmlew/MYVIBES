import { projectId, publicAnonKey } from '/utils/supabase/info';
import { saveToCache, getFromCache, updateLastSync, STORAGE_KEYS } from './offlineStorage';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

// In-memory cache for rapid reads (reduces localStorage access)
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const MEMORY_CACHE_TTL = 5000; // Reduced to 5 seconds to ensure freshness during testing

// Request deduplication map to prevent duplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();

// Helper function to get from memory cache
function getFromMemoryCache(key: string) {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

// Helper function to set memory cache
function setMemoryCache(key: string, data: any) {
  memoryCache.set(key, { data, timestamp: Date.now() });
  
  // Clear old cache entries to prevent memory leaks
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
}

// Helper function to make API calls with offline support and request deduplication
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const cacheKey = `${endpoint}_${JSON.stringify(options.body || {})}`;
  
  // Check memory cache first for GET requests
  const cachedData = getFromMemoryCache(cacheKey);
  if (cachedData && (!options.method || options.method === 'GET')) {
    return cachedData;
  }
  
  // Check if there's already a pending request for this endpoint
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }
  
  const requestPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 second timeout
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      
      // Cache GET requests in memory
      if (!options.method || options.method === 'GET') {
        setMemoryCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      // Don't log AbortError to console - it's expected for timeouts
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('API call failed:', endpoint, error);
      }
      throw error;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
}

// Seed the database (call once on first load)
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    const result = await apiCall('/seed', { method: 'POST' });
    console.log('✅ Database seeded successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    // Don't throw - allow app to work with cached data
    return null;
  }
}

// Get all businesses with offline support
export async function getBusinesses(lat?: number, lng?: number, forceRefresh: boolean = false) {
  const params = new URLSearchParams();
  if (lat) params.append('lat', lat.toString());
  if (lng) params.append('lng', lng.toString());
  if (forceRefresh) params.append('_t', Date.now().toString());
  
  const queryString = params.toString();
  
  try {
    const response = await apiCall(`/kv/businesses${queryString ? `?${queryString}` : ''}`);
    
    // Handle paginated response format (new Postgres API)
    const data = response.businesses ? response.businesses : (response.data ? response.data : response);
    
    // Ensure we return an array
    const businessesArray = Array.isArray(data) ? data : [];
    
    // Cache successful response
    saveToCache(STORAGE_KEYS.BUSINESSES, businessesArray);
    updateLastSync();
    return businessesArray;
  } catch (error) {
    console.warn('Using cached businesses data');
    // Return cached data if available
    const cachedData = getFromCache(STORAGE_KEYS.BUSINESSES);
    return cachedData || [];
  }
}

// Get business by ID with offline support
export async function getBusinessById(id: string, forceRefresh: boolean = false) {
  // Validate ID before making any calls
  if (!id || id === 'undefined' || id === 'null') {
    console.error('❌ Invalid business ID (empty or null):', id);
    return null;
  }
  
  // Reject special IDs or malformed IDs
  if (id.startsWith('special-') || id.startsWith('special:')) {
    console.error('❌ Invalid business ID (special ID detected):', id);
    console.warn('⚠️ Cannot fetch business with a special ID');
    return null;
  }
  
  const cacheKey = `${STORAGE_KEYS.BUSINESSES}_${id}`;
  
  // If force refresh, skip cache and fetch fresh data
  if (forceRefresh) {
    console.log(`🔄 Force refreshing business data for: ${id}`);
    try {
      // Add timestamp to URL to bypass browser/CDN cache
      const timestamp = new Date().getTime();
      const data = await apiCall(`/kv/businesses/${id}?_=${timestamp}`);
      saveToCache(cacheKey, data);
      console.log(`✅ Successfully refreshed business: ${data.business?.name || id}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to force refresh business ${id}:`, error);
      return null;
    }
  }
  
  try {
    console.log(`🔍 Fetching business with ID: ${id}`);
    // Add timestamp to URL to bypass stale cache
    const timestamp = new Date().getTime();
    const data = await apiCall(`/kv/businesses/${id}?_=${timestamp}`);
    // Cache individual business data
    saveToCache(cacheKey, data);
    console.log(`✅ Successfully fetched business: ${data.business?.name || id}`);
    return data;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch business ${id}, checking cache...`, error);
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`📦 Using cached business data for: ${id}`);
      return cachedData;
    }
    
    console.error(`❌ No cached data available for business: ${id}`);
    return null;
  }
}

// Get all specials with offline support
export async function getSpecials() {
  try {
    const data = await apiCall('/kv/specials');
    const specials = data.specials || data.data || [];
    saveToCache(STORAGE_KEYS.SPECIALS, specials);
    updateLastSync();
    return specials;
  } catch (error) {
    console.warn('Using cached specials data');
    const cachedData = getFromCache(STORAGE_KEYS.SPECIALS);
    return cachedData || [];
  }
}

// Get all events with offline support
export async function getEvents() {
  try {
    const data = await apiCall('/kv/events');
    const events = data.events || data.data || [];
    saveToCache(STORAGE_KEYS.EVENTS, events);
    updateLastSync();
    return events;
  } catch (error) {
    console.warn('Using cached events data');
    const cachedData = getFromCache(STORAGE_KEYS.EVENTS);
    return cachedData || [];
  }
}

// Get AI recommendations with offline support
export async function getRecommendations(lat?: number, lng?: number, useAdvanced: boolean = false) {
  try {
    const data = await apiCall('/kv/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        lat,
        lng,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'
      })
    });
    // Extract recommendations array from response
    const recommendations = data.recommendations || [];
    saveToCache(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
    return recommendations;
  } catch (error) {
    console.warn('API call failed, using cached recommendations data');
    const cachedData = getFromCache(STORAGE_KEYS.RECOMMENDATIONS);
    return cachedData || [];
  }
}

// Check if database is seeded
export async function checkSeeded() {
  try {
    const businesses = await apiCall('/kv/businesses');
    return businesses && businesses.length > 0;
  } catch (error) {
    // If offline, check cached data
    const cachedData = getFromCache(STORAGE_KEYS.BUSINESSES);
    return cachedData && cachedData.length > 0;
  }
}

// Get reviews for a business
export async function getReviews(businessId: string) {
  try {
    const data = await apiCall(`/kv/reviews/${businessId}`);
    const reviews = data.reviews || [];
    
    // Calculate average rating and total
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round(reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews * 10) / 10
      : 0;
    
    return {
      reviews,
      averageRating,
      totalReviews
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    };
  }
}

// Submit a review
export async function submitReview(businessId: string, rating: number, comment: string) {
  try {
    // Get user profile from localStorage (use customer profile for mobile)
    const storedProfile = localStorage.getItem('vibespot_customer_profile') || localStorage.getItem('vibespot_user_profile');
    let userName = 'Anonymous';
    let userPhone = null;
    let userEmail = null;
    
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      userName = profile.name || 'Anonymous';
      userPhone = profile.mobile || null;
      userEmail = profile.email || null;
    }
    
    const response = await fetch(`${BASE_URL}/kv/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        business_id: businessId,
        user_name: userName,
        rating,
        comment,
        user_phone: userPhone,
        user_email: userEmail
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit review');
    }
    
    const data = await response.json();
    console.log('✅ Review submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error submitting review:', error);
    throw error;
  }
}

// ============================================
// ANALYTICS API CALLS
// ============================================

// Get analytics data (revenue, bookings, views over time)
export async function getAnalytics() {
  try {
    const data = await apiCall('/kv/analytics');
    saveToCache('vibespot_analytics', data);
    return data;
  } catch (error) {
    console.warn('Using cached analytics data');
    const cachedData = getFromCache('vibespot_analytics');
    return cachedData || [];
  }
}

// Get popular times data
export async function getPopularTimes() {
  try {
    const data = await apiCall('/kv/popular-times');
    saveToCache('vibespot_popular_times', data);
    return data;
  } catch (error) {
    console.warn('Using cached popular times data');
    const cachedData = getFromCache('vibespot_popular_times');
    return cachedData || [];
  }
}

// Get cuisine stats
export async function getCuisineStats() {
  try {
    const data = await apiCall('/kv/cuisine-stats');
    saveToCache('vibespot_cuisine_stats', data);
    return data;
  } catch (error) {
    console.warn('Using cached cuisine stats data');
    const cachedData = getFromCache('vibespot_cuisine_stats');
    return cachedData || [];
  }
}

// Get demographics data
export async function getDemographics() {
  try {
    const data = await apiCall('/kv/demographics');
    saveToCache('vibespot_demographics', data);
    return data;
  } catch (error) {
    console.warn('Using cached demographics data');
    const cachedData = getFromCache('vibespot_demographics');
    return cachedData || [];
  }
}

// Get rating trends
export async function getRatingTrends() {
  try {
    const data = await apiCall('/kv/rating-trends');
    saveToCache('vibespot_rating_trends', data);
    return data;
  } catch (error) {
    console.warn('Using cached rating trends data');
    const cachedData = getFromCache('vibespot_rating_trends');
    return cachedData || [];
  }
}

// ============================================
// NOTIFICATION API
// ============================================

// Get notifications for a user
export async function getNotifications(userId: string) {
  try {
    const data = await apiCall(`/kv/notifications/${userId}`);
    return {
      notifications: data.notifications || [],
      unread_count: data.unread_count || 0
    };
  } catch (error) {
    console.warn('Failed to fetch notifications:', error);
    return { notifications: [], unread_count: 0 };
  }
}

// Mark notification as read
export async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    await apiCall(`/kv/notifications/${userId}/${notificationId}/read`, {
      method: 'PUT'
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await apiCall(`/kv/notifications/${userId}/read-all`, {
      method: 'PUT'
    });
    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }
}

// Delete a notification
export async function deleteNotification(userId: string, notificationId: string) {
  try {
    await apiCall(`/kv/notifications/${userId}/${notificationId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const data = await apiCall(`/kv/notifications/${userId}/unread-count`);
    return data.unread_count || 0;
  } catch (error) {
    console.warn('Failed to fetch unread count:', error);
    return 0;
  }
}

// ============================================
// EVENT INTEREST API
// ============================================

// Mark interest in an event
export async function markEventInterest(eventId: string, userId: string, status: 'interested' | 'going', userProfile?: any) {
  try {
    // Get user profile from localStorage if not provided
    const profile = userProfile || JSON.parse(localStorage.getItem('vibespot_customer_profile') || '{}');
    
    await apiCall(`/kv/events/${eventId}/interest`, {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        status,
        user_email: profile.email || userId,
        user_mobile: profile.mobile || '',
        notification_preference: profile.notificationPreference || 'email'
      })
    });
    return true;
  } catch (error) {
    console.error('Failed to mark event interest:', error);
    return false;
  }
}

// Remove interest from event
export async function removeEventInterest(eventId: string, userId: string) {
  try {
    await apiCall(`/kv/events/${eventId}/interest/${userId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Failed to remove event interest:', error);
    return false;
  }
}

// Check if user is interested in event
export async function checkEventInterest(eventId: string, userId: string) {
  try {
    const data = await apiCall(`/kv/events/${eventId}/interest/${userId}`);
    return {
      interested: data.interested || false,
      status: data.status || null
    };
  } catch (error) {
    console.warn('Failed to check event interest:', error);
    return { interested: false, status: null };
  }
}

// Get user's interested events
export async function getUserInterestedEvents(userId: string) {
  try {
    const data = await apiCall(`/kv/user/${userId}/interested-events`);
    return data.interests || [];
  } catch (error) {
    console.warn('Failed to fetch interested events:', error);
    return [];
  }
}

// Trigger event reminder check (typically called by cron or manual trigger)
export async function sendEventReminders() {
  try {
    const data = await apiCall('/kv/send-event-reminders', {
      method: 'POST'
    });
    return data;
  } catch (error) {
    console.error('Failed to send event reminders:', error);
    return { success: false, reminders_sent: 0 };
  }
}

// ============================================
// ANALYTICS TRACKING API
// ============================================

// Track business profile view
export async function trackBusinessView(businessId: string) {
  try {
    await apiCall('/analytics/track-view', {
      method: 'POST',
      body: JSON.stringify({
        business_id: businessId
      })
    });
    console.log('✅ View tracked:', businessId);
  } catch (error) {
    // Silently fail - analytics tracking should not break user experience
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics tracking unavailable:', error);
    }
  }
}

// Track ad/carousel click
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
    // Silently fail - analytics tracking should not break user experience
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics tracking unavailable:', error);
    }
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
    console.log('✅ Reservation tracked');
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

// Get platform analytics (admin)
export async function getPlatformAnalytics() {
  try {
    return await apiCall('/analytics/platform');
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error);
    return null;
  }
}

// Get all reservations (admin)
export async function getAllReservations() {
  try {
    return await apiCall('/analytics/reservations');
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    return null;
  }
}

// Get user reservations by email
export async function getUserReservations(userEmail: string) {
  try {
    return await apiCall(`/reservations/user/${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error('Failed to fetch user reservations:', error);
    return { reservations: [] };
  }
}

// Cancel reservation
export async function cancelReservation(reservationId: string, userEmail: string) {
  try {
    const response = await apiCall(`/reservations/${reservationId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ user_email: userEmail })
    });
    return response.success;
  } catch (error) {
    console.error('Failed to cancel reservation:', error);
    return false;
  }
}

// ============================================
// CUSTOMER AUTH API
// ============================================

export async function checkUsername(username: string) {
  try {
    const data = await apiCall('/auth/customer/check-username', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    return data.exists;
  } catch (error) {
    console.error('Check username failed:', error);
    return false;
  }
}

export async function loginCustomer(username: string) {
  try {
    const data = await apiCall('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function registerCustomer(username: string, name: string) {
  try {
    // Check for referral code
    const referralCode = localStorage.getItem('myvibes_referral_code');
    
    const data = await apiCall('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify({ username, name, referral_code: referralCode })
    });
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

export async function recoverUsername(email: string) {
  try {
    const data = await apiCall('/auth/customer/recover-username', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return data.success;
  } catch (error) {
    console.error('Recovery failed:', error);
    return false;
  }
}

// ============================================
// USER PROFILE API
// ============================================

// Save or update customer profile
export async function saveCustomerProfile(profile: {
  name: string;
  email: string;
  mobile: string;
  city?: string;
  notificationPreference?: 'email' | 'whatsapp';
}) {
  try {
    const response = await apiCall('/auth/customer/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
    return response;
  } catch (error) {
    console.error('Failed to save customer profile:', error);
    // Throw to allow caller to handle retry or UI feedback
    throw error;
  }
}

// ============================================
// ADMIN BUSINESS DIAGNOSTIC & FIX API
// ============================================

// Diagnose business visibility issues
export async function diagnoseBusinesses() {
  try {
    const data = await apiCall('/admin/diagnose-businesses');
    return data;
  } catch (error) {
    console.error('Failed to diagnose businesses:', error);
    return null;
  }
}

// Fix a specific business visibility
export async function fixBusinessVisibility(businessId: string) {
  try {
    const response = await apiCall(`/admin/fix-business-visibility/${businessId}`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to fix business visibility:', error);
    return null;
  }
}

// Fix all businesses visibility (bulk fix)
export async function fixAllBusinesses() {
  try {
    const response = await apiCall('/admin/fix-all-businesses', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to fix all businesses:', error);
    return null;
  }
}