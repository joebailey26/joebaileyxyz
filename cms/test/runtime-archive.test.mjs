import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { zipSync, strToU8 } from 'fflate';
import { downloadArchive, extractZip, archivePath, preparedRuntime, runtimeInventory, extractTar } from '../scripts/runtime-archive.mjs';

const checksum = bytes => createHash('sha256').update(bytes).digest('hex');
async function workspace(t) {
  const root = await mkdtemp(join(tmpdir(), 'cms-runtime-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('runtime downloads stream verified bytes and only promote complete files', async t => {
  const root = await workspace(t);
  const destination = join(root, 'runtime.zip');
  const bytes = new Uint8Array(256 * 1024 + 1).fill(123);
  await downloadArchive('https://example.test/runtime.zip', destination, checksum(bytes), { fetchImpl: async () => new Response(bytes) });
  assert.deepEqual(new Uint8Array(await readFile(destination)), bytes);
  assert.deepEqual(await readdir(root), ['runtime.zip']);
});

test('HTTP errors, truncated downloads and checksum failures leave no reusable archive', async t => {
  const root = await workspace(t);
  const destination = join(root, 'runtime.zip');
  const factories = [
    async () => new Response('missing', { status: 404 }),
    async () => new Response('incorrect checksum'),
    async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([1])); controller.error(new Error('Connection interrupted')); } }))
  ];
  for (const fetchImpl of factories) {
    await assert.rejects(downloadArchive('https://example.test/runtime.zip', destination, checksum('correct bytes'), { fetchImpl }));
    assert.deepEqual(await readdir(root), []);
  }
});

test('ZIP extraction works without a system ZIP-capable tar and rejects traversal', async t => {
  const root = await workspace(t);
  const archive = join(root, 'runtime.zip');
  const output = join(root, 'output');
  await writeFile(archive, zipSync({ 'directory/file.txt': strToU8('verified file') }));
  await extractZip(archive, output);
  assert.equal(await readFile(join(output, 'directory/file.txt'), 'utf8'), 'verified file');
  for (const name of ['../escape', '/absolute', 'C:/drive', 'directory\\escape', 'directory/../../escape']) {
    assert.throws(() => archivePath(output, name), /Unsafe/);
  }
  await writeFile(archive, zipSync({ '../escape': strToU8('unsafe') }));
  await assert.rejects(extractZip(archive, output), /invalid relative path|Unsafe/);
  await writeFile(join(root, 'invalid.tar.gz'), 'not an archive');
  await assert.rejects(extractTar(join(root, 'invalid.tar.gz'), output), /tar failed|spawn/);
});

test('runtime reuse rejects missing and truncated files and mismatched pins', async t => {
  const root = await workspace(t);
  const assets = join(root, 'runtime/assets');
  await mkdir(join(assets, 'assets'), { recursive: true });
  await mkdir(join(root, '.cache'));
  for (const name of ['remote.html', 'sw.js', 'assets/core.wasm']) await writeFile(join(assets, name), 'complete');
  const metadata = { path: 'runtime/assets', artifactSha256: 'pinned', files: await runtimeInventory(assets) };
  await writeFile(join(root, '.cache/runtime-path.json'), JSON.stringify(metadata));
  assert.ok(await preparedRuntime(root, metadata));
  assert.equal(await preparedRuntime(root, { artifactSha256: 'different' }), null);
  await writeFile(join(assets, 'assets/core.wasm'), 'partial');
  assert.equal(await preparedRuntime(root, metadata), null);
  await writeFile(join(assets, 'assets/core.wasm'), 'complete');
  await rm(join(assets, 'remote.html'));
  assert.equal(await preparedRuntime(root, metadata), null);
});
