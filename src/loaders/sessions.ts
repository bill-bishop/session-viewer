import { readdir, readFile } from 'fs/promises'
import { basename, join } from 'path'
import type { SessionSummary, ContentBlock } from '../types'
import { countToolCalls, countErrors } from './analyzers'
import { loadSessionEntries } from './entries'
import { extractErrors } from './errors'

export async function loadAllSessions(projectsDir: string): Promise<SessionSummary[]> {
  const sessions: SessionSummary[] = []

  // Fix Windows pathname from import.meta.url which returns /C:/path/to/dir
  let dir = projectsDir
  if (dir.startsWith('/') && dir[2] === ':') {
    dir = dir.slice(1)
  }

  try {
    const projects = await readdir(dir)

    for (const project of projects) {
      try {
        const projectPath = join(dir, project)
        const files = await readdir(projectPath).catch(() => [])

        for (const file of files) {
          try {
            if (!file.endsWith('.jsonl') || file.includes('subagents')) continue

            const filePath = join(projectPath, file)
            const content = await readFile(filePath, 'utf-8')
            const lines = content.trim().split('\n').filter(line => line.trim())

            if (lines.length === 0) continue

            // Extract sessionId from filename (remove .jsonl extension)
            const sessionId = file.replace(/\.jsonl$/, '')
            const projectSlug = project

            // Load all entries for analysis first
            const entries = lines.map(line => JSON.parse(line))

            // Find first entry with metadata (sessionId, timestamp, version, cwd)
            let cwd = '', timestamp = '', version = '', slug = ''
            for (const entry of entries) {
              if (!timestamp && entry.timestamp) timestamp = entry.timestamp
              if (!version && entry.version) version = entry.version
              if (!cwd && entry.cwd) cwd = entry.cwd
              if (!slug && entry.slug) slug = entry.slug
              if (timestamp && version && cwd && slug) break
            }

            // Count entries
            const entryCount = lines.length

            // Extract tool calls from entries
            const toolCallsList = entries
              .filter((entry: any) => {
                if (entry.type === 'assistant' && entry.message?.content) {
                  const content = entry.message.content
                  if (Array.isArray(content)) {
                    return content.some((block: ContentBlock) => block.type === 'tool_use')
                  }
                }
                return false
              })
              .flatMap((entry: any) => {
                const toolUses: any[] = []
                if (Array.isArray(entry.message.content)) {
                  for (const block of entry.message.content) {
                    if (block.type === 'tool_use') {
                      toolUses.push({
                        name: block.name || '',
                        input: block.input,
                        timestamp: entry.timestamp,
                      })
                    }
                  }
                }
                return toolUses
              })

            // Extract errors from message.content[0].is_error
            const errorsList = extractErrors(entries)

            // Find subagents - extract promptId from first entry if it exists
            const subagentsDir = join(projectPath, sessionId, 'subagents')
            const subagentFiles = await readdir(subagentsDir).catch(() => [])
            const subagents: any[] = []

            for (const f of subagentFiles) {
              if (!f.endsWith('.jsonl') || !f.startsWith('agent-')) continue

              const match = f.match(/agent-([^.]+)\.jsonl/)
              const agentId = match?.[1] || ''

              // Try to extract promptId from first entry of the agent file
              let promptId = ''
              try {
                const agentFilePath = join(subagentsDir, f)
                const agentContent = await readFile(agentFilePath, 'utf-8')
                const firstAgentLine = agentContent.trim().split('\n')[0]
                if (firstAgentLine) {
                  const firstEntry = JSON.parse(firstAgentLine)
                  promptId = firstEntry.promptId || ''
                }
              } catch {
                // If we can't read promptId, that's ok
              }

              subagents.push({ agentId, promptId })
            }

            sessions.push({
              sessionId,
              projectSlug,
              cwd,
              timestamp,
              version,
              slug,
              entryCount,
              subagents,
              toolCalls: toolCallsList.length,
              errors: errorsList.length,
              toolCallsList,
              errorsList,
            })
          } catch (fileError) {
            console.error(`Error processing file ${file}:`, fileError)
          }
        }
      } catch (projectError) {
        console.error(`Error processing project ${project}:`, projectError)
      }
    }
  } catch (error) {
    console.error('Error loading sessions:', error)
  }

  // Sort by timestamp descending
  return sessions.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
