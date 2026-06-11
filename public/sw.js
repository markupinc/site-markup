/* Markup Incorporações — Service Worker (PWA)
 * Estratégia conservadora para não servir conteúdo dinâmico/desatualizado:
 *  - Navegações (HTML): network-first, com fallback para /offline.html quando offline.
 *  - Estáticos (_next/static, ícones, fontes, imagens): stale-while-revalidate.
 *  - Ignora completamente: requisições não-GET, cross-origin (analytics, Supabase),
 *    e as rotas /api, /admin e /corretores/dashboard.
 */
const VERSION = "v1";
const STATIC_CACHE = `markup-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("markup-static-") && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/") ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico)$/.test(
      url.pathname
    )
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/corretores/dashboard")
  ) {
    return;
  }

  // Navegações: tenta a rede; se falhar (offline), mostra a página offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || Response.error())
      )
    );
    return;
  }

  // Estáticos: stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((resp) => {
            if (resp && resp.status === 200 && resp.type === "basic") {
              cache.put(request, resp.clone());
            }
            return resp;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
