const CACHE_NAME = 'attram-gym-v3'; // Updated version
const OFFLINE_PAGE = '/offline.html';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/photo_2025-06-19_01-30-39.jpg',
  '/photo_2025-06-19_01-30-42.jpg'
];

// Never cache these paths
const NO_CACHE_PATHS = [
  /^\/auth\//,               // Supabase auth endpoints
  /^\/api\//,               // API routes
  /\.(json|js|css)\?v=\d+$/, // Versioned files
  /chrome-extension:\/\//    // Chrome extensions
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('Skipping waiting');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Install failed:', err);
        throw err;
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and unsupported schemes
  if (request.method !== 'GET' || 
      NO_CACHE_PATHS.some(regex => regex.test(url.href))) {
    return event.respondWith(fetch(request));
  }

  // Network-first strategy with offline fallback
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        return cachedResponse || caches.match(OFFLINE_PAGE);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if available
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      // Clean old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      // Take control immediately
      await self.clients.claim();
      console.log('Service Worker activated');
    })()
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed') {
    event.waitUntil(retryFailedRequests());
  }
});

async function retryFailedRequests() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  await Promise.all(
    requests.map(async request => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
      } catch (err) {
        console.warn('Retry failed for:', request.url);
      }
    })
  );
}
