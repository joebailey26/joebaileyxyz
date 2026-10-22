import { openArchive } from './zip-reader.mjs';
const archive = await openArchive(process.argv[2]);
try {
  console.log(JSON.stringify([...archive.entries].filter(([path]) => path.toLowerCase().includes(process.argv[3].toLowerCase())).map(([path, entry]) => ({ path, bytes: entry.uncompressedSize })), null, 2));
} finally { archive.close(); }
