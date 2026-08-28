// Timbrò — Service Worker
// IMPORTANTE: incrementare CACHE_NAME ad ogni deploy che modifica index.html
// (o qualsiasi asset), altrimenti gli utenti resteranno sulla versione in cache.
const CACHE_NAME = "timbro-cache-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first per index.html (per prendere sempre l'ultima versione quando
// online), cache-first per il resto degli asset statici. Mai intercettare le
// chiamate verso api.github.com: la sincronizzazione deve passare sempre dalla
// rete.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.hostname === "api.github.com" || url.hostname.includes("cdnjs.cloudflare.com") || url.hostname.includes("fonts.g")) {
    return; // lascia passare: rete diretta, niente cache
  }

  if (event.request.mode === "navigate" || url.pathname.endsWith("index.html") || url.pathname === "/" ) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      });
    })
  );
});
