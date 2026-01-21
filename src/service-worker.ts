/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Workbox will inject the manifest here - DO NOT REMOVE
const precacheManifest = self.__WB_MANIFEST;

const CACHE_VERSION = 'myvibes-v1.0.1'; // Bumped version to clear old cache
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Maximum cache sizes
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // Cache both static assets and workbox precache manifest
      const urlsToCache = [...STATIC_ASSETS, ...precacheManifest.map((entry: any) => entry.url)];
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('myvibes-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map((key) => {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Supabase API calls - always fetch fresh
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
  } else if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (url.origin === self.location.origin) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS));
  }
});

// Cache-first strategy (good for images and static assets)
async function cacheFirstStrategy(
  request: Request,
  cacheName: string,
  maxItems?: number
): Promise<Response> {
  const cachedResponse = await caches.open(cacheName).then(cache => cache.match(request));
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limit cache size
      if (maxItems) {
        limitCacheSize(cacheName, maxItems);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

// Network-first strategy (good for dynamic content)
async function networkFirstStrategy(
  request: Request,
  cacheName: string,
  maxItems?: number
): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Limit cache size
      if (maxItems) {
        limitCacheSize(cacheName, maxItems);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);
    const cachedResponse = await caches.open(cacheName).then(cache => cache.match(request));
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Limit cache size by removing oldest entries
async function limitCacheSize(cacheName: string, maxItems: number): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Remove oldest items
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(itemsToDelete.map(key => cache.delete(key)));
  }
}

// Listen for messages from the client
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith('myvibes-'))
            .map((key) => caches.delete(key))
        );
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

async function syncFavorites(): Promise<void> {
  console.log('[Service Worker] Syncing favorites...');
  // Implement sync logic here
}

async function syncReservations(): Promise<void> {
  console.log('[Service Worker] Syncing reservations...');
  // Implement sync logic here
}

// Push notification handler
self.addEventListener('push', (event: any) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MYVIBES';
  const options = {
    body: data.body || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png', // Use existing icon instead of separate badge
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'View', icon: '/icons/view-icon.png' },
      { action: 'close', title: 'Close', icon: '/icons/close-icon.png' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

export {};