const CACHE_NAME = 'enterthecastle-v2'; // Bump version to force update
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/game_engine.js',
    '/config.js',
    '/manifest.json',
    '/assets/element_0.png',
    '/assets/element_1.png',
    '/assets/element_3.png',
    '/assets/element_4old.png',
    '/assets/IMG_1226.PNG'
];

// Install Event - Clean up old caches
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force new SW to activate immediately
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Activate Event - Delete old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
