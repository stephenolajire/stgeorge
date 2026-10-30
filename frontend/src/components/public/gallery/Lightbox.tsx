import { ChevronLeft, ChevronRight, LoaderCircle, Pause, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Photo } from '../../../types/admin'

const SLIDE_MS = 4000
const SWIPE_PX = 50

interface LightboxProps {
  title: string
  photos: Photo[] | undefined
  loading: boolean
  onClose: () => void
  /** Start the slideshow playing straight away. */
  autoplay?: boolean
}

/**
 * Full-screen slideshow: next/previous buttons, ← → keys, swipe on phones, play/pause (space),
 * thumbnails, and Escape to close.
 */
export default function Lightbox({ title, photos = [], loading, onClose, autoplay = true }: LightboxProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  const swipeStart = useRef<number | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const count = photos.length

  const go = useCallback((delta: number) => count && setIndex((i) => (i + delta + count) % count), [count])

  // Keyboard and page scroll lock.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else return
      if (e.key !== ' ') setPlaying(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [go, onClose])

  // Autoplay.
  useEffect(() => {
    if (!playing || count < 2) return
    const timer = setTimeout(() => go(1), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [playing, index, count, go])

  // Keep the current thumbnail in view, and load the next photo in advance.
  useEffect(() => {
    thumbsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    if (count > 1) new Image().src = photos[(index + 1) % count].image
  }, [index, count, photos])

  const manual = (delta: number) => {
    setPlaying(false)
    go(delta)
  }

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return
    const dx = e.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(dx) > SWIPE_PX) manual(dx < 0 ? 1 : -1)
  }

  const photo = photos[index]
  const navButton =
    'absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70 disabled:opacity-0'

  return (
    <div role="dialog" aria-modal="true" aria-label={`${title} slideshow`} className="fixed inset-0 z-50 flex flex-col bg-[#0a0f1c] text-white">
      <header className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold">{title}</p>
          {count > 0 && (
            <p className="text-xs text-white/70" aria-live="polite">
              {index + 1} / {count}
            </p>
          )}
        </div>
        {count > 1 && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-9 items-center gap-2 rounded-full border border-white/30 px-4 text-sm hover:bg-white/10"
            aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close slideshow">
          <X className="size-6" />
        </button>
      </header>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 select-none sm:px-20"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {loading ? (
          <LoaderCircle className="size-10 animate-spin text-white/70" aria-label="Loading photos" />
        ) : photo ? (
          <>
            <button type="button" onClick={() => manual(-1)} disabled={count < 2} className={`${navButton} left-3 sm:left-6`} aria-label="Previous photo">
              <ChevronLeft className="size-6" />
            </button>
            <figure key={photo.id} className="flex max-h-full max-w-full flex-col items-center animate-[fadeIn_.35s_ease]">
              <img src={photo.image} alt={photo.title} draggable={false} className="max-h-[calc(100vh-15rem)] max-w-full rounded-md object-contain shadow-raised" />
              <figcaption className="mt-3 max-w-2xl text-center">
                <span className="block font-display text-[0.9375rem] font-bold">{photo.title}</span>
                {photo.description && <span className="mt-1 block text-sm text-white/75">{photo.description}</span>}
              </figcaption>
            </figure>
            <button type="button" onClick={() => manual(1)} disabled={count < 2} className={`${navButton} right-3 sm:right-6`} aria-label="Next photo">
              <ChevronRight className="size-6" />
            </button>
          </>
        ) : (
          <p className="text-white/70">No photos here yet.</p>
        )}
      </div>

      {count > 1 && (
        <div ref={thumbsRef} className="flex gap-2 overflow-x-auto px-4 pt-2 pb-4 [scrollbar-width:none] sm:justify-center sm:px-6">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlaying(false)
                setIndex(i)
              }}
              aria-label={`Show photo ${i + 1}: ${p.title}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === index ? 'border-accent opacity-100' : 'border-transparent opacity-55 hover:opacity-90'
              }`}
            >
              <img src={p.image} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
