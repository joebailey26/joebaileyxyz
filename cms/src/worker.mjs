import { editorIdentity, buildIdentity, sameOrigin } from './auth.mjs';
import { assert, CHUNK_SIZE, REVISION, sha256, validateManifest, validateRecord, feedHash } from './shared.mjs';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const now = () => Math.floor(Date.now() / 1000);
const statement = (env, sql, ...values) => env.DB.prepare(sql).bind(...values);
const state = env => env.DB.prepare('SELECT * FROM cms_state WHERE id = 1').first();

function guard(env, token, base) {
  return statement(env, `INSERT INTO commit_assertion(ok) SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cms_state WHERE id = 1 AND lease_token = ? AND lease_expires > ? AND active_revision IS ?
  ) THEN 1 ELSE 0 END`, token, now(), base);
}

async function guardedBatch(env, token, base, statements) {
  try {
    return await env.DB.batch([guard(env, token, base), ...statements, env.DB.prepare('DELETE FROM commit_assertion')]);
  } catch (error) {
    if (/CHECK constraint|commit_assertion/.test(error.message)) throw Object.assign(new Error('Editing lease expired or the cloud revision changed. Recover your local work before reopening.'), { status: 409 });
    throw error;
  }
}

async function requireLease(request, env, owner) {
  const token = request.headers.get('X-CMS-Lease');
  const current = await state(env);
  assert(token && token === current.lease_token && current.lease_owner === owner && current.lease_expires > now(), 'This editing session has expired or another device is editing', 409);
  return { token, current };
}

async function staging(request, env, owner, revision) {
  assert(REVISION.test(revision), 'Invalid revision');
  const lease = await requireLease(request, env, owner);
  const snapshot = await statement(env, 'SELECT * FROM snapshots WHERE id = ?', revision).first();
  assert(snapshot && snapshot.status === 'staging' && snapshot.lease_token === lease.token, 'Unknown staging revision', 404);
  assert(snapshot.base_revision === lease.current.active_revision, 'Cloud revision changed', 409);
  return { ...lease, snapshot, manifest: JSON.parse(snapshot.manifest) };
}

async function bodyJson(request, max = 1800000) {
  const reader = request.body?.getReader();
  assert(reader, 'Request body required');
  const chunks = [];
  let length = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    assert(length <= max, 'Request body too large', 413);
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

async function binaryBody(request, limit) {
  const reader = request.body?.getReader();
  assert(reader, 'Request body required');
  const chunks = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    assert(size <= limit, 'Upload exceeds allowed size', 413);
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

async function buildTriggerId(env) {
  if (env.CF_BUILD_TRIGGER_ID) return env.CF_BUILD_TRIGGER_ID;
  assert(env.CF_WORKER_TAG, 'Cloudflare build trigger is not configured', 503);
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CF_ACCOUNT_ID)}/builds/workers/${encodeURIComponent(env.CF_WORKER_TAG)}/triggers`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${env.CF_BUILD_API_TOKEN}` }, signal: AbortSignal.timeout(20000), redirect: 'error' });
  assert(response.ok, `Cloudflare returned HTTP ${response.status} listing build triggers`, 502);
  const { result } = await response.json();
  const branch = env.SITE_BRANCH || 'master';
  const triggers = Array.isArray(result) ? result : [];
  const trigger = triggers.find(item => Array.isArray(item.branch_includes) && item.branch_includes.includes(branch)) || triggers[0];
  assert(trigger?.trigger_uuid, 'No Workers Builds trigger found for the site Worker', 502);
  return trigger.trigger_uuid;
}

export async function triggerBuild(env, revision) {
  const claim = crypto.randomUUID();
  const claimed = await statement(env, `UPDATE snapshots SET build_claim = ?, build_claim_expires = ?, build_attempts = build_attempts + 1
    WHERE id = ? AND status = 'complete' AND build_status IN ('pending', 'failed') AND build_claim_expires < ? RETURNING id`, claim, now() + 120, revision, now()).first();
  if (!claimed) return;
  try {
    assert(env.CF_ACCOUNT_ID && env.CF_BUILD_API_TOKEN, 'Cloudflare build trigger is not configured', 503);
    const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CF_ACCOUNT_ID)}/builds/triggers/${encodeURIComponent(await buildTriggerId(env))}/builds`;
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CF_BUILD_API_TOKEN}` }, body: JSON.stringify({ branch: env.SITE_BRANCH || 'master' }), signal: AbortSignal.timeout(20000), redirect: 'error' });
    assert(response.ok, `Cloudflare returned HTTP ${response.status}`, 502);
    await statement(env, "UPDATE snapshots SET build_status = 'sent', build_error = NULL, build_claim_expires = 0 WHERE id = ? AND build_claim = ? AND build_status IN ('pending', 'failed')", revision, claim).run();
  } catch (error) {
    // Never persist/log credentials from a network error.
    const message = error.status ? error.message : 'Cloudflare build request failed; retry is available';
    await statement(env, "UPDATE snapshots SET build_status = 'failed', build_error = ?, build_claim_expires = 0 WHERE id = ? AND build_claim = ? AND build_status IN ('pending', 'failed')", message, revision, claim).run();
  }
}

async function cleanup(env) {
  // FK cascading removes chunks, file manifests and feed rows together. R2 content-addressed
  // files are deliberately retained so deployed pages and unsynced recovery files keep working.
  await env.DB.batch([
    statement(env, "DELETE FROM snapshots WHERE status = 'staging' AND created_at < ? AND lease_token IS NOT (SELECT lease_token FROM cms_state WHERE id = 1)", now() - 86400),
    env.DB.prepare(`DELETE FROM snapshots WHERE status = 'complete' AND id NOT IN (
      SELECT id FROM snapshots WHERE status = 'complete' ORDER BY committed_at DESC, rowid DESC LIMIT 3
    ) AND id IS NOT (SELECT active_revision FROM cms_state WHERE id = 1)`)
  ]);
}

async function editorRoute(request, env, ctx, owner, path) {
  sameOrigin(request);
  if (path === '/api/editor/status' && request.method === 'GET') {
    const current = await state(env);
    const snapshot = current.active_revision ? await statement(env, 'SELECT id, manifest, committed_at, build_status, build_error FROM snapshots WHERE id = ?', current.active_revision).first() : null;
    return json({ revision: current.active_revision, snapshot: snapshot && { ...snapshot, manifest: JSON.parse(snapshot.manifest) }, locked: current.lease_expires > now(), owner: current.lease_expires > now() ? current.lease_owner : null, config: { blogCategory: env.BLOG_CATEGORY, projectsCategory: env.PROJECTS_CATEGORY } });
  }
  if (path === '/api/editor/lease' && request.method === 'POST') {
    const resume = request.headers.get('X-CMS-Lease');
    const token = crypto.randomUUID();
    // A tab retains its secret across reloads. Rotate it atomically on resumption so
    // requests from the previous document can neither write nor release the new lease.
    const acquired = await statement(env, `UPDATE cms_state SET lease_token = ?, lease_owner = ?, lease_expires = ?
      WHERE id = 1 AND (lease_expires <= ? OR (lease_token = ? AND lease_owner = ?)) RETURNING active_revision`, token, owner, now() + 120, now(), resume, owner).first();
    assert(acquired, 'Another editing session is open. Close it or wait two minutes for its lease to expire.', 409);
    return json({ token, revision: acquired.active_revision, expires: now() + 120 });
  }
  if (path === '/api/editor/lease' && ['PATCH', 'DELETE'].includes(request.method)) {
    const { token } = await requireLease(request, env, owner);
    const expires = request.method === 'DELETE' ? 0 : now() + 120;
    const renewed = await statement(env, 'UPDATE cms_state SET lease_expires = ? WHERE id = 1 AND lease_token = ? AND lease_expires > ? RETURNING id', expires, token, now()).first();
    assert(renewed, 'Lease expired', 409);
    return json({ expires });
  }
  if (path === '/api/editor/snapshots' && request.method === 'POST') {
    const { token, current } = await requireLease(request, env, owner);
    const body = await bodyJson(request, 12000000);
    assert(body.baseRevision === current.active_revision, 'Cloud revision changed', 409);
    const manifest = validateManifest(body.manifest);
    assert(manifest.blogCategory === env.BLOG_CATEGORY && manifest.projectsCategory === env.PROJECTS_CATEGORY, 'Category mapping does not match server configuration');
    const id = crypto.randomUUID();
    await guardedBatch(env, token, current.active_revision, [
      statement(env, "INSERT INTO snapshots (id, base_revision, lease_token, status, created_at, manifest) VALUES (?, ?, ?, 'staging', ?, ?)", id, current.active_revision, token, now(), JSON.stringify(manifest)),
      statement(env, `INSERT INTO snapshot_files(revision, path, checksum, size, kind)
        SELECT ?, json_extract(f.value, '$.path'), o.checksum, o.size, json_extract(f.value, '$.kind')
        FROM snapshots s, json_each(s.manifest, '$.files') f
        JOIN file_objects o ON o.checksum = json_extract(f.value, '$.hash') AND o.size = json_extract(f.value, '$.size')
        WHERE s.id = ? AND (json_extract(f.value, '$.kind') = 'private' OR o.media = 1)`, id, id)
    ]);
    const { results: present } = await statement(env, 'SELECT path FROM snapshot_files WHERE revision = ?', id).all();
    const knownPaths = new Set(present.map(file => file.path));
    return json({ revision: id, missingFiles: manifest.files.map((file, index) => knownPaths.has(file.path) ? null : index).filter(index => index !== null) }, 201);
  }
  const chunkMatch = path.match(/^\/api\/editor\/snapshots\/([^/]+)\/chunks\/(\d+)$/);
  if (chunkMatch) {
    const [, revision, positionString] = chunkMatch;
    const position = Number(positionString);
    if (request.method === 'PUT') {
      const { token, snapshot, manifest } = await staging(request, env, owner, revision);
      assert(Number.isSafeInteger(position) && position >= 0 && position < manifest.chunks.length, 'Invalid chunk position');
      const bytes = await binaryBody(request, CHUNK_SIZE);
      const expectedLength = Math.min(CHUNK_SIZE, manifest.databaseSize - position * CHUNK_SIZE);
      assert(bytes.length === expectedLength && await sha256(bytes) === manifest.chunks[position], 'Database chunk checksum or size mismatch');
      if (position === 0) assert(new TextDecoder().decode(bytes.subarray(0, 16)) === 'SQLite format 3\0', 'Not a SQLite database');
      await guardedBatch(env, token, snapshot.base_revision, [statement(env, 'INSERT OR REPLACE INTO snapshot_chunks (revision, position, checksum, data) VALUES (?, ?, ?, ?)', revision, position, manifest.chunks[position], bytes)]);
      return json({ ok: true });
    }
    if (request.method === 'GET') {
      const row = await statement(env, "SELECT c.data FROM snapshot_chunks c JOIN snapshots s ON s.id = c.revision WHERE c.revision = ? AND c.position = ? AND s.status = 'complete'", revision, position).first();
      assert(row, 'Snapshot chunk not found', 404);
      return new Response(new Uint8Array(row.data), { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' } });
    }
  }
  const filesMatch = path.match(/^\/api\/editor\/snapshots\/([^/]+)\/files\/(\d+)$/);
  if (filesMatch && request.method === 'PUT') {
    const [, revision, index] = filesMatch;
    const { token, snapshot, manifest } = await staging(request, env, owner, revision);
    const file = manifest.files[Number(index)];
    assert(file, 'Unknown file');
    const key = `files/${file.hash}`;
    const known = await statement(env, 'SELECT size, media FROM file_objects WHERE checksum = ?', file.hash).first();
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
    if (request.headers.get('X-CMS-Reuse') === 'true') {
      if (known?.size !== file.size || !await env.FILES.head(key)) return json({ needsUpload: true });
    } else {
      const bytes = await binaryBody(request, 50 * 1024 * 1024);
      assert(bytes.length === file.size && await sha256(bytes) === file.hash, 'File checksum or size mismatch');
      // R2 objects are immutable by content hash. Authorization is checked again in the SQL batch.
      await env.FILES.put(key, bytes, { httpMetadata: { contentType } });
    }
    await guardedBatch(env, token, snapshot.base_revision, [
      statement(env, `INSERT INTO file_objects(checksum, size, media, content_type) VALUES (?, ?, ?, ?)
        ON CONFLICT(checksum) DO UPDATE SET media = MAX(file_objects.media, excluded.media)`, file.hash, file.size, file.kind === 'media' ? 1 : 0, contentType),
      statement(env, 'INSERT OR REPLACE INTO snapshot_files (revision, path, checksum, size, kind) VALUES (?, ?, ?, ?, ?)', revision, file.path, file.hash, file.size, file.kind)
    ]);
    return json({ ok: true });
  }
  const objectMatch = path.match(/^\/api\/editor\/files\/([a-f0-9]{64})$/);
  if (objectMatch && request.method === 'GET') {
    const object = await env.FILES.get(`files/${objectMatch[1]}`);
    assert(object, 'File not found', 404);
    return new Response(object.body, { headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store' } });
  }
  const contentMatch = path.match(/^\/api\/editor\/snapshots\/([^/]+)\/content\/(blog|projects)$/);
  if (contentMatch && request.method === 'PUT') {
    const [, revision, section] = contentMatch;
    const { token, snapshot } = await staging(request, env, owner, revision);
    const record = await bodyJson(request);
    validateRecord(record, section);
    // A rendered feed cannot reference temporary Playground URLs or unpublished file endpoints.
    assert(!/https?:\/\/[^\s"'<>]*\/scope:[^\s"'<>]*/.test(JSON.stringify(record)), 'Content contains temporary Playground URLs; migrate media and internal links first');
    await guardedBatch(env, token, snapshot.base_revision, [statement(env, 'INSERT OR REPLACE INTO content_records(revision, section, slug, date, payload) VALUES (?, ?, ?, ?, ?)', revision, section, record.slug, record.date, JSON.stringify(record))]);
    return json({ ok: true });
  }
  const commitMatch = path.match(/^\/api\/editor\/snapshots\/([^/]+)\/commit$/);
  if (commitMatch && request.method === 'POST') {
    const revision = commitMatch[1];
    const { token, snapshot, manifest } = await staging(request, env, owner, revision);
    const contentSize = await statement(env, 'SELECT COALESCE(SUM(length(CAST(payload AS BLOB))), 0) AS size FROM content_records WHERE revision = ?', revision).first();
    assert(contentSize.size <= 24 * 1024 * 1024, 'Rendered feed exceeds the 24 MiB checkpoint limit', 413);
    const [{ results: chunks }, { results: files }, { results: rows }] = await Promise.all([
      statement(env, 'SELECT position, checksum, length(data) AS size FROM snapshot_chunks WHERE revision = ? ORDER BY position', revision).all(),
      statement(env, 'SELECT path, checksum, size, kind FROM snapshot_files WHERE revision = ?', revision).all(),
      statement(env, 'SELECT section, payload FROM content_records WHERE revision = ? ORDER BY section, slug', revision).all()
    ]);
    assert(chunks.length === manifest.chunks.length && chunks.every((chunk, i) => chunk.position === i && chunk.checksum === manifest.chunks[i] && chunk.size === Math.min(CHUNK_SIZE, manifest.databaseSize - i * CHUNK_SIZE)), 'Snapshot database is incomplete', 409);
    const fileMap = new Map(files.map(file => [file.path, file]));
    assert(files.length === manifest.files.length && manifest.files.every(file => { const row = fileMap.get(file.path); return row && row.checksum === file.hash && row.size === file.size && row.kind === file.kind; }), 'Snapshot files are incomplete', 409);
    assert(['blog', 'projects'].every(section => rows.filter(row => row.section === section).length === manifest.counts[section]), 'Published feed is incomplete', 409);
    const hash = await feedHash(rows.map(row => JSON.parse(row.payload)));
    const previous = snapshot.base_revision ? await statement(env, 'SELECT feed_hash, build_status, build_error FROM snapshots WHERE id = ?', snapshot.base_revision).first() : null;
    const changed = previous?.feed_hash !== hash;
    const buildStatus = changed ? 'pending' : ['pending', 'failed'].includes(previous?.build_status) ? previous.build_status : 'none';
    await guardedBatch(env, token, snapshot.base_revision, [
      statement(env, "UPDATE snapshots SET build_status = 'superseded' WHERE status = 'complete' AND build_status IN ('pending', 'failed')"),
      statement(env, "UPDATE snapshots SET status = 'complete', committed_at = ?, feed_hash = ?, build_status = ?, build_error = ? WHERE id = ? AND status = 'staging'", now(), hash, buildStatus, changed ? null : previous?.build_error || null, revision),
      statement(env, 'UPDATE cms_state SET active_revision = ? WHERE id = 1', revision)
    ]);
    ctx.waitUntil((async () => { if (changed) await triggerBuild(env, revision); await cleanup(env); })());
    return json({ revision, committedAt: now(), buildStatus });
  }
  const retryMatch = path.match(/^\/api\/editor\/snapshots\/([^/]+)\/retry-build$/);
  if (retryMatch && request.method === 'POST') {
    assert(REVISION.test(retryMatch[1]), 'Invalid revision');
    ctx.waitUntil(triggerBuild(env, retryMatch[1]));
    return json({ queued: true });
  }
  if (path === '/api/editor/snapshots' && request.method === 'GET') {
    const { results } = await env.DB.prepare("SELECT id, committed_at, manifest, build_status, build_error FROM snapshots WHERE status = 'complete' ORDER BY committed_at DESC, rowid DESC LIMIT 3").all();
    return json(results.map(row => ({ ...row, manifest: JSON.parse(row.manifest) })));
  }
  return json({ error: 'Editor endpoint not found' }, 404);
}

async function feedRoute(request, env, path) {
  await buildIdentity(request, env);
  assert(request.method === 'GET', 'Read-only feed', 405);
  if (path === '/api/content/manifest') {
    const current = await state(env);
    assert(current.active_revision, 'No committed CMS snapshot', 503);
    const snapshot = await statement(env, 'SELECT manifest FROM snapshots WHERE id = ?', current.active_revision).first();
    return json({ revision: current.active_revision, counts: JSON.parse(snapshot.manifest).counts });
  }
  if (path === '/api/content/posts') {
    const url = new URL(request.url);
    const revision = url.searchParams.get('revision'), section = url.searchParams.get('section');
    const page = Number(url.searchParams.get('page') || 1), perPage = Number(url.searchParams.get('per_page') || 10);
    assert(REVISION.test(revision) && ['blog', 'projects'].includes(section), 'Specify a revision and section');
    assert(Number.isSafeInteger(page) && page >= 1 && Number.isSafeInteger(perPage) && perPage >= 1 && perPage <= 100, 'Invalid pagination');
    const snapshot = await statement(env, "SELECT manifest FROM snapshots WHERE id = ? AND status = 'complete'", revision).first();
    assert(snapshot, 'This content revision has expired; restart the build', 410);
    const total = JSON.parse(snapshot.manifest).counts[section];
    assert(page <= Math.max(1, Math.ceil(total / perPage)), 'Page out of range', 404);
    const { results } = await statement(env, 'SELECT payload FROM content_records WHERE revision = ? AND section = ? ORDER BY date DESC, slug ASC LIMIT ? OFFSET ?', revision, section, perPage, (page - 1) * perPage).all();
    return json({ revision, total, totalPages: Math.ceil(total / perPage), items: results.map(row => JSON.parse(row.payload)) });
  }
  return json({ error: 'Feed endpoint not found' }, 404);
}

async function mediaRoute(request, env, path) {
  assert(['GET', 'HEAD'].includes(request.method), 'Read-only media', 405);
  const match = path.match(/^\/media\/([a-f0-9]{64})\/[^/]+$/);
  assert(match, 'Media not found', 404);
  const metadata = await statement(env, 'SELECT * FROM file_objects WHERE checksum = ? AND media = 1', match[1]).first();
  assert(metadata, 'Media not found', 404);
  const object = await env.FILES.get(`files/${match[1]}`, { range: request.headers, onlyIf: request.headers });
  assert(object, 'Media not found', 404);
  const inline = /^(image\/(png|jpeg|gif|webp|avif)|video\/(mp4|webm|ogg)|audio\/[a-z0-9.+-]+)$/.test(metadata.content_type);
  const headers = new Headers({
    'Content-Type': inline ? metadata.content_type : 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'ETag': object.httpEtag,
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes'
  });
  if (!inline) headers.set('Content-Disposition', 'attachment');
  let status = 200;
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  if (object.range) {
    headers.set('Content-Range', `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
    headers.set('Content-Length', String(object.range.length));
    status = 206;
  } else headers.set('Content-Length', String(object.size));
  return new Response(request.method === 'HEAD' ? null : object.body, { status, headers });
}

export async function handleRequest(request, env, ctx) {
  try {
    const path = new URL(request.url).pathname;
    if (path.startsWith('/media/')) return await mediaRoute(request, env, path);
    if (path.startsWith('/api/content/')) return await feedRoute(request, env, path);
    const owner = await editorIdentity(request, env);
    if (path.startsWith('/api/editor/')) return await editorRoute(request, env, ctx, owner, path);
    assert(['GET', 'HEAD'].includes(request.method), 'Method not allowed', 405);
    const assetUrl = new URL(request.url);
    if (path === '/') assetUrl.pathname = '/index.html';
    let response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (response.status === 404) {
      const mapping = await env.ASSETS.fetch(new Request(new URL('/runtime-objects.json', request.url)));
      const objects = mapping.ok ? await mapping.json() : {};
      if (objects[path]) {
        const object = await env.FILES.get(`runtime/${objects[path].hash}`);
        assert(object, 'Runtime assets are not uploaded. Run npm run runtime:upload.', 503);
        response = new Response(request.method === 'HEAD' ? null : object.body, { headers: { 'Content-Type': objects[path].type } });
      }
    }
    const headers = new Headers(response.headers);
    // Access-protected runtime assets must never be cached by a shared intermediary.
    headers.set('Cache-Control', 'private, no-cache');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('Referrer-Policy', 'same-origin');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Service-Worker-Allowed', '/');
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    if (!error.status) console.error('CMS request failed', error.name);
    return json({ error: error.status ? error.message : 'CMS storage request failed' }, error.status || 500);
  }
}

export default {
  fetch: handleRequest,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil((async () => {
      const { results } = await env.DB.prepare("SELECT id FROM snapshots WHERE status = 'complete' AND build_status IN ('pending', 'failed') ORDER BY committed_at LIMIT 5").all();
      for (const row of results) await triggerBuild(env, row.id);
      await cleanup(env);
    })());
  }
};
