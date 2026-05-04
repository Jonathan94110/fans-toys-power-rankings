import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'
const DATA_DIR = join(__dirname, 'data')
const RANKINGS_FILE = join(DATA_DIR, 'rankings.json')
const SUBMISSIONS_FILE = join(DATA_DIR, 'submissions.json')
const DEFAULT_BRAND = 'eighties-birthday'

app.use(cors())
app.use(express.json())

// Serve built frontend in production
app.use(express.static(join(__dirname, 'dist')))

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

function readJSON(file, fallback = []) {
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) { console.error(`Error reading ${file}:`, e) }
  return fallback
}

function writeJSON(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2))
}

function normalizeBrand(brand) {
  return typeof brand === 'string' && brand.trim()
    ? brand.trim().toLowerCase()
    : DEFAULT_BRAND
}

function getBrandStore(file) {
  const data = readJSON(file, null)
  if (Array.isArray(data)) {
    return { [DEFAULT_BRAND]: data }
  }
  if (data && typeof data === 'object') {
    return data
  }
  return {}
}

function readBrandCollection(file, brand) {
  const store = getBrandStore(file)
  return Array.isArray(store[brand]) ? store[brand] : []
}

function writeBrandCollection(file, brand, collection) {
  const store = getBrandStore(file)
  store[brand] = collection
  writeJSON(file, store)
}

// ─── Rankings (live working order) ───

app.get('/api/rankings', (req, res) => {
  const brand = normalizeBrand(req.query.brand)
  res.json(readBrandCollection(RANKINGS_FILE, brand))
})

app.put('/api/rankings', (req, res) => {
  try {
    const brand = normalizeBrand(req.query.brand)
    writeBrandCollection(RANKINGS_FILE, brand, req.body)
    res.json({ ok: true })
  } catch (e) {
    console.error('Error saving rankings:', e)
    res.status(500).json({ error: 'Failed to save' })
  }
})

// ─── Submissions (snapshots) ───

app.get('/api/submissions', (req, res) => {
  const brand = normalizeBrand(req.query.brand)
  const subs = readBrandCollection(SUBMISSIONS_FILE, brand)
  res.json(subs.sort((a, b) => b.id - a.id))
})

app.post('/api/submissions', (req, res) => {
  try {
    const brand = normalizeBrand(req.body.brand)
    const subs = readBrandCollection(SUBMISSIONS_FILE, brand)
    const { tier, rankings } = req.body
    const newSub = {
      id: subs.length > 0 ? Math.max(...subs.map(s => s.id)) + 1 : 1,
      date: new Date().toISOString(),
      tier: tier || 25,
      rankings: rankings || [],
    }
    subs.push(newSub)
    writeBrandCollection(SUBMISSIONS_FILE, brand, subs)
    res.json(newSub)
  } catch (e) {
    console.error('Error saving submission:', e)
    res.status(500).json({ error: 'Failed to save submission' })
  }
})

app.get('/api/leaderboard', (req, res) => {
  const brand = normalizeBrand(req.query.brand)
  const subs = readBrandCollection(SUBMISSIONS_FILE, brand)
  if (subs.length === 0) {
    return res.json({ current: null, movements: {}, submissionCount: 0, previous: null })
  }

  const sorted = subs.sort((a, b) => b.id - a.id)
  const current = sorted[0]
  const previous = sorted.length > 1 ? sorted[1] : null

  // Calculate movements
  const movements = {}
  current.rankings.forEach((figId, idx) => {
    if (previous) {
      const prevIdx = previous.rankings.indexOf(figId)
      if (prevIdx === -1) {
        movements[figId] = 'new'
      } else {
        movements[figId] = prevIdx - idx // positive = moved up
      }
    } else {
      movements[figId] = 0
    }
  })

  res.json({
    current,
    movements,
    submissionCount: subs.length,
    previous,
    history: sorted.slice(0, 20).map(s => ({ id: s.id, date: s.date, tier: s.tier })),
  })
})

app.get('/api/submissions/:id', (req, res) => {
  const brand = normalizeBrand(req.query.brand)
  const subs = readBrandCollection(SUBMISSIONS_FILE, brand)
  const sub = subs.find(s => s.id === parseInt(req.params.id))
  if (!sub) return res.status(404).json({ error: 'Not found' })

  // Find the submission before this one
  const sorted = subs.sort((a, b) => a.id - b.id)
  const idx = sorted.findIndex(s => s.id === sub.id)
  const previous = idx > 0 ? sorted[idx - 1] : null

  const movements = {}
  sub.rankings.forEach((figId, i) => {
    if (previous) {
      const prevIdx = previous.rankings.indexOf(figId)
      movements[figId] = prevIdx === -1 ? 'new' : prevIdx - i
    } else {
      movements[figId] = 0
    }
  })

  res.json({ submission: sub, movements, previous })
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})
