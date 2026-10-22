import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNodeRuntime } from '@php-wasm/node';
import { bootWordPressAndRequestHandler } from '@wp-playground/wordpress';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(await readFile(join(root, '.cache/runtime-path.json'), 'utf8'));
const assets = resolve(root, metadata.path);
const lock = JSON.parse(await readFile(join(root, 'runtime.lock.json'), 'utf8'));
const core = (await readdir(join(assets, 'assets'))).find(name => name.startsWith(`wp-${lock.wordpressMajor}.tar-`) && name.endsWith('.zst'));
const coreFile = new File([await readFile(join(assets, 'assets', core))], 'wordpress.tar.zst');
const sqliteFile = new File([await readFile(join(root, 'node_modules/@wp-playground/cli/sqlite-database-integration.zip'))], 'sqlite.zip');
const bridge = await readFile(join(root, 'wordpress/joebailey-cms.php'), 'utf8');
const migration = await readFile(join(root, 'wordpress/migration.php'), 'utf8');
async function boot() {
  let php;
  const handler = await bootWordPressAndRequestHandler({
    createPhpRuntime: () => loadNodeRuntime('8.3', { emscriptenOptions: { processId: process.pid } }), phpVersion: '8.3',
    siteUrl: 'https://cms.example.test/scope:joebailey-cms/', documentRoot: '/wordpress',
    wordPressZip: coreFile, sqliteIntegrationPluginZip: sqliteFile, maxPhpInstances: 1,
    constants: { DISABLE_WP_CRON: true },
    onPHPInstanceCreated(instance, { isPrimary }) { if (isPrimary) php = instance; }
  });
  php.mkdir('/wordpress/wp-content/mu-plugins');
  php.writeFile('/wordpress/wp-content/mu-plugins/joebailey-cms.php', bridge);
  php.writeFile('/tmp/migration.php', migration);
  async function run(code) {
    const response = await php.run({ code: `<?php define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; ${code}` });
    assert.equal(response.exitCode, 0, response.errors || response.text);
    assert.equal(response.httpStatusCode, 200, response.text);
    return response.text;
  }
  return { php, handler, run };
}

console.log('Booting the pinned WordPress/PHP/SQLite runtime…');
const first = await boot();
try {
  await first.run(`
    $blog = wp_insert_term('Blog', 'category', array('slug' => 'blog'));
    $projects = wp_insert_term('Projects', 'category', array('slug' => 'projects'));
    $published = wp_insert_post(array('post_title' => 'Published fixture', 'post_name' => 'published-fixture', 'post_status' => 'publish', 'post_content' => '<p>Published content</p>', 'post_category' => array($blog['term_id'])));
    wp_insert_post(array('post_title' => 'Draft fixture', 'post_status' => 'draft', 'post_content' => 'Private draft', 'post_category' => array($blog['term_id'])));
    $project = wp_insert_post(array('post_title' => 'Project fixture', 'post_status' => 'publish', 'post_category' => array($projects['term_id'])));
    update_post_meta($project, 'icons', array('PHP', 'Vue'));
    update_post_meta($project, 'github', 'https://github.com/example/project');
    update_option('joebailey_test_setting', 'restored-setting');
  `);
  const captured = JSON.parse(await first.run("echo wp_json_encode(joebailey_cms_capture(array('blogCategory' => 'blog', 'projectsCategory' => 'projects')), JSON_THROW_ON_ERROR);"));
  assert.equal(captured.records.length, 2);
  assert.equal(captured.records.some(post => post.title.rendered === 'Draft fixture'), false);
  assert.deepEqual(captured.records.find(post => post.section === 'projects').acf.icons, ['PHP', 'Vue']);
  const backup = first.php.readFileAsBuffer('/tmp/joebailey-cms.sqlite');
  assert.equal(new TextDecoder().decode(backup.subarray(0, 16)), 'SQLite format 3\0');

  // A completely separate PHP filesystem simulates clearing browser storage / another device.
  console.log('Restoring the checkpoint into a fresh WordPress runtime…');
  const second = await boot();
  try {
    const target = (await second.run('echo joebailey_cms_database_path();')).trim();
    second.php.writeFile(target, backup);
    for (const suffix of ['-wal', '-shm']) if (second.php.fileExists(target + suffix)) second.php.unlink(target + suffix);
    const restored = JSON.parse(await second.run("echo wp_json_encode(array('drafts' => wp_count_posts()->draft, 'setting' => get_option('joebailey_test_setting'), 'admins' => count(get_users(array('role' => 'administrator'))), 'records' => joebailey_cms_capture(array('blogCategory' => 'blog', 'projectsCategory' => 'projects'))['records']), JSON_THROW_ON_ERROR);"));
    assert.equal(Number(restored.drafts), 1);
    assert.equal(restored.setting, 'restored-setting');
    assert.equal(restored.admins, 1);
    assert.equal(restored.records.length, 2);
    second.php.writeFile('/tmp/joebailey-cms-login', 'one-time-login');
    const login = await second.handler.request({ url: '/?joebailey_cms_login=one-time-login' });
    assert.equal(login.httpStatusCode, 200);
    const admin = await second.handler.request({ url: '/wp-admin/edit.php' });
    assert.equal(admin.httpStatusCode, 200, 'restored editor must be authenticated');
    second.php.mkdir('/wordpress/wp-content/uploads/2025');
    second.php.writeFile('/wordpress/wp-content/uploads/2025/fixture.png', Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7GQAAAAASUVORK5CYII=', 'base64')));
    const source = (id, type, overrides = {}) => ({ id, type, status: type === 'attachment' ? 'inherit' : 'publish', slug: `imported-${id}`, title: `Imported ${id}`, content: '', excerpt: '', date: '2024-01-02 12:00:00', dateGmt: '2024-01-02 12:00:00', author: 'source-author', parent: 0, categories: [], meta: [], ...overrides });
    const migrationData = {
      version: 1, authors: [{ login: 'source-author', displayName: 'Source author' }],
      categories: [{ name: 'Projects', slug: 'projects', taxonomy: 'category' }], tags: [], acf: [],
      posts: [
        source(900, 'attachment', { attachmentUrl: 'https://old.example/wp-content/uploads/2025/fixture.png', meta: [{ key: '_wp_attached_file', raw: '2025/fixture.png' }] }),
        source(901, 'post', { content: '<p><img src="https://old.example/wp-content/uploads/2025/fixture.png"></p>', categories: [{ taxonomy: 'category', slug: 'projects', name: 'Projects' }], url: 'https://old.example/imported-901/', meta: [{ key: '_thumbnail_id', raw: '900' }, { key: 'icons', raw: 'a:2:{i:0;s:3:"PHP";i:1;s:3:"Vue";}' }, { key: 'github', raw: 'https://github.com/example/imported' }, { key: 'multi', raw: 'one' }, { key: 'multi', raw: 'two' }] }),
        source(902, 'post', { status: 'draft' })
      ]
    };
    second.php.writeFile('/tmp/migration.json', JSON.stringify(migrationData));
    const imported = JSON.parse(await second.run("require '/tmp/migration.php'; echo wp_json_encode(joebailey_cms_import('/tmp/migration.json'), JSON_THROW_ON_ERROR);"));
    assert.equal(imported.media, 1);
    const checkImport = JSON.parse(await second.run("$posts = get_posts(array('name' => 'imported-901')); $post = $posts[0]; echo wp_json_encode(array('date' => $post->post_date, 'content' => $post->post_content, 'icons' => get_post_meta($post->ID, 'icons', true), 'multi' => get_post_meta($post->ID, 'multi'), 'thumbnail' => get_post_thumbnail_id($post), 'draft' => count(get_posts(array('name' => 'imported-902', 'post_status' => 'draft')))), JSON_THROW_ON_ERROR);"));
    assert.equal(checkImport.date, '2024-01-02 12:00:00');
    assert.deepEqual(checkImport.icons, ['PHP', 'Vue']);
    assert.deepEqual(checkImport.multi, ['one', 'two']);
    assert(checkImport.thumbnail);
    assert.equal(checkImport.draft, 1);
    assert(checkImport.content.includes('https://cms.example.test/scope:joebailey-cms/wp-content/uploads/2025/fixture.png'));
    await second.run("require '/tmp/migration.php'; joebailey_cms_import('/tmp/migration.json');");
    const duplicateCount = await second.run("echo count(get_posts(array('name' => 'imported-901')));");
    assert.equal(duplicateCount.trim(), '1');
    console.log('PASS: full database restore preserves drafts, settings, users, rendered posts and project fields; restored WordPress admin login works.');
    console.log('PASS: migration preserves dates, drafts, serialized and repeated custom fields, attachment mappings and media URLs; reimport is idempotent.');
  } finally { second.php.exit(); }
} finally { first.php.exit(); }
