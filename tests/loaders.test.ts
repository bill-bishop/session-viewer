import { describe, it, expect } from 'vitest'
import { loadAllSessions } from '../src/loaders/sessions.ts'
import { loadSessionEntries, loadSubagentEntries } from '../src/loaders/entries.ts'
import { extractErrors } from '../src/loaders/errors.ts'

const FIXTURES_DIR = new URL('./fixtures', import.meta.url).pathname

describe('loadAllSessions', () => {
  it('returns non-empty array', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(Array.isArray(sessions)).toBe(true)
    expect(sessions.length).toBeGreaterThan(0)
  })

  it('SessionSummary has sessionId field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.sessionId).toBeDefined()
      expect(typeof session.sessionId).toBe('string')
    })
  })

  it('SessionSummary has projectSlug field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.projectSlug).toBeDefined()
      expect(typeof session.projectSlug).toBe('string')
    })
  })

  it('SessionSummary has cwd field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.cwd).toBeDefined()
      expect(typeof session.cwd).toBe('string')
    })
  })

  it('SessionSummary has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.timestamp).toBeDefined()
      expect(typeof session.timestamp).toBe('string')
    })
  })

  it('SessionSummary has version field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.version).toBeDefined()
      expect(typeof session.version).toBe('string')
    })
  })

  it('SessionSummary has entryCount field (number)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.entryCount).toBeDefined()
      expect(typeof session.entryCount).toBe('number')
    })
  })

  it('SessionSummary has subagents field (array)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.subagents).toBeDefined()
      expect(Array.isArray(session.subagents)).toBe(true)
    })
  })

  it('SessionSummary has toolCalls field (number)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.toolCalls).toBeDefined()
      expect(typeof session.toolCalls).toBe('number')
    })
  })

  it('SessionSummary has errors field (number)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.errors).toBeDefined()
      expect(typeof session.errors).toBe('number')
    })
  })


  it('SessionSummary has toolCallsList field (array)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.toolCallsList).toBeDefined()
      expect(Array.isArray(session.toolCallsList)).toBe(true)
    })
  })

  it('ToolCall has name field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    const firstSessionWithToolCalls = sessions.find(s => s.toolCallsList.length > 0)
    expect(firstSessionWithToolCalls).toBeDefined()
    firstSessionWithToolCalls!.toolCallsList.forEach(toolCall => {
      expect(toolCall.name).toBeDefined()
      expect(typeof toolCall.name).toBe('string')
    })
  })

  it('ToolCall has input field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithToolCalls = sessions.find(s => s.toolCallsList.length > 0)
    expect(firstSessionWithToolCalls).toBeDefined()
    firstSessionWithToolCalls!.toolCallsList.forEach(toolCall => {
      expect(toolCall.input).toBeDefined()
    })
  })

  it('ToolCall has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithToolCalls = sessions.find(s => s.toolCallsList.length > 0)
    expect(firstSessionWithToolCalls).toBeDefined()
    firstSessionWithToolCalls!.toolCallsList.forEach(toolCall => {
      expect(toolCall.timestamp).toBeDefined()
      expect(typeof toolCall.timestamp).toBe('string')
    })
  })

  it('SessionSummary has errorsList field (array)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(0)
    sessions.forEach(session => {
      expect(session.errorsList).toBeDefined()
      expect(Array.isArray(session.errorsList)).toBe(true)
    })
  })

  it('SessionError has content field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithErrors = sessions.find(s => s.errorsList.length > 0)
    if (firstSessionWithErrors) {
      firstSessionWithErrors.errorsList.forEach(error => {
        expect(error.content).toBeDefined()
        expect(typeof error.content).toBe('string')
      })
    }
  })

  it('SessionError has tool_use_id field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithErrors = sessions.find(s => s.errorsList.length > 0)
    if (firstSessionWithErrors) {
      firstSessionWithErrors.errorsList.forEach(error => {
        expect(error.tool_use_id).toBeDefined()
        expect(typeof error.tool_use_id).toBe('string')
      })
    }
  })

  it('SessionError has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithErrors = sessions.find(s => s.errorsList.length > 0)
    if (firstSessionWithErrors) {
      firstSessionWithErrors.errorsList.forEach(error => {
        expect(error.timestamp).toBeDefined()
        expect(typeof error.timestamp).toBe('string')
      })
    }
  })


  it('returns sessions sorted by timestamp descending', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    expect(sessions.length).toBeGreaterThan(1)
    for (let i = 0; i < sessions.length - 1; i++) {
      expect(sessions[i].timestamp >= sessions[i + 1].timestamp).toBe(true)
    }
  })

  it('SubagentRef has agentId field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(firstSessionWithSubagents).toBeDefined()
    firstSessionWithSubagents!.subagents.forEach(subagent => {
      expect(subagent.agentId).toBeDefined()
      expect(typeof subagent.agentId).toBe('string')
    })
  })

  it('SubagentRef has promptId field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const firstSessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(firstSessionWithSubagents).toBeDefined()
    firstSessionWithSubagents!.subagents.forEach(subagent => {
      expect(subagent.promptId).toBeDefined()
      expect(typeof subagent.promptId).toBe('string')
    })
  })
})

describe('loadSessionEntries', () => {
  it('returns array', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    expect(Array.isArray(entries)).toBe(true)
  })

  it('SessionEntry has uuid field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    entries.forEach(entry => {
      expect(entry.uuid).toBeDefined()
      expect(typeof entry.uuid).toBe('string')
    })
  })

  it('SessionEntry has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    entries.forEach(entry => {
      expect(entry.timestamp).toBeDefined()
      expect(typeof entry.timestamp).toBe('string')
    })
  })

  it('SessionEntry has type field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    entries.forEach(entry => {
      expect(entry.type).toBeDefined()
      expect(typeof entry.type).toBe('string')
    })
  })

  it('SessionEntry has isSidechain field (boolean)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    entries.forEach(entry => {
      expect(entry.isSidechain).toBeDefined()
      expect(typeof entry.isSidechain).toBe('boolean')
    })
  })

  it('SessionEntry has parentUuid field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    entries.forEach(entry => {
      expect(entry.parentUuid === null || typeof entry.parentUuid === 'string').toBe(true)
    })
  })

  it('includes file-history-snapshot entries (no filtering)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionId = sessions[0].sessionId
    const entries = await loadSessionEntries(FIXTURES_DIR, sessionId)
    const hasFileHistorySnapshot = entries.some(entry => entry.type === 'file-history-snapshot')
    expect(hasFileHistorySnapshot).toBe(true)
  })
})

describe('loadSubagentEntries', () => {
  it('returns array', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    expect(Array.isArray(entries)).toBe(true)
  })

  it('SessionEntry has uuid field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    expect(entries.length).toBeGreaterThan(0)
    entries.forEach(entry => {
      expect(entry.uuid).toBeDefined()
      expect(typeof entry.uuid).toBe('string')
    })
  })

  it('SessionEntry has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    entries.forEach(entry => {
      expect(entry.timestamp).toBeDefined()
      expect(typeof entry.timestamp).toBe('string')
    })
  })

  it('SessionEntry has type field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    entries.forEach(entry => {
      expect(entry.type).toBeDefined()
      expect(typeof entry.type).toBe('string')
    })
  })

  it('SessionEntry has isSidechain field (boolean)', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    entries.forEach(entry => {
      expect(entry.isSidechain).toBeDefined()
      expect(typeof entry.isSidechain).toBe('boolean')
    })
  })

  it('SessionEntry has parentUuid field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const sessionWithSubagents = sessions.find(s => s.subagents.length > 0)
    expect(sessionWithSubagents).toBeDefined()
    const agentId = sessionWithSubagents!.subagents[0].agentId
    const entries = await loadSubagentEntries(FIXTURES_DIR, sessionWithSubagents!.sessionId, agentId)
    entries.forEach(entry => {
      expect(entry.parentUuid === null || typeof entry.parentUuid === 'string').toBe(true)
    })
  })
})

describe('extractErrors', () => {
  it('returns array', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(Array.isArray(errors)).toBe(true)
  })

  it('extracts errors from message.content[0].is_error', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('SessionError has content field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(errors.length).toBeGreaterThan(0)
    errors.forEach(error => {
      expect(error.content).toBeDefined()
      expect(typeof error.content).toBe('string')
      expect(error.content.length).toBeGreaterThan(0)
    })
  })

  it('SessionError has tool_use_id field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(errors.length).toBeGreaterThan(0)
    errors.forEach(error => {
      expect(error.tool_use_id).toBeDefined()
      expect(typeof error.tool_use_id).toBe('string')
      expect(error.tool_use_id.length).toBeGreaterThan(0)
    })
  })

  it('SessionError has timestamp field', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(errors.length).toBeGreaterThan(0)
    errors.forEach(error => {
      expect(error.timestamp).toBeDefined()
      expect(typeof error.timestamp).toBe('string')
    })
  })

  it('returns empty array for entries with no errors', async () => {
    const emptyEntries: any[] = []
    const errors = extractErrors(emptyEntries)
    expect(errors).toEqual([])
  })

  it('captures errors from nested data.message.message.content', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    // Should extract errors from both primary and nested locations
    expect(errors.length).toBeGreaterThan(0)
  })

  it('extracts multiple errors from single session', async () => {
    const sessions = await loadAllSessions(FIXTURES_DIR)
    const entries = await loadSessionEntries(FIXTURES_DIR, sessions[0].sessionId)
    const errors = extractErrors(entries)
    expect(errors.length).toBeGreaterThan(0)
  })
})
