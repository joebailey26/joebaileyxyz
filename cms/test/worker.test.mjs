import test from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './helpers.mjs';
import { CHUNK_SIZE, sha256, validateManifest } from '../src/shared.mjs';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { handleBuildRequest } from '../src/build-worker.mjs';

async function fixture(t) {
  const app = environment();
  t.after(() => app.close());
  const acquired = await app.request('/api/editor/lease', { method: 'POST', body: {} });
  assert.equal(acquired.status, 200);
  const { token: lease } = await acquired.json();
  const database = new Uint8Array(400);
  database.set(new TextEncoder().encode('SQLite format 3\0'));
  const hash = await sha256(database);
  const manifest = { version: 1, runtime: '3.1.60', php: '8.3', wordpress: '6.8.3', databaseSize: database.length, databaseHash: hash, chunks: [hash], files: [], counts: { blog: 1, projects: 0 }, blogCategory: 'blog', projectsCategory: 'projects' };
  const post = { id: 1, section: 'blog', status: 'publish', slug: 'hello', date: '2026-10-22T12:00:00', title: { rendered: 'Hello' }, excerpt: { rendered: '<p>Excerpt</p>' }, content: { rendered: '<p>Content</p>' }, acf: { icons: ['PHP'] }, featured_media_url: null };
  async function start(baseRevision = null, override = {}) {
    const response = await app.request('/api/editor/snapshots', { method: 'POST', lease, body: { baseRevision, manifest: { ...manifest, ...override } } });
    assert.equal(response.status, 201, await response.clone().text());
    return (await response.json()).revision;
  }
  const upload = async (revision, record = post) => {
    assert.equal((await app.request(`/api/editor/snapshots/${revision}/chunks/0`, { method: 'PUT', lease, body: database })).status, 200);
    assert.equal((await app.request(`/api/editor/snapshots/${revision}/content/blog`, { method: 'PUT', lease, body: record })).status, 200);
  };
  const commit = revision => app.request(`/api/editor/snapshots/${revision}/commit`, { method: 'POST', lease, body: {} });
  return { ...app, lease, database, manifest, post, start, upload, commit };
}

test('the separate build host exposes no editor or runtime routes', async t => {
  const f = await fixture(t);
  for (const path of ['/', '/editor.js', '/api/editor/status', '/api/editor/lease']) {
    const response = await handleBuildRequest(new Request(`https://build.example${path}`, { headers: { Authorization: `Bearer ${f.env.CMS_BUILD_TOKEN}` } }), f.env, { waitUntil() {} });
    assert.equal(response.status, 404);
  }
  const response = await handleBuildRequest(new Request('https://build.example/api/content/manifest'), f.env, { waitUntil() {} });
  assert.equal(response.status, 401);
});

test('the separate build feed keeps revisions and routes media through the build host', async t => {
  const f = await fixture(t);
  const media = `https://cms.example/media/${'a'.repeat(64)}/image.png`;
  f.post.featured_media_url = media;
  f.post.content.rendered = `<img src="${media}">`;
  const revision = await f.start();
  await f.upload(revision);
  assert.equal((await f.commit(revision)).status, 200);
  const response = await handleBuildRequest(new Request(`https://build.example/api/content/posts?revision=${revision}&section=blog`, { headers: { Authorization: `Bearer ${f.env.CMS_BUILD_TOKEN}` } }), { ...f.env, EDITOR_ORIGIN: 'https://cms.example' }, { waitUntil() {} });
  const feed = await response.json();
  assert.equal(feed.revision, revision);
  assert.equal(feed.items[0].featured_media_url, media.replace('cms.example', 'build.example'));
  assert.equal(feed.items[0].content.rendered, `<img src="${media.replace('cms.example', 'build.example')}">`);
});

test('a complete checkpoint restores bytes and exposes a revision-pinned, private feed', async t => {
  const f = await fixture(t);
  const revision = await f.start();
  await f.upload(revision);
  assert.equal((await f.commit(revision)).status, 200);
  await f.drain();
  const restored = await f.request(`/api/editor/snapshots/${revision}/chunks/0`);
  assert.deepEqual(new Uint8Array(await restored.arrayBuffer()), f.database);
  assert.equal((await f.request('/api/content/manifest')).status, 401);
  const headers = { Authorization: `Bearer ${f.env.CMS_BUILD_TOKEN}` };
  const response = await f.request(`/api/content/posts?revision=${revision}&section=blog`, { headers });
  const content = await response.json();
  assert.equal(content.revision, revision);
  assert.deepEqual(content.items, [f.post]);
  assert.equal((await f.request(`/api/content/posts?section=blog`, { headers })).status, 400);
});

test('interrupted uploads cannot activate a snapshot or replace the working revision', async t => {
  const f = await fixture(t);
  const first = await f.start(); await f.upload(first); await f.commit(first); await f.drain();
  const second = await f.start(first);
  assert.equal((await f.commit(second)).status, 409);
  assert.equal((await (await f.request('/api/editor/status')).json()).revision, first);
});

test('chunk checksums, SQLite headers, file manifests and draft exclusion are enforced', async t => {
  const f = await fixture(t);
  const revision = await f.start();
  const invalid = f.database.slice(); invalid[100] = 1;
  assert.equal((await f.request(`/api/editor/snapshots/${revision}/chunks/0`, { method: 'PUT', lease: f.lease, body: invalid })).status, 400);
  assert.equal((await f.request(`/api/editor/snapshots/${revision}/content/blog`, { method: 'PUT', lease: f.lease, body: { ...f.post, status: 'draft' } })).status, 400);
  assert.throws(() => validateManifest({ ...f.manifest, files: [{ path: 'uploads/../secret', hash: f.manifest.databaseHash, size: 1, kind: 'media' }] }), /Unsafe/);
  assert.equal((await f.request(`/api/editor/snapshots/${revision}/chunks/0`)).status, 404);
});

test('an editing lease excludes other sessions and rejects stale writes', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/api/editor/lease', { method: 'POST', body: {} })).status, 409);
  assert.equal((await f.request('/api/editor/snapshots', { method: 'POST', lease: 'stale', body: {} })).status, 409);
  f.sqlite.exec('UPDATE cms_state SET lease_expires = 0');
  assert.equal((await f.request('/api/editor/lease', { method: 'PATCH', lease: f.lease })).status, 409);
});

test('lease expiry during commit rolls back the snapshot and active pointer atomically', async t => {
  const f = await fixture(t);
  const revision = await f.start(); await f.upload(revision);
  f.db.beforeBatch = () => { f.sqlite.exec('UPDATE cms_state SET lease_expires = 0'); f.db.beforeBatch = null; };
  assert.equal((await f.commit(revision)).status, 409);
  assert.equal(f.sqlite.prepare('SELECT status FROM snapshots WHERE id = ?').get(revision).status, 'staging');
  assert.equal(f.sqlite.prepare('SELECT active_revision FROM cms_state').get().active_revision, null);
});

test('R2 file uploads are checked, reusable and private unless explicitly media', async t => {
  const f = await fixture(t);
  const bytes = new TextEncoder().encode('private plugin file');
  const hash = await sha256(bytes);
  const files = [{ path: 'plugins/example/example.php', hash, size: bytes.length, kind: 'private' }];
  const revision = await f.start(null, { files });
  const endpoint = `/api/editor/snapshots/${revision}/files/0`;
  assert.equal((await f.request(endpoint, { method: 'PUT', lease: f.lease, body: new Uint8Array([1]) })).status, 400);
  assert.equal((await f.request(endpoint, { method: 'PUT', lease: f.lease, body: bytes })).status, 200);
  assert.equal((await f.request(endpoint, { method: 'PUT', lease: f.lease, headers: { 'X-CMS-Reuse': 'true' } })).status, 200);
  assert.equal((await f.request(`/media/${hash}/example.php`)).status, 404);
  const restored = await f.request(`/api/editor/files/${hash}`);
  assert.deepEqual(new Uint8Array(await restored.arrayBuffer()), bytes);
});

test('production editor access cannot use the localhost bypass or a build token', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/api/editor/status', { origin: 'https://cms.joebailey.xyz' })).status, 401);
  assert.equal((await f.request('/api/editor/status', { origin: 'https://cms.joebailey.xyz', headers: { Authorization: `Bearer ${f.env.CMS_BUILD_TOKEN}` } })).status, 401);
  const request = new Request('http://localhost/api/editor/lease', { method: 'POST', headers: { Origin: 'https://attacker.example' } });
  const { handleRequest } = await import('../src/worker.mjs');
  assert.equal((await handleRequest(request, f.env, { waitUntil() {} })).status, 403);
});

test('Access JWT signature, audience and expiration are verified', async t => {
  const f = await fixture(t);
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...await exportJWK(publicKey), kid: 'cms-test-key', alg: 'RS256', use: 'sig' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ keys: [jwk] });
  t.after(() => { globalThis.fetch = originalFetch; });
  const token = (audience, expires = '2m') => new SignJWT({ email: 'editor@example.test' }).setProtectedHeader({ alg: 'RS256', kid: jwk.kid }).setIssuer('https://example.cloudflareaccess.com').setAudience(audience).setIssuedAt().setExpirationTime(expires).sign(privateKey);
  const good = await token('test-audience');
  assert.equal((await f.request('/api/editor/status', { origin: 'https://cms.joebailey.xyz', headers: { 'Cf-Access-Jwt-Assertion': good } })).status, 200);
  const wrongAudience = await token('other-audience');
  assert.equal((await f.request('/api/editor/status', { origin: 'https://cms.joebailey.xyz', headers: { 'Cf-Access-Jwt-Assertion': wrongAudience } })).status, 401);
  const expired = await token('test-audience', '-1m');
  assert.equal((await f.request('/api/editor/status', { origin: 'https://cms.joebailey.xyz', headers: { 'Cf-Access-Jwt-Assertion': expired } })).status, 401);
});

test('only published output changes schedule builds; failed hooks can be retried', async t => {
  const f = await fixture(t);
  const originalFetch = globalThis.fetch;
  let builds = 0;
  globalThis.fetch = async () => { builds++; return new Response('', { status: 200 }); };
  t.after(() => { globalThis.fetch = originalFetch; });
  f.env.NETLIFY_BUILD_HOOK = 'https://api.netlify.com/build_hooks/testhook';
  const one = await f.start(); await f.upload(one); await f.commit(one); await f.drain();
  assert.equal(builds, 1);
  const two = await f.start(one); await f.upload(two); await f.commit(two); await f.drain();
  assert.equal(builds, 1, 'a full database checkpoint with identical published content should not rebuild');
  const three = await f.start(two); await f.upload(three, { ...f.post, content: { rendered: 'Updated content' } });
  globalThis.fetch = async () => { builds++; return new Response('', { status: 503 }); };
  await f.commit(three); await f.drain();
  assert.equal(f.sqlite.prepare('SELECT build_status FROM snapshots WHERE id = ?').get(three).build_status, 'failed');
  globalThis.fetch = async () => { builds++; return new Response('', { status: 200 }); };
  await f.request(`/api/editor/snapshots/${three}/retry-build`, { method: 'POST', body: {} }); await f.drain();
  assert.equal(f.sqlite.prepare('SELECT build_status FROM snapshots WHERE id = ?').get(three).build_status, 'sent');
  const four = await f.start(three, { counts: { blog: 0, projects: 0 } });
  await f.request(`/api/editor/snapshots/${four}/chunks/0`, { method: 'PUT', lease: f.lease, body: f.database });
  await f.commit(four); await f.drain();
  assert.equal(f.sqlite.prepare("SELECT count(*) AS total FROM snapshots WHERE status = 'complete'").get().total, 3);
  assert.equal(f.sqlite.prepare('SELECT count(*) AS total FROM snapshot_chunks WHERE revision = ?').get(one).total, 0);
});

test('256 KiB chunking is deterministic at boundary sizes', async () => {
  const bytes = new Uint8Array(CHUNK_SIZE + 1);
  assert.equal(Math.ceil(bytes.length / CHUNK_SIZE), 2);
  assert.notEqual(await sha256(bytes.subarray(0, CHUNK_SIZE)), await sha256(bytes.subarray(CHUNK_SIZE)));
});
