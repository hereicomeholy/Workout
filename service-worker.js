/* Iron Cocka service worker
   Scope is automatically /Workout/ because this file is registered from
   /Workout/index.html with a relative path ("service-worker.js").

   This worker only intercepts network requests (fetch events) for caching
   purposes. It never touches localStorage or IndexedDB — those are separate
   browser storage APIs that a service worker has no access to and cannot
   accidentally clear, so your workout data is never at risk from this file. */

const CACHE_NAME = 'iron-cocka-cache-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Network-first: always tries to fetch the latest version first so updates
   show up immediately when online, falling back to the cached copy only
   when offline. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
