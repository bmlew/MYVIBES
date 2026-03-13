/**
 * Simple in-memory cache for API responses
 * Optimizes performance by reducing duplicate API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get data from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache entry has expired
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.data;
  }

  /**
   * Set data in cache with expiration time
   * @param key Cache key
   * @param data Data to cache
   * @param expiresIn Expiration time in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
    console.log(`💾 Cache SET: ${key} (expires in: ${Math.round(expiresIn / 1000)}s)`);
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache CLEAR: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    console.log('🗑️ Cache CLEAR ALL');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const apiCache = new Cache();
