import { Image } from 'lucide-react'

interface ImageTileProps {
  src?: string
  alt: string
  className?: string
}

/** Shows the image, or a neutral placeholder when there is no image yet. */
export default function ImageTile({ src, alt, className = '' }: ImageTileProps) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`rounded-lg object-cover ${className}`} />
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center rounded-lg bg-surface-muted text-muted/60 ${className}`}
    >
      <Image className="size-6" />
    </div>
  )
}
