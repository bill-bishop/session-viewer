#!/usr/bin/env node
import express from 'express'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadAllSessions } from './loaders/sessions'
import { loadSessionEntries, loadSubagentEntries } from './loaders/entries'

const app = express()

const args = process.argv.slice(2)
const projectDirIdx = args.indexOf('--project-dir')
const portIdx = args.indexOf('--port')
const PROJECTS_DIR = projectDirIdx !== -1 ? args[projectDirIdx + 1] : path.join(os.homedir(), '.claude', 'projects')
const PORT = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 3000

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

app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))))
app.get('/', (req, res) => {
  res.sendFile(new URL('./public/index.html', import.meta.url).pathname)
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
