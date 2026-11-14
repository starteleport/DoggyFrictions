// Registers the service worker (wwwroot/sw.js) that lets the installed app start offline.
// Service workers need a secure context: HTTPS or localhost.
(function () {
    if (!('serviceWorker' in navigator)) {
        window.cacheAppShell = function () { };
        return;
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js');
    });

    // Hands the worker every file this page has loaded so far (scripts, styles, fonts, templates):
    // on the first visit they were fetched before it was running. Called once the app has started.
    window.cacheAppShell = function (extraUrls) {
        navigator.serviceWorker.ready.then(function (registration) {
            var urls = performance.getEntriesByType('resource')
                .map(function (entry) { return entry.name; })
                .concat(extraUrls || [], [window.location.origin + '/']);
            registration.active.postMessage({ type: 'cache-shell', urls: _.uniq(urls) });
        });
    };
})();
