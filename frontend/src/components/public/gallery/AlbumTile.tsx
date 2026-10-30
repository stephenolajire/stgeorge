import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlbumTileProps {
  title: string
  count: number
  cover: string | null
  /** Rendered as a link (Link) or a button by the parent. */
  as: (props: { className: string; children: ReactNode }) => ReactNode
}

/** Photo tile with a dark band at the bottom: title, "42 photos" and an arrow. */
export default function AlbumTile({ title, count, cover, as: Wrapper }: AlbumTileProps) {
  return Wrapper({
    className:
      'group relative block aspect-[16/9] w-full overflow-hidden rounded-lg bg-mist text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    children: (
      <>
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted">
            <ImageIcon className="size-10" />
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/75 via-black/45 to-transparent px-3.5 pt-10 pb-3 text-white">
          <span className="min-w-0">
            <span className="block truncate font-display text-[0.9375rem] font-bold">{title}</span>
            <span className="block text-xs text-white/85">
              {count} {count === 1 ? 'photo' : 'photos'}
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/80 transition group-hover:bg-white group-hover:text-primary">
            <ArrowRight className="size-4" />
          </span>
        </span>
      </>
    ),
  })
}
