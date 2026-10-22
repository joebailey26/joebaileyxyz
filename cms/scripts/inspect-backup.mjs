import { gunzipSync } from 'node:zlib';
import { openArchive } from './zip-reader.mjs';
import { readDump } from './mysql-dump.mjs';

const archive = await openArchive(process.argv[2]);
try {
  const names = [...archive.entries.keys()];
  const configName = names.find(name => /(^|\/)wp-config\.php$/.test(name));
  const config = (await archive.read(configName, 1024 * 1024)).toString('utf8');
  const prefix = config.match(/\$table_prefix\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!prefix || !/^[a-zA-Z0-9_]+$/.test(prefix)) throw new Error('Cannot identify WordPress table prefix');
  const sqlName = names.find(name => /\.sql(\.gz)?$/.test(name));
  if (!sqlName) throw new Error('No SQL database in backup');
  const compressed = await archive.read(sqlName);
  const sql = (sqlName.endsWith('.gz') ? gunzipSync(compressed, { maxOutputLength: 512 * 1024 * 1024 }) : compressed).toString('utf8');
  const data = readDump(sql, prefix);
  const categories = data.term_taxonomy.filter(term => term.taxonomy === 'category').map(term => ({ id: Number(term.term_id), taxonomyId: Number(term.term_taxonomy_id), ...data.terms.find(item => item.term_id === term.term_id), count: Number(term.count) }));
  console.log(JSON.stringify({ archiveEntries: names.length, databaseBytes: Buffer.byteLength(sql), tables: Object.fromEntries(Object.entries(data).map(([name, rows]) => [name, rows.length])), categories }, null, 2));
  const taxonomyIds = new Set(categories.filter(term => [39, 96].includes(term.id)).map(term => String(term.taxonomyId)));
  const ids = new Set(data.term_relationships.filter(term => taxonomyIds.has(term.term_taxonomy_id)).map(term => term.object_id));
  const selected = data.posts.filter(post => ids.has(post.ID) && post.post_type === 'post');
  const shortcodes = new Set(selected.flatMap(post => [...post.post_content.matchAll(/\[(?!\[|\/)([a-zA-Z][a-zA-Z0-9_-]*)\b/g)].map(match => match[1])));
  console.log(JSON.stringify({ selectedPosts: selected.map(post => ({ id: post.ID, slug: post.post_name, title: post.post_title, status: post.post_status, date: post.post_date })), shortcodes: [...shortcodes], sourcePluginLists: names.filter(name => /pluginlist.*\.txt$/.test(name)) }, null, 2));
} finally { archive.close(); }
