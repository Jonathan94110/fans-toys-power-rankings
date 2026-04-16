import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function FigureCard({ figure, rank, prevRank, greyed, shuffling, highlighted }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: figure.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: shuffling
      ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s'
      : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const diff = prevRank != null ? prevRank - rank : 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid-card ${isDragging ? 'dragging' : ''} ${greyed ? 'greyed' : ''} ${shuffling ? 'shuffling' : ''} ${highlighted ? 'highlighted' : ''}`}
      data-figure-id={figure.id}
      {...attributes}
      {...listeners}
      onPointerEnter={() => setShowTooltip(true)}
      onPointerLeave={() => setShowTooltip(false)}
    >
      <div className="card-image">
        {figure.img ? (
          <img src={figure.img} alt={figure.name} draggable={false} />
        ) : (
          <div className="card-placeholder">
            <span>{figure.id}</span>
          </div>
        )}
      </div>

      <div className="card-overlay" />

      <div className="card-rank">{rank}</div>

      <div className="card-movement">
        {diff > 0 ? (
          <span className="move-up">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="#00d26a">
              <path d="M5 0L10 8H0L5 0z" />
            </svg>
            <span className="move-num">{diff}</span>
          </span>
        ) : diff < 0 ? (
          <span className="move-down">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="#ff4444">
              <path d="M5 8L0 0h10L5 8z" />
            </svg>
            <span className="move-num">{Math.abs(diff)}</span>
          </span>
        ) : (
          <span className="move-none">--</span>
        )}
      </div>

      <div className="card-name">{figure.name}</div>
      <div className="card-label">{figure.id}</div>

      {showTooltip && !isDragging && (
        <div className="card-tooltip">
          <strong>{figure.name}</strong>
          <span>{figure.id}{figure.year ? ` \u00B7 ${figure.year}` : ''}</span>
        </div>
      )}
    </div>
  )
}
