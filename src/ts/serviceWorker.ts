const CACHE_NAME = "WCHS-map-v0.3";
const toCache = [
    "/",
    "/bundle.css",
    "/bundle.js",
    "/assets/map/1st_floor.svg",
    "/assets/map/2nd_floor.svg"
];

self.addEventListener("install", (e) => {
    // @ts-ignore: Valid for SW install event
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(toCache);
            })
    );
});

self.addEventListener("fetch", (e) => {
    // @ts-ignore: Valid for SW install event
    const request = e.request;

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
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
});