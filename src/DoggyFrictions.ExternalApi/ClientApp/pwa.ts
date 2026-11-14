// The service worker (wwwroot/sw.js) lets the installed app start offline.
// Service workers need a secure context: HTTPS or localhost.

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
  }
}

/**
 * Hands the worker every file this page has loaded (the page, scripts, styles, fonts): on the first
 * visit they were fetched before it was running. Call once the app has started.
 */
export function cacheAppShell() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  void navigator.serviceWorker.ready.then(registration => {
    const urls = performance.getEntriesByType('resource').map(entry => entry.name).concat(`${location.origin}/`);
    registration.active?.postMessage({ type: 'cache-shell', urls: [...new Set(urls)] });
  });
}
