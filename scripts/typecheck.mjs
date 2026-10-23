// Runs `tsc --noEmit`, but passes when the repository has no TypeScript files (tsc fails with TS18003 otherwise).
import { execFileSync, spawnSync } from 'node:child_process'

const files = execFileSync('git', ['ls-files', '*.ts', '*.tsx', ':!cms/'], { encoding: 'utf8' }).trim()
if (!files) {
  console.log('No TypeScript files found; skipping typecheck.')
  process.exit(0)
}
const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.json'], { stdio: 'inherit' })
process.exit(result.status ?? 1)
