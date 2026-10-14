const CACHE_NAME = 'reloop-static-v1';
const OFFLINE_URL = '/offline.html';

// Public static assets safe to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

// Private and sensitive API patterns that MUST NEVER BE CACHED publicly
const SENSITIVE_ENDPOINTS = [
  '/api/auth',
  '/api/conversations',
  '/api/messages',
  '/api/admin',
  '/api/notifications',
  '/api/offers',
  '/api/saved',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache or intercept sensitive private API endpoints (Test 18)
  for (const endpoint of SENSITIVE_ENDPOINTS) {
    if (url.pathname.startsWith(endpoint)) {
      return; // Fall through to standard network fetch
    }
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Stale-while-revalidate for static public scripts, styles, images
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
