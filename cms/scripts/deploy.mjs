import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

export function deploymentPlan(config, migrations, preview = false) {
  const target = preview ? config.previews : config;
  const database = target?.d1_databases?.find(item => item.binding === 'DB');
  const bucket = target?.r2_buckets?.find(item => item.binding === 'FILES');
  if (!database?.database_id || !bucket?.bucket_name) throw new Error('Deployment storage is not configured');
  if (preview) {
    if (config.d1_databases.some(item => item.database_id === database.database_id) || config.r2_buckets.some(item => item.bucket_name === bucket.bucket_name)) throw new Error('Preview deployment cannot use production storage');
    const migrationDatabase = migrations?.d1_databases?.find(item => item.binding === 'DB');
    if (migrationDatabase?.database_id !== database.database_id || migrationDatabase?.database_name !== database.database_name || migrationDatabase?.migrations_dir !== database.migrations_dir) throw new Error('Preview migrations must target the Preview database');
    if (target.vars?.CMS_TRIGGER_BUILDS !== 'false') throw new Error('Preview website builds must be disabled');
  }
  return {
    bucket: bucket.bucket_name,
    commands: [
      ['wrangler', 'd1', 'migrations', 'apply', 'DB', '--remote', ...(preview ? ['--config', 'wrangler.preview-migrations.jsonc'] : [])],
      ['upload-runtime', ...(preview ? ['--preview'] : [])],
      ['wrangler', preview ? 'preview' : 'deploy']
    ]
  };
}

export async function executeDeployment(plan, run) {
  for (const command of plan.commands) await run(command);
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const config = JSON.parse(await readFile(join(root, 'wrangler.jsonc'), 'utf8'));
  const preview = process.argv.includes('--preview');
  const migrations = preview ? JSON.parse(await readFile(join(root, 'wrangler.preview-migrations.jsonc'), 'utf8')) : null;
  const plan = deploymentPlan(config, migrations, preview);
  console.log(`Deploying ${preview ? 'preview' : 'production'}; runtime bucket: ${plan.bucket}`);
  await executeDeployment(plan, async ([tool, ...args]) => {
    const script = tool === 'wrangler' ? join(root, 'node_modules/wrangler/bin/wrangler.js') : join(root, 'scripts/upload-runtime.mjs');
    const child = spawn(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve() : reject(new Error(`${tool} failed (${code}); deployment stopped`)));
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
