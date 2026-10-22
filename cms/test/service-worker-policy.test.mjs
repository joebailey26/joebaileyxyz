import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function policy(caches = {}) {
  const listeners = new Map();
  runInNewContext(readFileSync(new URL('../scripts/service-worker-policy.js', import.meta.url), 'utf8'), {
    URL, caches,
    self: { location: new URL('https://cms.example/sw.js'), addEventListener(type, listener) { listeners.set(type, listener); } }
  });
  return listeners;
}

test('CMS state, shell, media and authentication never reach the offline cache', () => {
  const listeners = policy();
  for (const path of ['/', '/index.html', '/editor.js', '/editor.css', '/runtime.json', '/joebailey-cms.php', '/api/editor/status', '/api/editor/snapshots/one/chunks/0', '/api/content/manifest', '/media/hash/image.jpg', '/cdn-cgi/access/logout']) {
    let networkOnly = false;
    listeners.get('fetch')({ request: { url: `https://cms.example${path}` }, stopImmediatePropagation() { networkOnly = true; } });
    assert.equal(networkOnly, true, path);
  }
  for (const path of ['/scope:joebailey-cms/wp-admin/edit.php', '/scope:joebailey-cms/api/example', '/assets/pinned-runtime.wasm', '/wp-7.0/wordpress-static.zip']) {
    listeners.get('fetch')({ request: { url: `https://cms.example${path}` }, stopImmediatePropagation() { assert.fail(`Must preserve Playground routing/cache for ${path}`); } });
  }
});

test('activation removes old cached CMS responses while retaining immutable runtime files', async () => {
  const entries = ['/', '/editor.js', '/api/editor/status', '/api/editor/files/hash', '/assets/runtime.wasm'].map(path => ({ url: `https://cms.example${path}` }));
  const removed = [];
  const listeners = policy({
    async keys() { return ['playground-cache-old', 'another-app']; },
    async open(name) {
      assert.equal(name, 'playground-cache-old');
      return { async keys() { return entries; }, async delete(request) { removed.push(request.url); } };
    }
  });
  let activation;
  listeners.get('activate')({ waitUntil(promise) { activation = promise; } });
  await activation;
  assert.deepEqual(removed, entries.slice(0, 4).map(request => request.url));
});
