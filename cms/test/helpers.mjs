import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../src/worker.mjs';

export function environment() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0001_cms.sql', import.meta.url), 'utf8'));
  const convert = row => row ? Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value instanceof Uint8Array ? Array.from(value) : value])) : null;
  const db = {
    prepare(sql) {
      let params = [];
      const result = {
        bind(...values) { params = values.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value); return result; },
        execute() { return sqlite.prepare(sql).all(...params).map(convert); },
        async first() { return result.execute()[0] || null; },
        async all() { return { results: result.execute() }; },
        async run() { result.execute(); return { success: true }; }
      };
      return result;
    },
    async batch(statements) {
      db.beforeBatch?.();
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map(statement => ({ results: statement.execute() }));
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    }
  };
  const objects = new Map();
  const env = {
    DB: db, LOCAL_DEV: 'true', BLOG_CATEGORY: 'blog', PROJECTS_CATEGORY: 'projects',
    ACCESS_TEAM_DOMAIN: 'example.cloudflareaccess.com', ACCESS_AUD: 'test-audience',
    CMS_BUILD_TOKEN: 'a-test-build-token-with-at-least-32-characters',
    FILES: {
      async put(key, data, options) { objects.set(key, { bytes: new Uint8Array(data), options }); },
      async head(key) { return objects.has(key) ? { size: objects.get(key).bytes.length } : null; },
      async get(key) { const object = objects.get(key); return object ? { body: object.bytes, size: object.bytes.length, httpEtag: '"test"' } : null; }
    },
    ASSETS: { async fetch() { return new Response('Missing asset', { status: 404 }); } }
  };
  const tasks = [];
  const ctx = { waitUntil(task) { tasks.push(task); } };
  const request = (path, options = {}) => {
    const { lease, body, origin = 'http://localhost', ...rest } = options;
    const headers = new Headers(rest.headers);
    if (lease) headers.set('X-CMS-Lease', lease);
    if (rest.method && rest.method !== 'GET') headers.set('Origin', origin);
    if (body && !(body instanceof Uint8Array)) headers.set('Content-Type', 'application/json');
    return handleRequest(new Request(new URL(path, origin), { ...rest, headers, body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined }), env, ctx);
  };
  return { env, db, sqlite, objects, request, async drain() { while (tasks.length) await tasks.shift(); }, close() { sqlite.close(); } };
}
