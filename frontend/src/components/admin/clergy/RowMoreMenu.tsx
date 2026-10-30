import { ArrowDown, ArrowUp, CircleCheck, CircleOff, Ellipsis } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface RowMoreMenuProps {
  isActive: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleActive: () => void
}

const item = 'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-ink hover:bg-surface-muted disabled:opacity-40'

export default function RowMoreMenu({ isActive, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onToggleActive }: RowMoreMenuProps) {
  const [style, setStyle] = useState<CSSProperties | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // The table scrolls sideways, which would clip a normal dropdown, so the menu is fixed to the screen.
  const open = () => {
    const rect = buttonRef.current!.getBoundingClientRect()
    setStyle({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
  }
  const close = () => setStyle(null)

  useEffect(() => {
    if (!style) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [style])

  const run = (fn: () => void) => () => {
    close()
    fn()
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={style ? close : open}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={Boolean(style)}
        className="flex size-7.5 items-center justify-center rounded-md border border-field-border text-ink hover:bg-surface-muted"
      >
        <Ellipsis className="size-4" />
      </button>
      {style && (
        <div ref={menuRef} role="menu" style={style} className="fixed z-40 w-48 rounded-lg border border-line bg-surface py-1.5 shadow-raised">
          <button type="button" role="menuitem" className={item} onClick={run(onMoveUp)} disabled={!canMoveUp}>
            <ArrowUp className="size-4" /> Move up
          </button>
          <button type="button" role="menuitem" className={item} onClick={run(onMoveDown)} disabled={!canMoveDown}>
            <ArrowDown className="size-4" /> Move down
          </button>
          <button type="button" role="menuitem" className={item} onClick={run(onToggleActive)}>
            {isActive ? <CircleOff className="size-4" /> : <CircleCheck className="size-4" />}
            {isActive ? 'Mark as inactive' : 'Mark as active'}
          </button>
        </div>
      )}
    </>
  )
}
