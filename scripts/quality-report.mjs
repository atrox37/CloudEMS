import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const outIndex = args.indexOf('--out')
const outPath =
  outIndex >= 0 && args[outIndex + 1]
    ? resolve(args[outIndex + 1])
    : resolve('reports/quality/quality-report.md')

const configPath = resolve('quality.config.json')
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''))
  : {
      coverageThresholds: { lines: 70, statements: 70, functions: 70, branches: 60 },
      bundleThresholds: { maxJsAssetKb: 500, maxCssAssetKb: 250, maxTotalDistMb: 15 },
      auditPolicy: { failOn: ['critical', 'high'], warnOn: ['moderate'] },
    }

const STATUS_LABEL = { PASS: '\u901a\u8fc7', WARN: '\u8b66\u544a', FAIL: '\u5931\u8d25' }
const STATUS_ICON = { PASS: 'PASS', WARN: 'WARN', FAIL: 'FAIL' }

const checks = [
  {
    key: 'type-check',
    name: '\u7c7b\u578b\u68c0\u67e5',
    description: '\u68c0\u67e5 TypeScript \u4e0e Vue \u7c7b\u578b\u9519\u8bef\u3002',
    rule: '\u6267\u884c vue-tsc\uff0c\u547d\u4ee4\u5931\u8d25\u5219\u76f4\u63a5\u5224\u5b9a\u4e3a\u5931\u8d25\u3002',
    command: 'pnpm',
    args: ['type-check:only'],
  },
  {
    key: 'lint',
    name: '\u4ee3\u7801\u89c4\u8303\u68c0\u67e5',
    description:
      '\u68c0\u67e5 ESLint \u89c4\u5219\u3001\u6f5c\u5728\u7f3a\u9677\u4e0e\u4e0d\u89c4\u8303\u5199\u6cd5\u3002',
    rule: '\u6267\u884c ESLint\uff0c\u53ea\u8981\u5b58\u5728 error \u6216\u547d\u4ee4\u975e 0 \u9000\u51fa\u5373\u5224\u5b9a\u4e3a\u5931\u8d25\u3002',
    command: 'pnpm',
    args: ['lint'],
  },
  {
    key: 'format',
    name: '\u683c\u5f0f\u68c0\u67e5',
    description:
      '\u68c0\u67e5\u4ee3\u7801\u662f\u5426\u7b26\u5408 Prettier \u683c\u5f0f\u8981\u6c42\u3002',
    rule: '\u6267\u884c Prettier --check\uff0c\u683c\u5f0f\u4e0d\u7b26\u5408\u5373\u5224\u5b9a\u4e3a\u5931\u8d25\u3002',
    command: 'pnpm',
    args: ['format:check'],
  },
  {
    key: 'unit-test',
    name: '\u5355\u5143\u6d4b\u8bd5',
    description: '\u6267\u884c Vitest \u5355\u5143\u6d4b\u8bd5\u3002',
    rule: '\u6d4b\u8bd5\u547d\u4ee4\u975e 0 \u9000\u51fa\u5219\u5224\u5b9a\u4e3a\u5931\u8d25\u3002',
    command: 'pnpm',
    args: ['test:run'],
  },
  {
    key: 'coverage',
    name: '\u6d4b\u8bd5\u8986\u76d6\u7387',
    description:
      '\u6267\u884c\u5e26\u8986\u76d6\u7387\u7684\u6d4b\u8bd5\uff0c\u5e76\u8bc4\u4f30\u6838\u5fc3\u8986\u76d6\u6307\u6807\u3002',
    rule: `\u547d\u4ee4\u5931\u8d25\u5219\u76f4\u63a5\u5931\u8d25\uff1b\u82e5\u8986\u76d6\u7387\u4f4e\u4e8e\u9608\u503c\uff08lines ${config.coverageThresholds.lines}%\uff0cstatements ${config.coverageThresholds.statements}%\uff0cfunctions ${config.coverageThresholds.functions}%\uff0cbranches ${config.coverageThresholds.branches}%\uff09\uff0c\u5219\u8bb0\u4e3a\u8b66\u544a\u3002`,
    command: 'pnpm',
    args: ['test:coverage'],
    analyze: analyzeCoverage,
  },
  {
    key: 'build',
    name: '\u6784\u5efa\u9a8c\u8bc1',
    description: '\u9a8c\u8bc1\u9879\u76ee\u662f\u5426\u53ef\u4ee5\u6210\u529f\u6784\u5efa\u3002',
    rule: '\u6784\u5efa\u547d\u4ee4\u975e 0 \u9000\u51fa\u5219\u5224\u5b9a\u4e3a\u5931\u8d25\u3002',
    command: 'pnpm',
    args: ['build'],
  },
  {
    key: 'bundle-size',
    name: '\u6784\u5efa\u4ea7\u7269\u4f53\u79ef',
    description:
      '\u5206\u6790 dist \u76ee\u5f55\u4ea7\u7269\u5927\u5c0f\uff0c\u8bc6\u522b\u8fc7\u5927\u7684 JS/CSS \u8d44\u6e90\u3002',
    rule: `\u811a\u672c\u80fd\u5206\u6790 dist \u5373\u9000\u51fa\u7801\u4e3a 0\uff1b\u82e5\u5355\u4e2a JS \u8d85\u8fc7 ${config.bundleThresholds.maxJsAssetKb} KB\u3001\u5355\u4e2a CSS \u8d85\u8fc7 ${config.bundleThresholds.maxCssAssetKb} KB \u6216 dist \u603b\u4f53\u79ef\u8d85\u8fc7 ${config.bundleThresholds.maxTotalDistMb} MB\uff0c\u5219\u8bb0\u4e3a\u8b66\u544a\u3002`,
    run: analyzeBundleSize,
  },
  {
    key: 'audit',
    name: '\u4f9d\u8d56\u5b89\u5168\u626b\u63cf',
    description:
      '\u901a\u8fc7 pnpm audit \u68c0\u67e5\u9ad8\u5371\u4e0e\u4e25\u91cd\u4f9d\u8d56\u6f0f\u6d1e\u3002',
    rule: `\u4e25\u91cd\u6216\u9ad8\u5371\u6f0f\u6d1e\u8bb0\u4e3a\u5931\u8d25\uff1b\u4e2d\u5371\u6f0f\u6d1e\u8bb0\u4e3a\u8b66\u544a\u3002\u5f53\u524d failOn=${config.auditPolicy.failOn.join(', ')}\uff0cwarnOn=${config.auditPolicy.warnOn.join(', ')}\u3002`,
    command: 'pnpm',
    args: ['audit', '--audit-level=high', '--json', '--registry=https://registry.npmjs.org'],
    analyze: analyzeAudit,
  },
]

const startedAt = new Date()
const results = []

for (const check of checks) {
  const result =
    typeof check.run === 'function' ? check.run() : runCommand(check.command, check.args)
  let status = result.status ?? (result.exitCode === 0 ? 'PASS' : 'FAIL')
  let details = result.details ?? []
  let basis =
    result.basis ??
    (result.exitCode === 0
      ? '\u547d\u4ee4\u6267\u884c\u6210\u529f'
      : '\u547d\u4ee4\u6267\u884c\u5931\u8d25')

  if (typeof check.analyze === 'function') {
    const analyzed = check.analyze(result)
    status = analyzed.status
    details = analyzed.details
    basis = analyzed.basis
    if (analyzed.output) result.output = analyzed.output
  }

  results.push({
    key: check.key,
    name: check.name,
    description: check.description,
    rule: check.rule,
    status,
    exitCode: result.exitCode,
    output: result.output || '\u65e0\u8f93\u51fa',
    details,
    basis,
  })
}

const failed = results.filter((item) => item.status === 'FAIL')
const warned = results.filter((item) => item.status === 'WARN')
const passedCount = results.filter((item) => item.status === 'PASS').length
const summary = failed.length > 0 ? 'FAIL' : warned.length > 0 ? 'WARN' : 'PASS'

const lines = [
  '# \u4ee3\u7801\u8d28\u91cf\u62a5\u544a',
  '',
  `- \u751f\u6210\u65f6\u95f4\uff1a${startedAt.toISOString()}`,
  `- \u603b\u4f53\u7ed3\u679c\uff1a${STATUS_ICON[summary]} ${STATUS_LABEL[summary]}`,
  `- \u901a\u8fc7\uff1a${passedCount}`,
  `- \u8b66\u544a\uff1a${warned.length}`,
  `- \u5931\u8d25\uff1a${failed.length}`,
  '',
  '## \u7ed3\u679c\u89e3\u8bfb',
  '',
  '- `\u9000\u51fa\u7801` \u8868\u793a\u547d\u4ee4\u672c\u8eab\u662f\u5426\u6267\u884c\u6210\u529f\uff1a`0` \u4e3a\u6210\u529f\uff0c\u975e `0` \u4e3a\u5931\u8d25\u3002',
  '- `\u5224\u5b9a\u4f9d\u636e` \u8868\u793a\u8fd9\u4e2a\u68c0\u67e5\u4e3a\u4ec0\u4e48\u88ab\u5224\u5b9a\u4e3a\u901a\u8fc7\u3001\u8b66\u544a\u6216\u5931\u8d25\u3002',
  '- `\u89c4\u5219/\u9608\u503c` \u8868\u793a\u8fd9\u4e2a\u68c0\u67e5\u4f7f\u7528\u7684\u8d28\u91cf\u5224\u65ad\u6807\u51c6\u3002',
  '',
]

if (failed.length > 0) {
  lines.push('## \u5931\u8d25\u9879\u6458\u8981', '')
  for (const item of failed) lines.push(`- ${item.name}\uff1a${item.basis}`)
  lines.push('')
}

if (warned.length > 0) {
  lines.push('## \u8b66\u544a\u9879\u6458\u8981', '')
  for (const item of warned) lines.push(`- ${item.name}\uff1a${item.basis}`)
  lines.push('')
}

lines.push('## \u68c0\u67e5\u603b\u89c8', '')
lines.push(
  '| \u68c0\u67e5\u9879 | \u7ed3\u679c | \u9000\u51fa\u7801 | \u5224\u5b9a\u4f9d\u636e | \u89c4\u5219/\u9608\u503c |',
)
lines.push('| --- | --- | --- | --- | --- |')
for (const item of results)
  lines.push(
    `| ${item.name} | ${STATUS_ICON[item.status]} ${STATUS_LABEL[item.status]} | ${item.exitCode} | ${escapeTable(item.basis)} | ${escapeTable(item.rule)} |`,
  )
lines.push('', '## \u5f53\u524d\u9608\u503c\u914d\u7f6e', '')
lines.push(
  `- \u8986\u76d6\u7387\uff1alines ${config.coverageThresholds.lines}%\uff0cstatements ${config.coverageThresholds.statements}%\uff0cfunctions ${config.coverageThresholds.functions}%\uff0cbranches ${config.coverageThresholds.branches}%`,
)
lines.push(
  `- \u4ea7\u7269\u4f53\u79ef\uff1aJS ${config.bundleThresholds.maxJsAssetKb} KB\uff0cCSS ${config.bundleThresholds.maxCssAssetKb} KB\uff0cdist \u603b\u4f53\u79ef ${config.bundleThresholds.maxTotalDistMb} MB`,
)
lines.push(
  `- \u5b89\u5168\u626b\u63cf\uff1afailOn=${config.auditPolicy.failOn.join(', ')}\uff0cwarnOn=${config.auditPolicy.warnOn.join(', ')}`,
  '',
)

for (const item of results) {
  lines.push(`## ${item.name}`, '')
  lines.push(`- \u7ed3\u679c\uff1a${STATUS_ICON[item.status]} ${STATUS_LABEL[item.status]}`)
  lines.push(`- \u9000\u51fa\u7801\uff1a${item.exitCode}`)
  lines.push(`- \u5224\u5b9a\u4f9d\u636e\uff1a${item.basis}`)
  lines.push(`- \u68c0\u67e5\u8bf4\u660e\uff1a${item.description}`)
  lines.push(`- \u89c4\u5219/\u9608\u503c\uff1a${item.rule}`)
  if (item.details.length > 0) {
    lines.push('- \u5173\u952e\u7ed3\u8bba\uff1a')
    for (const detail of item.details) lines.push(`  - ${detail}`)
  }
  lines.push('', '```text', item.output || '\u65e0\u8f93\u51fa', '```', '')
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `\uFEFF${lines.join('\n')}\n`, 'utf8')
console.log(`Quality report written to ${outPath}`)
if (failed.length > 0) process.exit(1)

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
      npm_config_color: 'false',
      CI: process.env.CI || '1',
    },
  })
  return {
    exitCode: result.status ?? 1,
    output: sanitizeOutput([result.stdout, result.stderr].filter(Boolean).join('\n').trim()),
  }
}

function analyzeCoverage(result) {
  const summaryPath = resolve('coverage/coverage-summary.json')
  if (!existsSync(summaryPath)) {
    const basis =
      result.exitCode !== 0
        ? '\u8986\u76d6\u7387\u4efb\u52a1\u6267\u884c\u5931\u8d25\uff0c\u672a\u751f\u6210 coverage-summary.json'
        : '\u8986\u76d6\u7387\u4efb\u52a1\u5df2\u6267\u884c\uff0c\u4f46\u672a\u627e\u5230 coverage-summary.json'
    return {
      status: 'FAIL',
      basis,
      details: [
        '\u672a\u627e\u5230 coverage-summary.json\uff0c\u65e0\u6cd5\u89e3\u6790\u8986\u76d6\u7387\u7ed3\u679c\u3002',
      ],
      output: result.output,
    }
  }

  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'))
  const total = summary.total || {}
  const metrics = [
    ['lines', '\u884c\u8986\u76d6\u7387'],
    ['statements', '\u8bed\u53e5\u8986\u76d6\u7387'],
    ['functions', '\u51fd\u6570\u8986\u76d6\u7387'],
    ['branches', '\u5206\u652f\u8986\u76d6\u7387'],
  ]
  const details = metrics.map(
    ([key, label]) =>
      `${label}\uff1a${total[key]?.pct ?? 0}%\uff08\u76ee\u6807 ${config.coverageThresholds[key]}%\uff09`,
  )
  const below = metrics.filter(([key]) => (total[key]?.pct ?? 0) < config.coverageThresholds[key])
  const status = result.exitCode !== 0 ? 'FAIL' : below.length > 0 ? 'WARN' : 'PASS'
  const basis =
    result.exitCode !== 0
      ? '\u8986\u76d6\u7387\u547d\u4ee4\u6267\u884c\u5931\u8d25'
      : below.length > 0
        ? `\u8986\u76d6\u7387\u672a\u8fbe\u5230\u9608\u503c\uff0c\u672a\u8fbe\u6807\u9879\uff1a${below.map(([, label]) => label).join('\u3001')}`
        : '\u8986\u76d6\u7387\u5df2\u8fbe\u5230\u9608\u503c'
  return { status, basis, details, output: result.output }
}

function analyzeBundleSize() {
  const distDir = resolve('dist')
  if (!existsSync(distDir))
    return {
      exitCode: 1,
      output: 'dist \u76ee\u5f55\u4e0d\u5b58\u5728\uff0c\u8bf7\u5148\u6267\u884c\u6784\u5efa\u3002',
      status: 'FAIL',
      basis:
        '\u7f3a\u5c11 dist \u76ee\u5f55\uff0c\u65e0\u6cd5\u5206\u6790\u6784\u5efa\u4ea7\u7269\u4f53\u79ef',
      details: [
        '\u7f3a\u5c11 dist \u76ee\u5f55\uff0c\u65e0\u6cd5\u5206\u6790\u6784\u5efa\u4ea7\u7269\u4f53\u79ef\u3002',
      ],
    }
  const files = listFiles(distDir).filter((file) => !file.endsWith('.gz'))
  const assetInfos = files.map((file) => ({
    path: relative(distDir, file).replace(/\\/g, '/'),
    size: statSync(file).size,
    ext: extname(file).toLowerCase(),
  }))
  const totalBytes = assetInfos.reduce((sum, item) => sum + item.size, 0)
  const jsAssets = assetInfos.filter((item) => item.ext === '.js')
  const cssAssets = assetInfos.filter((item) => item.ext === '.css')
  const topAssets = [...assetInfos]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5)
    .map((item) => `${item.path}\uff1a${formatKb(item.size)} KB`)
  const oversizedJs = jsAssets.filter(
    (item) => item.size / 1024 > config.bundleThresholds.maxJsAssetKb,
  )
  const oversizedCss = cssAssets.filter(
    (item) => item.size / 1024 > config.bundleThresholds.maxCssAssetKb,
  )
  const totalMb = totalBytes / 1024 / 1024
  const details = [
    `dist \u603b\u5927\u5c0f\uff1a${totalMb.toFixed(2)} MB\uff08\u5efa\u8bae\u4e0d\u8d85\u8fc7 ${config.bundleThresholds.maxTotalDistMb} MB\uff09`,
    `JS \u8d44\u6e90\u6570\u91cf\uff1a${jsAssets.length}`,
    `CSS \u8d44\u6e90\u6570\u91cf\uff1a${cssAssets.length}`,
    `\u6700\u5927 JS \u9608\u503c\uff1a${config.bundleThresholds.maxJsAssetKb} KB\uff0c\u8d85\u6807\u6570\u91cf\uff1a${oversizedJs.length}`,
    `\u6700\u5927 CSS \u9608\u503c\uff1a${config.bundleThresholds.maxCssAssetKb} KB\uff0c\u8d85\u6807\u6570\u91cf\uff1a${oversizedCss.length}`,
    `\u4f53\u79ef\u6700\u5927\u7684 5 \u4e2a\u4ea7\u7269\uff1a${topAssets.join('\uff1b') || '\u65e0'}`,
  ]
  const warnings =
    oversizedJs.length > 0 ||
    oversizedCss.length > 0 ||
    totalMb > config.bundleThresholds.maxTotalDistMb
  return {
    exitCode: 0,
    output: details.join('\n'),
    status: warnings ? 'WARN' : 'PASS',
    basis: warnings
      ? '\u6784\u5efa\u5df2\u5b8c\u6210\uff0c\u4f46\u4ea7\u7269\u4f53\u79ef\u8d85\u51fa\u5efa\u8bae\u9608\u503c'
      : '\u6784\u5efa\u4ea7\u7269\u4f53\u79ef\u5728\u9608\u503c\u8303\u56f4\u5185',
    details,
  }
}

function analyzeAudit(result) {
  const raw = result.output.trim()
  if (raw.includes('ERR_PNPM_AUDIT_ENDPOINT_NOT_EXISTS')) {
    return {
      status: 'WARN',
      basis: '\u5f53\u524d npm registry \u955c\u50cf\u4e0d\u652f\u6301 audit \u63a5\u53e3',
      details: [
        '\u5f53\u524d audit \u8bf7\u6c42\u6307\u5411\u7684\u6ce8\u518c\u8868\u6e90\u4e0d\u63d0\u4f9b\u5b89\u5168\u5ba1\u8ba1\u63a5\u53e3\u3002',
        '\u82e5\u8981\u542f\u7528\u5b8c\u6574\u4f9d\u8d56\u5b89\u5168\u626b\u63cf\uff0c\u5efa\u8bae\u5207\u6362\u5230 https://registry.npmjs.org \u540e\u518d\u6267\u884c pnpm audit\u3002',
      ],
      output: result.output,
    }
  }
  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    const firstBrace = raw.indexOf('{')
    const lastBrace = raw.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1))
      } catch {
        parsed = null
      }
    }
  }
  if (parsed?.error?.code === 'ERR_PNPM_AUDIT_ENDPOINT_NOT_EXISTS') {
    return {
      status: 'WARN',
      basis: '\u5f53\u524d npm registry \u955c\u50cf\u4e0d\u652f\u6301 audit \u63a5\u53e3',
      details: [
        '\u5f53\u524d audit \u8bf7\u6c42\u6307\u5411\u7684\u6ce8\u518c\u8868\u6e90\u4e0d\u63d0\u4f9b\u5b89\u5168\u5ba1\u8ba1\u63a5\u53e3\u3002',
        '\u82e5\u8981\u542f\u7528\u5b8c\u6574\u4f9d\u8d56\u5b89\u5168\u626b\u63cf\uff0c\u5efa\u8bae\u5207\u6362\u5230 https://registry.npmjs.org \u540e\u518d\u6267\u884c pnpm audit\u3002',
      ],
      output: result.output,
    }
  }
  if (!parsed?.metadata?.vulnerabilities) {
    return {
      status: result.exitCode === 0 ? 'WARN' : 'FAIL',
      basis: '\u65e0\u6cd5\u89e3\u6790 pnpm audit \u8f93\u51fa',
      details: [
        '\u672a\u80fd\u89e3\u6790 pnpm audit \u8f93\u51fa\uff0c\u5efa\u8bae\u5728 CI \u65e5\u5fd7\u4e2d\u8fdb\u4e00\u6b65\u68c0\u67e5\u539f\u59cb\u8f93\u51fa\u3002',
      ],
      output: result.output,
    }
  }
  const vulnerabilities = parsed.metadata.vulnerabilities
  const critical = vulnerabilities.critical ?? 0
  const high = vulnerabilities.high ?? 0
  const moderate = vulnerabilities.moderate ?? 0
  const low = vulnerabilities.low ?? 0
  const info = vulnerabilities.info ?? 0
  const details = [
    `\u4e25\u91cd\u6f0f\u6d1e\uff1a${critical}`,
    `\u9ad8\u5371\u6f0f\u6d1e\uff1a${high}`,
    `\u4e2d\u5371\u6f0f\u6d1e\uff1a${moderate}`,
    `\u4f4e\u5371\u6f0f\u6d1e\uff1a${low}`,
    `\u63d0\u793a\u4fe1\u606f\uff1a${info}`,
  ]
  const failHits = config.auditPolicy.failOn.filter((level) => (vulnerabilities[level] ?? 0) > 0)
  const warnHits = config.auditPolicy.warnOn.filter((level) => (vulnerabilities[level] ?? 0) > 0)
  const status =
    failHits.length > 0 || result.exitCode !== 0 ? 'FAIL' : warnHits.length > 0 ? 'WARN' : 'PASS'
  const basis =
    failHits.length > 0
      ? `\u51fa\u73b0\u9700\u963b\u65ad\u7684\u6f0f\u6d1e\u7b49\u7ea7\uff1a${failHits.join(', ')}`
      : warnHits.length > 0
        ? `\u51fa\u73b0\u9700\u63d0\u9192\u7684\u6f0f\u6d1e\u7b49\u7ea7\uff1a${warnHits.join(', ')}`
        : '\u672a\u53d1\u73b0\u89e6\u53d1\u89c4\u5219\u7684\u4f9d\u8d56\u6f0f\u6d1e'
  return { status, basis, details, output: result.output }
}

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listFiles(fullPath))
    else files.push(fullPath)
  }
  return files
}
function formatKb(bytes) {
  return (bytes / 1024).toFixed(2)
}
function sanitizeOutput(text) {
  return text
    .replace(/\u001B\[[0-9;]*[A-Za-z]/g, '')
    .replace(/\u001B\][^\u0007]*(\u0007|\u001B\\)/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r/g, '')
    .trim()
}
function escapeTable(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>')
}
