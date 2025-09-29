// Generate cache name with timestamp for development
const CACHE_NAME = `expense-tracker-v${Date.now()}`;
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.ico'
];

// Development mode detection
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    // Skip caching for API calls and development
    if (event.request.url.includes('/api/') || isDevelopment) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // In development, always try network first
                if (isDevelopment) {
                    return fetch(event.request)
                        .then((networkResponse) => {
                            // Cache successful responses
                            if (networkResponse.status === 200) {
                                const responseClone = networkResponse.clone();
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // Fallback to cache if network fails
                            return response;
                        });
                }

                // Production: return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // In development, clear all caches on activation
            if (isDevelopment) {
                console.log('Development mode: clearing all caches');
                return caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                });
            }
        })
    );
});

