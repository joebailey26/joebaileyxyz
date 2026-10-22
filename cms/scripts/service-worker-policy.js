// This runs before Playground's fetch listener. Its offline cache is appropriate
// for immutable runtime files, but must never answer CMS or authentication requests.
const cmsNetworkOnly = value => {
  const url = new URL(value);
  return url.origin === self.location.origin && (
    ['/api/', '/media/', '/cdn-cgi/'].some(prefix => url.pathname.startsWith(prefix)) ||
    ['/', '/index.html', '/editor.js', '/editor.css', '/runtime.json', '/runtime-objects.json', '/joebailey-cms.php', '/migration.php'].includes(url.pathname)
  );
};

self.addEventListener('fetch', event => {
  if (cmsNetworkOnly(event.request.url)) event.stopImmediatePropagation();
});

// Remove responses cached by older builds, including the shell that loads the
// CMS client. Never touch WordPress's IndexedDB recovery data or pending edits.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (!name.startsWith('playground-cache')) continue;
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (cmsNetworkOnly(request.url)) await cache.delete(request);
      }
    }
  })());
});
