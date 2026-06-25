const CACHE = 'chickenday-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './xlsx.full.min.js',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache semua aset inti
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: bersihkan cache versi lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first untuk aset lokal, network untuk sisanya (mis. Google Fonts)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  } else {
    // Aset eksternal (font): coba network, fallback ke cache bila ada
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});
