const VERSION = 'mw6h4nux-5226d614'
const CACHE = 'tjtj-mw6h4nux-5226d614'
const PRECACHE = ["./","manifest.webmanifest","icons/icon.svg","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png","assets/index-NrQ5sxxn.js","assets/MirrorBall-Cw9WA2Dm.js","assets/firebase-client-BF-9LJuY.js","assets/a7182812ebf31e29ecc25216.bin","assets/index-W28TNrwA.css","index.html"]
/* Service worker for offline use (basement 노래방). PRECACHE is prepended at build time by vite.config.js. */
/* global PRECACHE, CACHE, VERSION */
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net']

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    await self.clients.claim()
    // One-time migration for pages whose old code cannot announce or accept an update.
    for (const client of await appClients()) {
      const url = new URL(client.url)
      if (!url.searchParams.has('v')) {
        url.searchParams.set('v', VERSION)
        // Its fetch waits for activation to finish; awaiting navigation here deadlocks both.
        client.navigate(url.href).catch(() => {})
      }
    }
    for (const client of await appClients()) client.postMessage({ type: 'release-ready', version: VERSION })
    await cleanup()
  })())
})

async function appClients() {
  return (await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .filter((client) => client.url.startsWith(self.registration.scope))
}

async function cleanup() {
  const clients = await appClients()
  const versions = clients.map((client) => new URL(client.url).searchParams.get('v'))
  if (versions.includes(null)) return // keep legacy assets if a migration navigation was blocked
  const keep = new Set([CACHE, ...versions.map((version) => `tjtj-${version}`)])
  for (const name of await caches.keys()) {
    if (name.startsWith('tjtj-') && !keep.has(name)) await caches.delete(name)
  }
}

// Fonts the page fetched before this worker took control; caching them now makes the first visit enough.
self.addEventListener('message', (e) => {
  if (e.data?.type === 'version') { e.source?.postMessage({ type: 'release-ready', version: VERSION }); return }
  if (e.data?.type === 'cleanup') { e.waitUntil(cleanup()); return }
  if (e.data?.type !== 'cache') return
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(e.data.urls.map((u) => c.add(u).catch(() => {})))))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  const same = url.origin === location.origin
  if (!same && !FONT_HOSTS.includes(url.hostname)) return // album art: TJ allows no CORS, so it stays network-only
  e.respondWith(same && req.mode === 'navigate' ? navigation(req) : cacheFirst(req))
})

async function navigation(req) {
  try {
    const response = await fetch(req, { cache: 'no-store' })
    if (response.ok) return response
  } catch { /* offline: use the shell from a completed installation */ }
  const cache = await caches.open(CACHE)
  const saved = await cache.match(self.registration.scope, { ignoreVary: true })
  if (saved) return saved
  throw new TypeError('No offline installation')
}

async function cacheFirst(req, key = req) {
  const c = await caches.open(CACHE)
  // Precache and module requests can have different Origin headers (Vary: Origin).
  // These URLs serve public static files, so both must use the same offline copy.
  const current = await c.match(key, { ignoreVary: true })
  if (current) return current
  // An open older tab still needs its own hashed JS/catalog after this worker takes control.
  for (const name of await caches.keys()) {
    if (!name.startsWith('tjtj-') || name === CACHE) continue
    const saved = await (await caches.open(name)).match(key, { ignoreVary: true })
    if (saved) return saved
  }
  return put(c, key, await fetch(req))
}

function put(c, key, res) {
  if (res.ok) c.put(key, res.clone())
  return res
}
