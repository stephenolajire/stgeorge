import { Image as ImageIcon, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'react-toastify'
import type { MediaImage } from '../../../types/admin'

const TYPES = ['image/jpeg', 'image/png']

interface ImagePickerFieldProps {
  label?: string
  value: MediaImage | null
  onChange: (value: MediaImage | null) => void
  maxMb?: number
  error?: string
  className?: string
}

/**
 * Wide image with a delete button on it, and "Change Image" / "Upload New Image" below.
 * New images are previewed locally and uploaded when the form is saved.
 */
export default function ImagePickerField({ label = 'Image', value, onChange, maxMb = 5, error, className = 'h-40' }: ImagePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const replace = (next: MediaImage | null) => {
    if (value?.url.startsWith('blob:')) URL.revokeObjectURL(value.url)
    onChange(next)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!TYPES.includes(file.type)) return void toast.error('Please choose a JPG or PNG image.')
    if (file.size > maxMb * 1024 * 1024) return void toast.error(`The image must be ${maxMb} MB or smaller.`)
    replace({ url: URL.createObjectURL(file), file })
  }

  const pick = () => inputRef.current?.click()

  return (
    <div>
      <p className="form-label">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {value ? (
        <div className={`relative overflow-hidden rounded-md ${className}`}>
          <img src={value.url} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => replace(null)}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md bg-surface text-ink shadow-card hover:text-danger"
            aria-label="Remove image"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-field-border bg-surface-muted text-[0.8125rem] font-medium text-muted hover:border-brand/40 hover:text-brand ${className}`}
        >
          <ImagePlus className="size-6" strokeWidth={1.5} />
          No image yet
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {value && (
          <button
            type="button"
            onClick={pick}
            className="inline-flex h-9.5 items-center gap-2 rounded-md border border-brand px-6 text-[0.8125rem] font-medium text-brand hover:bg-brand-soft"
          >
            <ImageIcon className="size-4" /> Change Image
          </button>
        )}
        {!value && (
          <button
            type="button"
            onClick={pick}
            className="inline-flex h-9.5 items-center gap-2 rounded-md border border-field-border px-5 text-[0.8125rem] font-medium text-ink hover:bg-surface-muted"
          >
            <Upload className="size-4" /> Upload New Image
          </button>
        )}
        <span className="text-xs text-muted">JPG, PNG up to {maxMb}MB</span>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
