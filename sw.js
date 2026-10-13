const PRECACHE = ["./","data.bin","manifest.webmanifest","icons/icon.svg","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","assets/index-TQ6pbpTv.js","assets/MirrorBall-BQbgoErm.js","assets/index-KMdZAkZY.css","index.html"]
/* Service worker for offline use (basement 노래방). PRECACHE is prepended at build time by vite.config.js. */
/* global PRECACHE */
const CACHE = 'tjtj-v1'
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = new Set(PRECACHE.map((p) => new URL(p, self.registration.scope).href))
    const c = await caches.open(CACHE)
    for (const req of await c.keys()) {
      if (req.url.includes('/assets/') && !keep.has(req.url)) await c.delete(req) // previous build's hashed files
    }
    await self.clients.claim()
  })())
})

// Fonts the page fetched before this worker took control; caching them now makes the first visit enough.
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'cache') return
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(e.data.urls.map((u) => c.add(u).catch(() => {})))))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const same = url.origin === location.origin
  if (!same && !FONT_HOSTS.includes(url.hostname)) return // album art: TJ allows no CORS, so it stays network-only
  if (same && !url.pathname.includes('/assets/')) e.respondWith(fresh(e, req))
  else e.respondWith(cacheFirst(req)) // hashed bundles and font files never change under the same URL
})

async function cacheFirst(req) {
  const c = await caches.open(CACHE)
  return (await c.match(req)) ?? put(c, req, await fetch(req))
}

// Page shell and data.bin: answer from cache at once, refresh in the background for the next visit.
async function fresh(e, req) {
  const c = await caches.open(CACHE)
  const key = req.mode === 'navigate' ? self.registration.scope : req // every ?q= URL is the same page
  const hit = await c.match(key)
  const net = fetch(req).then((res) => put(c, key, res))
  if (!hit) return net
  e.waitUntil(net.catch(() => {}))
  return hit
}

function put(c, key, res) {
  if (res.ok) c.put(key, res.clone())
  return res
}
