import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { spawn } from 'node:child_process';
import { openArchive } from './zip-reader.mjs';

export async function verifyArchive(path, checksum) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  if (hash.digest('hex') !== checksum) throw new Error('Runtime artifact checksum mismatch');
}

export async function downloadArchive(url, destination, checksum, { fetchImpl = fetch } = {}) {
  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.partial`;
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(15 * 60 * 1000) });
    if (!response.ok || !response.body) throw new Error(`Runtime download failed: HTTP ${response.status}`);
    const hash = createHash('sha256');
    const hashing = new Transform({ transform(chunk, encoding, callback) { hash.update(chunk); callback(null, chunk); } });
    await pipeline(Readable.fromWeb(response.body), hashing, createWriteStream(temporary, { flags: 'wx' }));
    if (hash.digest('hex') !== checksum) throw new Error('Runtime artifact checksum mismatch');
    await rename(temporary, destination);
  } finally { await rm(temporary, { force: true }); }
}

export function archivePath(root, name) {
  if (!name || name.startsWith('/') || name.includes('\\') || name.includes(':') || name.includes('\0') || name.split('/').some(part => part === '..')) throw new Error(`Unsafe artifact path: ${name}`);
  const target = resolve(root, name);
  if (target !== resolve(root) && !target.startsWith(`${resolve(root)}${sep}`)) throw new Error(`Unsafe artifact path: ${name}`);
  return target;
}

export async function extractZip(source, destination) {
  const archive = await openArchive(source);
  try {
    // Validate the entire list before writing; only regular files/directories.
    for (const [name, entry] of archive.entries) {
      archivePath(destination, name);
      const mode = (entry.externalFileAttributes >>> 16) & 0o170000;
      if (mode && ![0o040000, 0o100000].includes(mode)) throw new Error(`Unsupported artifact entry: ${name}`);
    }
    for (const name of archive.entries.keys()) {
      const target = archivePath(destination, name);
      if (name.endsWith('/')) await mkdir(target, { recursive: true });
      else await archive.extract(name, target);
    }
  } finally { archive.close(); }
}

export function runTar(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('tar', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', errors = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-4000); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(`Runtime tar failed (${code}): ${errors}`)));
  });
}

export async function extractTar(source, destination) {
  const names = await runTar(['-tzf', source]);
  for (const name of names.split(/\r?\n/).filter(Boolean)) archivePath(destination, name);
  const details = await runTar(['-tvzf', source]);
  if (details.split(/\r?\n/).some(line => /^[lh]/.test(line))) throw new Error('Unsupported link in runtime tarball');
  await mkdir(destination, { recursive: true });
  await runTar(['-xzf', source, '-C', destination]);
}

export async function runtimeInventory(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(join(directory, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await runtimeInventory(directory, name));
    else if (entry.isFile()) files.push({ path: name, size: (await stat(join(directory, name))).size });
    else throw new Error(`Unsupported runtime entry: ${name}`);
  }
  return files;
}

export async function preparedRuntime(root, lock) {
  try {
    const metadata = JSON.parse(await readFile(join(root, '.cache/runtime-path.json'), 'utf8'));
    if (metadata.artifactSha256 !== lock.artifactSha256 || !metadata.files?.length) return null;
    const assets = resolve(root, metadata.path);
    if (!assets.startsWith(`${join(root, 'runtime')}${sep}`)) return null;
    for (const name of ['remote.html', 'sw.js', 'assets']) await stat(join(assets, name));
    for (const file of metadata.files) {
      const info = await stat(archivePath(assets, file.path));
      if (!info.isFile() || info.size !== file.size) return null;
    }
    return { ...metadata, assets };
  } catch { return null; }
}
