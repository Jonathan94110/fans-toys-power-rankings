import React, { useState, useEffect, useCallback, useRef } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import RankingList from './components/RankingList'
import Leaderboard from './components/Leaderboard'
import fansToysFigures from './data/figures.json'
import xTransbotsFigures from './data/x-transbots-figures.json'
import hotToysFigures from './data/hottoys.json'
import giJoeClassifiedFigures from './data/gijoeclassified.json'
import transformersStudio86Figures from './data/transformersstudio86.json'
import transformersG1Figures from './data/transformersg1.json'
import takaraTomyMasterpieceFigures from './data/takaratomymasterpiece.json'
import eightiesBirthdayFigures from './data/eightiesbirthday.json'

const DEFAULT_BRAND = 'eighties-birthday'
const BRANDS = {
  'eighties-birthday': {
    label: '80s Birthday',
    badge: 'BORN IN 1979',
    title: '80S POWER RANKINGS',
    exportPrefix: '80s-birthday-power-rankings',
    figures: eightiesBirthdayFigures,
  },
  'fans-toys': {
    label: 'Fans Toys',
    badge: 'FANS TOYS',
    title: 'POWER RANKINGS',
    exportPrefix: 'fans-toys-power-rankings',
    figures: fansToysFigures,
  },
  'x-transbots': {
    label: 'X-Transbots / KFC',
    badge: 'X-TRANSBOTS + KFC',
    title: 'POWER RANKINGS',
    exportPrefix: 'x-transbots-power-rankings',
    figures: xTransbotsFigures,
  },
  'hot-toys': {
    label: 'Hot Toys',
    badge: 'HOT TOYS',
    title: 'POWER RANKINGS',
    exportPrefix: 'hot-toys-power-rankings',
    figures: hotToysFigures,
  },
  'gi-joe-classified': {
    label: 'G.I. Joe Classified',
    badge: 'G.I. JOE CLASSIFIED',
    title: 'POWER RANKINGS',
    exportPrefix: 'gi-joe-classified-power-rankings',
    figures: giJoeClassifiedFigures,
  },
  'transformers-studio-86': {
    label: 'Transformers Studio 86',
    badge: 'STUDIO SERIES 86',
    title: 'POWER RANKINGS',
    exportPrefix: 'transformers-studio-86-power-rankings',
    figures: transformersStudio86Figures,
  },
  'transformers-g1': {
    label: 'Transformers G1',
    badge: 'TRANSFORMERS G1',
    title: 'POWER RANKINGS',
    exportPrefix: 'transformers-g1-power-rankings',
    figures: transformersG1Figures,
  },
  'takara-tomy-masterpiece': {
    label: 'Takara Tomy',
    badge: 'TAKARA TOMY',
    title: 'POWER RANKINGS',
    exportPrefix: 'takara-tomy-masterpiece-power-rankings',
    figures: takaraTomyMasterpieceFigures,
  },
}
const TIER_OPTIONS = [5, 8, 10, 15, 16, 20, 25, 30, 32, 35, 40, 45, 50, 60, 64, 70, 80, 90, 100, 110, 112, 113, 118, 120, 122, 124, 130, 150, 200, 250, 300, 400, 500, 650, 700]

function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function getFigureSearchText(figure) {
  return normalizeSearchText([figure.name, figure.id, figure.year, figure.brand].filter(Boolean).join(' '))
}

function getInitialBrand() {
  const params = new URLSearchParams(window.location.search)
  const requestedBrand = params.get('brand')
  return BRANDS[requestedBrand] ? requestedBrand : DEFAULT_BRAND
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [brand, setBrand] = useState(getInitialBrand)
  const [figures, setFigures] = useState([])
  const [prevOrder, setPrevOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [tier, setTier] = useState(25)
  const [shuffling, setShuffling] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const [view, setView] = useState('ranking')
  const [submitFlash, setSubmitFlash] = useState(false)
  const [isPresenterMode, setIsPresenterMode] = useState(false)
  const appRef = useRef(null)
  const initialOrder = useRef({})
  const gridRef = useRef(null)
  const activeBrand = BRANDS[brand]

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams(window.location.search)
    params.set('brand', brand)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)

    setLoaded(false)
    setPrevOrder(null)
    setSearch('')
    setHighlightId(null)

    fetch(`/api/rankings?brand=${encodeURIComponent(brand)}`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const figs = data.length ? data : activeBrand.figures
        setFigures(figs)
        initialOrder.current[brand] = figs
        setLoaded(true)
      })
      .catch(() => {
        setFigures(activeBrand.figures)
        initialOrder.current[brand] = activeBrand.figures
        setLoaded(true)
      })
    return () => controller.abort()
  }, [brand, activeBrand])

  const togglePresenterMode = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      const target = appRef.current ?? document.documentElement
      if (target.requestFullscreen) {
        await target.requestFullscreen()
      }
    } catch (error) {
      console.warn('Could not toggle presenter mode:', error)
    }
  }, [])

  useEffect(() => {
    function syncPresenterMode() {
      setIsPresenterMode(Boolean(document.fullscreenElement))
    }

    syncPresenterMode()
    document.addEventListener('fullscreenchange', syncPresenterMode)
    return () => document.removeEventListener('fullscreenchange', syncPresenterMode)
  }, [])

  useEffect(() => {
    function handleKeydown(event) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target
      const isEditable = target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )
      if (isEditable) return

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        togglePresenterMode()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [togglePresenterMode])

  const saveRankings = useCallback(async (newFigures, activeBrandId) => {
    setSaving(true)
    try {
      await fetch(`/api/rankings?brand=${encodeURIComponent(activeBrandId)}`, {
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
    saveRankings(updated, brand)
  }

  function handleShuffle() {
    setPrevOrder([...figures])
    setShuffling(true)
    const shuffled = shuffle(figures)
    setFigures(shuffled)
    saveRankings(shuffled, brand)
    setTimeout(() => setShuffling(false), 600)
  }

  function handleReset() {
    if (!initialOrder.current[brand]) return
    setPrevOrder([...figures])
    setFigures([...initialOrder.current[brand]])
    saveRankings(initialOrder.current[brand], brand)
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
        link.download = `${activeBrand.exportPrefix}-top-${tier}.png`
        link.href = dataUrl
        link.click()
      }).catch(err => console.error('Export failed:', err))
    })
  }

  async function handleSubmit() {
    const rankings = figures.slice(0, tier).map(f => f.id)
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, tier, rankings }),
      })
      setSubmitFlash(true)
      setTimeout(() => {
        setSubmitFlash(false)
        setView('leaderboard')
      }, 1200)
    } catch (e) {
      console.error('Submit failed:', e)
    }
  }

  const normalizedSearch = normalizeSearchText(search)
  const searchResults = normalizedSearch
    ? figures.filter(f => getFigureSearchText(f).includes(normalizedSearch))
    : []
  const searchMatchIds = new Set(searchResults.map(f => f.id))

  function handleSearchSelect(id) {
    setHighlightId(id)
    setSearch('')
    const el = document.querySelector(`[data-figure-id="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightId(null), 2000)
  }

  if (!loaded) {
    return <div className="loading">Loading rankings...</div>
  }

  return (
    <div
      ref={appRef}
      className={`app brand-${brand} ${isPresenterMode ? 'presenter-mode' : ''}`}
    >
      <header className="app-header">
        <div className="header-topline">
          <div className="header-badge">{activeBrand.badge}</div>
          <button
            type="button"
            className={`action-btn presenter-btn ${isPresenterMode ? 'active' : ''}`}
            onClick={togglePresenterMode}
            aria-pressed={isPresenterMode}
            title={isPresenterMode ? 'Exit presenter mode' : 'Enter presenter mode'}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3.5A1.5 1.5 0 013.5 2H6M10 2h2.5A1.5 1.5 0 0114 3.5V6M14 10v2.5A1.5 1.5 0 0112.5 14H10M6 14H3.5A1.5 1.5 0 012 12.5V10"/>
            </svg>
            {isPresenterMode ? 'Exit Presenter' : 'Presenter Mode'}
          </button>
        </div>
        <h1>{activeBrand.title}</h1>
        <div className="header-status-row">
          {saving && <span className="save-indicator">Saving...</span>}
          <span className="presenter-hint">
            {isPresenterMode ? 'Press F or Esc to exit fullscreen' : 'Press F for fullscreen presenter mode'}
          </span>
        </div>
      </header>

      <nav className="brand-tabs" aria-label="Brand pages">
        {Object.entries(BRANDS).map(([brandId, brandConfig]) => (
          <button
            key={brandId}
            className={`brand-tab ${brand === brandId ? 'active' : ''}`}
            onClick={() => setBrand(brandId)}
          >
            {brandConfig.label}
          </button>
        ))}
      </nav>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${view === 'ranking' ? 'active' : ''}`}
          onClick={() => setView('ranking')}
        >
          Rankings
        </button>
        <button
          className={`nav-tab ${view === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setView('leaderboard')}
        >
          Leaderboard
        </button>
      </nav>

      {/* Submit flash */}
      {submitFlash && (
        <div className="submit-flash">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#00ff66" strokeWidth="2"/>
            <path d="M6 10l3 3 5-6" stroke="#00ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ranking Submitted!
        </div>
      )}

      {view === 'ranking' ? (
        <>
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
                  placeholder={brand === 'eighties-birthday' ? 'Search 80s icons...' : 'Search figures...'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="search-dropdown">
                    <div className="search-group-label">
                      <span>Shared name matches</span>
                      <strong>{searchResults.length}</strong>
                    </div>
                    {searchResults.slice(0, 24).map(f => (
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
                    {searchResults.length > 24 && (
                      <div className="search-more-count">+{searchResults.length - 24} more matches in ranking order</div>
                    )}
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
              <button className="action-btn submit-btn" onClick={handleSubmit} title="Submit ranking">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2L2 8.5l4.5 1.8M14 2l-5.5 8.3M8.5 10.3V14l2.2-2.5"/>
                </svg>
                Submit
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
              searchMatchIds={searchMatchIds}
              onReorder={handleReorder}
            />
          </main>
        </>
      ) : (
        <Leaderboard brand={brand} allFigures={figures} />
      )}
    </div>
  )
}
