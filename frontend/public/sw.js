/* eslint-disable */
// Service Worker - ESLint disabled as service worker globals are valid
// Development mode detection
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Use stable cache name in development, versioned cache in production
const CACHE_NAME = isDevelopment
    ? 'expense-tracker-dev'
    : `expense-tracker-v${Date.now()}`;
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.ico'
];

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
    // Handle API calls separately - fetch directly without caching
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If network fails, return a basic error response
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Network error - please check your connection'
                }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
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
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cache and network fails, return error response
                            return new Response('Network error and no cached version available', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'text/plain' }
                            });
                        });
                }

                // Production: return cached version or fetch from network
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).catch(() => {
                    // If fetch fails and no cache, return error response
                    return new Response('Network error and no cached version available', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
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
                    return Promise.resolve(); // Return resolved promise for cache names that match
                })
            );
        }).then(() => {
            // In development, only clear old caches (not the current one)
            // This allows caching to work while still cleaning up stale caches
            if (isDevelopment) {
                console.log('Development mode: cleaning up old caches');
                return caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            // Only delete caches that are not the current cache
                            if (cacheName !== CACHE_NAME) {
                                console.log('Deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            }
                            return Promise.resolve();
                        })
                    );
                });
            }
        })
    );
});

