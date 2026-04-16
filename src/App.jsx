import React, { useState, useEffect, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import RankingList from './components/RankingList'
import defaultFigures from './data/figures.json'

const API_URL = '/api/rankings'
const TIER_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [figures, setFigures] = useState([])
  const [prevOrder, setPrevOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [tier, setTier] = useState(25)
  const [shuffling, setShuffling] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const initialOrder = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const figs = data.length ? data : defaultFigures
        setFigures(figs)
        initialOrder.current = figs
        setLoaded(true)
      })
      .catch(() => {
        setFigures(defaultFigures)
        initialOrder.current = defaultFigures
        setLoaded(true)
      })
  }, [])

  const saveRankings = useCallback(async (newFigures) => {
    setSaving(true)
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFigures),
      })
    } catch (e) {
      console.warn('Could not save rankings:', e)
    }
    setSaving(false)
  }, [])

  function handleReorder(oldIndex, newIndex) {
    setPrevOrder([...figures])
    const updated = arrayMove(figures, oldIndex, newIndex)
    setFigures(updated)
    saveRankings(updated)
  }

  function handleShuffle() {
    setPrevOrder([...figures])
    setShuffling(true)
    const shuffled = shuffle(figures)
    setFigures(shuffled)
    saveRankings(shuffled)
    setTimeout(() => setShuffling(false), 600)
  }

  function handleReset() {
    if (!initialOrder.current) return
    setPrevOrder([...figures])
    setFigures([...initialOrder.current])
    saveRankings(initialOrder.current)
  }

  function handleExport() {
    import('html-to-image').then(({ toPng }) => {
      const grid = gridRef.current
      if (!grid) return
      toPng(grid, {
        backgroundColor: '#080808',
        pixelRatio: 2,
      }).then(dataUrl => {
        const link = document.createElement('a')
        link.download = `fans-toys-power-rankings-top-${tier}.png`
        link.href = dataUrl
        link.click()
      }).catch(err => console.error('Export failed:', err))
    })
  }

  // Search matching
  const searchResults = search.trim()
    ? figures.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase())
      )
    : []

  function handleSearchSelect(id) {
    setHighlightId(id)
    setSearch('')
    // Scroll to the card
    const el = document.querySelector(`[data-figure-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightId(null), 2000)
  }

  if (!loaded) {
    return <div className="loading">Loading rankings...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">FANS TOYS</div>
        <h1>POWER RANKINGS</h1>
        {saving && <span className="save-indicator">Saving...</span>}
      </header>

      <div className="controls">
        <div className="tier-selector">
          {TIER_OPTIONS.map(n => (
            <button
              key={n}
              className={`tier-btn ${tier === n ? 'active' : ''}`}
              onClick={() => setTier(n)}
            >
              Top {n}
            </button>
          ))}
        </div>
        <div className="controls-right">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search figures..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.slice(0, 8).map(f => (
                  <button
                    key={f.id}
                    className="search-result"
                    onClick={() => handleSearchSelect(f.id)}
                  >
                    <span className="search-result-id">{f.id}</span>
                    <span className="search-result-name">{f.name}</span>
                    <span className="search-result-rank">
                      #{figures.findIndex(fig => fig.id === f.id) + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="action-btn" onClick={handleShuffle} title="Shuffle">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 2.5l2 2-2 2M13.5 9.5l2 2-2 2M1 4.5h3.5a4 4 0 013.46 2l.54.93a4 4 0 003.46 2H15M1 11.5h3.5a4 4 0 003.46-2l.54-.93a4 4 0 013.46-2H15"/>
            </svg>
            Shuffle
          </button>
          <button className="action-btn" onClick={handleReset} title="Reset">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1v5h5M15 15v-5h-5"/>
              <path d="M13.5 6A6 6 0 003 3l-2 2M2.5 10a6 6 0 0010.5 3l2-2"/>
            </svg>
            Reset
          </button>
          <button className="action-btn export-btn" onClick={handleExport} title="Export as image">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3M8 2v8M5 7l3 3 3-3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      <main>
        <RankingList
          ref={gridRef}
          figures={figures}
          prevOrder={prevOrder}
          tier={tier}
          shuffling={shuffling}
          highlightId={highlightId}
          onReorder={handleReorder}
        />
      </main>
    </div>
  )
}
