import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import type { SessionEntry } from '../types.js'
import { randomUUID } from 'crypto'

function normalizePath(p: string): string {
  if (p.startsWith('/') && p[2] === ':') {
    return p.slice(1)
  }
  return p
}

async function findFile(dir: string, pattern: (name: string) => boolean): Promise<string | null> {
  try {
    dir = normalizePath(dir)
    const entries = await readdir(dir, { recursive: true })
    const found = entries.find(entry => pattern(entry.toString()))
    return found ? join(dir, found.toString()) : null
  } catch {
    return null
  }
}

function normalizeEntry(entry: any): SessionEntry {
  // Provide defaults for missing core fields
  return {
    ...entry,
    uuid: entry.uuid || entry.messageId || randomUUID(),
    timestamp: entry.timestamp || entry.snapshot?.timestamp || new Date().toISOString(),
    isSidechain: entry.isSidechain ?? false,
    parentUuid: entry.parentUuid ?? null,
  }
}

export async function loadSessionEntries(
  projectsDir: string,
  sessionId: string,
): Promise<SessionEntry[]> {
  projectsDir = normalizePath(projectsDir)
  const pattern = (name: string) => name.endsWith(`${sessionId}.jsonl`) && !name.includes('subagents')
  const filePath = await findFile(projectsDir, pattern)

  if (!filePath) return []

  const content = await readFile(filePath, 'utf-8')
  const lines = content.trim().split('\n')

  return lines
    .filter(line => line.trim())
    .map(line => JSON.parse(line))
    .map(entry => normalizeEntry(entry))
}

export async function loadSubagentEntries(
  projectsDir: string,
  sessionId: string,
  agentId: string,
): Promise<SessionEntry[]> {
  projectsDir = normalizePath(projectsDir)
  const pattern = (name: string) =>
    name.includes('subagents') &&
    name.endsWith(`agent-${agentId}.jsonl`) &&
    name.includes(sessionId)

  const filePath = await findFile(projectsDir, pattern)

  if (!filePath) return []

  const content = await readFile(filePath, 'utf-8')
  const lines = content.trim().split('\n')

  return lines
    .filter(line => line.trim())
    .map(line => JSON.parse(line))
    .map(entry => normalizeEntry(entry))
}
