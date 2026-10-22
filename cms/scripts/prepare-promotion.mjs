// Convert a verified local snapshot to the deployment origin through pinned WordPress APIs.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import { loadNodeRuntime } from '@php-wasm/node';
import { bootWordPressAndRequestHandler } from '@wp-playground/wordpress';
import { CHUNK_SIZE, sha256, validateManifest, validateRecord, rewriteRecords } from '../src/shared.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2], origin = process.argv[3], sourceSite = process.argv[4];
if (!input || !origin || !sourceSite || new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin || !URL.canParse(sourceSite)) throw new Error('Usage: node --experimental-wasm-jspi scripts/prepare-promotion.mjs snapshot.zip https://cms.example.com http://localhost:8788/scope:joebailey-cms');
const entries = unzipSync(await readFile(resolve(input)));
const manifest = validateManifest(JSON.parse(strFromU8(entries['manifest.json'])));
assert.equal(await sha256(entries['database.sqlite']), manifest.databaseHash);
const runtime = JSON.parse(await readFile(join(root, 'dist/runtime.json'), 'utf8'));
assert.equal(runtime.wordpress, manifest.wordpress);
const metadata = JSON.parse(await readFile(join(root, '.cache/runtime-path.json'), 'utf8'));
const assets = resolve(root, metadata.path);
const core = (await readdir(join(assets, 'assets'))).find(name => name === runtime.coreFile.slice('assets/'.length));
let php;
await bootWordPressAndRequestHandler({
  createPhpRuntime: () => loadNodeRuntime('8.3', { emscriptenOptions: { processId: process.pid } }), phpVersion: '8.3',
  siteUrl: `${origin}/scope:joebailey-cms/`, documentRoot: '/wordpress', maxPhpInstances: 1,
  wordPressZip: new File([await readFile(join(assets, 'assets', core))], 'wordpress.tar.zst'),
  sqliteIntegrationPluginZip: new File([await readFile(join(root, 'node_modules/@wp-playground/cli/sqlite-database-integration.zip'))], 'sqlite.zip'),
  constants: { DISABLE_WP_CRON: true },
  onPHPInstanceCreated(instance, { isPrimary }) { if (isPrimary) php = instance; }
});
async function run(code) {
  const response = await php.run({ code: `<?php $_SERVER['HTTPS'] = 'on'; $_SERVER['REQUEST_SCHEME'] = 'https'; define('JOEBAILEY_CMS_CHECKPOINT', true); require '/wordpress/wp-load.php'; ${code}` });
  assert.equal(response.exitCode, 0, response.errors || response.text);
  assert.equal(response.httpStatusCode, 200, response.text);
  return response.text;
}
try {
  php.mkdir('/wordpress/wp-content/mu-plugins');
  php.writeFile('/wordpress/wp-content/mu-plugins/joebailey-cms.php', await readFile(join(root, 'wordpress/joebailey-cms.php')));
  for (const file of manifest.files) {
    const bytes = entries[`wp-content/${file.path}`];
    assert(bytes && bytes.length === file.size && await sha256(bytes) === file.hash, `Invalid file ${file.path}`);
    const path = `/wordpress/wp-content/${file.path}`;
    php.mkdir(dirname(path).replaceAll('\\', '/'));
    php.writeFile(path, bytes);
  }
  const target = (await run('echo joebailey_cms_database_path();')).trim();
  php.writeFile(target, entries['database.sqlite']);
  for (const suffix of ['-wal', '-shm']) if (php.fileExists(target + suffix)) php.unlink(target + suffix);
  const site = `${origin}/scope:joebailey-cms`;
  await run(`global $wpdb; $old = ${JSON.stringify(sourceSite)}; $new = ${JSON.stringify(site)};
    foreach ($wpdb->get_results("SELECT ID, post_content, post_excerpt, guid FROM {$wpdb->posts}") as $post) {
      wp_update_post(wp_slash(array('ID' => $post->ID, 'post_content' => str_replace(rtrim($old, '/'), $new, $post->post_content), 'post_excerpt' => str_replace(rtrim($old, '/'), $new, $post->post_excerpt), 'guid' => str_replace(rtrim($old, '/'), $new, $post->guid))));
    }
    update_option('home', $new); update_option('siteurl', $new); wp_cache_flush();`);
  const exported = JSON.parse(await run(`echo wp_json_encode(joebailey_cms_capture(array('blogCategory' => ${JSON.stringify(manifest.blogCategory)}, 'projectsCategory' => ${JSON.stringify(manifest.projectsCategory)})), JSON_THROW_ON_ERROR);`));
  const database = php.readFileAsBuffer('/tmp/joebailey-cms.sqlite');
  const chunks = [];
  for (let position = 0; position < database.length; position += CHUNK_SIZE) chunks.push(await sha256(database.subarray(position, position + CHUNK_SIZE)));
  const promoted = validateManifest({ ...manifest, databaseSize: database.length, databaseHash: await sha256(database), chunks });
  const records = rewriteRecords(exported, manifest.files, origin);
  for (const record of records) validateRecord(record, record.section);
  await writeFile(join(root, '.cache/promotion-feed.json'), JSON.stringify({ siteUrl: exported.siteUrl, uploadBase: exported.uploadBase, records }, null, 2));
  assert(!JSON.stringify(records).includes('127.0.0.1'), 'Feed still contains local staging URLs');
  entries['database.sqlite'] = database;
  entries['manifest.json'] = strToU8(JSON.stringify(promoted, null, 2));
  entries['content.json'] = strToU8(JSON.stringify(records));
  await mkdir(join(root, 'migration'), { recursive: true });
  const output = join(root, 'migration/cloud-snapshot.zip');
  await writeFile(output, zipSync(entries, { level: 1 }));
  console.log(`Prepared ${records.length} published records and a complete ${database.length}-byte database for ${origin}: ${output}`);
} finally { php.exit(); }
