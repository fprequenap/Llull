/* Código de Llull — service worker: funciona sin conexión y se actualiza solo. */
const VERSION = 'llull-v15';
const ARCHIVOS = ['./','index.html','app.js','data.js','contenido.js','fisico.js','blason.js','motor.js','arnes.js','retrato.js','llull.webmanifest','icon-144.png','icon-384.png',
  'unifraktur.woff2','garamond-400.woff2','garamond-400i.woff2','garamond-600.woff2',
  'banda.png','ornamento.png','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png',
  'cap-A.png','cap-D.png','cap-E.png','cap-F.png','cap-O.png','cap-P.png','cap-S.png','cap-T.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache:'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // red primero para el HTML (actualizaciones), caché primero para lo demás
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(k => k.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch:true }).then(r => r || fetch(e.request).then(n => { const c = n.clone(); caches.open(VERSION).then(k => k.put(e.request, c)); return n; })));
});
