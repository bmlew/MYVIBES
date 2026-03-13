// MYVIBES Service Worker - v2.1.3
const CACHE_VERSION = 'myvibes-v2.1.3';
const CACHE_NAME = CACHE_VERSION; // Stable cache name to prevent loops

console.log('🔄 [Service Worker] Loading version:', CACHE_VERSION);

// Install event - wait for message before activating
self.addEventListener('install', (event) => {
  console.log('📦 [Service Worker] Installing:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => {
        console.log('✅ [Service Worker] Cache opened:', CACHE_NAME);
        // Don't skip waiting automatically - wait for user action
      })
      .catch((error) => {
        console.error('❌ [Service Worker] Install failed:', error);
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ [Service Worker] Skip waiting requested');
    self.skipWaiting();
  }
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 [Service Worker] Activating:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete old caches (keep current version)
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('myvibes-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('🗑️ [Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ [Service Worker] Claiming all clients');
        return self.clients.claim();
      })
  );
});

// Fetch event with smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 🚨 CRITICAL: Skip ALL non-GET requests (POST, PUT, DELETE)
  // This ensures API calls work in Android APK
  if (request.method !== 'GET') {
    console.log('⏭️  [SW] Bypass non-GET:', request.method, url.pathname);
    return; // Let it pass through
  }

  // Skip Supabase API calls - always fresh
  if (url.hostname.includes('supabase.co')) {
    console.log('⏭️  [SW] Bypass Supabase:', url.pathname);
    return;
  }

  // Skip Google Maps API
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('maps.google.com')) {
    return;
  }

  // Skip external domains
  if (url.origin !== self.location.origin) {
    return;
  }

  // NETWORK-FIRST for HTML to get updates immediately
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    console.log('🌐 [SW] Network-first for HTML:', url.pathname);
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // CACHE-FIRST for static assets (JS, CSS, images)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('💾 [SW] Serving from cache:', url.pathname);
          return cachedResponse;
        }
        
        console.log('🌐 [SW] Fetching from network:', url.pathname);
        return fetch(request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone and cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.error('❌ [SW] Fetch failed:', url.pathname, error);
            throw error;
          });
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️  [SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

console.log('✅ [Service Worker] Loaded version:', CACHE_VERSION);
