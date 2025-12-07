// Define the cache name for versioning
const CACHE_NAME = "ntc-zoo-cache-v1";

// List of essential files to pre-cache for offline use
const FILES_TO_CACHE = [
  "/", 
  "/index.html",
  "/styles.css",
  "/zoo.js",
  "/AnimalAPI.js",
  "/AnimalData.js",
  "/AdminDashboard.js",
  "/UiFeedback.js",
  "/Security.js",
  "/zooLocations.js",
  "/ZooOperations.js",
  "/Components/zoo-animal-card.js",
  "/Components/z-hover-highlight.js",
  "/Components/zoo-photo-booth.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install event – cache app shell
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Fetch event – serve from cache, then fallback to network
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GETs
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only same-origin requests
  if (url.origin !== self.location.origin) return;

  // Bypass API and warmup endpoints; let them hit network directly
  if (url.pathname.startsWith("/api/") || url.pathname === "/ping") return;

  // Handle SPA navigations: network-first with cached fallback to app shell
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(req); // live page if online
      } catch {
        // fallback to cached shell if offline
        return (await caches.match("/index.html")) || Response.error();
      }
    })());
    return; // IMPORTANT: ensure we don't call respondWith again
  }

  // Static assets: cache-first, then network; only cache "good" responses
  event.respondWith((async () => {
    // Serve from cache if present
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const resp = await fetch(req);

      // Decide if this response is safe to cache
      const isRange = req.headers.has("range");
      const okToCache =
        resp.status === 200 &&
        resp.type === "basic" && // same-origin
        !isRange;

      if (okToCache) {
        const copy = resp.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, copy);
      }

      return resp;
    } catch {
      // Offline fallback (optional)
      return new Response("Offline", { status: 503 });
    }
  })());
});