import { mkdir, readFile, writeFile, stat, readdir, rm } from 'node:fs/promises';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureArchive, extractZip, extractTar, preparedRuntime, runtimeInventory } from './runtime-archive.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(await readFile(join(root, 'runtime.lock.json'), 'utf8'));
const cache = join(root, '.cache');
await mkdir(cache, { recursive: true });
if (!process.argv[2] && await preparedRuntime(root, lock)) {
  console.log(`Verified prepared Playground ${lock.playground}; runtime is complete.`);
  process.exit(0);
}
const archive = process.argv[2] ? resolve(process.argv[2]) : join(cache, `playground-${lock.playground}.zip`);
console.log('Verifying the pinned archive; missing or corrupt generated caches download from the release (approximately 685 MiB)…');
await ensureArchive(lock.downloadUrl, archive, lock.artifactSha256, { local: Boolean(process.argv[2]) });

const destination = join(root, 'runtime');
// Only this fixed, resolved directory contains disposable extracted runtime data.
if (resolve(destination) !== resolve(root, 'runtime')) throw new Error('Unsafe runtime output directory');
await rm(join(cache, 'runtime-path.json'), { force: true });
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await extractZip(archive, destination);
const tarball = join(destination, 'wasm-wordpress-net.tar.gz');
if (await stat(tarball).catch(() => null)) await extractTar(tarball, join(destination, 'assets'));
async function findRemote(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'remote.html') return directory;
    if (entry.isDirectory()) { const found = await findRemote(join(directory, entry.name)); if (found) return found; }
  }
}
const assets = await findRemote(destination);
if (!assets) throw new Error('The artifact does not contain remote.html');
const files = await runtimeInventory(assets);
await writeFile(join(cache, 'runtime-path.json'), JSON.stringify({ path: relative(root, assets), ...lock, files }, null, 2));
if (!await preparedRuntime(root, lock)) throw new Error('Prepared runtime is incomplete');
console.log(`Verified Playground ${lock.playground}: ${assets}`);
