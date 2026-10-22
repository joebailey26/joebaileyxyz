import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright');
const origin = process.env.CMS_TEST_ORIGIN || 'http://127.0.0.1:8787';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Browser smoke tests may only write to a local CMS');
await mkdir(join(root, '.cache'), { recursive: true });
const browser = await chromium.launch({ headless: true });
let context, lease, editorReadyAt;
const snapshotStarts = [];
async function open() {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/editor/snapshots' && request.method() === 'POST') snapshotStarts.push(Date.now());
  });
  page.on('response', async response => {
    if (response.url().endsWith('/api/editor/lease') && response.request().method() === 'POST' && response.ok()) lease = (await response.json()).token;
  });
  page.on('console', message => { if (message.type() === 'error') console.error('Browser:', message.text().slice(0, 300)); });
  page.on('pageerror', error => console.error('Page error:', error.message));
  await page.goto(origin);
  try {
    await page.waitForFunction(() => ['Ready', 'Editor could not open'].includes(document.querySelector('#status').textContent), null, { timeout: 180000 });
    assert.equal(await page.locator('#status').textContent(), 'Ready', await page.locator('#notice').textContent());
  } catch (error) {
    await page.screenshot({ path: join(root, '.cache/editor-failed.png'), fullPage: true });
    console.error('Editor status:', await page.locator('#status').textContent(), await page.locator('#notice').textContent());
    throw error;
  }
  console.log('Browser editor ready.');
  editorReadyAt = Date.now();
  const frame = page.frames().find(frame => frame.url().includes('/remote.html'));
  assert(frame, 'Self-hosted remote iframe must be loaded');
  return { page, frame };
}

async function closeContext() {
  if (context && lease) {
    await context.request.delete(`${origin}/api/editor/lease`, { headers: { Origin: origin, 'X-CMS-Lease': lease } });
    lease = null;
  }
  await context?.close();
}

try {
  const first = await open();
  console.log('Creating published blog/project fixtures and a private draft in the browser runtime…');
  const image = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#005b43' } }).png().toBuffer();
  const result = await first.frame.evaluate(async imageBase64 => {
    const result = await window.playground.run({ code: `<?php require '/wordpress/wp-load.php';
      $blog = get_term_by('slug', 'blog', 'category'); $projects = get_term_by('slug', 'projects', 'category');
      global $wpdb;
      $old_ids = $wpdb->get_col($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE post_title IN (%s,%s,%s,%s)", 'Browser blog', 'Browser project', 'Private browser draft', 'Browser fixture'));
      foreach ($old_ids as $old_id) { if (get_post_type($old_id) === 'attachment') wp_delete_attachment($old_id, true); else wp_delete_post($old_id, true); }
      $uploads = wp_upload_dir(); $file = $uploads['path'] . '/browser-fixture.png'; file_put_contents($file, base64_decode('${imageBase64}'));
      $attachment = wp_insert_attachment(array('post_title' => 'Browser fixture', 'post_mime_type' => 'image/png', 'post_status' => 'inherit'), $file);
      update_attached_file($attachment, $file); wp_update_attachment_metadata($attachment, array('width' => 32, 'height' => 32, 'file' => _wp_relative_upload_path($file), 'sizes' => array()));
      $image_url = wp_get_attachment_url($attachment);
      $post = wp_insert_post(array('post_title' => 'Browser blog', 'post_name' => 'browser-blog', 'post_content' => '<p>Browser integration fixture.</p><figure class="wp-block-image"><img src="' . $image_url . '" alt="Browser fixture"></figure>', 'post_status' => 'publish', 'post_category' => array($blog->term_id)));
      set_post_thumbnail($post, $attachment);
      $project = wp_insert_post(array('post_title' => 'Browser project', 'post_name' => 'browser-project', 'post_content' => '<p>Browser project fixture.</p>', 'post_status' => 'publish', 'post_category' => array($projects->term_id)));
      update_post_meta($project, 'icons', array('PHP', 'Vue')); update_post_meta($project, 'github', 'https://github.com/example/project');
      wp_insert_post(array('post_title' => 'Private browser draft', 'post_name' => 'browser-draft', 'post_content' => 'Do not publish', 'post_status' => 'draft', 'post_category' => array($blog->term_id)));
      update_option('browser_restore_fixture', 'saved-from-first-browser'); echo 'created';` });
    return { exitCode: result.exitCode, text: result.text, errors: result.errors };
  }, image.toString('base64'));
  assert.equal(result.exitCode, 0, result.errors || result.text);
  await first.page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('Changes pending'), null, { timeout: 15000 });
  assert.equal(snapshotStarts.length, 0, 'Saving in WordPress must not immediately upload a snapshot');
  console.log('Changes remain pending. Waiting for the two-minute automatic sync…');
  await first.page.waitForFunction(() => ['Synced to Cloudflare', 'Editing paused', 'Not synced'].includes(document.querySelector('#status').textContent), null, { timeout: 240000 });
  assert.equal(await first.page.locator('#status').textContent(), 'Synced to Cloudflare', await first.page.locator('#notice').textContent());
  assert(snapshotStarts[0] - editorReadyAt >= 115000, 'Automatic sync must wait for the two-minute interval');
  await first.page.screenshot({ path: join(root, '.cache/editor-synced.png'), fullPage: true });
  const before = await (await context.request.get(`${origin}/api/editor/status`)).json();
  assert(before.revision);
  assert.equal(before.snapshot.manifest.counts.blog >= 1, true);
  assert.equal(before.snapshot.manifest.counts.projects >= 1, true);
  const manifest = await (await context.request.get(`${origin}/api/content/manifest`, { headers: { Authorization: 'Bearer local-development-token-for-cms-tests-only' } })).json();
  const feed = await (await context.request.get(`${origin}/api/content/posts?revision=${manifest.revision}&section=blog`, { headers: { Authorization: 'Bearer local-development-token-for-cms-tests-only' } })).json();
  const blogPost = feed.items.find(post => post.slug === 'browser-blog');
  assert(blogPost.featured_media_url.startsWith(`${origin}/media/`));
  assert(blogPost.content.rendered.includes(blogPost.featured_media_url));
  const media = await context.request.get(blogPost.featured_media_url);
  assert.equal(media.headers()['content-type'], 'image/png');
  assert.deepEqual(await media.body(), image);
  console.log('Refreshing after an automatic checkpoint changed the cloud revision…');
  await first.page.reload();
  await first.page.waitForFunction(() => ['Ready', 'Editor could not open'].includes(document.querySelector('#status').textContent), null, { timeout: 180000 });
  assert.equal(await first.page.locator('#status').textContent(), 'Ready', await first.page.locator('#notice').textContent());
  const refreshed = first.page.frames().find(frame => frame.url().includes('/remote.html'));
  const setting = await refreshed.evaluate(async () => {
    const result = await window.playground.run({ code: "<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; echo get_option('browser_restore_fixture');" });
    return result.text;
  });
  assert.equal(setting, 'saved-from-first-browser');
  console.log('Automatic browser checkpoint committed to local D1/R2. Opening a fresh browser context…');
  await closeContext();
  const second = await open();
  const restored = await second.frame.evaluate(async () => {
    const result = await window.playground.run({ code: `<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; echo wp_json_encode(array('draft' => count(get_posts(array('name' => 'browser-draft', 'post_status' => 'draft'))), 'setting' => get_option('browser_restore_fixture'), 'project' => get_posts(array('name' => 'browser-project'))[0]->ID));` });
    return JSON.parse(result.text);
  });
  assert.equal(restored.draft, 1);
  assert.equal(restored.setting, 'saved-from-first-browser');
  assert(restored.project);
  console.log('Verifying Sync now saves immediately between automatic intervals…');
  await second.frame.evaluate(async () => {
    await window.playground.run({ code: "<?php require '/wordpress/wp-load.php'; update_option('browser_restore_fixture', 'saved-manually');" });
  });
  const manualStarted = Date.now();
  const committed = second.page.waitForResponse(response => /\/api\/editor\/snapshots\/[^/]+\/commit$/.test(new URL(response.url()).pathname) && response.request().method() === 'POST', { timeout: 45000 });
  await second.page.locator('#sync').click();
  assert.equal((await committed).status(), 200);
  await second.page.waitForFunction(() => document.querySelector('#status').textContent === 'Synced to Cloudflare');
  assert(Date.now() - manualStarted < 45000, 'Manual sync must not wait for the automatic interval');
  await second.page.screenshot({ path: join(root, '.cache/editor-restored.png'), fullPage: true });
  console.log('PASS: two-minute automatic sync, immediate manual sync, save-then-refresh, fresh-browser restore, private draft, settings and project persistence.');
} finally { await closeContext(); await browser.close(); }
