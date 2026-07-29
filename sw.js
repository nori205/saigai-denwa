const CACHE_NAME = 'moshimo-tap-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './qrcode.min.js',
  './jsQR.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先: オンラインなら常に最新版を取得し、キャッシュも更新する。
// オフラインの時だけキャッシュにフォールバックする(更新後も古い版が残り続けるのを防ぐため)。
// cache:'reload'を指定し、ブラウザのHTTPキャッシュ(GitHub Pagesの
// Cache-Controlで数分〜10分ほど残る)を経由させず、必ずサーバーへ問い合わせる。
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'reload' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
