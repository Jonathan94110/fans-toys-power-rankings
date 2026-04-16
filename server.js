import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = join(__dirname, 'data')
const RANKINGS_FILE = join(DATA_DIR, 'rankings.json')

app.use(cors())
app.use(express.json())

// Serve built frontend in production
app.use(express.static(join(__dirname, 'dist')))

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// GET rankings
app.get('/api/rankings', (req, res) => {
  try {
    if (existsSync(RANKINGS_FILE)) {
      const data = readFileSync(RANKINGS_FILE, 'utf-8')
      res.json(JSON.parse(data))
    } else {
      res.json([])
    }
  } catch (e) {
    console.error('Error reading rankings:', e)
    res.json([])
  }
})

// PUT rankings
app.put('/api/rankings', (req, res) => {
  try {
    writeFileSync(RANKINGS_FILE, JSON.stringify(req.body, null, 2))
    res.json({ ok: true })
  } catch (e) {
    console.error('Error saving rankings:', e)
    res.status(500).json({ error: 'Failed to save' })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
