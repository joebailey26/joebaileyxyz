import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { zipSync, strToU8 } from 'fflate';
import { safePath } from '../src/shared.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const flags = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, index, all) => arg.startsWith('--') ? [...pairs, [arg.slice(2), all[index + 1]]] : pairs, []));
if (!flags.wxr || !flags.content) throw new Error('Usage: npm run migrate -- --wxr export.xml --content /path/to/wp-content [--acf fields.json] [--output migration.zip]');
const $ = load(await readFile(resolve(flags.wxr), 'utf8'), { xmlMode: true });
const text = (element, selector) => element.children(selector).first().text();
const entries = {};
const sourceRoot = resolve(flags.content);
async function files(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Migration cannot follow symlinks: ${entry.name}`);
    const relative = prefix + entry.name;
    const source = join(directory, entry.name);
    if (entry.isDirectory()) { await files(source, `${relative}/`); continue; }
    if (!safePath(relative)) continue;
    entries[`wp-content/${relative}`] = await readFile(source);
  }
}
await files(sourceRoot);
const categories = $('channel > wp\\:category').toArray().map(node => { const item = $(node); return { taxonomy: 'category', slug: text(item, 'wp\\:category_nicename'), name: text(item, 'wp\\:cat_name'), parent: text(item, 'wp\\:category_parent') }; });
const tags = $('channel > wp\\:tag').toArray().map(node => { const item = $(node); return { taxonomy: 'post_tag', slug: text(item, 'wp\\:tag_slug'), name: text(item, 'wp\\:tag_name') }; });
const authors = $('channel > wp\\:author').toArray().map(node => { const item = $(node); return { login: text(item, 'wp\\:author_login'), displayName: text(item, 'wp\\:author_display_name'), email: text(item, 'wp\\:author_email') }; });
const posts = $('channel > item').toArray().map(node => {
  const item = $(node);
  return {
    id: Number(text(item, 'wp\\:post_id')), type: text(item, 'wp\\:post_type'), status: text(item, 'wp\\:status'),
    slug: text(item, 'wp\\:post_name'), title: text(item, 'title'), content: text(item, 'content\\:encoded'), excerpt: text(item, 'excerpt\\:encoded'),
    date: text(item, 'wp\\:post_date'), dateGmt: text(item, 'wp\\:post_date_gmt'), author: text(item, 'dc\\:creator'), parent: Number(text(item, 'wp\\:post_parent')),
    url: text(item, 'link'), guid: text(item, 'guid'), attachmentUrl: text(item, 'wp\\:attachment_url'),
    categories: item.children('category').toArray().map(term => ({ taxonomy: $(term).attr('domain'), slug: $(term).attr('nicename'), name: $(term).text() })),
    meta: item.children('wp\\:postmeta').toArray().map(meta => ({ key: text($(meta), 'wp\\:meta_key'), raw: text($(meta), 'wp\\:meta_value') }))
  };
}).filter(post => !['revision', 'nav_menu_item', 'custom_css', 'customize_changeset'].includes(post.type));
if (!posts.length) throw new Error('No content found in WXR. Export All content from the source WordPress.');
for (const attachment of posts.filter(post => post.type === 'attachment')) {
  const path = attachment.meta.find(meta => meta.key === '_wp_attached_file')?.raw;
  if (!path || !entries[`wp-content/uploads/${path}`]) throw new Error(`Missing original media for attachment ${attachment.id}: ${path || attachment.attachmentUrl}. Supply the complete uploads directory.`);
}
const acf = flags.acf ? JSON.parse(await readFile(resolve(flags.acf), 'utf8')) : [];
entries['migration.json'] = strToU8(JSON.stringify({ version: 1, sourceUrl: $('channel > wp\\:base_site_url').text(), categories, tags, authors, posts, acf }));
const output = resolve(flags.output || join(root, 'migration/export.zip'));
await mkdir(dirname(output), { recursive: true });
await writeFile(output, zipSync(entries, { level: 1 }));
console.log(`Migration bundle: ${output}\n${posts.length} posts/attachments, ${Object.keys(entries).length - 1} files. Verify imported counts and project fields in staging before cutover.`);
