import type { SessionEntry, ContentBlock } from '../types.js'

export async function countToolCalls(entries: SessionEntry[]): Promise<number> {
  return entries.filter(entry => {
    if (entry.type === 'assistant' && entry.message?.content) {
      const content = entry.message.content
      if (Array.isArray(content)) {
        return content.some((block: ContentBlock) => block.type === 'tool_use')
      }
    }
    return false
  }).length
}

export async function countErrors(entries: SessionEntry[]): Promise<number> {
  return entries.filter(entry => {
    if (entry.data?.type === 'error') return true
    if (entry.type === 'error') return true
    return false
  }).length
}
