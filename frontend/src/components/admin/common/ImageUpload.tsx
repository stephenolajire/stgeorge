import { ImagePlus, Image as ImageIcon, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import type { MediaImage } from '../../../types/admin'

interface ImageUploadProps {
  value: MediaImage | null
  onChange: (value: MediaImage | null) => void
  alt: string
  className?: string
  /** "always" shows the buttons on the image; "hover" only on mouse-over. */
  controls?: 'always' | 'hover'
}

export default function ImageUpload({ value, onChange, alt, className = '', controls = 'always' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const pickFile = () => inputRef.current?.click()

  // Replace the image, freeing the memory used by the previous local preview.
  const replace = (next: MediaImage | null) => {
    if (value?.url.startsWith('blob:')) URL.revokeObjectURL(value.url)
    onChange(next)
  }

  const handleFile = (file: File | undefined) => {
    if (file) replace({ url: URL.createObjectURL(file), file })
  }

  const controlsClass = controls === 'hover' ? 'opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100' : ''

  return (
    <div className={`group relative overflow-hidden rounded-md ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {value ? (
        <>
          <img src={value.url} alt={alt} className="size-full object-cover" />
          <div className={controlsClass}>
            <button
              type="button"
              onClick={() => replace(null)}
              className="absolute top-2.5 right-2.5 flex size-7.5 items-center justify-center rounded-md bg-surface text-ink shadow-card hover:text-danger"
              aria-label="Remove image"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={pickFile}
              className="absolute right-2.5 bottom-2.5 inline-flex h-8 items-center gap-2 rounded-md bg-surface px-3 text-[0.8125rem] font-medium text-ink shadow-card hover:bg-surface-muted"
            >
              <ImageIcon className="size-4" /> Change Image
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          className="flex size-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-field-border bg-surface-muted text-[0.8125rem] font-medium text-muted hover:border-brand/40 hover:text-brand"
        >
          <ImagePlus className="size-6" strokeWidth={1.5} />
          Upload Image
        </button>
      )}
    </div>
  )
}
