// One-time account-admin promotion. Never replaces an existing cloud revision.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { unzipSync, strFromU8 } from 'fflate';
import { CHUNK_SIZE, sha256, validateManifest, validateRecord, feedHash } from '../src/shared.mjs';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/seed-cloud.mjs migration/cloud-snapshot.zip');
const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const account = config.account_id, databaseId = config.d1_databases[0].database_id, bucket = config.r2_buckets[0].bucket_name;
const credentials = await readFile(join(homedir(), '.wrangler/config/default.toml'), 'utf8');
const token = process.env.CLOUDFLARE_API_TOKEN || credentials.match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
if (!token) throw new Error('Cloudflare account-admin authentication is required');
const base = `https://api.cloudflare.com/client/v4/accounts/${account}`;
const entries = unzipSync(await readFile(resolve(input)));
const manifest = validateManifest(JSON.parse(strFromU8(entries['manifest.json'])));
const bytes = entries['database.sqlite'];
assert.equal(bytes.length, manifest.databaseSize);
assert.equal(await sha256(bytes), manifest.databaseHash);
const records = JSON.parse(strFromU8(entries['content.json']));
for (const record of records) {
  validateRecord(record, record.section);
  assert(!/https?:\/\/[^\s"'<>]*\/scope:[^\s"'<>]*/.test(JSON.stringify(record)), 'Unresolved Playground URL in promoted feed');
}
for (const section of ['blog', 'projects']) assert.equal(records.filter(record => record.section === section).length, manifest.counts[section]);
for (const file of manifest.files) {
  const data = entries[`wp-content/${file.path}`];
  assert(data && data.length === file.size && await sha256(data) === file.hash, `Invalid file: ${file.path}`);
}
async function query(statements) {
  const response = await fetch(`${base}/d1/database/${databaseId}/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(Array.isArray(statements) ? { batch: statements } : statements), signal: AbortSignal.timeout(60000) });
  const data = await response.json();
  if (!response.ok || !data.success || data.result.some(result => !result.success)) throw new Error(`D1 operation failed: ${JSON.stringify(data.errors || [])}`);
  return data.result;
}
const current = (await query({ sql: 'SELECT active_revision, lease_expires FROM cms_state WHERE id = 1' }))[0].results[0];
assert.equal(current.active_revision, null, 'Cloud is already initialized; use the authenticated editor to make changes');
assert(current.lease_expires <= Date.now() / 1000, 'An editor is open; close it before initial promotion');
const revision = randomUUID(), timestamp = Math.floor(Date.now() / 1000);
const guard = () => ({ sql: 'INSERT INTO commit_assertion(ok) SELECT CASE WHEN active_revision IS NULL AND lease_expires <= ? THEN 1 ELSE 0 END FROM cms_state WHERE id = 1', params: [Math.floor(Date.now() / 1000)] });
const guarded = statements => query([guard(), ...statements, { sql: 'DELETE FROM commit_assertion' }]);
await guarded([{ sql: "INSERT INTO snapshots(id, base_revision, lease_token, status, created_at, manifest) VALUES (?, NULL, 'initial-import', 'staging', ?, ?)", params: [revision, timestamp, JSON.stringify(manifest)] }]);
console.log(`Uploading ${manifest.files.length} verified file paths to R2…`);
const unique = [...new Map(manifest.files.map(file => [file.hash, file])).values()];
let cursor = 0, completed = 0;
const upload = async () => {
  while (cursor < unique.length) {
    const file = unique[cursor++], data = entries[`wp-content/${file.path}`];
    const response = await fetch(`${base}/r2/buckets/${bucket}/objects/files/${file.hash}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type || 'application/octet-stream', 'Content-MD5': createHash('md5').update(data).digest('base64') }, body: data, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`R2 upload failed: HTTP ${response.status}`);
    if (++completed % 50 === 0) console.log(`R2 ${completed}/${unique.length}`);
  }
};
const uploads = await Promise.allSettled(Array.from({ length: 6 }, upload));
const failed = uploads.find(result => result.status === 'rejected');
if (failed) throw failed.reason;
const fileRows = manifest.files.map(file => ({ ...file, media: file.kind === 'media' ? 1 : 0 }));
await guarded([
  { sql: "INSERT INTO file_objects(checksum,size,media,content_type) SELECT json_extract(value,'$.hash'),json_extract(value,'$.size'),json_extract(value,'$.media'),json_extract(value,'$.type') FROM json_each(?) WHERE true ON CONFLICT(checksum) DO UPDATE SET media=MAX(file_objects.media,excluded.media)", params: [JSON.stringify(fileRows)] },
  { sql: "INSERT INTO snapshot_files(revision,path,checksum,size,kind) SELECT ?,json_extract(value,'$.path'),json_extract(value,'$.hash'),json_extract(value,'$.size'),json_extract(value,'$.kind') FROM json_each(?)", params: [revision, JSON.stringify(fileRows)] }
]);
for (let position = 0; position < manifest.chunks.length; position++) {
  const chunk = bytes.subarray(position * CHUNK_SIZE, (position + 1) * CHUNK_SIZE);
  assert.equal(await sha256(chunk), manifest.chunks[position]);
  await guarded([{ sql: "INSERT INTO snapshot_chunks(revision,position,checksum,data) VALUES (?,?,?,X'')", params: [revision, position, manifest.chunks[position]] }]);
  // D1 limits SQL statement length. Assemble each 256 KiB value from smaller hex literals.
  for (let offset = 0; offset < chunk.length; offset += 32768) {
    const hex = Buffer.from(chunk.subarray(offset, offset + 32768)).toString('hex');
    await guarded([{ sql: `UPDATE snapshot_chunks SET data=CAST(data || X'${hex}' AS BLOB) WHERE revision=? AND position=?`, params: [revision, position] }]);
  }
  const stored = (await query({ sql: 'SELECT hex(data) AS data FROM snapshot_chunks WHERE revision=? AND position=?', params: [revision, position] }))[0].results[0];
  assert.equal(await sha256(Buffer.from(stored.data, 'hex')), manifest.chunks[position]);
}
for (let offset = 0; offset < records.length; offset += 10) {
  await guarded(records.slice(offset, offset + 10).map(record => ({ sql: 'INSERT INTO content_records(revision,section,slug,date,payload) VALUES (?,?,?,?,?)', params: [revision, record.section, record.slug, record.date, JSON.stringify(record)] })));
}
const hash = await feedHash(records);
await guarded([
  { sql: "UPDATE snapshots SET status='complete', committed_at=?, feed_hash=?, build_status='none' WHERE id=?", params: [timestamp, hash, revision] },
  { sql: 'UPDATE cms_state SET active_revision=? WHERE id=1', params: [revision] }
]);
await writeFile(new URL('../.cache/cloud-seeded.json', import.meta.url), JSON.stringify({ revision, counts: manifest.counts, databaseHash: manifest.databaseHash, files: manifest.files.length, committedAt: timestamp }, null, 2));
console.log(`Activated initial revision ${revision}: ${manifest.counts.blog} blog posts, ${manifest.counts.projects} projects. Public website ingestion has not changed.`);
