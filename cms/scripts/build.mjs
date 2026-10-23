import { build } from 'esbuild';
import { readFile, writeFile, readdir, mkdir, cp, stat, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { zstdDecompressSync } from 'node:zlib';
import { tarEntries } from './tar.mjs';
import { prepareAccessCompatibleRuntime } from './runtime-compat.mjs';
import { preparedRuntime } from './runtime-archive.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
if (resolve(output) !== resolve(root, 'dist')) throw new Error('Unsafe build output directory');
// Always reconstruct static output, including missing or stale cached files.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, 'web/index.html'), join(output, 'index.html'));
await cp(join(root, 'web/editor.css'), join(output, 'editor.css'));
await cp(join(root, 'wordpress/joebailey-cms.php'), join(output, 'joebailey-cms.php'));
await cp(join(root, 'wordpress/migration.php'), join(output, 'migration.php'));
await build({ entryPoints: [join(root, 'web/editor.js')], outfile: join(output, 'editor.js'), bundle: true, format: 'esm', target: 'es2022', minify: false, loader: { '.css': 'text', '.php': 'text' } });
const lock = JSON.parse(await readFile(join(root, 'runtime.lock.json'), 'utf8'));
const metadata = await preparedRuntime(root, lock);
if (!metadata) {
  if (process.argv.includes('--production')) throw new Error('Pinned Playground runtime is missing. Run pnpm run runtime first.');
  console.warn('Editor shell built. Run pnpm run runtime to install the pinned Playground runtime before opening WordPress.');
  process.exit(0);
}
if (metadata.artifactSha256 !== lock.artifactSha256) throw new Error('Prepared runtime does not match runtime.lock.json');
const assets = resolve(root, metadata.path);
if (!assets.startsWith(join(root, 'runtime'))) throw new Error('Runtime must be inside cms/runtime');
const objects = {};
await mkdir(join(root, '.cache/runtime-objects'), { recursive: true });
const contentTypes = { wasm: 'application/wasm', zip: 'application/zip', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', html: 'text/html', css: 'text/css' };
async function copyAssets(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = prefix + entry.name;
    if (entry.name.endsWith('.map')) continue;
    if (!prefix && /^(wp-|php-next|test-fixtures|demos|builder)/.test(entry.name) && entry.name !== `wp-${lock.wordpressMajor}` && entry.name !== 'wp-cli.phar' && entry.name !== 'wp-cli.phar.gz') continue;
    if (entry.isDirectory()) { await copyAssets(path, `${name}/`); continue; }
    // Preserve the upstream shell at a non-root path. Our editor owns /index.html.
    const targetName = name === 'index.html' ? 'playground-shell.html' : name;
    if (['editor.js', 'editor.css', 'joebailey-cms.php', 'runtime.json'].includes(targetName)) continue;
    if ((await stat(path)).size > 24 * 1024 * 1024) {
      const hash = createHash('sha256').update(await readFile(path)).digest('hex');
      await cp(path, join(root, '.cache/runtime-objects', hash));
      objects[`/${name}`] = { hash, type: contentTypes[name.split('.').pop()] || 'application/octet-stream' };
    } else {
      await mkdir(dirname(join(output, targetName)), { recursive: true });
      await cp(path, join(output, targetName));
    }
  }
}
await copyAssets(assets);
await prepareAccessCompatibleRuntime(assets, output);
await writeFile(join(output, 'runtime-objects.json'), JSON.stringify(objects));
await writeFile(join(root, '.cache/runtime-objects.json'), JSON.stringify(objects, null, 2));
const wordpress = lock.wordpressMajor;
const coreFile = (await readdir(join(assets, 'assets'))).find(name => name.startsWith(`wp-${wordpress}.tar-`) && name.endsWith('.zst'));
if (!coreFile) throw new Error('Could not find the pinned WordPress core bundle');
const core = tarEntries(zstdDecompressSync(await readFile(join(assets, 'assets', coreFile))));
const versionFile = [...core.entries()].find(([path]) => path.endsWith('wp-includes/version.php'))?.[1];
const exactVersion = new TextDecoder().decode(versionFile).match(/\$wp_version\s*=\s*'([^']+)'/)?.[1];
if (!exactVersion) throw new Error('Could not identify the pinned WordPress version');
await writeFile(join(output, 'runtime.json'), JSON.stringify({ playground: lock.playground, wordpress: exactVersion, php: '8.5', coreFile: `assets/${coreFile}`, artifactSha256: lock.artifactSha256 }));
console.log(`CMS built with pinned Playground ${lock.playground}, WordPress ${wordpress}. ${Object.keys(objects).length} large runtime files require R2 upload.`);
