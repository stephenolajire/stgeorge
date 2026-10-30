import { Ellipsis, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export interface MoreMenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}

interface MoreMenuProps {
  items: MoreMenuItem[]
  label?: string
  /** Icon on the button; defaults to "⋯". */
  icon?: LucideIcon
  buttonClassName?: string
}

const item = 'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-surface-muted disabled:opacity-40'

/**
 * A small dropdown of actions. The menu is fixed to the screen so it is not
 * clipped by scrolling containers such as tables, and follows its button on scroll.
 */
export default function MoreMenu({
  items,
  label = 'More actions',
  icon: Icon = Ellipsis,
  buttonClassName = 'flex size-7.5 items-center justify-center rounded-md border border-field-border text-ink hover:bg-surface-muted',
}: MoreMenuProps) {
  const [style, setStyle] = useState<CSSProperties | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /** Where to draw the menu next to the button: below it, or above it when there is no room below. */
  const position = (): CSSProperties | null => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return null // button is off screen
    const right = window.innerWidth - rect.right
    const menuHeight = items.length * 37 + 12
    const fitsBelow = rect.bottom + 4 + menuHeight <= window.innerHeight
    return fitsBelow ? { top: rect.bottom + 4, right } : { bottom: window.innerHeight - rect.top + 4, right }
  }
  const open = () => setStyle(position())
  const close = () => setStyle(null)

  const isOpen = style !== null
  useEffect(() => {
    if (!isOpen) return
    // Follow the button when the page scrolls; close once it leaves the screen.
    const follow = () => setStyle(position())
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', follow, true)
    window.addEventListener('resize', follow)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('resize', follow)
    }
    // position() only reads the button and item count, which the open menu does not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={isOpen ? close : open}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={buttonClassName}
      >
        <Icon className="size-4" />
      </button>
      {style && (
        <div ref={menuRef} role="menu" style={style} className="fixed z-40 w-48 rounded-lg border border-line bg-surface py-1.5 shadow-raised">
          {items.map(({ label: text, icon: ItemIcon, onClick, disabled, danger }) => (
            <button
              key={text}
              type="button"
              role="menuitem"
              disabled={disabled}
              className={`${item} ${danger ? 'text-danger' : 'text-ink'}`}
              onClick={() => {
                close()
                onClick()
              }}
            >
              <ItemIcon className="size-4" /> {text}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
