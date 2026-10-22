import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';

test('WXR packing keeps serialized metadata, drafts, term slugs and media files', async () => {
  const root = new URL('../.cache/', import.meta.url);
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(new URL('migration-test-', root));
  const content = join(directory, 'wp-content');
  await mkdir(join(content, 'uploads/2024'), { recursive: true });
  await writeFile(join(content, 'uploads/2024/photo.png'), new Uint8Array([1, 2, 3]));
  const xml = `<?xml version="1.0"?><rss xmlns:wp="http://wordpress.org/export/1.2/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"><channel>
    <wp:base_site_url>https://old.example</wp:base_site_url>
    <wp:category><wp:category_nicename>projects</wp:category_nicename><wp:cat_name>Projects</wp:cat_name></wp:category>
    <wp:author><wp:author_login>writer</wp:author_login><wp:author_display_name>Original Writer</wp:author_display_name></wp:author>
    <item><title>Photo</title><wp:post_id>99</wp:post_id><wp:post_type>attachment</wp:post_type><wp:status>inherit</wp:status><wp:attachment_url>https://old.example/wp-content/uploads/2024/photo.png</wp:attachment_url><wp:postmeta><wp:meta_key>_wp_attached_file</wp:meta_key><wp:meta_value>2024/photo.png</wp:meta_value></wp:postmeta></item>
    <item><title>Draft &amp; project</title><wp:post_id>100</wp:post_id><wp:post_type>post</wp:post_type><wp:status>draft</wp:status><wp:post_name>draft-project</wp:post_name><dc:creator>writer</dc:creator><content:encoded><![CDATA[<p>Raw block content</p>]]></content:encoded><category domain="category" nicename="projects">Projects</category><wp:postmeta><wp:meta_key>icons</wp:meta_key><wp:meta_value><![CDATA[a:1:{i:0;s:3:"PHP";}]]></wp:meta_value></wp:postmeta></item>
    </channel></rss>`;
  const wxr = join(directory, 'export.xml'), output = join(directory, 'migration.zip');
  await writeFile(wxr, xml);
  const previous = process.argv;
  try {
    process.argv = ['node', 'migrate.mjs', '--wxr', wxr, '--content', content, '--output', output];
    await import(`../scripts/migrate.mjs?test=${Date.now()}`);
  } finally { process.argv = previous; }
  const entries = unzipSync(await readFile(output));
  const manifest = JSON.parse(strFromU8(entries['migration.json']));
  assert.equal(manifest.posts.length, 2);
  assert.equal(manifest.posts[1].status, 'draft');
  assert.equal(manifest.posts[1].title, 'Draft & project');
  assert.equal(manifest.posts[1].meta[0].raw, 'a:1:{i:0;s:3:"PHP";}');
  assert.equal(manifest.posts[1].categories[0].slug, 'projects');
  assert.deepEqual(entries['wp-content/uploads/2024/photo.png'], new Uint8Array([1, 2, 3]));
});
