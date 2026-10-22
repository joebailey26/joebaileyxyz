import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright');
const origin = process.env.CMS_TEST_ORIGIN || 'http://127.0.0.1:8788';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Migration validation only writes to a local CMS');
const bundle = resolve(process.argv[2] || join(root, 'migration/joebailey-content.zip'));
const report = JSON.parse(await readFile(join(dirname(bundle), 'migration-report.json'), 'utf8'));
await mkdir(join(root, '.cache'), { recursive: true });
const browser = await chromium.launch({ headless: true });
let context, page, frame, lease;
async function open() {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  page.on('response', async response => {
    if (response.url().endsWith('/api/editor/lease') && response.request().method() === 'POST' && response.ok()) lease = (await response.json()).token;
  });
  page.on('pageerror', error => console.error('Page error:', error.message));
  await page.goto(origin);
  await page.waitForFunction(() => ['Ready', 'Editor could not open'].includes(document.querySelector('#status').textContent), null, { timeout: 240000 });
  assert.equal(await page.locator('#status').textContent(), 'Ready', await page.locator('#notice').textContent());
  frame = page.frames().find(frame => frame.url().includes('/remote.html'));
}
async function close() {
  if (context && lease) await context.request.delete(`${origin}/api/editor/lease`, { headers: { Origin: origin, 'X-CMS-Lease': lease } });
  lease = null;
  await context?.close();
}
async function inspect() {
  return frame.evaluate(async () => {
    const result = await window.playground.run({ code: `<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php';
      $capture = joebailey_cms_capture(array('blogCategory' => 'blog', 'projectsCategory' => 'projects'));
      $imported = get_posts(array('post_type' => 'post', 'post_status' => 'any', 'meta_key' => '_joebailey_source_id', 'posts_per_page' => -1));
      $posts = array_map(function ($post) { return array('sourceId' => (int) get_post_meta($post->ID, '_joebailey_source_id', true), 'slug' => $post->post_name, 'date' => $post->post_date, 'status' => $post->post_status); }, $imported);
      $missing = array(); foreach (get_posts(array('post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => -1)) as $post) { $file = get_attached_file($post->ID); if (!is_file($file)) $missing[] = $file; foreach ((wp_get_attachment_metadata($post->ID)['sizes'] ?? array()) as $size) { if (!is_file(dirname($file) . '/' . $size['file'])) $missing[] = $size['file']; } }
      echo wp_json_encode(array('posts' => $posts, 'counts' => array_count_values(array_column($capture['records'], 'section')), 'records' => $capture['records'], 'missingMedia' => $missing), JSON_THROW_ON_ERROR);` });
    if (result.exitCode || result.httpStatusCode >= 400) throw new Error(result.errors || result.text);
    return JSON.parse(result.text);
  });
}
try {
  await open();
  let imported;
  if (!process.argv.includes('--restore-only')) {
  console.log('Importing the real filtered backup through the browser editor…');
  await page.locator('#import').setInputFiles(bundle);
  await page.waitForFunction(() => document.querySelector('#status').textContent.startsWith('Import complete') || document.querySelector('#notice').textContent.startsWith('Import failed'), null, { timeout: 600000 });
  assert.match(await page.locator('#status').textContent(), /^Import complete/, await page.locator('#notice').textContent());
  imported = await inspect();
  assert.equal(imported.posts.length, report.posts);
  assert.deepEqual(imported.counts, report.publishedBySection);
  assert.deepEqual(imported.missingMedia, []);
  for (const expected of report.postsIncluded) {
    const actual = imported.posts.find(post => post.sourceId === expected.sourceId);
    assert(actual, `Missing source post ${expected.sourceId}`);
    assert.equal(actual.slug, expected.slug);
    assert.equal(actual.status, expected.status);
  }
  await page.locator('#sync').click();
  await page.waitForFunction(() => ['Synced to Cloudflare', 'Not synced', 'Editing paused'].includes(document.querySelector('#status').textContent), null, { timeout: 600000 });
  assert.equal(await page.locator('#status').textContent(), 'Synced to Cloudflare', await page.locator('#notice').textContent());
  await page.screenshot({ path: join(root, '.cache/migration-imported.png'), fullPage: true });
  } else imported = await inspect();
  await close();
  console.log('Restoring migrated content in a fresh browser profile…');
  await open();
  const restored = await inspect();
  assert.deepEqual(restored, imported);
  await writeFile(join(root, '.cache/migration-verified.json'), JSON.stringify({ origin, posts: restored.posts, counts: restored.counts, records: restored.records, missingMedia: restored.missingMedia }, null, 2));
  await page.screenshot({ path: join(root, '.cache/migration-restored.png'), fullPage: true });
  const downloading = page.waitForEvent('download', { timeout: 240000 });
  await page.locator('#backup').click();
  const backup = await downloading;
  await backup.saveAs(join(dirname(bundle), 'verified-staging-snapshot.zip'));
  console.log(`PASS: ${report.posts} imported posts, ${report.attachments} attachments, exact slugs/statuses, all media paths and fresh-browser D1/R2 restore.`);
} catch (error) {
  if (page) await page.screenshot({ path: join(root, '.cache/migration-failed.png'), fullPage: true }).catch(() => {});
  throw error;
} finally { await close(); await browser.close(); }
