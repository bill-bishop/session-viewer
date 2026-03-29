import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const FIXTURES_DIR = join(import.meta.dirname, '..', 'tests', 'fixtures')

type FieldInfo = {
  types: Set<string>
  samples: Set<string>
  count: number
}

const fieldMap = new Map<string, FieldInfo>()
const typeDistribution = new Map<string, number>()
let totalEntries = 0
let totalFiles = 0
let totalProjects = 0

function walkJson(obj: unknown, path: string) {
  if (obj === null || obj === undefined) {
    record(path, 'null', null)
    return
  }
  if (Array.isArray(obj)) {
    record(path, `array(${obj.length})`, null)
    for (const item of obj) walkJson(item, `${path}[]`)
    return
  }
  if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      walkJson(val, path ? `${path}.${key}` : key)
    }
    return
  }
  const val = String(obj)
  record(path, typeof obj, val)
}

function record(path: string, type: string, sample: string | null) {
  let info = fieldMap.get(path)
  if (!info) {
    info = { types: new Set(), samples: new Set(), count: 0 }
    fieldMap.set(path, info)
  }
  info.types.add(type)
  info.count++
  if (sample !== null && info.samples.size < 5 && sample.length < 100) {
    info.samples.add(sample)
  }
}

// ── Scan ────────────────────────────────────────────────────────────
for (const projectDir of readdirSync(FIXTURES_DIR)) {
  const projectPath = join(FIXTURES_DIR, projectDir)
  if (!statSync(projectPath).isDirectory()) continue
  totalProjects++

  for (const file of readdirSync(projectPath)) {
    if (!file.endsWith('.jsonl')) continue
    totalFiles++

    const lines = readFileSync(join(projectPath, file), 'utf-8').split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        totalEntries++
        const combo = entry.subtype ? `${entry.type}:${entry.subtype}` : (entry.type ?? 'unknown')
        typeDistribution.set(combo, (typeDistribution.get(combo) ?? 0) + 1)
        walkJson(entry, '')
      } catch { /* skip */ }
    }
  }
}

// ── Output ──────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════')
console.log(' JSON FIELD INVENTORY')
console.log(`  ${totalProjects} projects · ${totalFiles} sessions · ${totalEntries} entries`)
console.log('═══════════════════════════════════════════════════════════════')
console.log()

console.log('─── ENTRY TYPE DISTRIBUTION ────────────────────────────────')
for (const [combo, count] of [...typeDistribution.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${combo.padEnd(40)} ${String(count).padStart(6)}  (${((count / totalEntries) * 100).toFixed(1)}%)`)
}
console.log()

console.log('─── ALL FIELDS ────────────────────────────────────────────')
const sorted = [...fieldMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))

let prevGroup = ''
for (const [path, info] of sorted) {
  if (!path) continue
  const group = path.split('.')[0].replace('[]', '')
  if (group !== prevGroup) {
    console.log()
    prevGroup = group
  }
  const types = [...info.types].join('|')
  const samples = [...info.samples].slice(0, 3)
  const sampleStr = samples.length > 0
    ? `  e.g. ${samples.map(s => JSON.stringify(s.length > 50 ? s.slice(0, 50) + '…' : s)).join(', ')}`
    : ''
  console.log(`  ${path.padEnd(55)} [${types}] ×${info.count}${sampleStr}`)
}
console.log()
console.log('═══════════════════════════════════════════════════════════════')
