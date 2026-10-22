import { startPlaygroundWeb } from '@wp-playground/client';
import { ProgressTracker } from '@php-wasm/progress';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { CHUNK_SIZE, sha256, validateManifest, safePath, rewriteRecords } from '../src/shared.mjs';
import { recovery } from './recovery.js';
import { HEADLESS_THEME, headlessThemeFiles, isRetiredThemeFile } from './headless-theme.js';

const $ = id => document.getElementById(id);
let client, lease, revision = null, config, busy = false, lostLease = false;
let dirtyToken = '', syncTimer, renewTimer, pollTimer, pending;
let unsyncedChanges = false;
let themeMigrationPending = false;
let autoSyncPaused = false;
let savedVersions = [];
const leaseKey = 'joebailey-cms-lease';
let releaseTab, loadingTimer, loadingStarted, lastProgress, loadingActive = false;
const api = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  if (lease) headers.set('X-CMS-Lease', lease);
  const response = await fetch(path, { signal: AbortSignal.timeout(60000), ...options, headers, cache: 'no-store', redirect: 'error' });
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

function showProgress(stage, detail = '', value) {
  if (!loadingActive) return;
  const changed = $('loading-stage').textContent !== stage || $('loading-detail').textContent !== detail || $('loading-progress').value !== value;
  if (changed) lastProgress = Date.now();
  $('loading-stage').textContent = stage;
  $('loading-detail').textContent = detail;
  if (Number.isFinite(value)) $('loading-progress').value = value;
  else $('loading-progress').removeAttribute('value');
}

function startLoading() {
  loadingActive = true;
  loadingStarted = lastProgress = Date.now();
  $('loading').hidden = false;
  loadingTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - loadingStarted) / 1000);
    const idle = Math.floor((Date.now() - lastProgress) / 1000);
    $('loading-time').textContent = `${elapsed}s elapsed · last progress ${idle}s ago`;
    if (idle >= 30) {
      $('loading-help').textContent = 'No progress for 30 seconds. Check your connection; if this continues, reload to resume your editing session.';
      $('reload').hidden = false;
    } else {
      $('loading-help').textContent = 'The first visit downloads WordPress and PHP. Keep this tab open while your saved content is restored.';
      $('reload').hidden = true;
    }
  }, 1000);
}

async function startupStep(promise, message, timeout = 120000) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeout); })]);
  } finally { clearTimeout(timer); }
}

async function openingFailed(error) {
  clearInterval(loadingTimer); clearInterval(renewTimer); clearInterval(pollTimer);
  clearInterval(syncTimer);
  loadingActive = false;
  $('wordpress').hidden = true;
  $('wordpress').src = 'about:blank';
  for (const id of ['sync', 'backup', 'import', 'close']) $(id).disabled = true;
  // Do not leave a failed boot renewing a lease indefinitely.
  if (lease && !lostLease) await api('/api/editor/lease', { method: 'DELETE', allowConflict: true }).catch(() => {});
  lease = null;
  releaseTab?.();
  $('loading').hidden = false;
  $('loading-stage').textContent = 'Editor could not open';
  $('loading-progress').hidden = true;
  $('reload').hidden = false;
  setStatus('Editor could not open');
  notice(error.message);
}

async function claimTab() {
  if (!navigator.locks) throw new Error('This browser does not support editing-session protection. Use a current version of Chrome, Edge, Firefox or Safari.');
  await new Promise((resolve, reject) => {
    navigator.locks.request('joebailey-cms-editor', { ifAvailable: true }, lock => {
      if (!lock) { reject(new Error('The editor is already open in another tab. Close that tab and reload this one.')); return; }
      return new Promise(release => { releaseTab = release; resolve(); });
    }).catch(reject);
  });
}

function freeze(message) {
  lostLease = true;
  clearInterval(syncTimer);
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
  const manifest = validateManifest({ version: 1, runtime: '3.1.60', php: '8.5', wordpress: exported.wordpress, databaseSize: database.length, databaseHash: await sha256(database), chunks, files: files.map(file => ({ path: file.path, hash: file.hash, size: file.size, kind: file.kind, type: file.type })), blogCategory: config.blogCategory, projectsCategory: config.projectsCategory, counts: Object.fromEntries(['blog', 'projects'].map(section => [section, records.filter(post => post.section === section).length])) });
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
    unsyncedChanges = false;
    themeMigrationPending = false;
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

async function prepareHeadlessTheme(manifest) {
  const directory = `/wordpress/wp-content/themes/${HEADLESS_THEME}`;
  await client.mkdir(directory).catch(() => {});
  let changedFiles = false;
  for (const [name, contents] of Object.entries(headlessThemeFiles)) {
    const bytes = strToU8(contents);
    const saved = manifest?.files.find(file => file.path === `themes/${HEADLESS_THEME}/${name}`);
    if (manifest && saved?.hash !== await sha256(bytes)) changedFiles = true;
    await client.writeFile(`${directory}/${name}`, bytes);
  }
  const switched = await php(`wp_clean_themes_cache();
    if (get_stylesheet() !== ${phpString(HEADLESS_THEME)} || get_template() !== ${phpString(HEADLESS_THEME)}) {
      switch_theme(${phpString(HEADLESS_THEME)}); echo 'switched';
    }`);
  // WordPress's core bundle includes this default theme on every boot. Its files
  // are disposable here; historical snapshots and backups remain unchanged.
  const retired = '/wordpress/wp-content/themes/twentytwentyfive';
  if (await client.isDir(retired)) await client.rmdir(retired, { recursive: true });
  if (switched.trim() === 'switched' || changedFiles || manifest?.files.some(file => isRetiredThemeFile(file.path))) {
    themeMigrationPending = true;
    unsyncedChanges = true;
    await client.writeFile('/tmp/joebailey-cms-dirty', crypto.randomUUID());
  }
}

async function restore(checkpoint) {
  showProgress('Restoring WordPress files', 'Verifying the saved database…');
  validateManifest(checkpoint.manifest);
  if (checkpoint.database.length !== checkpoint.manifest.databaseSize) throw new Error('Database backup size mismatch');
  if (await sha256(checkpoint.database) !== checkpoint.manifest.databaseHash) throw new Error('Database backup checksum mismatch');
  const target = (await php('echo joebailey_cms_database_path();')).trim();
  // The snapshot is authoritative for user-owned files. Runtime-owned MU plugins remain pinned.
  const files = checkpoint.files.filter(file => !isRetiredThemeFile(file.path));
  const keep = files.map(file => file.path);
  await php(`$keep = array_flip(json_decode(${phpString(JSON.stringify(keep))}, true)); foreach (array('uploads', 'plugins', 'themes', 'languages') as $dir) { $root = WP_CONTENT_DIR . '/' . $dir; if (!is_dir($root)) continue; $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST); foreach ($it as $file) { if ($file->isFile() && !isset($keep[substr($file->getPathname(), strlen(WP_CONTENT_DIR) + 1)])) unlink($file->getPathname()); } }`);
  const directories = [...new Set(files.map(file => {
    if (!safePath(file.path)) throw new Error(`Invalid backup file: ${file.path}`);
    return `/wordpress/wp-content/${file.path.slice(0, file.path.lastIndexOf('/'))}`;
  }))];
  const created = await client.run({ code: `<?php foreach (json_decode(${phpString(JSON.stringify(directories))}, true) as $dir) { if (!is_dir($dir) && !mkdir($dir, 0777, true)) throw new RuntimeException('Could not create backup directory'); }` });
  if (created.exitCode !== 0) throw new Error('Could not prepare WordPress file directories');
  let restored = 0;
  for (const file of files) {
    if (!safePath(file.path) || file.bytes.length !== file.size || await sha256(file.bytes) !== file.hash) throw new Error(`Invalid backup file: ${file.path}`);
    const path = `/wordpress/wp-content/${file.path}`;
    await client.writeFile(path, file.bytes);
    showProgress('Restoring WordPress files', `${++restored}/${files.length} files · ${file.path}`, restored / files.length * 100);
  }
  showProgress('Restoring the database', 'Applying the verified SQLite snapshot…');
  // Each PHP run closes its PDO connection. Replace the DB only between requests.
  await client.writeFile(target, checkpoint.database);
  for (const suffix of ['-wal', '-shm']) if (await client.fileExists(target + suffix)) await client.unlink(target + suffix);
  await prepareHeadlessTheme(checkpoint.manifest);
  await php("wp_cache_flush(); wp_set_current_user(get_users(array('role' => 'administrator', 'number' => 1))[0]->ID);");
}

async function cloudCheckpoint(snapshot, progress = () => {}, { editing = false } = {}) {
  const manifest = validateManifest(snapshot.manifest);
  const database = new Uint8Array(manifest.databaseSize);
  for (let index = 0; index < manifest.chunks.length; index++) {
    progress('Downloading the database', `Chunk ${index + 1}/${manifest.chunks.length}`, index / manifest.chunks.length * 100);
    const chunk = new Uint8Array(await (await api(`/api/editor/snapshots/${snapshot.id}/chunks/${index}`)).arrayBuffer());
    if (await sha256(chunk) !== manifest.chunks[index]) throw new Error('Cloud database chunk checksum mismatch');
    database.set(chunk, index * CHUNK_SIZE);
  }
  // Backups fetch the complete historical revision. Editing upgrades only the
  // retired default theme, avoiding its 235 individual R2 downloads.
  const entries = editing ? manifest.files.filter(file => !isRetiredThemeFile(file.path)) : manifest.files;
  const files = new Array(entries.length);
  let next = 0, completed = 0, failed = false;
  progress('Downloading saved files', `0/${files.length} files`, 0);
  const downloadFiles = async () => {
    try {
      while (!failed && next < entries.length) {
        const index = next++;
        const item = entries[index];
        const bytes = new Uint8Array(await (await api(`/api/editor/files/${item.hash}`)).arrayBuffer());
        if (bytes.length !== item.size || await sha256(bytes) !== item.hash) throw new Error(`Cloud file checksum or size mismatch: ${item.path}`);
        files[index] = { ...item, bytes };
        progress('Downloading saved files', `${++completed}/${files.length} files · ${item.path}`, completed / files.length * 100);
      }
    } catch (error) { failed = true; throw error; }
  };
  const downloads = await Promise.allSettled(Array.from({ length: Math.min(6, files.length) }, downloadFiles));
  const failure = downloads.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
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

async function prepareBrowserRuntime() {
  showProgress('Checking browser support', 'Registering the WordPress service worker…');
  if (!navigator.serviceWorker) throw new Error('WordPress requires service-worker support and a secure browser connection.');
  try {
    await startupStep((async () => {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', type: 'classic', updateViaCache: 'none' });
      // register() can return an existing registration even when its update fails.
      // Await update explicitly so an authentication redirect is always visible.
      await registration.update();
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker && worker.state !== 'activated') {
        await new Promise((resolve, reject) => {
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve();
            if (worker.state === 'redundant') reject(new Error('The WordPress service worker could not activate'));
          });
        });
      }
    })(), 'The WordPress service-worker request timed out. Reload to retry.', 30000);
  } catch (error) {
    throw new Error(`WordPress could not start its service worker: ${error.message}. If the request was redirected, reopen the CMS login and try again.`);
  }
}

async function boot(snapshot, local) {
  if (!loadingActive) startLoading();
  setStatus('Loading WordPress…');
  if (snapshot?.committed_at) $('last-synced').textContent = `Last synced ${new Date(snapshot.committed_at * 1000).toLocaleString('en-GB')}`;
  const runtime = await (await api('/runtime.json')).json();
  if (snapshot && snapshot.manifest.wordpress !== runtime.wordpress) throw new Error('The saved database requires a different WordPress runtime. Restore the matching pinned runtime before editing.');
  const progressTracker = new ProgressTracker();
  progressTracker.addEventListener('progress', event => showProgress('Starting WordPress', event.detail.caption || 'Downloading PHP and preparing WordPress…', event.detail.progress));
  showProgress('Starting WordPress', 'Downloading PHP and preparing WordPress…');
  client = await startupStep(startPlaygroundWeb({
    iframe: $('wordpress'), remoteUrl: `${location.origin}/remote.html`, scope: 'joebailey-cms',
    progressTracker, detailedProgressCaptions: true,
    blueprint: { landingPage: '/', preferredVersions: { php: '8.5', wp: runtime.wordpress.split('.').slice(0, 2).join('.') }, login: false, features: { networking: false }, constants: { DISABLE_WP_CRON: true, WP_AUTO_UPDATE_CORE: false } }
  }), 'WordPress startup did not finish within two minutes. Reload to retry; your committed cloud snapshot is safe.');
  showProgress('Preparing saved content', 'Installing the CMS bridge…');
  await client.mkdir('/wordpress/wp-content/mu-plugins').catch(() => {});
  await client.writeFile('/wordpress/wp-content/mu-plugins/joebailey-cms.php', await (await api('/joebailey-cms.php')).text());
  if (snapshot) await restore(local || await cloudCheckpoint(snapshot, showProgress, { editing: true }));
  else {
    await php(`foreach (array(${phpString(config.blogCategory)}, ${phpString(config.projectsCategory)}) as $slug) { if (!get_term_by('slug', $slug, 'category')) wp_insert_term(ucfirst($slug), 'category', array('slug' => $slug)); }`);
    await prepareHeadlessTheme();
  }
  // Existing installs may have a different administrator username; authenticate locally.
  showProgress('Opening WordPress admin', 'Signing in to your restored site…');
  await php("$users = get_users(array('role' => 'administrator', 'number' => 1)); if (!$users) throw new RuntimeException('No WordPress administrator in backup'); wp_set_auth_cookie($users[0]->ID, true);");
  const loginToken = crypto.randomUUID();
  await client.writeFile('/tmp/joebailey-cms-login', loginToken);
  const loggedIn = await client.request({ url: `/?joebailey_cms_login=${loginToken}` });
  if (loggedIn.httpStatusCode !== 200) throw new Error('Could not authenticate to restored WordPress');
  await client.goTo('/wp-admin/edit.php');
  if (lostLease) throw new Error('The editing lease was lost during startup. Reload to retry.');
  loadingActive = false;
  clearInterval(loadingTimer);
  $('loading').hidden = true;
  $('wordpress').hidden = false;
  $('backup').disabled = false;
  $('close').disabled = false;
  $('import').disabled = false;
  $('sync').disabled = false;
  setStatus(local ? 'Local changes restored — sync to save to Cloudflare' : 'Ready');
  dirtyToken = (await client.fileExists('/tmp/joebailey-cms-dirty')) ? await client.readFileAsText('/tmp/joebailey-cms-dirty') : '';
  if (local || themeMigrationPending) dirtyToken = '';
  unsyncedChanges = Boolean(local) || themeMigrationPending;
  const detectChanges = async () => {
    const token = await client.fileExists('/tmp/joebailey-cms-dirty') ? await client.readFileAsText('/tmp/joebailey-cms-dirty') : '';
    unsyncedChanges = token !== dirtyToken || Boolean(pending);
    return unsyncedChanges;
  };
  pollTimer = setInterval(async () => {
    if (busy || lostLease || autoSyncPaused) return;
    try {
      if (await detectChanges() && !pending) setStatus('Changes pending · automatic sync every 2 minutes');
    } catch (error) { notice(error.message); }
  }, 3000);
  syncTimer = setInterval(async () => {
    if (busy || lostLease || autoSyncPaused) return;
    try { if (await detectChanges()) await checkpoint(); }
    catch (error) { notice(error.message); }
  }, 120000);
  await refreshBuild();
}

async function openEditor() {
  await claimTab();
  // If runtime validation fails during refresh, release this tab's previous
  // lease too. The tab lock prevents a duplicate tab from releasing it.
  lease = sessionStorage.getItem(leaseKey);
  startLoading();
  // Activate the current cache policy before any status/lease request. Older
  // Playground versions may have cached the CMS shell and API responses.
  await prepareBrowserRuntime();
  let status = await (await api('/api/editor/status')).json();
  config = status.config;
  // sessionStorage belongs to this tab and survives refresh. A Web Lock prevents
  // duplicated tabs (which can inherit sessionStorage) from resuming concurrently.
  const previousLease = lease;
  const acquired = await (await api('/api/editor/lease', { method: 'POST', headers: previousLease ? { 'X-CMS-Lease': previousLease } : {}, body: '{}', allowConflict: true })).json();
  lease = acquired.token;
  sessionStorage.setItem(leaseKey, lease);
  revision = acquired.revision;
  status = await (await api('/api/editor/status')).json();
  if (status.revision !== revision) throw new Error('Cloud revision changed while opening the editor. Reload to retry.');
  renewTimer = setInterval(async () => {
    try { await api('/api/editor/lease', { method: 'PATCH' }); }
    catch (error) { freeze(`Cannot renew editing session: ${error.message}`); }
  }, 30000);
  const local = await recovery('get');
  if (local) {
    loadingActive = false;
    clearInterval(loadingTimer);
    $('loading').hidden = true;
    pending = local;
    $('recovery').hidden = false;
    $('recover').disabled = local.baseRevision !== revision;
    setStatus('Local recovery available');
    $('recover').onclick = async () => { $('recovery').hidden = true; await boot({ manifest: local.manifest }, local).catch(openingFailed); };
    $('download-recovery').onclick = () => download(local);
    $('discard-recovery').onclick = async () => { await recovery('delete'); pending = null; $('recovery').hidden = true; await boot(status.snapshot).catch(openingFailed); };
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
  clearInterval(pollTimer); clearInterval(renewTimer); clearInterval(syncTimer);
  await api('/api/editor/lease', { method: 'DELETE' });
  sessionStorage.removeItem(leaseKey);
  lease = null;
  releaseTab?.();
  $('wordpress').hidden = true;
  $('close').disabled = true; $('sync').disabled = true; $('backup').disabled = true;
  setStatus('Editor closed. Reload to open again.');
};
window.addEventListener('beforeunload', event => {
  if (busy || pending || unsyncedChanges) { event.preventDefault(); event.returnValue = ''; }
});

$('reload').onclick = () => location.reload();
window.addEventListener('pagehide', () => {
  clearInterval(renewTimer); clearInterval(pollTimer); clearInterval(syncTimer);
  releaseTab?.();
});
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
openEditor().catch(openingFailed);
