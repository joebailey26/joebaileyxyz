import { gunzipSync } from 'node:zlib';
import { openArchive } from './zip-reader.mjs';
import { readDump } from './mysql-dump.mjs';

export async function loadBackup(path) {
  const archive = await openArchive(path);
  try {
    const names = [...archive.entries.keys()];
    const configName = names.find(name => /(^|\/)wp-config\.php$/.test(name));
    const config = (await archive.read(configName, 1024 * 1024)).toString('utf8');
    const prefix = config.match(/\$table_prefix\s*=\s*['"]([^'"]+)['"]/)?.[1];
    if (!prefix || !/^[a-zA-Z0-9_]+$/.test(prefix)) throw new Error('Cannot identify WordPress table prefix');
    const sqlName = names.find(name => /\.sql(\.gz)?$/.test(name));
    if (!sqlName) throw new Error('No SQL database in backup');
    const compressed = await archive.read(sqlName);
    const sql = (sqlName.endsWith('.gz') ? gunzipSync(compressed, { maxOutputLength: 512 * 1024 * 1024 }) : compressed).toString('utf8');
    return { archive, data: readDump(sql, prefix), contentPrefix: configName.slice(0, -'wp-config.php'.length) + 'wp-content/' };
  } catch (error) { archive.close(); throw error; }
}
