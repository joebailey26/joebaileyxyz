import { startPlaygroundWeb } from '@wp-playground/client';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { CHUNK_SIZE, sha256, validateManifest, safePath, rewriteRecords } from '../src/shared.mjs';
import { recovery } from './recovery.js';

const $ = id => document.getElementById(id);
let client, lease, revision = null, config, busy = false, lostLease = false;
let dirtyToken = '', checkpointTimer, renewTimer, pollTimer, pending;
let autoSyncPaused = false;
let savedVersions = [];
const api = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  if (lease) headers.set('X-CMS-Lease', lease);
  const response = await fetch(path, { ...options, headers, cache: 'no-store', redirect: 'error' });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = Object.assign(new Error(body.error || `Request failed (${response.status})`), { status: response.status });
    if (response.status === 409 && !options.allowConflict) freeze(error.message);
    throw error;
  }
  return response;
};
const send = async (path, body, method = 'POST') => (await api(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
const setStatus = message => { $('status').textContent = message; };
const notice = message => { $('notice').textContent = message; $('notice').hidden = !message; };

function freeze(message) {
  lostLease = true;
  clearTimeout(checkpointTimer);
  clearInterval(renewTimer);
  $('sync').disabled = true;
  document.body.classList.add('busy');
  notice(`${message} Download a backup to keep any unsynced work.`);
  setStatus('Editing paused');
}

async function php(code) {
  const result = await client.run({ code: `<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; ${code}` });
  if (result.exitCode !== 0 || result.httpStatusCode >= 400) throw new Error(result.errors || result.text || 'WordPress checkpoint failed');
  return result.text;
}

const phpString = value => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

function mediaType(path) {
  const extension = path.split('.').pop().toLowerCase();
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', ogg: 'audio/ogg', mp3: 'audio/mpeg', wav: 'audio/wav' })[extension] || 'application/octet-stream';
}

async function capture() {
  await client.writeFile('/tmp/joebailey-cms-lock', '1');
  try { return await captureLocked(); }
  finally { await client.unlink('/tmp/joebailey-cms-lock'); }
}

async function captureLocked() {
  const exported = JSON.parse(await php(`echo wp_json_encode(joebailey_cms_capture(json_decode(${phpString(JSON.stringify(config))}, true)), JSON_THROW_ON_ERROR);`));
  const database = await client.readFileAsBuffer('/tmp/joebailey-cms.sqlite');
  const files = [];
  for (const item of exported.files.sort((a, b) => a.path.localeCompare(b.path))) {
    if (!safePath(item.path)) throw new Error(`Unsupported WordPress file path: ${item.path}`);
    const bytes = await client.readFileAsBuffer(`/wordpress/wp-content/${item.path}`);
    const hash = await sha256(bytes);
    const file = { path: item.path, hash, size: bytes.length, kind: item.path.startsWith('uploads/') ? 'media' : 'private', type: mediaType(item.path), bytes };
    files.push(file);
  }
  const records = rewriteRecords(exported, files, location.origin);
  const chunks = [];
  for (let position = 0; position < database.length; position += CHUNK_SIZE) chunks.push(await sha256(database.subarray(position, position + CHUNK_SIZE)));
  const manifest = validateManifest({ version: 1, runtime: '3.1.60', php: '8.3', wordpress: exported.wordpress, databaseSize: database.length, databaseHash: await sha256(database), chunks, files: files.map(file => ({ path: file.path, hash: file.hash, size: file.size, kind: file.kind, type: file.type })), blogCategory: config.blogCategory, projectsCategory: config.projectsCategory, counts: Object.fromEntries(['blog', 'projects'].map(section => [section, records.filter(post => post.section === section).length])) });
  return { manifest, database, files, records, baseRevision: revision, dirtyToken: exported.dirtyToken };
}

async function checkpoint() {
  if (busy || lostLease || !client) return;
  busy = true;
  $('sync').disabled = true;
  document.body.classList.add('busy');
  setStatus('Saving a recovery copy…');
  try {
    pending = await capture();
    await recovery('put', pending);
    const result = await send('/api/editor/snapshots', { baseRevision: revision, manifest: pending.manifest });
    const base = `/api/editor/snapshots/${result.revision}`;
    for (let position = 0; position < pending.manifest.chunks.length; position++) {
      setStatus(`Syncing database ${position + 1}/${pending.manifest.chunks.length}…`);
      await api(`${base}/chunks/${position}`, { method: 'PUT', body: pending.database.slice(position * CHUNK_SIZE, (position + 1) * CHUNK_SIZE) });
    }
    const missingFiles = result.missingFiles;
    let nextFile = 0, completedFiles = 0;
    const uploadFiles = async () => {
      while (nextFile < missingFiles.length) {
        const index = missingFiles[nextFile++];
        const file = pending.files[index];
        await api(`${base}/files/${index}`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file.bytes });
        setStatus(`Syncing changed files ${++completedFiles}/${missingFiles.length}…`);
      }
    };
    const uploads = await Promise.allSettled(Array.from({ length: Math.min(4, missingFiles.length) }, uploadFiles));
    const failure = uploads.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    for (const post of pending.records) await send(`${base}/content/${post.section}`, post, 'PUT');
    setStatus('Committing cloud version…');
    const committed = await send(`${base}/commit`, {});
    revision = committed.revision;
    dirtyToken = pending.dirtyToken;
    await recovery('delete');
    pending = null;
    notice('');
    setStatus('Synced to Cloudflare');
    $('last-synced').textContent = `Last synced ${new Date(committed.committedAt * 1000).toLocaleString('en-GB')}`;
    await refreshBuild();
  } catch (error) {
    if (error.status === 409) freeze(error.message);
    else { notice(`${error.message}. Your last recovery copy remains on this device. Use Sync now to retry.`); setStatus('Not synced'); }
  } finally {
    busy = false;
    $('sync').disabled = lostLease;
    if (!lostLease) document.body.classList.remove('busy');
  }
}

async function restore(checkpoint) {
  validateManifest(checkpoint.manifest);
  if (checkpoint.database.length !== checkpoint.manifest.databaseSize) throw new Error('Database backup size mismatch');
  if (await sha256(checkpoint.database) !== checkpoint.manifest.databaseHash) throw new Error('Database backup checksum mismatch');
  const target = (await php('echo joebailey_cms_database_path();')).trim();
  // The snapshot is authoritative for user-owned files. Runtime-owned MU plugins remain pinned.
  const keep = checkpoint.manifest.files.map(file => file.path);
  await php(`$keep = array_flip(json_decode(${phpString(JSON.stringify(keep))}, true)); foreach (array('uploads', 'plugins', 'themes', 'languages') as $dir) { $root = WP_CONTENT_DIR . '/' . $dir; if (!is_dir($root)) continue; $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST); foreach ($it as $file) { if ($file->isFile() && !isset($keep[substr($file->getPathname(), strlen(WP_CONTENT_DIR) + 1)])) unlink($file->getPathname()); } }`);
  for (const file of checkpoint.files) {
    if (!safePath(file.path) || file.bytes.length !== file.size || await sha256(file.bytes) !== file.hash) throw new Error(`Invalid backup file: ${file.path}`);
    const path = `/wordpress/wp-content/${file.path}`;
    await client.mkdir(path.slice(0, path.lastIndexOf('/'))).catch(() => {});
    // mkdirTree via PHP handles nested directories consistently across Playground versions.
    await client.run({ code: `<?php if (!is_dir(${phpString(path.slice(0, path.lastIndexOf('/')))})) mkdir(${phpString(path.slice(0, path.lastIndexOf('/')))}, 0777, true);` });
    await client.writeFile(path, file.bytes);
  }
  // Each PHP run closes its PDO connection. Replace the DB only between requests.
  await client.writeFile(target, checkpoint.database);
  for (const suffix of ['-wal', '-shm']) if (await client.fileExists(target + suffix)) await client.unlink(target + suffix);
  await php("wp_cache_flush(); wp_set_current_user(get_users(array('role' => 'administrator', 'number' => 1))[0]->ID);");
}

async function cloudCheckpoint(snapshot) {
  const manifest = validateManifest(snapshot.manifest);
  const database = new Uint8Array(manifest.databaseSize);
  for (let index = 0; index < manifest.chunks.length; index++) {
    const chunk = new Uint8Array(await (await api(`/api/editor/snapshots/${snapshot.id}/chunks/${index}`)).arrayBuffer());
    if (await sha256(chunk) !== manifest.chunks[index]) throw new Error('Cloud database chunk checksum mismatch');
    database.set(chunk, index * CHUNK_SIZE);
  }
  const files = [];
  for (const item of manifest.files) {
    const bytes = new Uint8Array(await (await api(`/api/editor/files/${item.hash}`)).arrayBuffer());
    files.push({ ...item, bytes });
  }
  return { manifest, database, files, baseRevision: snapshot.id };
}

function download(checkpoint) {
  const entries = { 'manifest.json': strToU8(JSON.stringify(checkpoint.manifest, null, 2)), 'database.sqlite': checkpoint.database };
  for (const file of checkpoint.files) entries[`wp-content/${file.path}`] = file.bytes;
  const blob = new Blob([zipSync(entries, { level: 1 })], { type: 'application/zip' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `joebailey-wordpress-${new Date().toISOString().replaceAll(':', '-')}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
}

async function refreshBuild() {
  const status = await (await api('/api/editor/status')).json();
  savedVersions = await (await api('/api/editor/snapshots')).json();
  $('versions').replaceChildren(...savedVersions.map(snapshot => {
    const option = document.createElement('option');
    option.value = snapshot.id;
    option.textContent = new Date(snapshot.committed_at * 1000).toLocaleString('en-GB');
    return option;
  }));
  $('cloud-backups').hidden = !savedVersions.length;
  $('download-version').hidden = !savedVersions.length;
  $('retry').hidden = status.snapshot?.build_status !== 'failed';
  if (status.snapshot?.build_error) notice(`Content is synced. Website rebuild: ${status.snapshot.build_error}`);
}

async function boot(snapshot, local) {
  setStatus('Loading WordPress…');
  if (snapshot?.committed_at) $('last-synced').textContent = `Last synced ${new Date(snapshot.committed_at * 1000).toLocaleString('en-GB')}`;
  const runtime = await (await api('/runtime.json')).json();
  if (snapshot && snapshot.manifest.wordpress !== runtime.wordpress) throw new Error('The saved database requires a different WordPress runtime. Restore the matching pinned runtime before editing.');
  client = await startPlaygroundWeb({
    iframe: $('wordpress'), remoteUrl: `${location.origin}/remote.html`, scope: 'joebailey-cms',
    blueprint: { landingPage: '/', preferredVersions: { php: '8.3', wp: runtime.wordpress.split('.').slice(0, 2).join('.') }, login: false, features: { networking: false }, constants: { DISABLE_WP_CRON: true, WP_AUTO_UPDATE_CORE: false } }
  });
  await client.mkdir('/wordpress/wp-content/mu-plugins').catch(() => {});
  await client.writeFile('/wordpress/wp-content/mu-plugins/joebailey-cms.php', await (await api('/joebailey-cms.php')).text());
  if (snapshot) await restore(local || await cloudCheckpoint(snapshot));
  else {
    await php(`foreach (array(${phpString(config.blogCategory)}, ${phpString(config.projectsCategory)}) as $slug) { if (!get_term_by('slug', $slug, 'category')) wp_insert_term(ucfirst($slug), 'category', array('slug' => $slug)); }`);
  }
  // Existing installs may have a different administrator username; authenticate locally.
  await php("$users = get_users(array('role' => 'administrator', 'number' => 1)); if (!$users) throw new RuntimeException('No WordPress administrator in backup'); wp_set_auth_cookie($users[0]->ID, true);");
  const loginToken = crypto.randomUUID();
  await client.writeFile('/tmp/joebailey-cms-login', loginToken);
  const loggedIn = await client.request({ url: `/?joebailey_cms_login=${loginToken}` });
  if (loggedIn.httpStatusCode !== 200) throw new Error('Could not authenticate to restored WordPress');
  await client.goTo('/wp-admin/edit.php');
  $('wordpress').hidden = false;
  $('backup').disabled = false;
  $('close').disabled = false;
  $('import').disabled = false;
  $('sync').disabled = false;
  setStatus(local ? 'Local changes restored — sync to save to Cloudflare' : 'Ready');
  dirtyToken = (await client.fileExists('/tmp/joebailey-cms-dirty')) ? await client.readFileAsText('/tmp/joebailey-cms-dirty') : '';
  if (local) dirtyToken = '';
  pollTimer = setInterval(async () => {
    if (busy || lostLease || autoSyncPaused) return;
    try {
      const token = await client.fileExists('/tmp/joebailey-cms-dirty') ? await client.readFileAsText('/tmp/joebailey-cms-dirty') : '';
      if (token !== dirtyToken) { clearTimeout(checkpointTimer); checkpointTimer = setTimeout(checkpoint, 1500); }
    } catch (error) { notice(error.message); }
  }, 3000);
  await refreshBuild();
}

async function openEditor() {
  let status = await (await api('/api/editor/status')).json();
  config = status.config;
  const acquired = await send('/api/editor/lease', {});
  lease = acquired.token;
  revision = acquired.revision;
  status = await (await api('/api/editor/status')).json();
  if (status.revision !== revision) throw new Error('Cloud revision changed while opening the editor. Reload to retry.');
  renewTimer = setInterval(async () => {
    try { await api('/api/editor/lease', { method: 'PATCH' }); }
    catch (error) { freeze(`Cannot renew editing session: ${error.message}`); }
  }, 30000);
  const local = await recovery('get');
  if (local) {
    pending = local;
    $('recovery').hidden = false;
    $('recover').disabled = local.baseRevision !== revision;
    setStatus('Local recovery available');
    $('recover').onclick = async () => { $('recovery').hidden = true; await boot({ manifest: local.manifest }, local); };
    $('download-recovery').onclick = () => download(local);
    $('discard-recovery').onclick = async () => { await recovery('delete'); pending = null; $('recovery').hidden = true; await boot(status.snapshot); };
  } else await boot(status.snapshot);
}

$('sync').onclick = () => { autoSyncPaused = false; return checkpoint(); };
$('backup').onclick = async () => { try { download(busy ? pending : await capture()); } catch (error) { notice(error.message); } };
$('download-version').onclick = async () => {
  $('download-version').disabled = true;
  try {
    const snapshot = savedVersions.find(snapshot => snapshot.id === $('versions').value);
    if (snapshot) download(await cloudCheckpoint(snapshot));
  } catch (error) { notice(`Could not download saved version: ${error.message}`); }
  finally { $('download-version').disabled = false; }
};
$('retry').onclick = async () => { await send(`/api/editor/snapshots/${revision}/retry-build`, {}); setStatus('Website rebuild requested'); };
$('import').onchange = async event => {
  if (busy || lostLease || !event.target.files[0]) return;
  autoSyncPaused = true;
  busy = true;
  document.body.classList.add('busy');
  try {
    // Keep the current site recoverable before an explicitly selected import.
    pending = await capture();
    await recovery('put', pending);
    const entries = unzipSync(new Uint8Array(await event.target.files[0].arrayBuffer()));
    if (entries['manifest.json'] && entries['database.sqlite']) {
      const manifest = validateManifest(JSON.parse(strFromU8(entries['manifest.json'])));
      const current = JSON.parse(await php('echo wp_json_encode(array("wordpress" => $GLOBALS["wp_version"]));'));
      if (manifest.wordpress !== current.wordpress) throw new Error('Backup WordPress version does not match the pinned runtime');
      const files = manifest.files.map(file => {
        const bytes = entries[`wp-content/${file.path}`];
        if (!bytes) throw new Error(`Backup is missing ${file.path}`);
        return { ...file, bytes };
      });
      await restore({ manifest, database: entries['database.sqlite'], files });
    } else if (entries['migration.json']) {
      await client.writeFile('/tmp/joebailey-migration.json', entries['migration.json']);
      for (const [path, bytes] of Object.entries(entries)) {
        if (!path.startsWith('wp-content/')) continue;
        const relative = path.slice('wp-content/'.length);
        if (!safePath(relative)) throw new Error(`Unsafe migration path: ${relative}`);
        const target = `/wordpress/wp-content/${relative}`;
        await client.run({ code: `<?php if (!is_dir(dirname(${phpString(target)}))) mkdir(dirname(${phpString(target)}), 0777, true);` });
        await client.writeFile(target, bytes);
      }
      const migrationPhp = await (await api('/migration.php')).text();
      await client.writeFile('/tmp/joebailey-import.php', migrationPhp);
      const report = JSON.parse(await php("require '/tmp/joebailey-import.php'; echo wp_json_encode(joebailey_cms_import('/tmp/joebailey-migration.json'), JSON_THROW_ON_ERROR);"));
      notice(`Imported ${report.posts} posts and ${report.media} media records. Verify both sections before publishing the first cloud version.`);
    } else throw new Error('Select a CMS backup ZIP or a migration ZIP produced by the export tool');
    await client.writeFile('/tmp/joebailey-cms-dirty', crypto.randomUUID());
    await client.goTo('/wp-admin/edit.php');
    setStatus('Import complete — Sync now when ready');
    pending = await capture();
    await recovery('put', pending);
  } catch (error) { notice(`Import failed: ${error.message}. The pre-import recovery backup remains on this device.`); }
  finally { busy = false; document.body.classList.remove('busy'); event.target.value = ''; }
};
$('close').onclick = async () => {
  if (busy) return;
  await checkpoint();
  if (pending || lostLease) return;
  clearInterval(pollTimer); clearInterval(renewTimer);
  await api('/api/editor/lease', { method: 'DELETE' });
  $('wordpress').hidden = true;
  $('close').disabled = true; $('sync').disabled = true; $('backup').disabled = true;
  setStatus('Editor closed. Reload to open again.');
};
window.addEventListener('beforeunload', event => {
  if (busy || pending) { event.preventDefault(); event.returnValue = ''; }
});

openEditor().catch(error => { setStatus('Editor could not open'); notice(error.message); });
