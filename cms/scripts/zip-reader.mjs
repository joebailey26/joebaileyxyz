import yauzl from 'yauzl';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';

export async function openArchive(path) {
  const zip = await new Promise((resolve, reject) => yauzl.open(path, { lazyEntries: true, autoClose: false }, (error, zip) => error ? reject(error) : resolve(zip)));
  const entries = new Map();
  await new Promise((resolve, reject) => {
    zip.on('error', reject);
    zip.on('end', resolve);
    zip.on('entry', entry => { entries.set(entry.fileName, entry); zip.readEntry(); });
    zip.readEntry();
  });
  const stream = name => new Promise((resolve, reject) => {
    const entry = entries.get(name);
    if (!entry) { reject(new Error(`Missing backup entry: ${name}`)); return; }
    zip.openReadStream(entry, (error, stream) => error ? reject(error) : resolve(stream));
  });
  return {
    entries,
    async read(name, limit = 128 * 1024 * 1024) {
      if ((entries.get(name)?.uncompressedSize || 0) > limit) throw new Error(`Backup entry is too large to read: ${name}`);
      const chunks = []; let size = 0;
      for await (const chunk of await stream(name)) { size += chunk.length; if (size > limit) throw new Error('Backup size limit exceeded'); chunks.push(chunk); }
      return Buffer.concat(chunks);
    },
    async extract(name, destination) {
      await mkdir(dirname(destination), { recursive: true });
      await pipeline(await stream(name), createWriteStream(destination));
    },
    close() { zip.close(); }
  };
}
