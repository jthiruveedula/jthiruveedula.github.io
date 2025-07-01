const CACHE_NAME = 'jt-profile-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/main.js',
  '/js/ui.js',
  '/js/animations.js',
  '/js/timeline.js',
  'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
  // Add other important assets like fonts if self-hosted, key images, etc.
  // Icon paths from manifest.json (ensure these exist)
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-192x192-mono.png',
  '/assets/icons/icon-512x512-mono.png',
  // Potentially the resume PDF if desired for offline access
  '/Jagadeesh_Thiruveedula_Resume.pdf'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // It's possible some external resources (like Google Fonts) might fail if network is unavailable during install.
        // Consider adding them with a separate, non-blocking fetch or making them non-critical.
        return cache.addAll(urlsToCache.map(url => new Request(url, { mode: 'cors' })))
          .catch(error => {
            console.error('Failed to cache some resources during install:', error);
          });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // For Google Fonts, use a stale-while-revalidate strategy or network first
  if (requestUrl.origin === 'https://fonts.googleapis.com' || requestUrl.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Optionally, cache new resources dynamically if they are important
            // For example, if it's a GET request and from your origin:
            if (event.request.method === 'GET' && requestUrl.origin === self.location.origin) {
              // Be careful about what you cache dynamically to avoid filling up storage
              // For this portfolio, explicit caching in 'urlsToCache' is likely sufficient.
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // Optionally, return a fallback offline page if appropriate
          // For example, if event.request.mode === 'navigate'
          // return caches.match('/offline.html');
          throw error;
        });
      })
  );
});
