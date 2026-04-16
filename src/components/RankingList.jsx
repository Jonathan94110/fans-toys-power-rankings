import React, { forwardRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import FigureCard from './FigureCard'

const RankingList = forwardRef(function RankingList(
  { figures, prevOrder, tier, shuffling, highlightId, onReorder },
  ref
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = figures.findIndex(f => f.id === active.id)
      const newIndex = figures.findIndex(f => f.id === over.id)
      onReorder(oldIndex, newIndex)
    }
  }

  // Figure out which row the tier cutoff falls on (4 columns)
  const cutoffIndex = Math.min(tier, figures.length)
  const cutoffRow = Math.ceil(cutoffIndex / 4)
  const showDivider = cutoffIndex < figures.length

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={figures.map(f => f.id)} strategy={rectSortingStrategy}>
        <div className="ranking-grid" ref={ref}>
          {figures.map((figure, index) => {
            const prevRank = prevOrder
              ? prevOrder.findIndex(f => f.id === figure.id) + 1
              : null
            const isInTier = index < tier
            const isHighlighted = highlightId === figure.id
            return (
              <FigureCard
                key={figure.id}
                figure={figure}
                rank={index + 1}
                prevRank={prevRank}
                greyed={!isInTier}
                shuffling={shuffling}
                highlighted={isHighlighted}
              />
            )
          })}
        </div>
        {showDivider && (
          <div
            className="tier-divider"
            style={{ '--divider-row': cutoffRow }}
          >
            <span className="tier-divider-label">Top {tier}</span>
          </div>
        )}
      </SortableContext>
    </DndContext>
  )
})

export default RankingList
