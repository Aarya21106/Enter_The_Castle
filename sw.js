const CACHE_NAME = 'enterthecastle-v1';
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
    '/assets/element_4.png',
    '/assets/element_4old.png',
    '/assets/background_game.png',
    '/assets/background_ice.png',
    '/assets/IMG_1226.PNG'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then((response) => response || fetch(e.request))
    );
});
