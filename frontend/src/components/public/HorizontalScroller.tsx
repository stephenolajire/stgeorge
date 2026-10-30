import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface HorizontalScrollerProps {
  /** Heading area on the left of the arrows. */
  header: ReactNode
  children: ReactNode
  label: string
}

const arrow =
  'flex size-9 items-center justify-center rounded-full border border-field-border bg-surface text-primary shadow-card transition hover:bg-mist disabled:pointer-events-none disabled:opacity-30'

/**
 * A row of cards that slides sideways (swipe, trackpad or shift+wheel). The scrollbar is hidden;
 * arrow buttons appear only when there are more cards than fit.
 */
export default function HorizontalScroller({ header, children, label }: HorizontalScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () => {
      setCanPrev(track.scrollLeft > 4)
      setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(track)
    return () => {
      track.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [children])

  const slide = (direction: 1 | -1) => {
    const track = trackRef.current
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>{header}</div>
        {(canPrev || canNext) && (
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => slide(-1)} disabled={!canPrev} className={arrow} aria-label={`Previous ${label}`}>
              <ChevronLeft className="size-4.5" />
            </button>
            <button type="button" onClick={() => slide(1)} disabled={!canNext} className={arrow} aria-label={`Next ${label}`}>
              <ChevronRight className="size-4.5" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  )
}
