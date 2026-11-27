// Jobnavi スマホ版: オフラインでも開けるようにするための小さなサービスワーカー
// ・同じ場所のファイルだけを扱う（GASなど外部への通信には関与しない）
// ・ネットが使えるときは最新を取りに行き、使えないときは前回の保存分で開く
const CACHE = 'jobnavi-phone-v1';
const FILES = ['./jobnavi-phone.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./jobnavi-phone.html')))
  );
});
