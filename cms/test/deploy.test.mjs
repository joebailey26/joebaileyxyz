import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { deploymentPlan, executeDeployment } from '../scripts/deploy.mjs';

const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const migrations = JSON.parse(await readFile(new URL('../wrangler.preview-migrations.jsonc', import.meta.url), 'utf8'));

test('production and preview deployment plans target their own database and runtime bucket', () => {
  const production = deploymentPlan(config, null);
  const preview = deploymentPlan(config, migrations, true);
  assert.equal(production.bucket, 'joebailey-cms-files');
  assert.equal(preview.bucket, 'joebailey-cms-preview-files');
  assert.deepEqual(production.commands.at(-1), ['wrangler', 'deploy']);
  assert.deepEqual(preview.commands.at(-1), ['wrangler', 'preview']);
  assert.ok(preview.commands[0].includes('wrangler.preview-migrations.jsonc'));
  assert.deepEqual(preview.commands[1], ['upload-runtime', '--preview']);
  const unsafe = structuredClone(config);
  unsafe.previews.d1_databases = unsafe.d1_databases;
  assert.throws(() => deploymentPlan(unsafe, migrations, true), /production storage/);
  assert.throws(() => deploymentPlan(config, { d1_databases: config.d1_databases }, true), /migrations/);
});

test('migration and runtime upload failures stop deployment before publishing a Worker', async () => {
  const plan = deploymentPlan(config, migrations, true);
  for (const failureAt of [0, 1]) {
    const called = [];
    await assert.rejects(executeDeployment(plan, async command => {
      called.push(command);
      if (called.length === failureAt + 1) throw new Error('Preparation failed');
    }), /Preparation failed/);
    assert.equal(called.length, failureAt + 1);
  }
});
