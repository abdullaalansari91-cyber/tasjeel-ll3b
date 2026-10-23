/* تسجيل للعب: network-first pages, static asset fallback only. */
const CACHE = 'tasjeel-static-2.0-20261023-1';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
 event.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tasjeel-') && k !== CACHE).map(k => caches.delete(k)))),
  self.clients.claim()
 ]));
});
self.addEventListener('message', event => {
 if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
 const req=event.request;
 if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
 if(req.mode === 'navigate') {
  event.respondWith(fetch(req, {cache:'no-store'}).catch(async () => (await caches.match('/index.html')) || Response.error()));
  return;
 }
 const url=new URL(req.url);
 if(!ASSETS.includes(url.pathname))return;
 event.respondWith(fetch(req,{cache:'no-store'}).then(async response => {
  if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}
  return response;
 }).catch(async()=> (await caches.match(req)) || Response.error()));
});
