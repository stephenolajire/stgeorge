import { Image as ImageIcon } from 'lucide-react'

export default function Thumb({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
  ) : (
    <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted">
      <ImageIcon className="size-5" />
    </span>
  )
}
