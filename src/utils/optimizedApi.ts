import { projectId, publicAnonKey } from '/utils/supabase/info';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Get from cache or fetch
async function cachedFetch<T>(url: string, cacheKey: string): Promise<T> {
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return cached.data;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

// Fetch businesses with pagination
export async function fetchBusinessesPaginated(
  page: number = 1,
  limit: number = 50,
  lat?: number,
  lng?: number
): Promise<PaginatedResponse<any>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(lat && { lat: lat.toString() }),
    ...(lng && { lng: lng.toString() })
  });
  
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/businesses?${params}`;
  const cacheKey = `businesses_${page}_${limit}_${lat}_${lng}`;
  
  return cachedFetch(url, cacheKey);
}

// Fetch specials with caching
export async function fetchSpecials(): Promise<any[]> {
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`;
  const cacheKey = 'specials';
  
  return cachedFetch(url, cacheKey);
}

// Fetch events with caching
export async function fetchEvents(): Promise<any[]> {
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events`;
  const cacheKey = 'events';
  
  return cachedFetch(url, cacheKey);
}

// Clear cache
export function clearCache() {
  cache.clear();
  console.log('🗑️ Cache cleared');
}

// Clear specific cache entry
export function clearCacheEntry(key: string) {
  cache.delete(key);
  console.log(`🗑️ Cache entry cleared: ${key}`);
}
