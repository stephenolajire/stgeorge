/** Returns a copy of the list with the item at `from` moved to `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}
