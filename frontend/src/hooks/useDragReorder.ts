import { useState, type DragEvent } from 'react'
import { moveItem } from '../utils/array'

/**
 * Drag-and-drop reordering for a list of rows. Spread `rowProps(index)` onto each draggable row;
 * `onReorder` gets the list in its new order. `isDropTarget(index)` is true for the row being hovered.
 */
export function useDragReorder<T>(items: T[], onReorder: (items: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const end = () => {
    setDragIndex(null)
    setOverIndex(null)
  }

  const move = (from: number, to: number) => {
    if (from !== to && to >= 0 && to < items.length) onReorder(moveItem(items, from, to))
  }

  const rowProps = (index: number) => ({
    draggable: true,
    onDragStart: () => setDragIndex(index),
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setOverIndex(index)
    },
    onDrop: () => {
      if (dragIndex !== null) move(dragIndex, index)
      end()
    },
    onDragEnd: end,
  })

  const isDropTarget = (index: number) => overIndex === index && dragIndex !== null && dragIndex !== index

  return { rowProps, isDropTarget, move }
}
