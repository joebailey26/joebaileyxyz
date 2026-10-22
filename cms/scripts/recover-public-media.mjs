import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../src/shared.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(await readFile(join(root, 'migration/migration-report.json'), 'utf8'));
const destination = join(root, 'migration/recovered');
const results = [];
let index = 0;
async function recover() {
  while (index < report.missingFiles.length) {
    const path = report.missingFiles[index++];
    if (path.startsWith('/') || path.includes('\\') || path.split('/').some(part => part === '..' || part === '.')) throw new Error('Unsafe recovery path');
    const url = `https://joebailey.xyz/img/wordpress/${encodeURIComponent(basename(path)).toLowerCase()}`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok || !/^(image|video|audio)\//.test(response.headers.get('Content-Type') || '')) { results.push({ path, status: response.status }); continue; }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length > 50 * 1024 * 1024) throw new Error('Recovery file too large');
      const output = join(destination, 'wp-content/uploads', path);
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, bytes);
      results.push({ path, url, bytes: bytes.length, hash: await sha256(bytes), status: 200 });
    } catch { results.push({ path, status: 'unavailable' }); }
  }
}
await Promise.all(Array.from({ length: 6 }, recover));
await writeFile(join(destination, 'recovery-report.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ attempted: results.length, recovered: results.filter(item => item.hash).length, originalsRecovered: report.missingOriginals.filter(original => results.some(item => item.path === original.path && item.hash)).length, output: destination }, null, 2));
