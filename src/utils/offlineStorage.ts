// Offline storage utilities for caching data
const STORAGE_KEYS = {
  BUSINESSES: 'vibespot_businesses',
  SPECIALS: 'vibespot_specials',
  EVENTS: 'vibespot_events',
  RECOMMENDATIONS: 'vibespot_recommendations',
  LAST_SYNC: 'vibespot_last_sync',
};

// Save data to localStorage
export function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

// Get data from localStorage
export function getFromCache<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
}

// Clear specific cache
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

// Clear all cache
export function clearAllCache(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    clearCache(key);
  });
}

// Clear invalid business references (business-1, business-2, business-3 (simple sequential IDs only))
export function clearInvalidBusinessCache(): void {
  try {
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
      // Clear any key that references business-1, business-2, business-3 (simple sequential IDs only)
      if (key.includes('business-1') || 
          key.includes('business-2') || 
          key.includes('business-3') ||
          key.match(/business-[1-9]\d{0,2}/)) {
        console.log(`🧹 Clearing invalid cache: ${key}`);
        localStorage.removeItem(key);
        clearedCount++;
      }
    });
    
    // Also check and clear business_id if it's invalid (simple sequential IDs only, max 3 digits)
    const businessId = localStorage.getItem('business_id');
    if (businessId && businessId.match(/^business-[1-9]\d{0,2}$/)) {
      console.log(`🧹 Clearing invalid business_id: ${businessId}`);
      localStorage.removeItem('business_id');
      localStorage.removeItem('business_name');
      localStorage.removeItem('access_token');
      localStorage.removeItem('business_settings_cache');
      clearedCount++;
    }
    
    if (clearedCount > 0) {
      console.log(`✅ Cleared ${clearedCount} invalid cache entries`);
    } else {
      console.log(`✅ No invalid cache entries found`);
    }
  } catch (error) {
    console.warn('Failed to clear invalid cache:', error);
  }
}

// Check if data is stale (older than 1 hour)
export function isCacheStale(): boolean {
  const lastSync = getFromCache<number>(STORAGE_KEYS.LAST_SYNC);
  if (!lastSync) return true;
  
  const oneHourInMs = 60 * 60 * 1000;
  return Date.now() - lastSync > oneHourInMs;
}

// Update last sync time
export function updateLastSync(): void {
  saveToCache(STORAGE_KEYS.LAST_SYNC, Date.now());
}

export { STORAGE_KEYS };