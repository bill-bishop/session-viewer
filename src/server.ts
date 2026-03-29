import express from 'express'
import os from 'os'
import path from 'path'
import { loadAllSessions } from './loaders/sessions.ts'
import { loadSessionEntries, loadSubagentEntries } from './loaders/entries.ts'

const app = express()
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.join(os.homedir(), '.claude', 'projects')

app.get('/api/sessions', async (req, res) => {
  const sessions = await loadAllSessions(PROJECTS_DIR)
  res.json(sessions)
})

app.get('/api/sessions/:id', async (req, res) => {
  const entries = await loadSessionEntries(PROJECTS_DIR, req.params.id)
  res.json(entries)
})

app.get('/api/sessions/:id/subagents/:agentId', async (req, res) => {
  const entries = await loadSubagentEntries(PROJECTS_DIR, req.params.id, req.params.agentId)
  res.json(entries)
})

app.use(express.static('src/public'))
app.get('/', (req, res) => {
  res.sendFile(new URL('./public/index.html', import.meta.url).pathname)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
