// Simple Service Worker for Customer PWA
const CACHE_NAME = 'myvibes-customer-v1.0.6';

// No pre-caching - everything cached on-demand
const STATIC_ASSETS = [];

// Install event - skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => {
        console.log('[Service Worker] Cache opened successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Cache open failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('myvibes-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Skip ALL non-GET requests (POST, PUT, DELETE, etc.)
  // This ensures API calls like check-in and reservations work in Android APK
  if (request.method !== 'GET') {
    console.log('[Service Worker] Bypassing non-GET request:', request.method, url.pathname);
    return;
  }

  // Skip Supabase API calls - always fetch fresh
  if (url.hostname.includes('supabase.co')) {
    console.log('[Service Worker] Bypassing Supabase API call:', url.pathname);
    return;
  }

  // Skip external domains
  if (url.origin !== self.location.origin) {
    return;
  }

  // Cache-first strategy for app shell
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Listen for messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Loaded version:', CACHE_NAME);