import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright');
const upstream = process.env.CMS_TEST_ORIGIN || 'http://127.0.0.1:8788';
if (!['localhost', '127.0.0.1'].includes(new URL(upstream).hostname)) throw new Error('Loading tests may only use a local CMS');
// Model Access in front of the real emulator: the service-worker script requires
// an HttpOnly login cookie, and a missing cookie produces an authentication redirect.
let failServiceWorker = false;
let delayFiles = true, active = 0, maximum = 0;
const workerRequests = [];
const fileRequests = [];
const proxy = createServer(async (request, response) => {
  try {
    if (request.url.split('?')[0] === '/sw.js') {
      workerRequests.push({ hasCookie: (request.headers.cookie || '').includes('cms_test_auth=yes') });
      if (failServiceWorker || !workerRequests.at(-1).hasCookie) {
        response.writeHead(302, { Location: '/login' }); response.end(); return;
      }
    }
    const headers = new Headers(request.headers);
    headers.delete('host');
    if (headers.has('origin')) headers.set('origin', upstream);
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const isFile = request.url.startsWith('/api/editor/files/');
    if (isFile) fileRequests.push(request.url.split('/').pop());
    if (isFile) { active++; maximum = Math.max(maximum, active); }
    let result, bytes;
    try {
      result = await fetch(`${upstream}${request.url}`, { method: request.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined, redirect: 'manual' });
      bytes = Buffer.from(await result.arrayBuffer());
      if (isFile && delayFiles) await new Promise(resolve => setTimeout(resolve, 40));
    } finally { if (isFile) active--; }
    const outputHeaders = Object.fromEntries(result.headers);
    delete outputHeaders['content-encoding']; delete outputHeaders['content-length'];
    if (request.url === '/') outputHeaders['set-cookie'] = 'cms_test_auth=yes; HttpOnly; SameSite=Lax; Path=/';
    response.writeHead(result.status, outputHeaders); response.end(bytes);
  } catch (error) { response.writeHead(502); response.end(error.message); }
});
await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${proxy.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
let lease;
const timings = [];
page.on('response', async response => {
  if (response.url().endsWith('/api/editor/lease') && response.request().method() === 'POST' && response.ok()) lease = (await response.json()).token;
});
page.on('pageerror', error => console.error('Page error:', error.message));
const waitForResult = async target => {
  await target.waitForFunction(() => ['Ready', 'Editor could not open'].includes(document.querySelector('#status').textContent), null, { timeout: 180000 });
  return target.locator('#status').textContent();
};
try {
  await mkdir(join(root, '.cache'), { recursive: true });
  const original = await (await context.request.get(`${origin}/api/editor/status`)).json();
  const retired = new Set(original.snapshot.manifest.files.filter(file => file.path.startsWith('themes/twentytwentyfive/')).map(file => file.hash));
  // Keep file transfers observable, and ensure restore actually runs concurrently.
  let started = Date.now();
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector('#loading-stage').textContent === 'Downloading saved files' || document.querySelector('#status').textContent === 'Editor could not open', null, { timeout: 150000 });
  assert.notEqual(await page.locator('#status').textContent(), 'Editor could not open', await page.locator('#notice').textContent());
  assert.match(await page.locator('#loading-detail').textContent(), /\d+\/\d+ files/);
  await page.screenshot({ path: join(root, '.cache/editor-loading.png') });
  assert.equal(await waitForResult(page), 'Ready', await page.locator('#notice').textContent());
  timings.push({ stage: 'cold-open', seconds: (Date.now() - started) / 1000 });
  assert(maximum > 1 && maximum <= 6, `Expected bounded concurrent downloads; saw ${maximum}`);
  assert(fileRequests.every(hash => !retired.has(hash)), 'Editing must not download retired theme files');
  const frame = page.frames().find(frame => frame.url().includes('/remote.html'));
  const theme = await frame.evaluate(async () => {
    const result = await window.playground.run({ code: "<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; echo wp_json_encode(array('stylesheet' => get_stylesheet(), 'thumbnails' => current_theme_supports('post-thumbnails'), 'themes' => array_keys(wp_get_themes())));" });
    return JSON.parse(result.text);
  });
  assert.equal(theme.stylesheet, 'joebailey-headless');
  assert.equal(theme.thumbnails, true);
  assert.equal(theme.themes.includes('twentytwentyfive'), false);
  // The proxy uses a fresh origin. Relocate browser-fixture content to it before
  // committing, just as promotion relocates a staging snapshot for deployment.
  // This mutates only the isolated local test runtime, not the saved old revision.
  await frame.evaluate(async () => {
    const result = await window.playground.run({ code: `<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php';
      global $wpdb; $new = ${JSON.stringify(location.origin)};
      foreach ($wpdb->get_results("SELECT ID, post_content, post_excerpt FROM {$wpdb->posts}") as $post) {
        $pattern = '~https?://(?:127[.]0[.]0[.]1|localhost)(?::[0-9]+)?/scope:joebailey-cms(?=/)~';
        $content = preg_replace($pattern, $new . '/scope:joebailey-cms', $post->post_content);
        $excerpt = preg_replace($pattern, $new . '/scope:joebailey-cms', $post->post_excerpt);
        if ($content !== $post->post_content || $excerpt !== $post->post_excerpt) {
          wp_update_post(wp_slash(array('ID' => $post->ID, 'post_content' => $content, 'post_excerpt' => $excerpt)));
        }
      }` });
    if (result.exitCode !== 0) throw new Error(result.errors || result.text);
  });
  // Commit the theme migration before refreshing, preserving the pending-change
  // warning and ensuring the next snapshot restores the minimal theme directly.
  await page.locator('#sync').click();
  await page.waitForFunction(() => ['Synced to Cloudflare', 'Not synced', 'Editing paused'].includes(document.querySelector('#status').textContent), null, { timeout: 120000 });
  assert.equal(await page.locator('#status').textContent(), 'Synced to Cloudflare', await page.locator('#notice').textContent());
  const migrated = await (await context.request.get(`${origin}/api/editor/status`)).json();
  assert.equal(migrated.snapshot.manifest.files.filter(file => file.path.startsWith('themes/')).length, 3);
  if (retired.size) {
    await page.locator('#versions').selectOption(original.snapshot.id);
    const downloading = page.waitForEvent('download');
    await page.locator('#download-version').click();
    const backup = await downloading;
    const entries = unzipSync(new Uint8Array(await readFile(await backup.path())));
    for (const file of original.snapshot.manifest.files) assert(entries[`wp-content/${file.path}`], `Historical backup must include ${file.path}`);
  }
  delayFiles = false;
  const firstLease = lease;

  // Duplicated tabs inherit sessionStorage. They must not steal the live lease.
  const duplicatePromise = context.waitForEvent('page');
  await page.evaluate(() => window.open(location.href, '_blank'));
  const duplicate = await duplicatePromise;
  assert.equal(await waitForResult(duplicate), 'Editor could not open');
  assert.match(await duplicate.locator('#notice').textContent(), /another tab/);
  await duplicate.close();
  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  await other.goto(origin);
  assert.equal(await waitForResult(other), 'Editor could not open');
  assert.match(await other.locator('#notice').textContent(), /Another editing session/);
  await otherContext.close();

  started = Date.now();
  await page.reload();
  assert.equal(await waitForResult(page), 'Ready', await page.locator('#notice').textContent());
  timings.push({ stage: 'refresh', seconds: (Date.now() - started) / 1000 });
  assert.notEqual(lease, firstLease);
  assert.equal((await context.request.delete(`${origin}/api/editor/lease`, { headers: { Origin: origin, 'X-CMS-Lease': firstLease } })).status(), 409);
  assert.equal((await context.request.patch(`${origin}/api/editor/lease`, { headers: { Origin: origin, 'X-CMS-Lease': lease } })).status(), 200);

  // Reproduce the exact deployed failure: registration must report it and stop
  // keeping the failed session locked instead of hanging inside Playground.
  failServiceWorker = true;
  await page.reload();
  assert.equal(await waitForResult(page), 'Editor could not open');
  assert.match(await page.locator('#notice').textContent(), /service worker/);
  await page.waitForFunction(() => document.querySelector('#reload').hidden === false);
  const status = await (await context.request.get(`${origin}/api/editor/status`)).json();
  assert.equal(status.locked, false, 'Failed startup must release the lease');
  failServiceWorker = false;
  await page.reload();
  assert.equal(await waitForResult(page), 'Ready', await page.locator('#notice').textContent());
  await page.screenshot({ path: join(root, '.cache/editor-loading-fixed.png') });
  assert(workerRequests.length > 0 && workerRequests.every(request => request.hasCookie), 'All service-worker script requests must carry the Access cookie');
  await writeFile(join(root, '.cache/loading-verified.json'), JSON.stringify({ timings, maximum, authenticatedWorkerRequests: workerRequests.length, checkedAt: new Date().toISOString() }, null, 2));
  console.log('PASS: minimal theme migration, no retired-theme downloads, complete historical backups, visible progress, immediate refresh, session exclusion and failed-start recovery.', JSON.stringify(timings));
} catch (error) {
  console.error('Loading state:', await page.locator('#loading-stage').textContent(), await page.locator('#notice').textContent());
  await page.screenshot({ path: join(root, '.cache/loading-test-failed.png') });
  throw error;
} finally {
  if (lease) await context.request.delete(`${origin}/api/editor/lease`, { headers: { Origin: origin, 'X-CMS-Lease': lease } }).catch(() => {});
  await browser.close();
  proxy.closeAllConnections();
  await new Promise(resolve => proxy.close(resolve));
}
