import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const rootDir = process.cwd()
const gitDir = path.join(rootDir, '.git')
const hooksDir = path.join(rootDir, '.githooks')

if (!existsSync(gitDir) || !existsSync(hooksDir)) {
  process.exit(0)
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
