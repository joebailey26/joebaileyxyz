// Read regular files from the trusted, checksum-pinned upstream core tarball.
export function tarEntries(bytes) {
  const entries = new Map();
  const decoder = new TextDecoder();
  for (let offset = 0; offset + 512 <= bytes.length;) {
    const header = bytes.subarray(offset, offset + 512);
    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*$/, '');
    if (!name) break;
    const prefix = decoder.decode(header.subarray(345, 500)).replace(/\0.*$/, '');
    const path = prefix ? `${prefix}/${name}` : name;
    const size = parseInt(decoder.decode(header.subarray(124, 136)).replace(/\0.*$/, '').trim() || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > bytes.length) throw new Error('Invalid runtime tarball');
    if ([0, 48].includes(header[156])) entries.set(path, bytes.subarray(offset + 512, offset + 512 + size));
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}
