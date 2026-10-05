const CACHE = 'reimburse-v2-0-0-alpha-23';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './js/app.js', './js/db.js', './js/records.js', './js/rules.js', './js/ui.js', './js/backup.js', './js/pdf.js', './js/drive.js', './js/sync.js',
  './icons/icon-192.png', './icons/icon-512.png', './batch.html', './js/batch.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    ASSETS.map(url => new Request(url, { cache: 'reload' }))
  )));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('reimburse-v2-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const scope = new URL('./', self.location.href);
  // Google sync/PDF requests must bypass offline asset caching entirely.
  if (url.origin !== scope.origin) return;
  if (!ASSETS.some(asset => new URL(asset, scope).pathname === url.pathname)) return;
  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
      const response = await fetch(event.request);
      if (response.ok && response.type === 'basic') {
        await cache.put(event.request, response.clone());
      }
      return response;
      } catch (error) {
        if (event.request.mode === 'navigate') {
          const fallback = await cache.match('./index.html');
          if (fallback) return fallback;
        }
        throw error;
      }
    })
  );
});
