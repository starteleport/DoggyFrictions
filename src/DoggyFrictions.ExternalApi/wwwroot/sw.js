// Service worker: lets the installed app start without a connection.
// It caches the application shell only; data always comes from the network.
const CACHE = 'doggy-frictions-v1';

// Libraries and fonts the layout loads from CDNs are part of the shell too.
const SHELL_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
    // The start page is the offline fallback for every navigation (the app is a single page).
    event.waitUntil(caches.open(CACHE).then(cache => cache.add('/')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
            .then(() => self.clients.claim()));
});

// The page loads its files before this worker runs, so on the first visit it hands their URLs over
// (js/pwa.js) to have everything needed for an offline start cached right away.
self.addEventListener('message', event => {
    if (!event.data || event.data.type !== 'cache-shell') {
        return;
    }
    const urls = event.data.urls.filter(url => isShell(new URL(url)));
    event.waitUntil(Promise.all(urls.map(url => {
        const key = new URL(url).pathname === '/' ? '/' : url;
        return fetch(url).then(response => put(key, response)).catch(() => undefined);
    })).then(() => event.source && event.source.postMessage({ type: 'shell-cached' })));
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || !isShell(url)) {
        return;
    }

    if (url.origin === self.location.origin) {
        // Our own page, scripts, styles and templates: always the current ones when online, so a new
        // deployment (or a change of language) is never mixed with leftovers; the cached copy otherwise.
        const key = request.mode === 'navigate' ? '/' : request;
        const cacheable = request.mode !== 'navigate' || url.pathname === '/';
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (cacheable) event.waitUntil(put(key, response.clone()));
                    return response;
                })
                .catch(() => caches.match(key).then(cached => cached || Response.error())));
        return;
    }

    // Versioned files on a CDN never change: answer from the cache and only fetch what is missing.
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
        event.waitUntil(put(request, response.clone()));
        return response;
    })));
});

// Never the API: stale debts are worse than none.
function isShell(url) {
    return url.origin === self.location.origin
        ? !/^\/api\//i.test(url.pathname)
        : SHELL_HOSTS.includes(url.hostname);
}

async function put(key, response) {
    // Error pages and opaque (unreadable) responses are not worth replaying.
    if (!response.ok) {
        return;
    }
    const cache = await caches.open(CACHE);
    const url = new URL(typeof key === 'string' ? key : key.url, self.location.origin);
    if (url.origin === self.location.origin) {
        // A deployment changes the ?v= of our files: drop the copies the new one replaces.
        for (const old of await cache.keys()) {
            const oldUrl = new URL(old.url);
            if (oldUrl.pathname === url.pathname && oldUrl.href !== url.href) {
                await cache.delete(old);
            }
        }
    }
    await cache.put(key, response);
}
