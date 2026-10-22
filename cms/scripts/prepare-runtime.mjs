import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(await readFile(join(root, 'runtime.lock.json'), 'utf8'));
const cache = join(root, '.cache');
await mkdir(cache, { recursive: true });
const archive = process.argv[2] ? resolve(process.argv[2]) : join(cache, `playground-${lock.playground}.zip`);
if (!process.argv[2] && !(await stat(archive).catch(() => null))) {
  console.log('Downloading the official pinned Playground artifact (approximately 685 MiB)…');
  const child = spawn('gh', ['api', `repos/${lock.repository}/actions/artifacts/${lock.artifactId}/zip`], { stdio: ['ignore', 'pipe', 'inherit'] });
  const complete = new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error('Runtime download failed. Authenticate gh, or supply the pinned artifact ZIP path.'))); });
  await Promise.all([pipeline(child.stdout, createWriteStream(archive)), complete]);
}
const checksum = createHash('sha256');
for await (const chunk of createReadStream(archive)) checksum.update(chunk);
if (checksum.digest('hex') !== lock.artifactSha256) throw new Error('Runtime artifact checksum mismatch. Remove the incomplete archive and download the pinned artifact again.');
const destination = join(root, 'runtime');
await mkdir(destination, { recursive: true });
// Windows ships bsdtar, which handles ZIP/tar.gz without loading them in RAM.
async function extract(source, target) {
  const listing = spawn('tar', ['-tf', source], { stdio: ['ignore', 'pipe', 'inherit'] });
  let entries = '';
  for await (const chunk of listing.stdout) entries += chunk;
  if (entries.split(/\r?\n/).some(entry => entry && (entry.startsWith('/') || entry.includes('\\') || entry.split('/').includes('..') || /^[a-z]:/i.test(entry)))) throw new Error('Unsafe artifact path');
  const extracted = spawn('tar', ['-xf', source, '-C', target], { stdio: 'inherit' });
  await new Promise((resolve, reject) => { extracted.on('error', reject); extracted.on('close', code => code === 0 ? resolve() : reject(new Error('Runtime extraction failed'))); });
}
await extract(archive, destination);
// The upstream GitHub artifact wraps the website tarball in a ZIP.
const tarball = join(destination, 'wasm-wordpress-net.tar.gz');
if (await stat(tarball).catch(() => null)) {
  const unpacked = join(destination, 'assets');
  await mkdir(unpacked, { recursive: true });
  await extract(tarball, unpacked);
}
async function findRemote(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'remote.html') return directory;
    if (entry.isDirectory()) { const found = await findRemote(join(directory, entry.name)); if (found) return found; }
  }
}
const assets = await findRemote(destination);
if (!assets) throw new Error('The artifact does not contain remote.html');
await writeFile(join(root, '.cache/runtime-path.json'), JSON.stringify({ path: relative(root, assets), ...lock }, null, 2));
console.log(`Verified Playground ${lock.playground}: ${assets}`);
