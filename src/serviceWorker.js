(function () {
    'use strict';

    // Injected by versionInjector
    const VERSION = "v0.10.4";
    const CACHE_NAME = "WCHS-map+" + VERSION;
    const toCache = [
        "./",
        "./bundle.js",
        "./assets/bundle.css",
        "./assets/map/1st_floor.svg",
        "./assets/map/2nd_floor.svg",
        "./assets/fontawesome/webfonts/fa-solid-900.woff2",
        "./assets/app-icon/icon-192.png",
        "./assets/app-icon/icon-512.png",
        "./assets/app-icon/favicon_v1.ico",
    ];
    // @ts-expect-error: poor TS support for service workers leads to no proper types here
    self.oninstall = (e) => {
        e.waitUntil(caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(toCache);
        }));
    };
    // @ts-expect-error: poor TS support for service workers leads to no proper types here
    self.onfetch = (e) => {
        const request = e.request;
        e.respondWith((async function () {
            return await caches.match(request).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(request).then((response) => {
                    if (!response ||
                        response.status !== 200 ||
                        response.type !== "basic") {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                });
            });
        })());
    };
    // @ts-expect-error: poor TS support for service workers leads to no proper types here
    self.onactivate = (e) => {
        // Clear all old caches when a new service worker takes over
        e.waitUntil(caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames
                .filter((cacheName) => cacheName !== CACHE_NAME)
                .map((cacheName) => caches.delete(cacheName)));
        }));
    };

}());
//# sourceMappingURL=serviceWorker.js.map

