// MYVIBES Service Worker - v2.2.0
const CACHE_VERSION = 'myvibes-v2.2.0';
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

  // CRITICAL FIX: Bypass service worker for ALL POST requests (check-ins, reservations, etc.)
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    console.log(`🔓 [Service Worker] Bypassing cache for ${request.method}:`, url.pathname);
    return; // Let the request go directly to the network
  }

  // Skip caching for:
  // 1. Non-HTTP(S) requests
  // 2. API calls (always fetch fresh)
  // 3. Chrome extension requests
  if (
    !url.protocol.startsWith('http') ||
    url.pathname.startsWith('/functions/') ||
    url.pathname.includes('/api/') ||
    url.origin.includes('chrome-extension')
  ) {
    console.log('⏭️ [Service Worker] Skipping cache for:', url.pathname);
    return;
  }

  // For static assets, use cache-first strategy
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|ico)$/) ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 [Service Worker] Serving from cache:', url.pathname);
          // Return cached version and update in background
          fetch(request)
            .then((freshResponse) => {
              if (freshResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, freshResponse);
                });
              }
            })
            .catch(() => {
              // Network failed, but we have cache
            });
          return cachedResponse;
        }

        // Not in cache, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else, network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 [Service Worker] Network failed, serving from cache:', url.pathname);
            return cachedResponse;
          }
          // No cache available
          return new Response('Offline - No cached version available', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});
