import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, join, basename, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync, strToU8 } from 'fflate';
import { loadBackup } from './backup-data.mjs';
import { unserialize } from './php-serialization.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const flags = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, index, all) => arg.startsWith('--') ? [...pairs, [arg.slice(2), all[index + 1]]] : pairs, []));
if (!flags.archive) throw new Error('Usage: pnpm run migrate:backup --archive backup.zip [--blog-category 39] [--projects-category 96]');
const { archive, data, contentPrefix } = await loadBackup(resolve(flags.archive));
try {
  const categoryIds = { blog: Number(flags['blog-category'] || 39), projects: Number(flags['projects-category'] || 96) };
  const targetSlugs = { blog: flags['blog-slug'] || 'blog', projects: flags['projects-slug'] || 'projects' };
  const selectedTaxonomies = data.term_taxonomy.filter(term => term.taxonomy === 'category' && Object.values(categoryIds).includes(Number(term.term_id)));
  if (selectedTaxonomies.length !== 2) throw new Error('Both source categories must exist in the backup');
  const taxonomyIds = new Set(selectedTaxonomies.map(term => term.term_taxonomy_id));
  const postIds = new Set(data.term_relationships.filter(term => taxonomyIds.has(term.term_taxonomy_id)).map(term => term.object_id));
  const selected = data.posts.filter(post => postIds.has(post.ID) && post.post_type === 'post' && !['trash', 'auto-draft'].includes(post.post_status));
  if (!selected.length) throw new Error('No matching blog/project posts');
  const meta = new Map();
  for (const row of data.postmeta) { if (!meta.has(row.post_id)) meta.set(row.post_id, []); meta.get(row.post_id).push(row); }
  const field = (id, key) => meta.get(id)?.find(item => item.meta_key === key)?.meta_value;
  const attachmentIds = new Set();
  const directFiles = new Set(), uploadBases = new Set();
  const uploadPath = url => {
    const marker = '/wp-content/uploads/';
    const index = url.indexOf(marker);
    if (index < 0) return null;
    uploadBases.add(url.slice(0, index) + marker);
    try { return decodeURIComponent(url.slice(index + marker.length).split(/[?#]/)[0]); }
    catch { return url.slice(index + marker.length).split(/[?#]/)[0]; }
  };
  for (const post of selected) {
    const thumbnail = field(post.ID, '_thumbnail_id');
    if (thumbnail) attachmentIds.add(String(thumbnail));
    const content = post.post_content + '\n' + post.post_excerpt;
    for (const match of content.matchAll(/(?:wp-image-|"id"\s*:\s*)(\d+)/g)) attachmentIds.add(match[1]);
    for (const match of content.matchAll(/https?:\/\/[^\s"'<>\\)]+\/wp-content\/uploads\/[^\s"'<>\\)]+/g)) { const path = uploadPath(match[0]); if (path) directFiles.add(path); }
  }
  const mediaFiles = new Map();
  for (const post of data.posts.filter(post => post.post_type === 'attachment')) {
    const original = field(post.ID, '_wp_attached_file');
    if (!original) continue;
    const paths = new Set([original]);
    const serialized = field(post.ID, '_wp_attachment_metadata');
    if (serialized) {
      try {
        const details = unserialize(serialized);
        for (const size of Object.values(details.sizes || {})) if (size.file) paths.add(posix.join(posix.dirname(original), size.file));
        if (details.original_image) paths.add(posix.join(posix.dirname(original), details.original_image));
      } catch { /* Original file and direct content references are still checked below. */ }
    }
    mediaFiles.set(post.ID, paths);
    if ([...paths].some(path => directFiles.has(path))) attachmentIds.add(post.ID);
  }
  const attachments = data.posts.filter(post => post.post_type === 'attachment' && attachmentIds.has(post.ID));
  const sourceUrl = data.options.find(option => option.option_name === 'siteurl')?.option_value || '';
  const permalink = data.options.find(option => option.option_name === 'permalink_structure')?.option_value || '/?p=%post_id%';
  const all = [...selected, ...attachments];
  const termIds = new Set();
  for (const relationship of data.term_relationships.filter(term => postIds.has(term.object_id))) termIds.add(relationship.term_taxonomy_id);
  const termRows = data.term_taxonomy.filter(term => termIds.has(term.term_taxonomy_id) && ['category', 'post_tag'].includes(term.taxonomy));
  const termMap = new Map();
  for (const term of termRows) {
    const original = data.terms.find(row => row.term_id === term.term_id);
    const section = Object.entries(categoryIds).find(([, id]) => id === Number(term.term_id))?.[0];
    termMap.set(term.term_taxonomy_id, { taxonomy: term.taxonomy, name: original.name, slug: section ? targetSlugs[section] : original.slug });
  }
  const authorIds = new Set(all.map(post => post.post_author));
  const authors = data.users.filter(user => authorIds.has(user.ID)).map(user => ({ login: user.user_login, displayName: user.display_name }));
  const posts = all.map(post => {
    const date = post.post_date.split(' ')[0].split('-');
    const url = sourceUrl.replace(/\/$/, '') + permalink.replace('%postname%', post.post_name).replace('%post_id%', post.ID).replace('%year%', date[0]).replace('%monthnum%', date[1]).replace('%day%', date[2]);
    const original = field(post.ID, '_wp_attached_file');
    return { id: Number(post.ID), type: post.post_type, status: post.post_status, slug: post.post_name, title: post.post_title, content: post.post_content, excerpt: post.post_excerpt, date: post.post_date, dateGmt: post.post_date_gmt, author: data.users.find(user => user.ID === post.post_author)?.user_login || 'admin', parent: Number(post.post_parent), url, attachmentUrl: post.post_type === 'attachment' ? (uploadPath(post.guid) ? post.guid : `${sourceUrl.replace(/\/$/, '')}/wp-content/uploads/${original}`) : '', categories: data.term_relationships.filter(term => term.object_id === post.ID).map(term => termMap.get(term.term_taxonomy_id)).filter(Boolean), meta: (meta.get(post.ID) || []).filter(item => !['_edit_lock', '_edit_last'].includes(item.meta_key)).map(item => ({ key: item.meta_key, raw: item.meta_value })) };
  });
  const requiredFiles = new Set(directFiles);
  for (const attachment of attachments) for (const path of mediaFiles.get(attachment.ID) || []) requiredFiles.add(path);
  const entries = {}, missingFiles = [], missingOriginals = [], recoveredFiles = [], supplementalFiles = [];
  const recovered = flags.recovered ? JSON.parse(await readFile(join(resolve(flags.recovered), 'recovery-report.json'), 'utf8')) : [];
  let bytes = 0;
  for (const path of requiredFiles) {
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => part === '..' || part === '.')) throw new Error('Unsafe media path in backup');
    const name = contentPrefix + 'uploads/' + path;
    let value;
    if (!archive.entries.has(name)) {
      if (flags.uploads) {
        const supplemental = join(resolve(flags.uploads), path);
        try {
          const details = await stat(supplemental);
          if (!details.isFile() || details.size > 50 * 1024 * 1024) throw new Error('Supplemental media is not a supported file');
          value = await readFile(supplemental);
          supplementalFiles.push({ path, bytes: value.length, hash: createHash('sha256').update(value).digest('hex') });
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      if (!value && recovered.some(item => item.path === path && item.hash)) {
        value = await readFile(join(resolve(flags.recovered), 'wp-content/uploads', path));
        const provenance = recovered.find(item => item.path === path && item.hash);
        if (createHash('sha256').update(value).digest('hex') !== provenance.hash) throw new Error(`Recovered media checksum mismatch: ${path}`);
        recoveredFiles.push(provenance);
      }
      if (!value && flags['fetch-missing'] === 'true') {
        const url = new URL(`${sourceUrl.replace(/\/$/, '')}/wp-content/uploads/${path}`);
        if (url.protocol === 'http:') url.protocol = 'https:';
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
          if (response.ok && /^(image|video|audio)\//.test(response.headers.get('Content-Type') || '')) {
            value = Buffer.from(await response.arrayBuffer());
            if (value.length > 50 * 1024 * 1024) throw new Error('Recovered media exceeds file limit');
            recoveredFiles.push({ path, url: url.toString(), bytes: value.length });
          }
        } catch { /* Missing files are recorded for review; no fabricated replacements. */ }
      }
      if (!value) { missingFiles.push(path); continue; }
    } else value = await archive.read(name, 50 * 1024 * 1024);
    entries[`wp-content/uploads/${path}`] = value; bytes += value.length;
  }
  for (const attachment of attachments) {
    const original = field(attachment.ID, '_wp_attached_file');
    if (!entries[`wp-content/uploads/${original}`]) missingOriginals.push({ id: attachment.ID, path: original, title: attachment.post_title, availableVariants: [...(mediaFiles.get(attachment.ID) || [])].filter(path => entries[`wp-content/uploads/${path}`]).map(path => ({ path, bytes: entries[`wp-content/uploads/${path}`].length })).sort((a, b) => b.bytes - a.bytes) });
  }
  const categories = [...termMap.values()].filter(term => term.taxonomy === 'category');
  const tags = [...termMap.values()].filter(term => term.taxonomy === 'post_tag');
  entries['migration.json'] = strToU8(JSON.stringify({ version: 1, sourceUrl, uploadBases: [...uploadBases], authors, categories, tags, posts, acf: [] }));
  const output = resolve(flags.output || join(root, 'migration/joebailey-content.zip'));
  await mkdir(dirname(output), { recursive: true });
  if (!missingOriginals.length) await writeFile(output, zipSync(entries, { level: 1 }));
  const report = { backup: basename(flags.archive), sourceUrl, sourcePermalink: permalink, categoryMapping: selectedTaxonomies.map(term => ({ sourceId: Number(term.term_id), sourceSlug: data.terms.find(row => row.term_id === term.term_id).slug, targetSlug: targetSlugs[Object.entries(categoryIds).find(([, id]) => id === Number(term.term_id))[0]] })), posts: selected.length, publishedBySection: Object.fromEntries(Object.entries(categoryIds).map(([section, id]) => { const tax = selectedTaxonomies.find(term => Number(term.term_id) === id).term_taxonomy_id; const ids = new Set(data.term_relationships.filter(term => term.term_taxonomy_id === tax).map(term => term.object_id)); return [section, selected.filter(post => post.post_status === 'publish' && ids.has(post.ID)).length]; })), drafts: selected.filter(post => post.post_status === 'draft').length, attachments: attachments.length, mediaFiles: Object.keys(entries).length - 1, mediaBytes: bytes, missingFiles, missingOriginals, recoveredFiles, excludedPosts: data.posts.filter(post => post.post_type === 'post').length - selected.length, shortcodes: [...new Set(selected.flatMap(post => [...post.post_content.matchAll(/\[(?!\[|\/)([a-zA-Z][a-zA-Z0-9_-]*)\b/g)].map(match => match[1])))], postsIncluded: selected.map(post => ({ sourceId: Number(post.ID), slug: post.post_name, title: post.post_title, status: post.post_status })) };
  report.supplementalSource = flags.uploads ? resolve(flags.uploads) : null;
  report.supplementalFiles = supplementalFiles;
  await writeFile(join(dirname(output), 'migration-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ posts: report.posts, publishedBySection: report.publishedBySection, drafts: report.drafts, mediaFiles: report.mediaFiles, mediaBytes: bytes, missingOriginals, recoveredFiles: recoveredFiles.length, excludedPosts: report.excludedPosts, output }, null, 2));
  if (missingOriginals.length) throw new Error('Migration needs the missing original media listed in migration-report.json; no incomplete migration bundle was written');
} finally { archive.close(); }
