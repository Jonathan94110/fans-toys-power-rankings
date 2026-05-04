import React, { useState, useEffect } from 'react'

function getFallbackBadge(figure) {
  if (figure.brand) return figure.brand
  if (figure.id?.startsWith('KFC-')) return 'KFC'
  if (/^(FT|FM|RP|PF)-/.test(figure.id || '')) return 'FANS TOYS'
  return 'X-TRANSBOTS'
}

function LeaderboardImage({ fig }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasRealImage = Boolean(fig.img) && !imageFailed

  useEffect(() => {
    setImageFailed(false)
  }, [fig.id, fig.img])

  if (hasRealImage) {
    return (
      <img
        src={fig.img}
        alt={fig.name}
        className="figure-image"
        onError={() => setImageFailed(true)}
        style={fig.imgPosition ? { objectPosition: fig.imgPosition } : undefined}
      />
    )
  }

  return (
    <div className="lb-card-fallback" aria-label={`${fig.name} placeholder`}>
      <div className="lb-card-fallback-badge">{getFallbackBadge(fig)}</div>
      <div className="lb-card-fallback-id">{fig.id}</div>
      <div className="lb-card-fallback-name">{fig.name}</div>
      <div className="lb-card-fallback-meta">{fig.year || 'Image coming soon'}</div>
    </div>
  )
}

export default function Leaderboard({ brand, allFigures }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewingId, setViewingId] = useState(null)

  useEffect(() => {
    loadLeaderboard()
  }, [brand])

  async function loadLeaderboard() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?brand=${encodeURIComponent(brand)}`)
      const json = await res.json()
      setData(json)
      setViewingId(null)
    } catch (e) {
      console.error('Failed to load leaderboard:', e)
    }
    setLoading(false)
  }

  async function loadSubmission(id) {
    setLoading(true)
    try {
      const res = await fetch(`/api/submissions/${id}?brand=${encodeURIComponent(brand)}`)
      const json = await res.json()
      setData(prev => ({
        ...prev,
        current: json.submission,
        movements: json.movements,
      }))
      setViewingId(id)
    } catch (e) {
      console.error('Failed to load submission:', e)
    }
    setLoading(false)
  }

  if (loading && !data) {
    return <div className="lb-loading">Loading leaderboard...</div>
  }

  if (!data || !data.current) {
    return (
      <div className="lb-empty">
        <div className="lb-empty-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#ff3333" strokeWidth="2">
            <circle cx="24" cy="24" r="20"/>
            <path d="M24 14v12M24 30v2"/>
          </svg>
        </div>
        <h3>No Rankings Submitted Yet</h3>
        <p>Arrange your figures and hit Submit to create the first {brand === 'x-transbots' ? 'X-Transbots' : 'Fans Toys'} leaderboard entry.</p>
      </div>
    )
  }

  const { current, movements, submissionCount, history } = data
  const figureMap = {}
  allFigures.forEach(f => { figureMap[f.id] = f })

  const formattedDate = new Date(current.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="leaderboard">
      <div className="lb-header">
        <div className="lb-header-left">
          <h2>
            {viewingId ? `Submission #${viewingId}` : 'Latest Rankings'}
          </h2>
          <span className="lb-meta">
            {formattedDate} &middot; Top {current.tier} &middot; {submissionCount} submission{submissionCount !== 1 ? 's' : ''} total
          </span>
        </div>
        {viewingId && (
          <button className="lb-back-btn" onClick={loadLeaderboard}>
            &larr; Latest
          </button>
        )}
      </div>

      <div className="lb-grid">
        {current.rankings.map((figId, index) => {
          const fig = figureMap[figId]
          const move = movements[figId]
          if (!fig) return null

          return (
            <div key={figId} className="lb-card">
              <div className="lb-card-image">
                <LeaderboardImage fig={fig} />
              </div>
              <div className="lb-card-overlay" />
              <div className="lb-card-rank">{index + 1}</div>
              <div className="lb-card-movement">
                {move === 'new' ? (
                  <span className="lb-move-new">NEW</span>
                ) : move > 0 ? (
                  <span className="lb-move-up">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="#00ff66">
                      <path d="M6 0L12 10H0L6 0z" />
                    </svg>
                    <span>{move}</span>
                  </span>
                ) : move < 0 ? (
                  <span className="lb-move-down">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="#ff0040">
                      <path d="M6 10L0 0h12L6 10z" />
                    </svg>
                    <span>{Math.abs(move)}</span>
                  </span>
                ) : (
                  <span className="lb-move-none">&mdash;</span>
                )}
              </div>
              <div className="lb-card-info">
                <span className="lb-card-name">{fig.name}</span>
                <span className="lb-card-id">{fig.id}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      {history && history.length > 1 && (
        <div className="lb-history">
          <h3>Submission History</h3>
          <div className="lb-history-list">
            {history.map(h => {
              const d = new Date(h.date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })
              const isActive = viewingId ? viewingId === h.id : h.id === current.id
              return (
                <button
                  key={h.id}
                  className={`lb-history-item ${isActive ? 'active' : ''}`}
                  onClick={() => loadSubmission(h.id)}
                >
                  <span className="lb-history-num">#{h.id}</span>
                  <span className="lb-history-date">{d}</span>
                  <span className="lb-history-tier">Top {h.tier}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
