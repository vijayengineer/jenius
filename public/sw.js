const CACHE_NAME = "jenius-shell-v2";
const PRECACHE = [
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/jenius-icon.svg",
];

function discoverShellAssets(html) {
  const assets = new Set();
  const references = html.matchAll(/(?:src|href)=["']([^"'#]+)["']/gi);
  for (const [, reference] of references) {
    try {
      const url = new URL(reference, self.location.origin);
      if (
        url.origin === self.location.origin &&
        !url.pathname.startsWith("/api/") &&
        (url.pathname.startsWith("/assets/") ||
          url.pathname.startsWith("/icons/") ||
          url.pathname === "/manifest.webmanifest" ||
          url.pathname === "/favicon.ico")
      ) {
        assets.add(url.pathname);
      }
    } catch {
      // Ignore malformed optional references; the critical shell remains cached.
    }
  }
  return [...assets];
}

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE);

  const shellResponse = await fetch(new Request("/", { cache: "reload" }));
  if (!shellResponse.ok) throw new Error("Unable to cache the Jenius shell");
  await cache.put("/", shellResponse.clone());

  const html = await shellResponse.text();
  await cache.addAll(discoverShellAssets(html));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ??
            (await caches.match("/")) ??
            (await caches.match("/offline.html"))
          );
        }),
    );
    return;
  }

  if (["script", "style", "image", "font", "worker"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
