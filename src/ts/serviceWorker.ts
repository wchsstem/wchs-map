const VERSION = "v0.5.13";

const CACHE_NAME = "WCHS-map-" + VERSION;
const toCache = [
    "/",
    "/bundle.css",
    "/bundle.js",
    "/assets/map/1st_floor.svg",
    "/assets/map/2nd_floor.svg",
    "/assets/fontawesome/webfonts/fa-solid-900.woff2",
    "/assets/app-icon/icon-192.png",
    "/assets/app-icon/icon-512.png",
    "/assets/app-icon/favicon_v0.ico"
];

self.addEventListener("install", e => {
    // @ts-ignore: Valid for SW install event
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(toCache);
            })
    );
});

self.addEventListener("fetch", e => {
    // @ts-ignore: Valid for fetch event
    const request: Request = e.request;

    // @ts-ignore: Valid for SW install event
    e.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== "basic") {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    return response;
                });
            })
    );
});

self.addEventListener("activate", (e) => {
    // Clear all old caches when a new service worker takes over
    // @ts-ignore: Valid for SW install event
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            )
        })
    )
});