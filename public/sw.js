const CACHE_VERSION = "v1";
const CORE_CACHE = `mqorbit-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mqorbit-runtime-${CACHE_VERSION}`;
const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/pwa/apple-touch-icon.png",
  "/pwa/icon-192x192.png",
  "/pwa/icon-512x512.png",
];

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

async function cacheCoreAssets() {
  const cache = await caches.open(CORE_CACHE);
  await cache.addAll(CORE_ASSETS);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await caches.match("/")) || Response.error();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/")) ||
      Response.error()
    );
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheCoreAssets().then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CORE_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
  }
});
